import React, { useState } from 'react';
import {
  MessageSquare,
  X,
  Copy,
  Check,
  ExternalLink,
  Send,
  Smartphone
} from 'lucide-react';
import api from '../services/api';

export default function WhatsAppModal({ isOpen, onClose, data }) {
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!isOpen || !data) return null;

  const { ticketId, customerName, customerPhone, message, waUrl, triggerType } = data;

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = async () => {
    setSending(true);
    try {
      // Record log in backend
      await api.post('/notifications/whatsapp/send-direct', {
        ticketId,
        customerName,
        customerPhone,
        triggerType,
        messageBody: message
      });
      setSentSuccess(true);
    } catch (e) {
      console.warn('Logging dispatch warning:', e);
    } finally {
      setSending(false);
    }

    // Open WhatsApp in new tab
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              WhatsApp Confirmation Preview
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sending to: <strong className="text-slate-700 dark:text-slate-300">{customerName}</strong> ({customerPhone})
            </p>
          </div>
        </div>

        {/* WhatsApp message mockup bubble */}
        <div className="bg-[#efeae2] dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl p-4 mb-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500"></div>
          <div className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-400 mb-1 flex items-center gap-1">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Customer Message Template • Ticket #{ticketId}</span>
          </div>

          <pre className="whitespace-pre-wrap font-sans text-xs text-slate-800 dark:text-slate-200 bg-white/80 dark:bg-slate-900/90 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 leading-relaxed max-h-60 overflow-y-auto">
            {message}
          </pre>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            type="button"
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy Text'}</span>
          </button>

          <button
            onClick={handleOpenWhatsApp}
            disabled={sending}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/25 transition"
          >
            <Send className="w-4 h-4" />
            <span>Open in WhatsApp Web / App</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </button>
        </div>

        {sentSuccess && (
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 text-center mt-2 font-medium">
            ✓ Logged to shop notification history
          </p>
        )}
      </div>
    </div>
  );
}
