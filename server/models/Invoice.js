import mongoose from 'mongoose';
import { createAdapter } from './dbAdapter.js';

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  ticketId: { type: String, required: true },
  customer: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: '' },
    address: { type: String, default: '' }
  },
  deviceSummary: { type: String, default: '' },
  items: [
    {
      description: { type: String, required: true },
      type: { type: String, enum: ['PART', 'LABOR', 'DIAGNOSTIC', 'ACCESSORY'], default: 'PART' },
      quantity: { type: Number, default: 1 },
      unitPrice: { type: Number, default: 0 },
      total: { type: Number, default: 0 }
    }
  ],
  laborFee: { type: Number, default: 0 },
  subtotal: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  taxRate: { type: Number, default: 18 }, // e.g. 18% GST / VAT
  taxAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  paidAmount: { type: Number, default: 0 },
  dueAmount: { type: Number, default: 0 },
  paymentStatus: {
    type: String,
    enum: ['PAID', 'PARTIAL', 'UNPAID'],
    default: 'UNPAID'
  },
  paymentMethod: {
    type: String,
    enum: ['CASH', 'UPI', 'CARD', 'NET_BANKING', 'PENDING'],
    default: 'PENDING'
  },
  notes: { type: String, default: 'Thank you for choosing TechFix Pro Care.' },
  warrantyInfo: { type: String, default: '90 Days Service Warranty on replaced parts.' },
  issuedDate: { type: Date, default: Date.now }
}, { timestamps: true });

let MongooseInvoice = null;
try {
  MongooseInvoice = mongoose.models.Invoice || mongoose.model('Invoice', invoiceSchema);
} catch (e) {}

export const Invoice = createAdapter('invoices', MongooseInvoice);
