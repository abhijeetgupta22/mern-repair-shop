import React, { useState } from 'react';
import {
  X,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  QrCode,
  Sparkles,
  Lock,
  Smartphone,
  Info,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';

export default function SubscriptionPaymentModal({
  isOpen,
  onClose,
  initialPlanId = '3_MONTHS',
  reason = ''
}) {
  const { plans, upgradePlan, ownerPaymentConfig } = useSubscription();
  const [selectedPlanId, setSelectedPlanId] = useState(initialPlanId || '3_MONTHS');
  const [utrNumber, setUtrNumber] = useState('');
  const [copied, setCopied] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successData, setSuccessData] = useState(null);

  if (!isOpen) return null;

  // Fallback plans if not loaded
  const availablePlans = (plans && plans.length > 0
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

  const selectedPlan = availablePlans.find(p => p.id === selectedPlanId) || availablePlans[0];

  // Platform Owner payment details
  const payeeUPI = ownerPaymentConfig?.upiId || 'guptaabhijeet396@okhdfcbank';
  const payeeName = ownerPaymentConfig?.payeeName || 'Abhijeet Gupta';

  // Construct UPI deep-link string
  const upiPayString = `upi://pay?pa=${encodeURIComponent(payeeUPI)}&pn=${encodeURIComponent(payeeName)}&am=${selectedPlan.priceINR}&cu=INR&tn=${encodeURIComponent(`Repair Shop ${selectedPlan.name}`)}`;

  // Construct crisp QR Code URL
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${encodeURIComponent(upiPayString)}`;

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(payeeUPI);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleConfirmPayment = async (isDemoBypass = false) => {
    setErrorMsg('');
    const reference = isDemoBypass ? `DEMO_${Date.now()}` : utrNumber.trim();

    if (!isDemoBypass && (!reference || reference.length < 4)) {
      setErrorMsg('Please enter the 12-digit UPI UTR / Transaction Reference number from your payment app receipt.');
      return;
    }

    setProcessing(true);
    try {
      const res = await upgradePlan(selectedPlan.id, reference);
      setProcessing(false);
      if (res.success) {
        setSuccessData({
          planName: selectedPlan.name,
          price: selectedPlan.priceINR,
          duration: selectedPlan.durationDays,
          txnId: res.transactionId || reference,
          expiresAt: res.subscription?.expiresAt
        });
      } else {
        setErrorMsg(res.message || 'Payment confirmation failed. Please try again.');
      }
    } catch (err) {
      setProcessing(false);
      setErrorMsg('Connection error. Please try again.');
    }
  };

  const handleFinish = () => {
    setSuccessData(null);
    setUtrNumber('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Close Button */}
        <button
          onClick={successData ? handleFinish : onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {successData ? (
          /* SUCCESS SCREEN */
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner ring-8 ring-emerald-50 dark:ring-emerald-900/20 animate-bounce">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                Payment Verified & Received
              </span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Subscription Activated!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your shop account has been upgraded with full access.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-left space-y-3 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400">Plan Selected:</span>
                <span className="font-bold text-slate-900 dark:text-white">{successData.planName}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400">Amount Paid:</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">₹{successData.price}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400">Paid To:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{payeeName} ({payeeUPI})</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400">Transaction UTR / Ref:</span>
                <span className="font-mono font-medium text-blue-600 dark:text-blue-400">{successData.txnId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Valid Until:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {successData.expiresAt ? new Date(successData.expiresAt).toLocaleDateString(undefined, { dateStyle: 'long' }) : `${successData.duration} Days`}
                </span>
              </div>
            </div>

            <button
              onClick={handleFinish}
              className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-600/30 text-sm transition"
            >
              Continue to Shop Dashboard
            </button>
          </div>
        ) : (
          /* CHECKOUT SCREEN */
          <div className="p-6 sm:p-7 space-y-5">
            {/* Header */}
            <div className="text-center space-y-1 pt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/70 text-blue-700 dark:text-blue-300 text-[11px] font-bold uppercase tracking-wider mb-1">
                <Lock className="w-3.5 h-3.5" />
                <span>Direct UPI Payment Gateway</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Shop Subscription Renewal
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                {reason || '28-day free trial completed. Scan the UPI QR code below to pay directly into the owner bank account.'}
              </p>
            </div>

            {/* Plan Switcher Pills */}
            <div className="grid grid-cols-2 gap-3">
              {availablePlans.map((plan) => {
                const isSelected = selectedPlan.id === plan.id;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`relative p-3.5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/50 shadow-md ring-2 ring-blue-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900'
                    }`}
                  >
                    {plan.recommended && (
                      <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-[9px] font-black text-white uppercase tracking-wider shadow">
                        {plan.badge || 'Best Value'}
                      </span>
                    )}
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                        {plan.name}
                      </span>
                      <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-0.5">
                        ₹{plan.priceINR}
                        <span className="text-[10px] font-normal text-slate-500 ml-1">
                          / {plan.durationDays}d
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Recipient / Payee Details Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 dark:text-white">{payeeName}</span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[9px] font-extrabold uppercase">
                      Verified Payee
                    </span>
                  </div>
                  <span className="font-mono text-slate-600 dark:text-slate-300 text-[11px] block mt-0.5">
                    {payeeUPI}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyUPI}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 font-semibold text-slate-700 dark:text-slate-200 transition text-[11px] shadow-sm"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy UPI ID</span>
                  </>
                )}
              </button>
            </div>

            {/* QR Code & Direct Mobile Action */}
            <div className="p-4 rounded-2xl bg-gradient-to-b from-blue-50/40 to-slate-50/40 dark:from-slate-800/40 dark:to-slate-900/40 border border-blue-100 dark:border-slate-800 text-center space-y-3">
              <div className="inline-block p-3 rounded-2xl bg-white shadow-md border border-slate-200 mx-auto">
                <img
                  src={qrCodeUrl}
                  alt={`Scan to pay ₹${selectedPlan.priceINR} via UPI`}
                  className="w-44 h-44 sm:w-48 sm:h-48 object-contain mx-auto block"
                />
                <div className="mt-2 text-center">
                  <span className="text-xs font-black text-slate-900">
                    Pay Exactly: <strong className="text-blue-600 font-black">₹{selectedPlan.priceINR}</strong>
                  </span>
                </div>
              </div>

              {/* Supported UPI Apps Badges */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">Google Pay</span>
                <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">PhonePe</span>
                <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">Paytm</span>
                <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">BHIM / Any UPI</span>
              </div>

              {/* Direct UPI Intent Link for Mobile Devices */}
              <div>
                <a
                  href={upiPayString}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>On Mobile? Tap here to open in UPI App</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Step 2: UTR Reference Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Enter 12-Digit UTR / UPI Ref Number after payment:
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={30}
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  placeholder="e.g. 426189345612 or UPI Reference"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-1">
                <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                <span>Found on your payment receipt in GPay, PhonePe, or Paytm under &quot;UPI transaction ID&quot; or &quot;UTR&quot;.</span>
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => handleConfirmPayment(false)}
                disabled={processing}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold shadow-lg shadow-blue-500/25 transition disabled:opacity-50 text-sm"
              >
                {processing ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Confirm UTR & Activate Plan (₹{selectedPlan.priceINR})</span>
                  </>
                )}
              </button>

              {/* Instant Test / Bypass Button for quick verification */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => handleConfirmPayment(true)}
                  disabled={processing}
                  className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
                  title="Simulate instant payment authorization for testing"
                >
                  ⚡ Instant Demo Bypass (Test Mode)
                </button>
                <span className="text-[11px] text-slate-400">
                  🔒 100% Direct P2P Bank Settlement
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
