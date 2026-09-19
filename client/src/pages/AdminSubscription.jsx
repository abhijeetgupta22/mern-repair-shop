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
  ShieldAlert,
  Gift,
  CalendarCheck,
  Copy,
  CheckCircle2,
  Receipt
} from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';
import SubscriptionPaymentModal from '../components/SubscriptionPaymentModal';

export default function AdminSubscription() {
  const { subscription, plans, simulateToggle, ownerPaymentConfig } = useSubscription();
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPlanForModal, setSelectedPlanForModal] = useState('3_MONTHS');
  const [copiedUPI, setCopiedUPI] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const payeeUPI = ownerPaymentConfig?.upiId || 'guptaabhijeet396@okhdfcbank';
  const payeeName = ownerPaymentConfig?.payeeName || 'Abhijeet Gupta';

  const isExpired = subscription?.isExpired || subscription?.status === 'EXPIRED';
  const isTrial = subscription?.plan === 'FREE_TRIAL' || subscription?.status === 'TRIAL';
  const daysLeft = subscription?.daysRemaining ?? 28;

  const handleCopyOwnerUPI = () => {
    navigator.clipboard.writeText(payeeUPI);
    setCopiedUPI(true);
    setTimeout(() => setCopiedUPI(false), 2000);
  };

  const handleToggleSimulate = async (newStatus) => {
    await simulateToggle(newStatus);
    setSuccessMessage(
      newStatus === 'ACTIVE'
        ? 'Subscription successfully simulated as ACTIVE (Unlocked)!'
        : 'Subscription successfully simulated as EXPIRED (Paywall Active)!'
    );
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const activePlans = [
    {
      id: '1_MONTH',
      name: '1 Month Shop Plan',
      priceINR: 599,
      durationDays: 30,
      badge: 'Monthly',
      features: [
        'Full Shop Access for 30 Days',
        'Unlimited Repair Tickets Intake',
        'Inventory (+ / -) Stock Control',
        'Custom Parts & Labor Billing + Print',
        'Automated WhatsApp Intake & Delivery Alerts',
        'Automated Email Confirmation System',
        'Customer Live Status Tracking'
      ]
    },
    {
      id: '3_MONTHS',
      name: '3 Months Value Plan',
      priceINR: 1699,
      durationDays: 90,
      recommended: true,
      badge: 'Best Value • Save ₹98',
      features: [
        'Full Shop Access for 90 Days (3 Months)',
        'Effectively ₹566 / Month (Save ₹98)',
        'Includes Everything in 1 Month Plan',
        'Custom UPI QR Code on Invoices',
        'Dynamic Shop Profile Branding',
        'Priority Technical Support & Cloud Backup',
        'Free Light & Dark Mode Customization'
      ]
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Shop Subscription & Paywall Management
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Your shop starts with a <strong>28-day free trial</strong>. After 28 days, renew with affordable 1-month or 3-month plans to keep creating repair tickets, editing inventory, and sending customer alerts.
        </p>
      </div>

      {/* Success alert */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* CURRENT ACTIVE SUBSCRIPTION STATUS CARD */}
      <div className={`p-6 rounded-3xl border shadow-sm ${
        isExpired
          ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800'
          : 'bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white border-blue-800'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
                Current Plan Status
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                isExpired
                  ? 'bg-rose-600 text-white'
                  : isTrial
                  ? 'bg-amber-500 text-white'
                  : 'bg-emerald-500 text-white'
              }`}>
                {isExpired ? 'EXPIRED / UNPAID' : isTrial ? '28-DAY FREE TRIAL' : 'ACTIVE'}
              </span>
            </div>

            <h2 className={`text-2xl font-black ${isExpired ? 'text-rose-900 dark:text-rose-200' : 'text-white'}`}>
              {subscription?.plan === '3_MONTHS'
                ? '3 Months Value Plan (90 Days)'
                : subscription?.plan === '1_MONTH'
                ? '1 Month Shop Plan (30 Days)'
                : '28-Day Free Access Trial'}
            </h2>

            <p className={`text-xs ${isExpired ? 'text-rose-700 dark:text-rose-300' : 'text-slate-300'}`}>
              {isExpired ? (
                <span>⚠️ Your access period has ended. Please renew below with ₹599 or ₹1,699 to unlock management features.</span>
              ) : (
                <span>Valid until {new Date(subscription?.expiresAt || Date.now()).toLocaleDateString()} • <strong className="text-white">{daysLeft} days remaining</strong></span>
              )}
            </p>
          </div>

          {/* Controls & Simulator */}
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
                title="Simulate expiration to test paywall restrictions"
              >
                Simulate Expired (Test Paywall)
              </button>
            )}

            <button
              onClick={() => {
                setSelectedPlanForModal('3_MONTHS');
                setPaymentModalOpen(true);
              }}
              className="w-full sm:w-auto px-4 py-2 text-xs font-bold rounded-xl bg-white text-slate-900 hover:bg-slate-100 shadow-md transition"
            >
              Renew / Extend Plan
            </button>
          </div>
        </div>
      </div>

      {/* 28-Day Trial Info Callout */}
      <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-start gap-3">
        <Gift className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs">
          <span className="font-bold text-blue-900 dark:text-blue-200 block">
            How our subscription model works:
          </span>
          <p className="text-blue-800 dark:text-blue-300 mt-0.5">
            Every new admin gets <strong>28 days 100% free</strong> to test tickets, inventory (+ / -), and billing. After 28 days, renew for <strong>₹599 (1 month)</strong> or <strong>₹1,699 (3 months)</strong>. No surprise charges, no contracts.
          </p>
        </div>
      </div>

      {/* Verified Owner Payment Details Card */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                Platform Payment Recipient: {payeeName}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[10px] font-black uppercase">
                Verified UPI
              </span>
            </div>
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
              UPI ID: <strong className="text-slate-800 dark:text-slate-200">{payeeUPI}</strong>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopyOwnerUPI}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-200 text-xs shadow-sm transition"
        >
          {copiedUPI ? (
            <>
              <Check className="w-4 h-4 text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-slate-500" />
              <span>Copy Payee UPI ID</span>
            </>
          )}
        </button>
      </div>

      {/* Plan Selection Cards */}
      <div className="space-y-4">
        <div className="text-center space-y-1">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Choose Your Renewal Option
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Instant activation with Direct UPI QR Code (GPay, PhonePe, Paytm, BHIM) or UTR verification.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          {activePlans.map((p) => {
            const isCurrent = subscription?.plan === p.id && !isExpired;

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
                    {p.badge || 'Most Popular'}
                  </span>
                )}

                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">{p.name}</h4>
                    <div className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
                      ₹{p.priceINR}
                      <span className="text-xs font-normal text-slate-500 ml-1">
                        / {p.durationDays} days
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                    {p.features.map((f, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => {
                      setSelectedPlanForModal(p.id);
                      setPaymentModalOpen(true);
                    }}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                      isCurrent
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        : p.recommended
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/25'
                        : 'border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <span>{isCurrent ? 'Current Plan (Extend)' : `Select ${p.name}`}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment & Transaction History */}
      {subscription?.paymentHistory && subscription.paymentHistory.length > 0 && (
        <div className="space-y-3 pt-4">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Recent Subscription Payments & Receipts
            </h3>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Plan</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">UTR / Transaction ID</th>
                  <th className="py-3 px-4">Paid To</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {subscription.paymentHistory.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(item.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {item.plan === '3_MONTHS' ? '3 Months Value Plan' : '1 Month Shop Plan'}
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{item.amount}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                      {item.utr || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {item.paidToUPI || payeeUPI}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{item.status || 'PAID'}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Direct UPI Scan & Pay Modal */}
      <SubscriptionPaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        initialPlanId={selectedPlanForModal}
      />
    </div>
  );
}
