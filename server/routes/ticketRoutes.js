import express from 'express';
import { RepairTicket } from '../models/RepairTicket.js';
import { InventoryItem } from '../models/InventoryItem.js';
import { protectAdmin } from '../middleware/authMiddleware.js';
import { requireActiveSubscription } from '../middleware/subscriptionMiddleware.js';
import { whatsappService } from '../services/whatsappService.js';
import { emailService } from '../services/emailService.js';

const router = express.Router();

// Helper to generate formatted ticket ID
async function generateNextTicketId() {
  const all = await RepairTicket.find();
  const baseNum = 1000 + all.length + 1;
  return `REP-${baseNum}`;
}

// ----------------------------------------------------
// PUBLIC ROUTE: Live Status Tracking by Customer
// ----------------------------------------------------
// GET /api/tickets/track/:query (Query can be Ticket ID like 'REP-1001' or Phone number)
router.get('/track/:query', async (req, res) => {
  try {
    const rawQuery = req.params.query.trim();

    const all = await RepairTicket.find();
    let ticket = all.find(t => 
      t.ticketId.toUpperCase() === rawQuery.toUpperCase() ||
      (t.customer && t.customer.phone && t.customer.phone.replace(/\D/g, '') === rawQuery.replace(/\D/g, ''))
    );

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: `No active repair ticket found matching "${rawQuery}". Please check your Ticket ID or contact store support.`
      });
    }

    // Return safe public tracking payload (mask sensitive internal technician notes)
    const publicData = {
      ticketId: ticket.ticketId,
      customer: {
        name: ticket.customer?.name || 'Customer',
        phoneMasked: ticket.customer?.phone ? ticket.customer.phone.replace(/.(?=.{4})/g, '*') : '***'
      },
      device: {
        type: ticket.device?.type,
        brand: ticket.device?.brand,
        model: ticket.device?.model
      },
      issueDescription: ticket.issueDescription,
      status: ticket.status,
      statusHistory: ticket.statusHistory || [],
      estimatedDeliveryDate: ticket.estimatedDeliveryDate,
      estimatedCost: ticket.estimatedCost,
      finalCost: ticket.finalCost,
      paymentStatus: ticket.paymentStatus,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt
    };

    res.json({ success: true, ticket: publicData });
  } catch (error) {
    console.error('Public track error:', error);
    res.status(500).json({ success: false, message: 'Server error while tracking ticket' });
  }
});

// ----------------------------------------------------
// ADMIN PROTECTED ROUTES
// ----------------------------------------------------

