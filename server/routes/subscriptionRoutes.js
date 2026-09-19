import express from 'express';
import { Admin } from '../models/Admin.js';
import { protectAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

export const SUBSCRIPTION_PLANS = [
  {
    id: 'FREE_TRIAL',
    name: '28-Day Free Trial',
    priceINR: 0,
    durationDays: 28,
    billingCycle: 'trial',
    ticketLimit: 99999,
    features: [
      '28 Days 100% Free Full Access',
      'Unlimited Repair Tickets',
      'Inventory (+ / -) Stock Control',
      'Tax & GST Invoicing with Shop Branding',
      'WhatsApp & Email Customer Alerts',
      'Customer Live Tracking Portal'
    ],
    recommended: false
  },
  {
    id: '1_MONTH',
    name: '1 Month Renewal Plan',
    priceINR: 599,
    durationDays: 30,
    billingCycle: 'monthly',
    ticketLimit: 99999,
    features: [
      'Full Shop Management for 30 Days',
      'Unlimited Repair Tickets',
      'Direct Inventory (+ / -) Stock Adjustment',
      'Custom Parts & Labor Billing + Print',
      'Automated WhatsApp Intake & Delivery Alerts',
      'Automated Email Confirmation System'
    ],
    recommended: false
  },
  {
    id: '3_MONTHS',
    name: '3 Months Value Plan',
    priceINR: 1699,
    durationDays: 90,
    billingCycle: 'quarterly',
    ticketLimit: 99999,
    badge: 'Best Value • Save ₹98',
    features: [
      'Full Shop Management for 90 Days',
      'Includes Everything in 1 Month Plan',
      'Discounted Quarterly Pricing (₹566/mo)',
      'Priority Support & Data Backup',
      'Custom UPI QR Code on Invoices',
      'Free Theme Customization (Dark / Light)'
    ],
    recommended: true
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
      plan: 'FREE_TRIAL',
      status: 'TRIAL',
      expiresAt: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000)
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
    const { planId } = req.body;
    const adminId = req.admin._id || req.admin.id;

    let selectedPlan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
    if (!selectedPlan) {
      selectedPlan = SUBSCRIPTION_PLANS.find(p => p.id === '1_MONTH');
    }

    const durationDays = selectedPlan.durationDays || 30;
    const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

    const updatedSubscription = {
      plan: selectedPlan.id,
      status: 'ACTIVE',
      startDate: new Date(),
      expiresAt,
      price: selectedPlan.priceINR,
      billingCycle: selectedPlan.billingCycle,
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
      message: `Subscription successfully renewed with ${selectedPlan.name}! Valid for ${durationDays} days.`,
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
      : new Date(Date.now() + 28 * 24 * 60 * 60 * 1000); // 28 days ahead

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
