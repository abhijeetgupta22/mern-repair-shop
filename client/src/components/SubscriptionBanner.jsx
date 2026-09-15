import React from 'react';
import { AlertTriangle, Zap, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';

export default function SubscriptionBanner({ onNavigate }) {
  const { subscription, openPaywall, simulateToggle } = useSubscription();

  if (!subscription) return null;

  const isExpired = subscription.isExpired || subscription.status === 'EXPIRED';
  const daysLeft = subscription.daysRemaining ?? 30;

  if (isExpired) {
    return (
      <div className="bg-rose-500 text-white px-4 py-2.5 shadow-md flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm animate-fadeIn">
        <div className="flex items-center gap-2 font-medium">
          <ShieldAlert className="w-5 h-5 flex-shrink-0 animate-bounce" />
          <span>
            <strong>Shop Subscription Expired:</strong> Your plan has lapsed. Admin features like creating tickets, adjusting inventory stock, and sending WhatsApp notifications are locked.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => simulateToggle('ACTIVE')}
            className="px-2.5 py-1 text-xs rounded bg-rose-700/80 hover:bg-rose-800 text-white font-medium"
            title="Demo quick unblock"
          >
            Simulate Active
          </button>
          <button
            onClick={() => openPaywall('Subscription Expired')}
            className="px-3.5 py-1 text-xs font-bold rounded bg-white text-rose-600 hover:bg-rose-50 shadow-sm transition"
          >
            Renew Now
          </button>
        </div>
      </div>
    );
  }

  // Active / Trial banner
  return (
    <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs border-b border-blue-800/40">
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-slate-300">
          Current Plan: <strong className="text-white">{subscription.plan} TIER</strong> ({daysLeft} days remaining)
        </span>
        <span className="hidden md:inline-block text-slate-400">• Unlimited Tickets & WhatsApp Alerts Active</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => simulateToggle('EXPIRED')}
          className="text-[11px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          title="Simulate expiration to test paywall"
        >
          Simulate Expired (Test Paywall)
        </button>
        <button
          onClick={() => onNavigate ? onNavigate('admin-subscription') : openPaywall()}
          className="text-[11px] px-2.5 py-0.5 rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 border border-blue-400/30 font-medium transition"
        >
          Manage Plans
        </button>
      </div>
    </div>
  );
}
