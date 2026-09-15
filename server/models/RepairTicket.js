import mongoose from 'mongoose';
import { createAdapter } from './dbAdapter.js';

const repairTicketSchema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true },
  customer: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: '' },
    address: { type: String, default: '' }
  },
  device: {
    type: { type: String, enum: ['LAPTOP', 'DESKTOP', 'MOBILE', 'TABLET', 'OTHER'], default: 'LAPTOP' },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    serialNumber: { type: String, default: '' },
    accessoriesReceived: [{ type: String }],
    passcode: { type: String, default: '' }
  },
  issueDescription: { type: String, required: true },
  status: {
    type: String,
    enum: [
      'RECEIVED',
      'DIAGNOSING',
      'WAITING_PARTS',
      'IN_REPAIR',
      'QUALITY_CHECK',
      'READY_FOR_DELIVERY',
      'DELIVERED',
      'CANCELLED'
    ],
    default: 'RECEIVED'
  },
  statusHistory: [
    {
      status: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
      note: { type: String, default: '' },
      updatedBy: { type: String, default: 'Admin' }
    }
  ],
  technician: { type: String, default: 'Chief Tech' },
  estimatedDeliveryDate: { type: Date },
  estimatedCost: { type: Number, default: 0 },
  laborCost: { type: Number, default: 0 },
  partsUsed: [
    {
      inventoryItemId: { type: String },
      name: { type: String },
      quantity: { type: Number, default: 1 },
      unitPrice: { type: Number, default: 0 },
      total: { type: Number, default: 0 }
    }
  ],
  finalCost: { type: Number, default: 0 },
  paymentStatus: {
    type: String,
    enum: ['UNPAID', 'PARTIAL', 'PAID'],
    default: 'UNPAID'
  },
  notificationsSent: {
    intakeWhatsApp: { type: Boolean, default: false },
    intakeEmail: { type: Boolean, default: false },
    readyWhatsApp: { type: Boolean, default: false },
    readyEmail: { type: Boolean, default: false }
  },
  internalNotes: { type: String, default: '' }
}, { timestamps: true });

let MongooseTicket = null;
try {
  MongooseTicket = mongoose.models.RepairTicket || mongoose.model('RepairTicket', repairTicketSchema);
} catch (e) {}

export const RepairTicket = createAdapter('tickets', MongooseTicket);
