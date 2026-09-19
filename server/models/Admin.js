import mongoose from 'mongoose';
import { createAdapter } from './dbAdapter.js';

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  shopName: { type: String, default: 'Apex Laptop & Mobile Repair Hub' },
  phone: { type: String, default: '+91 98765 43210' },
  address: { type: String, default: 'Shop 104, Tech Arcade, Electronics Market' },
  shopEmail: { type: String, default: 'apexrepaircare@gmail.com' },
  upiId: { type: String, default: 'apexrepair@upi' },
  isConfigured: { type: Boolean, default: false },
  subscription: {
    plan: { type: String, enum: ['FREE_TRIAL', '1_MONTH', '3_MONTHS'], default: 'FREE_TRIAL' },
    status: { type: String, enum: ['ACTIVE', 'TRIAL', 'EXPIRED'], default: 'TRIAL' },
    startDate: { type: Date, default: Date.now },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 28 * 24 * 60 * 60 * 1000) // 28-day free trial
    },
    price: { type: Number, default: 0 },
    billingCycle: { type: String, enum: ['trial', 'monthly', 'quarterly'], default: 'trial' },
    ticketLimit: { type: Number, default: 99999 },
    lastPaymentRef: { type: String, default: '' },
    lastPaymentDate: { type: Date },
    paidToUPI: { type: String, default: 'guptaabhijeet396@okhdfcbank' },
    paidToName: { type: String, default: 'Abhijeet Gupta' },
    paymentHistory: [
      {
        plan: String,
        amount: Number,
        utr: String,
        paidToUPI: String,
        paidToName: String,
        date: { type: Date, default: Date.now },
        status: { type: String, default: 'PAID' }
      }
    ]
  }
}, { timestamps: true });

let MongooseAdmin = null;
try {
  MongooseAdmin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);
} catch (e) {
  // Ignored if mongoose not yet initialized
}

export const Admin = createAdapter('admins', MongooseAdmin);
