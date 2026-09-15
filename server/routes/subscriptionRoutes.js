import express from 'express';
import { Admin } from '../models/Admin.js';
import { protectAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

export const SUBSCRIPTION_PLANS = [
  {
    id: 'STARTER',
    name: 'Starter Shop',
    priceINR: 999,
    priceUSD: 19,
    billingCycle: 'monthly',
    ticketLimit: 150,
    features: [
      'Up to 150 Repair Tickets / month',
      'Inventory Stock Management (+ / -)',
      'Basic Billing & Invoice Printing',
      'Customer Live Status Tracking',
      'Standard Dark / Light Mode'
    ],
    recommended: false
  },
  {
    id: 'PRO',
    name: 'Pro Repair Pro',
    priceINR: 1999,
    priceUSD: 39,
    billingCycle: 'monthly',
    ticketLimit: 1000,
    features: [
      'Unlimited Repair Tickets',
      'Automated WhatsApp Intake & Delivery Alerts',
      'Automated Email Notification System',
      'Full Inventory with Low Stock Warnings',
      'Tax & GST Invoicing with Shop Branding',
      'Priority Support & Cloud Backup'
    ],
    recommended: true
  },
  {
    id: 'ENTERPRISE',
    name: 'Enterprise Multi-Store',
    priceINR: 3999,
    priceUSD: 79,
    billingCycle: 'monthly',
    ticketLimit: 99999,
    features: [
      'All Pro Features Included',
      'Multiple Branch Locations',
      'Dedicated WhatsApp Business API Gateway',
      'Custom Domain Support',
      'Staff Role Management & Commission Tracking',
      '24/7 Dedicated Account Manager'
    ],
    recommended: false
  }
];

// GET /api/subscriptions/plans - Public / Authenticated plans listing
router.get('/plans', (req, res) => {
  res.json({ success: true, plans: SUBSCRIPTION_PLANS });
});

// GET /api/subscriptions/status - Get current admin's subscription
router.get('/status', protectAdmin, async (req, res) => {
  try {
    const admin = req.admin;
    const sub = admin.subscription || {
      plan: 'PRO',
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    };

    const now = new Date();
    const expiresAt = new Date(sub.expiresAt);
    const msRemaining = expiresAt.getTime() - now.getTime();
    const daysRemaining = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));
    const isExpired = msRemaining <= 0 || sub.status === 'EXPIRED';

    res.json({
      success: true,
      subscription: {
        ...sub,
        isExpired,
        daysRemaining,
        isActive: !isExpired && (sub.status === 'ACTIVE' || sub.status === 'TRIAL')
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve subscription status' });
  }
});

// POST /api/subscriptions/upgrade - Simulate or process payment to activate/renew plan
router.post('/upgrade', protectAdmin, async (req, res) => {
  try {
    const { planId, paymentMethod = 'SIMULATED_UPI', billingCycle = 'monthly' } = req.body;
    const adminId = req.admin._id || req.admin.id;

    const selectedPlan = SUBSCRIPTION_PLANS.find(p => p.id === planId) || SUBSCRIPTION_PLANS[1];

    const durationDays = billingCycle === 'yearly' ? 365 : 30;
    const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

    const updatedSubscription = {
      plan: selectedPlan.id,
      status: 'ACTIVE',
      startDate: new Date(),
      expiresAt,
      price: selectedPlan.priceINR,
      billingCycle,
      ticketLimit: selectedPlan.ticketLimit
    };

    const updatedAdmin = await Admin.findByIdAndUpdate(
      adminId,
      { $set: { subscription: updatedSubscription } },
      { new: true }
    );

    const safeAdmin = { ...updatedAdmin };
    delete safeAdmin.password;

    res.json({
      success: true,
      message: `Subscription successfully upgraded to ${selectedPlan.name}!`,
      transactionId: 'TXN_' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      subscription: updatedSubscription,
      admin: safeAdmin
    });
  } catch (error) {
    console.error('Subscription upgrade error:', error);
    res.status(500).json({ success: false, message: 'Failed to upgrade subscription' });
  }
});

// POST /api/subscriptions/simulate-toggle - Allow toggling between ACTIVE and EXPIRED for testing
router.post('/simulate-toggle', protectAdmin, async (req, res) => {
  try {
    const { status } = req.body; // 'ACTIVE' or 'EXPIRED'
    const adminId = req.admin._id || req.admin.id;

    const newStatus = status === 'EXPIRED' ? 'EXPIRED' : 'ACTIVE';
    const expiresAt = newStatus === 'EXPIRED' 
      ? new Date(Date.now() - 24 * 60 * 60 * 1000) // Yesterday
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days ahead

    const updatedAdmin = await Admin.findByIdAndUpdate(
      adminId,
      {
        $set: {
          'subscription.status': newStatus,
          'subscription.expiresAt': expiresAt
        }
      },
      { new: true }
    );

    res.json({
      success: true,
      message: `Subscription simulated as ${newStatus}`,
      subscription: updatedAdmin.subscription
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to toggle status' });
  }
});

export default router;
