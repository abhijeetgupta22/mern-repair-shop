import React, { useState } from 'react';
import {
  Lock,
  X,
  Check,
  CreditCard,
  Sparkles,
  ShieldCheck,
  Calendar,
  Gift
} from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';

export default function PaywallModal() {
  const { showPaywallModal, closePaywall, paywallReason, plans, upgradePlan } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState('3_MONTHS');
  const [processing, setProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!showPaywallModal) return null;

  const handleCheckout = async () => {
    setProcessing(true);
    setSuccessMsg('');
    const res = await upgradePlan(selectedPlan);
    setProcessing(false);
    if (res.success) {
      setSuccessMsg('Payment Simulated & Verified! Your subscription is now Active.');
      setTimeout(() => {
        setSuccessMsg('');
        closePaywall();
      }, 1500);
    }
  };

  const activePlans = (plans && plans.length > 0
    ? plans.filter(p => p.id !== 'FREE_TRIAL')
    : [
        {
          id: '1_MONTH',
          name: '1 Month Renewal Plan',
          priceINR: 599,
          durationDays: 30,
          features: ['30 Days Full Access', 'Unlimited Repair Tickets', 'Inventory (+ / -) Control', 'Tax & GST Invoices', 'WhatsApp & Email Alerts']
        },
        {
          id: '3_MONTHS',
          name: '3 Months Value Plan',
          priceINR: 1699,
          durationDays: 90,
          recommended: true,
          badge: 'Save ₹98 • Best Value',
          features: ['90 Days Full Access', 'Just ₹566 / Month', 'Unlimited Repair Tickets', 'Inventory & Billing', 'Automated Notifications', 'Priority Support']
        }
      ]
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8">
        {/* Close button */}
        <button
          onClick={closePaywall}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-500/30 mb-1">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Subscription Renewal Required
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {paywallReason || 'Your 28-day free trial has expired. Renew with one of our flexible plans to continue managing repairs, adjusting inventory, and sending customer WhatsApp updates.'}
          </p>
        </div>

        {/* Trial expired notice badge */}
        <div className="mb-6 p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 flex items-center justify-center gap-2 text-xs font-semibold text-blue-700 dark:text-blue-300">
          <Gift className="w-4 h-4 text-blue-500" />
          <span>28 Days Free Trial Completed • Select a Renewal Option</span>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {activePlans.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative cursor-pointer p-5 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 shadow-md ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                {plan.recommended && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-[10px] font-bold text-white uppercase tracking-wider shadow">
                    {plan.badge || 'Best Value'}
                  </span>
                )}

                <div className="text-center space-y-1 mb-3">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{plan.name}</h4>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    ₹{plan.priceINR}
                    <span className="text-xs font-normal text-slate-500 ml-1">
                      for {plan.durationDays || 30} days
                    </span>
                  </div>
                </div>

                <ul className="space-y-1.5 text-left text-[11px] text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
                  {(plan.features || []).map((f, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Success message */}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs text-center font-medium flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Checkout Button */}
        <div className="space-y-3">
          <button
            onClick={handleCheckout}
            disabled={processing}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold shadow-lg shadow-blue-500/25 transition disabled:opacity-50 text-sm"
          >
            {processing ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                <span>Pay & Activate Plan (Simulate UPI / Card Verification)</span>
              </>
            )}
          </button>

          <p className="text-center text-[11px] text-slate-400">
            🔒 256-Bit Encrypted Demo Gateway • Instant Account Renewal
          </p>
        </div>
      </div>
    </div>
  );
}
