import mongoose from 'mongoose';
import { createAdapter } from './dbAdapter.js';

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  shopName: { type: String, default: 'Pro Tech Repair Hub' },
  phone: { type: String, default: '+91 98765 43210' },
  address: { type: String, default: 'Shop 104, Tech Plaza, Station Road' },
  upiId: { type: String, default: 'techfix@upi' },
  subscription: {
    plan: { type: String, enum: ['FREE_TRIAL', 'STARTER', 'PRO', 'ENTERPRISE'], default: 'PRO' },
    status: { type: String, enum: ['ACTIVE', 'TRIAL', 'EXPIRED', 'PAST_DUE'], default: 'ACTIVE' },
    startDate: { type: Date, default: Date.now },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days active
    },
    price: { type: Number, default: 49 },
    billingCycle: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' },
    ticketLimit: { type: Number, default: 500 }
  }
}, { timestamps: true });

let MongooseAdmin = null;
try {
  MongooseAdmin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);
} catch (e) {
  // Ignored if mongoose not yet initialized
}

export const Admin = createAdapter('admins', MongooseAdmin);
