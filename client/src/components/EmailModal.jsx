import React, { useState } from 'react';
import { Mail, X, Send, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import api from '../services/api';

export default function EmailModal({ isOpen, onClose, ticket, triggerType = 'INTAKE_CONFIRMATION' }) {
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  if (!isOpen || !ticket) return null;

  const handleSend = async () => {
    setSending(true);
    setError('');
    setResult(null);

    try {
      const res = await api.post('/notifications/email/send', {
        ticketId: ticket.ticketId,
        triggerType
      });

      if (res.data.success) {
        setResult(res.data.result);
      } else {
        setError(res.data.message || 'Failed to send email');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server error sending email');
    } finally {
      setSending(false);
    }
  };

  const isDelivery = triggerType === 'READY_FOR_DELIVERY';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
            isDelivery ? 'bg-emerald-500/10 text-emerald-600' : 'bg-blue-500/10 text-blue-600'
          }`}>
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {isDelivery ? 'Ready For Delivery Email' : 'Intake Confirmation Email'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ticket #{ticket.ticketId} • {ticket.customer?.name}
            </p>
          </div>
        </div>

        <div className="space-y-3 mb-5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="flex justify-between">
            <span className="text-slate-400">To:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{ticket.customer?.email || 'No email specified'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Subject:</span>
            <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-xs">
              {isDelivery ? `Device Ready for Pickup: #${ticket.ticketId}` : `Repair Intake Confirmation: #${ticket.ticketId}`}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Device:</span>
            <span>{ticket.device?.brand} {ticket.device?.model}</span>
          </div>
          {isDelivery && (
            <div className="flex justify-between font-bold text-emerald-600 dark:text-emerald-400">
              <span>Total Bill:</span>
              <span>₹{ticket.finalCost || ticket.estimatedCost}</span>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-semibold text-xs">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Email dispatched successfully!</span>
            </div>
            {result.previewUrl && (
              <a
                href={result.previewUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                <span>View Real Rendered HTML Email (Ethereal Preview)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            type="button"
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending || !ticket.customer?.email}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-white text-xs sm:text-sm font-bold shadow-md transition disabled:opacity-50 ${
              isDelivery ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {sending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send Email Now</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
