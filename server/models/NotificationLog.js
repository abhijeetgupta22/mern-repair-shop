import mongoose from 'mongoose';
import { createAdapter } from './dbAdapter.js';

const notificationLogSchema = new mongoose.Schema({
  ticketId: { type: String, required: true },
  recipientName: { type: String, required: true },
  recipientContact: { type: String, required: true }, // phone or email
  channel: { type: String, enum: ['WHATSAPP', 'EMAIL'], required: true },
  triggerType: {
    type: String,
    enum: ['INTAKE_CONFIRMATION', 'READY_FOR_DELIVERY', 'STATUS_UPDATE', 'CUSTOM'],
    required: true
  },
  subject: { type: String, default: '' },
  messageBody: { type: String, required: true },
  status: { type: String, enum: ['SENT', 'SIMULATED', 'FAILED'], default: 'SENT' },
  meta: { type: Object, default: {} },
  sentAt: { type: Date, default: Date.now }
}, { timestamps: true });

let MongooseNotif = null;
try {
  MongooseNotif = mongoose.models.NotificationLog || mongoose.model('NotificationLog', notificationLogSchema);
} catch (e) {}

export const NotificationLog = createAdapter('notifications', MongooseNotif);
