import express from 'express';
import { Invoice } from '../models/Invoice.js';
import { RepairTicket } from '../models/RepairTicket.js';
import { InventoryItem } from '../models/InventoryItem.js';
import { protectAdmin } from '../middleware/authMiddleware.js';
import { requireActiveSubscription } from '../middleware/subscriptionMiddleware.js';

const router = express.Router();

async function generateInvoiceNumber() {
  const all = await Invoice.find();
  const year = new Date().getFullYear();
  const count = all.length + 1;
  const seq = String(count).padStart(4, '0');
  return `INV-${year}-${seq}`;
}

// GET /api/invoices - List invoices
router.get('/', protectAdmin, async (req, res) => {
  try {
    const { status, search } = req.query;
    let invoices = await Invoice.find();

    if (status && status !== 'ALL') {
      invoices = invoices.filter(inv => inv.paymentStatus === status);
    }

    if (search) {
      const q = search.toLowerCase();
      invoices = invoices.filter(inv =>
        (inv.invoiceNumber && inv.invoiceNumber.toLowerCase().includes(q)) ||
        (inv.ticketId && inv.ticketId.toLowerCase().includes(q)) ||
        (inv.customer?.name && inv.customer.name.toLowerCase().includes(q)) ||
        (inv.customer?.phone && inv.customer.phone.includes(q))
      );
    }

    res.json({ success: true, count: invoices.length, invoices });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch invoices' });
  }
});

// GET /api/invoices/by-ticket/:ticketId
router.get('/by-ticket/:ticketId', async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ ticketId: req.params.ticketId });
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'No invoice found for this ticket' });
    }
    res.json({ success: true, invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve invoice' });
  }
});

// GET /api/invoices/:id
router.get('/:id', protectAdmin, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    res.json({ success: true, invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch invoice' });
  }
});

// POST /api/invoices - Generate / Create invoice
router.post('/', protectAdmin, requireActiveSubscription, async (req, res) => {
  try {
    const {
      ticketId,
      customer,
      deviceSummary,
      items = [],
      laborFee = 0,
      discount = 0,
      taxRate = 18,
      paidAmount = 0,
      paymentMethod = 'CASH',
      paymentStatus = 'UNPAID',
      notes,
      warrantyInfo
    } = req.body;

    if (!ticketId || !customer?.name) {
      return res.status(400).json({ success: false, message: 'Ticket ID and customer details are required' });
    }

    // Calculate subtotal from items
    const processedItems = items.map(item => {
      const qty = Number(item.quantity) || 1;
      const price = Number(item.unitPrice) || 0;
      return {
        description: item.description || 'Service Item',
        type: item.type || 'PART',
        quantity: qty,
        unitPrice: price,
        total: qty * price
      };
    });

    const itemsSum = processedItems.reduce((acc, curr) => acc + curr.total, 0);
    const numericLabor = Number(laborFee) || 0;
    const numericDiscount = Number(discount) || 0;
    const numericTaxRate = Number(taxRate) || 0;

    const subtotal = itemsSum + numericLabor;
    const discountedSubtotal = Math.max(0, subtotal - numericDiscount);
    const taxAmount = Math.round((discountedSubtotal * numericTaxRate) / 100);
    const totalAmount = discountedSubtotal + taxAmount;

    const numericPaid = Number(paidAmount) || 0;
    const dueAmount = Math.max(0, totalAmount - numericPaid);

    let determinedStatus = paymentStatus;
    if (numericPaid >= totalAmount && totalAmount > 0) {
      determinedStatus = 'PAID';
    } else if (numericPaid > 0 && numericPaid < totalAmount) {
      determinedStatus = 'PARTIAL';
    }

    const invoiceNumber = await generateInvoiceNumber();

    const newInvoice = await Invoice.create({
      invoiceNumber,
      ticketId,
      customer,
      deviceSummary: deviceSummary || 'Repair Service',
      items: processedItems,
      laborFee: numericLabor,
      subtotal,
      discount: numericDiscount,
      taxRate: numericTaxRate,
      taxAmount,
      totalAmount,
      paidAmount: numericPaid,
      dueAmount,
      paymentStatus: determinedStatus,
      paymentMethod,
      notes: notes || 'Thank you for choosing TechFix Pro Care.',
      warrantyInfo: warrantyInfo || '90 Days Service Warranty on replaced parts.'
    });

    // Sync back with RepairTicket
    const ticket = await RepairTicket.findOne({ ticketId });
    if (ticket) {
      await RepairTicket.findByIdAndUpdate(ticket._id || ticket.id, {
        $set: {
          finalCost: totalAmount,
          paymentStatus: determinedStatus
        }
      });
    }

    res.status(201).json({
      success: true,
      message: `Invoice #${invoiceNumber} created successfully`,
      invoice: newInvoice
    });
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({ success: false, message: 'Failed to create invoice' });
  }
});

// PATCH /api/invoices/:id/payment - Record payment
router.patch('/:id/payment', protectAdmin, requireActiveSubscription, async (req, res) => {
  try {
    const { id } = req.params;
    const { paidAmount, paymentMethod } = req.body;

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const currentPaid = Number(invoice.paidAmount) || 0;
    const newPaid = currentPaid + Number(paidAmount);
    const total = Number(invoice.totalAmount);
    const due = Math.max(0, total - newPaid);

    let newStatus = 'UNPAID';
    if (newPaid >= total) {
      newStatus = 'PAID';
    } else if (newPaid > 0) {
      newStatus = 'PARTIAL';
    }

    const updated = await Invoice.findByIdAndUpdate(
      id,
      {
        $set: {
          paidAmount: newPaid,
          dueAmount: due,
          paymentStatus: newStatus,
          paymentMethod: paymentMethod || invoice.paymentMethod
        }
      },
      { new: true }
    );

    // Sync ticket
    const ticket = await RepairTicket.findOne({ ticketId: invoice.ticketId });
    if (ticket) {
      await RepairTicket.findByIdAndUpdate(ticket._id || ticket.id, {
        $set: { paymentStatus: newStatus }
      });
    }

    res.json({
      success: true,
      message: `Payment of ₹${paidAmount} recorded successfully`,
      invoice: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to record payment' });
  }
});

export default router;
