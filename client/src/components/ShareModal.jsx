import React, { useState } from 'react';
import {
  QrCode,
  X,
  Copy,
  Check,
  Printer,
  Share2,
  ExternalLink,
  Smartphone,
  Store,
  Compass
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ShareModal({ isOpen, onClose }) {
  const { admin } = useAuth();
  const [selectedTarget, setSelectedTarget] = useState('home'); // 'home' | 'track'
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const baseUrl = typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : 'https://mern-repair-shop-app.vercel.app';

  const currentUrl = selectedTarget === 'track'
    ? `${baseUrl}/#track`
    : `${baseUrl}/`;

  const shopTitle = admin?.shopName || 'TechFix Pro Repair Care';
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(currentUrl)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Check out ${shopTitle}! Track your laptop, desktop & mobile repairs live online anytime:\n${currentUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="no-print absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1 mb-5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 mb-1">
            <QrCode className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Share Your Website QR Code
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Customers and clients can scan this with any smartphone camera to visit instantly.
          </p>
        </div>

        {/* Destination Toggle */}
        <div className="no-print flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-semibold mb-5">
          <button
            onClick={() => setSelectedTarget('home')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl transition ${
              selectedTarget === 'home'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Main Website</span>
          </button>
          <button
            onClick={() => setSelectedTarget('track')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl transition ${
              selectedTarget === 'track'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Customer Live Tracker</span>
          </button>
        </div>

        {/* Printable Standee Card */}
        <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-gradient-to-b from-slate-50 to-white dark:from-slate-800/80 dark:to-slate-900 border-2 border-dashed border-blue-400/40 dark:border-blue-500/30 text-center shadow-inner">
          <span className="text-xs font-black text-blue-600 dark:text-blue-400 tracking-wider uppercase mb-1">
            {shopTitle}
          </span>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-3">
            {selectedTarget === 'track'
              ? 'Scan to Track Your Repair Status Live'
              : 'Scan to Visit Our Repair Shop Online'}
          </p>

          {/* QR Code Image */}
          <div className="p-3 bg-white rounded-2xl shadow-lg border border-slate-200/80 mb-3">
            <img
              src={qrApiUrl}
              alt="Website QR Code"
              className="w-48 h-48 sm:w-52 sm:h-52 object-contain rounded-xl"
            />
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
            <Smartphone className="w-3.5 h-3.5 text-blue-500" />
            <span>Point any smartphone camera to scan</span>
          </div>
        </div>

        {/* Direct Link & Copy */}
        <div className="no-print mt-4 space-y-3">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
            <span className="flex-1 truncate font-mono text-slate-700 dark:text-slate-300 px-1">
              {currentUrl}
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Action Buttons: Print Standee & WhatsApp */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-sm transition"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Print Counter QR</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition"
            >
              <Share2 className="w-4 h-4" />
              <span>Share on WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
