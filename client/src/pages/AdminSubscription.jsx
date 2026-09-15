import React, { useState } from 'react';
import {
  CreditCard,
  Zap,
  Check,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Sparkles,
  QrCode,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';

export default function AdminSubscription() {
  const { subscription, plans, upgradePlan, simulateToggle, refreshSubscription } = useSubscription();
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [checkoutPlan, setCheckoutPlan] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const isExpired = subscription?.isExpired || subscription?.status === 'EXPIRED';
  const daysLeft = subscription?.daysRemaining ?? 30;

  const handleUpgrade = async (planId) => {
    setProcessing(true);
    setSuccessMessage('');
    const res = await upgradePlan(planId, billingCycle);
    setProcessing(false);
    if (res.success) {
      setSuccessMessage(`Subscription upgraded to ${planId} plan successfully!`);
      setCheckoutPlan(null);
      setTimeout(() => setSuccessMessage(''), 4000);
    }
  };

  const handleToggleSimulate = async (newStatus) => {
    await simulateToggle(newStatus);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Shop Subscription & Paywall Management
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Platform access plan for the repair shop administrator. An active plan is required to create tickets, edit stock, and send customer alerts.
        </p>
      </div>

      {/* Success alert */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* CURRENT ACTIVE SUBSCRIPTION CARD */}
      <div className={`p-6 rounded-3xl border shadow-sm ${
        isExpired
          ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800'
          : 'bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white border-blue-800'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
                Current Subscription Status
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                isExpired
                  ? 'bg-rose-600 text-white'
                  : 'bg-emerald-500 text-white'
              }`}>
                {isExpired ? 'EXPIRED / UNPAID' : 'ACTIVE'}
              </span>
            </div>

            <h2 className={`text-2xl font-black ${isExpired ? 'text-rose-900 dark:text-rose-200' : 'text-white'}`}>
              {subscription?.plan || 'PRO'} REPAIR SHOP PLAN
            </h2>

            <p className={`text-xs ${isExpired ? 'text-rose-700 dark:text-rose-300' : 'text-slate-300'}`}>
              {isExpired ? (
                <span>⚠️ Your subscription is currently expired. Paywall locks are active for management routes.</span>
              ) : (
                <span>Valid until {new Date(subscription?.expiresAt || Date.now()).toLocaleDateString()} • {daysLeft} days left</span>
              )}
            </p>
          </div>

          {/* Paywall test toggles */}
          <div className="flex flex-col sm:flex-row items-center gap-2">
            {isExpired ? (
              <button
                onClick={() => handleToggleSimulate('ACTIVE')}
                className="w-full sm:w-auto px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition"
              >
                Simulate Active (Unlock)
              </button>
            ) : (
              <button
                onClick={() => handleToggleSimulate('EXPIRED')}
                className="w-full sm:w-auto px-4 py-2 text-xs font-bold rounded-xl bg-rose-600/80 hover:bg-rose-700 text-white border border-rose-400/40 shadow-sm transition"
              >
                Simulate Expired (Test Paywall)
              </button>
            )}

            <button
              onClick={() => setCheckoutPlan(plans[1] || { id: 'PRO', name: 'Pro Repair Pro', priceINR: 1999 })}
              className="w-full sm:w-auto px-4 py-2 text-xs font-bold rounded-xl bg-white text-slate-900 hover:bg-slate-100 shadow-md transition"
            >
              Renew / Upgrade Plan
            </button>
          </div>
        </div>
      </div>

      {/* Plan Selection Cards */}
      <div className="space-y-4">
        <div className="text-center space-y-1">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Choose the Right Plan for Your Workshop
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Cancel or switch tiers anytime. All plans include dark/light mode and cloud sync.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {(plans && plans.length > 0 ? plans : [
            {
              id: 'STARTER',
              name: 'Starter Shop',
              priceINR: 999,
              ticketLimit: 150,
              features: [
                'Up to 150 Repair Tickets / month',
                'Inventory Stock Management (+ / -)',
                'Basic Billing & Invoicing',
                'Customer Live Status Tracking',
                'Dark / Light Mode'
              ]
            },
            {
              id: 'PRO',
              name: 'Pro Repair Pro',
              priceINR: 1999,
              ticketLimit: 1000,
              recommended: true,
              features: [
                'Unlimited Repair Tickets',
                'Automated WhatsApp Intake & Delivery Alerts',
                'Automated Email Notification System',
                'Full Inventory (+ / -) with Low Stock Alerts',
                'Tax & GST Invoicing with Shop Branding',
                'Priority Cloud Backup & Multi-Technician'
              ]
            },
            {
              id: 'ENTERPRISE',
              name: 'Enterprise Multi-Store',
              priceINR: 3999,
              ticketLimit: 99999,
              features: [
                'All Pro Features Included',
                'Multiple Branch Locations',
                'Dedicated WhatsApp Business API Gateway',
                'Custom Domain Branding',
                'Staff Role Management & Commission Tracking',
                '24/7 Dedicated Account Manager'
              ]
            }
          ]).map((p) => {
            const isCurrent = subscription?.plan === p.id;

            return (
              <div
                key={p.id}
                className={`relative p-6 rounded-3xl border-2 flex flex-col justify-between transition-all ${
                  p.recommended
                    ? 'border-blue-600 bg-white dark:bg-slate-900 shadow-xl shadow-blue-500/10 ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm'
                }`}
              >
                {p.recommended && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-[10px] font-extrabold text-white uppercase tracking-wider shadow">
                    Most Popular Choice
                  </span>
                )}

                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">{p.name}</h4>
                    <div className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
                      ₹{p.priceINR}
                      <span className="text-xs font-normal text-slate-500"> / month</span>
                    </div>
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                    {p.features?.map((f, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setCheckoutPlan(p)}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                      isCurrent
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        : p.recommended
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/25'
                        : 'border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <span>{isCurrent ? 'Current Plan (Extend)' : `Choose ${p.name}`}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mock Checkout Modal */}
      {checkoutPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Activate Subscription: {checkoutPlan.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Total Payable: <strong className="text-slate-900 dark:text-white">₹{checkoutPlan.priceINR} / month</strong>
            </p>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
                <QrCode className="w-4 h-4 text-blue-500" />
                <span>Simulated UPI & Card Payment Gateway</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Clicking confirm simulates instant payment authorization and immediately marks your subscription as ACTIVE with 30 days validity.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCheckoutPlan(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={processing}
                onClick={() => handleUpgrade(checkoutPlan.id)}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition disabled:opacity-50"
              >
                {processing ? 'Authorizing...' : `Pay ₹${checkoutPlan.priceINR} & Activate`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