// GET /api/tickets/stats/dashboard - Dashboard KPIs and metrics
router.get('/stats/dashboard', protectAdmin, async (req, res) => {
  try {
    const tickets = await RepairTicket.find();
    const inventory = await InventoryItem.find();

    const totalTickets = tickets.length;
    const received = tickets.filter(t => t.status === 'RECEIVED').length;
    const diagnosing = tickets.filter(t => t.status === 'DIAGNOSING').length;
    const waitingParts = tickets.filter(t => t.status === 'WAITING_PARTS').length;
    const inRepair = tickets.filter(t => t.status === 'IN_REPAIR').length;
    const qualityCheck = tickets.filter(t => t.status === 'QUALITY_CHECK').length;
    const readyForDelivery = tickets.filter(t => t.status === 'READY_FOR_DELIVERY').length;
    const delivered = tickets.filter(t => t.status === 'DELIVERED').length;

    const activeTickets = totalTickets - delivered - tickets.filter(t => t.status === 'CANCELLED').length;

    const lowStockItems = inventory.filter(i => Number(i.stockQuantity) <= Number(i.minStockThreshold)).length;

    // Total revenue calculation
    const totalRevenue = tickets
      .filter(t => t.paymentStatus === 'PAID')
      .reduce((sum, t) => sum + (Number(t.finalCost) || Number(t.estimatedCost) || 0), 0);

    const pendingRevenue = tickets
      .filter(t => t.paymentStatus !== 'PAID' && t.status !== 'CANCELLED')
      .reduce((sum, t) => sum + (Number(t.finalCost) || Number(t.estimatedCost) || 0), 0);

    // Breakdown by device type
    const deviceBreakdown = {
      LAPTOP: tickets.filter(t => t.device?.type === 'LAPTOP').length,
      DESKTOP: tickets.filter(t => t.device?.type === 'DESKTOP').length,
      MOBILE: tickets.filter(t => t.device?.type === 'MOBILE').length,
      TABLET: tickets.filter(t => t.device?.type === 'TABLET').length,
      OTHER: tickets.filter(t => !['LAPTOP', 'DESKTOP', 'MOBILE', 'TABLET'].includes(t.device?.type)).length
    };

    res.json({
      success: true,
      stats: {
        totalTickets,
        activeTickets,
        received,
        diagnosing,
        waitingParts,
        inRepair,
        qualityCheck,
        readyForDelivery,
        delivered,
        lowStockItems,
        totalRevenue,
        pendingRevenue,
        deviceBreakdown
      },
      recentTickets: tickets.slice(0, 7)
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate dashboard statistics' });
  }
});

// GET /api/tickets - List all tickets with filters
router.get('/', protectAdmin, async (req, res) => {
  try {
    const { status, deviceType, search } = req.query;
    let tickets = await RepairTicket.find();

    if (status && status !== 'ALL') {
      tickets = tickets.filter(t => t.status === status);
    }

    if (deviceType && deviceType !== 'ALL') {
      tickets = tickets.filter(t => t.device?.type === deviceType);
    }

    if (search) {
      const q = search.toLowerCase();
      tickets = tickets.filter(t =>
        (t.ticketId && t.ticketId.toLowerCase().includes(q)) ||
        (t.customer?.name && t.customer.name.toLowerCase().includes(q)) ||
        (t.customer?.phone && t.customer.phone.includes(q)) ||
        (t.device?.brand && t.device.brand.toLowerCase().includes(q)) ||
        (t.device?.model && t.device.model.toLowerCase().includes(q))
      );
    }

    res.json({ success: true, count: tickets.length, tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch tickets' });
  }
});

// GET /api/tickets/:id - Get single ticket by ID
router.get('/:id', protectAdmin, async (req, res) => {
  try {
    const ticket = await RepairTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Repair ticket not found' });
    }
    res.json({ success: true, ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve ticket' });
  }
});

// POST /api/tickets - Create new ticket intake (with automatic WhatsApp & Email dispatch trigger)
router.post('/', protectAdmin, requireActiveSubscription, async (req, res) => {
  try {
    const {
      customer,
      device,
      issueDescription,
      technician = 'Chief Tech',
      estimatedDeliveryDate,
      estimatedCost = 0,
      laborCost = 0,
      internalNotes = '',
      sendNotifications = true
    } = req.body;

    if (!customer?.name || !customer?.phone || !device?.brand || !device?.model || !issueDescription) {
      return res.status(400).json({
        success: false,
        message: 'Customer name, phone, device brand, model, and issue description are required'
      });
    }

    const ticketId = await generateNextTicketId();
    const trackingUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/track/${ticketId}`;

    const newTicket = await RepairTicket.create({
      ticketId,
      customer: {
        name: customer.name,
        phone: customer.phone,
        email: customer.email || '',
        address: customer.address || ''
      },
      device: {
        type: device.type || 'LAPTOP',
        brand: device.brand,
        model: device.model,
        serialNumber: device.serialNumber || '',
        accessoriesReceived: device.accessoriesReceived || [],
        passcode: device.passcode || ''
      },
      issueDescription,
      status: 'RECEIVED',
      statusHistory: [
        {
          status: 'RECEIVED',
          timestamp: new Date(),
          note: 'Device intake completed. Initial assessment pending.',
          updatedBy: req.admin?.name || 'Admin'
        }
      ],
      technician,
      estimatedDeliveryDate: estimatedDeliveryDate ? new Date(estimatedDeliveryDate) : new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      estimatedCost: Number(estimatedCost) || 0,
      laborCost: Number(laborCost) || 0,
      finalCost: Number(estimatedCost) || 0,
      paymentStatus: 'UNPAID',
      notificationsSent: {
        intakeWhatsApp: false,
        intakeEmail: false,
        readyWhatsApp: false,
        readyEmail: false
      },
      internalNotes
    });

    // Generate WhatsApp preview message and URL
    const waMessage = whatsappService.generateIntakeMessage({
      ticketId,
      customerName: customer.name,
      device,
      issue: issueDescription,
      estimatedDeliveryDate: newTicket.estimatedDeliveryDate,
      trackingUrl
    });
    const waUrl = whatsappService.generateWhatsAppUrl(customer.phone, waMessage);

    // Auto-send or simulate notifications
    let emailResult = null;
    if (sendNotifications && customer.email) {
      emailResult = await emailService.sendIntakeEmail({
        ticketId,
        customerName: customer.name,
        customerEmail: customer.email,
        device,
        issue: issueDescription,
        estimatedDeliveryDate: newTicket.estimatedDeliveryDate,
        trackingUrl
      });
      if (emailResult.success) {
        await RepairTicket.findByIdAndUpdate(newTicket._id || newTicket.id, {
          $set: { 'notificationsSent.intakeEmail': true }
        });
      }
    }

    // Log WhatsApp notification record
    await whatsappService.logNotification({
      ticketId,
      customerName: customer.name,
      customerContact: customer.phone,
      triggerType: 'INTAKE_CONFIRMATION',
      messageBody: waMessage,
      meta: { waUrl }
    });

    res.status(201).json({
      success: true,
      message: `Repair Ticket #${ticketId} created successfully!`,
      ticket: newTicket,
      notifications: {
        whatsapp: {
          url: waUrl,
          message: waMessage,
          phone: customer.phone
        },
        email: emailResult
      }
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ success: false, message: 'Failed to create repair ticket' });
  }
});

// PATCH /api/tickets/:id/status - Update repair status (triggers READY_FOR_DELIVERY alerts)
router.patch('/:id/status', protectAdmin, requireActiveSubscription, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note, finalCost, sendAlerts = true } = req.body;

    const ticket = await RepairTicket.findById(id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const previousStatus = ticket.status;
    const newStatus = status;

    const historyEntry = {
      status: newStatus,
      timestamp: new Date(),
      note: note || `Status updated from ${previousStatus} to ${newStatus}`,
      updatedBy: req.admin?.name || 'Admin'
    };

    const updateFields = {
      status: newStatus,
      statusHistory: [...(ticket.statusHistory || []), historyEntry]
    };

    if (finalCost !== undefined) {
      updateFields.finalCost = Number(finalCost);
    }

    const updated = await RepairTicket.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    );

    // Notification handling for READY_FOR_DELIVERY
    let notificationPayload = null;
    if (newStatus === 'READY_FOR_DELIVERY' && sendAlerts) {
      const trackingUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/track/${ticket.ticketId}`;
      const waMessage = whatsappService.generateReadyForDeliveryMessage({
        ticketId: ticket.ticketId,
        customerName: ticket.customer?.name,
        device: ticket.device,
        finalCost: updated.finalCost || ticket.estimatedCost,
        paymentStatus: updated.paymentStatus,
        trackingUrl
      });
      const waUrl = whatsappService.generateWhatsAppUrl(ticket.customer?.phone, waMessage);

      // Email dispatch
      let emailResult = null;
      if (ticket.customer?.email) {
        emailResult = await emailService.sendReadyForDeliveryEmail({
          ticketId: ticket.ticketId,
          customerName: ticket.customer.name,
          customerEmail: ticket.customer.email,
          device: ticket.device,
          finalCost: updated.finalCost || ticket.estimatedCost,
          paymentStatus: updated.paymentStatus,
          trackingUrl
        });
      }

      await whatsappService.logNotification({
        ticketId: ticket.ticketId,
        customerName: ticket.customer?.name,
        customerContact: ticket.customer?.phone,
        triggerType: 'READY_FOR_DELIVERY',
        messageBody: waMessage,
        meta: { waUrl }
      });

      notificationPayload = {
        whatsapp: {
          url: waUrl,
          message: waMessage,
          phone: ticket.customer?.phone
        },
        email: emailResult
      };
    }

    res.json({
      success: true,
      message: `Status updated to ${newStatus}`,
      ticket: updated,
      notificationAlert: notificationPayload
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update repair status' });
  }
});

// PUT /api/tickets/:id - Full ticket edit (add parts, update cost, technician notes)
router.put('/:id', protectAdmin, requireActiveSubscription, async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await RepairTicket.findById(id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const {
      customer,
      device,
      issueDescription,
      technician,
      estimatedDeliveryDate,
      estimatedCost,
      laborCost,
      finalCost,
      partsUsed,
      paymentStatus,
      internalNotes
    } = req.body;

    const updateFields = {};
    if (customer) updateFields.customer = customer;
    if (device) updateFields.device = device;
    if (issueDescription) updateFields.issueDescription = issueDescription;
    if (technician) updateFields.technician = technician;
    if (estimatedDeliveryDate) updateFields.estimatedDeliveryDate = new Date(estimatedDeliveryDate);
    if (estimatedCost !== undefined) updateFields.estimatedCost = Number(estimatedCost);
    if (laborCost !== undefined) updateFields.laborCost = Number(laborCost);
    if (finalCost !== undefined) updateFields.finalCost = Number(finalCost);
    if (partsUsed) updateFields.partsUsed = partsUsed;
    if (paymentStatus) updateFields.paymentStatus = paymentStatus;
    if (internalNotes !== undefined) updateFields.internalNotes = internalNotes;

    const updated = await RepairTicket.findByIdAndUpdate(id, { $set: updateFields }, { new: true });

    res.json({ success: true, message: 'Ticket details updated successfully', ticket: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update ticket' });
  }
});

export default router;
