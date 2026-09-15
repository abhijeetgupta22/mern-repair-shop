import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  Wrench,
  AlertCircle,
  PackageCheck,
  Calendar,
  Smartphone,
  Laptop,
  Monitor,
  Receipt,
  Printer,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import InvoicePrintModal from '../components/InvoicePrintModal';

const STEP_STAGES = [
  { key: 'RECEIVED', label: 'Received' },
  { key: 'DIAGNOSING', label: 'Diagnosing' },
  { key: 'IN_REPAIR', label: 'In Repair' },
  { key: 'QUALITY_CHECK', label: 'Quality Check' },
  { key: 'READY_FOR_DELIVERY', label: 'Ready for Pickup' },
  { key: 'DELIVERED', label: 'Delivered' }
];

export default function PublicTrack({ query = '', onNavigate }) {
  const [searchInput, setSearchInput] = useState(query || 'REP-1002');
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [invoice, setInvoice] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const fetchTrackData = async (targetQuery) => {
    if (!targetQuery) return;
    setLoading(true);
    setError('');
    setInvoice(null);

    try {
      const res = await api.get(`/tickets/track/${encodeURIComponent(targetQuery.trim())}`);
      if (res.data.success) {
        setTicket(res.data.ticket);
        // Also fetch invoice if ready or delivered
        try {
          const invRes = await api.get(`/invoices/by-ticket/${res.data.ticket.ticketId}`);
          if (invRes.data.success) {
            setInvoice(invRes.data.invoice);
          }
        } catch (e) {
          // No invoice generated yet
        }
      } else {
        setError(res.data.message || 'Ticket not found');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not find repair ticket. Please verify ID.');
      setTicket(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (query) {
      setSearchInput(query);
      fetchTrackData(query);
    } else {
      fetchTrackData('REP-1002');
    }
  }, [query]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      fetchTrackData(searchInput.trim());
    }
  };

  const getStageIndex = (status) => {
    if (status === 'WAITING_PARTS') return 2; // Treat same level as in-repair
    const idx = STEP_STAGES.findIndex(s => s.key === status);
    return idx !== -1 ? idx : 0;
  };

  const currentStageIdx = ticket ? getStageIndex(ticket.status) : 0;

  const getDeviceIcon = (type) => {
    switch (type) {
      case 'MOBILE': return Smartphone;
      case 'DESKTOP': return Monitor;
      default: return Laptop;
    }
  };

  const DeviceIcon = ticket ? getDeviceIcon(ticket.device?.type) : Laptop;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Search Header */}
      <div className="text-center space-y-3">
        <button
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white font-medium mb-2 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>

        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Live Repair Status Tracker
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Enter your Ticket ID or registered phone number to check stage progression in real time.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="max-w-md mx-auto mt-4 relative flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="e.g. REP-1002 or Phone..."
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:outline-none shadow-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-600/20 transition disabled:opacity-50"
          >
            {loading ? 'Tracking...' : 'Search'}
          </button>
        </form>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs sm:text-sm text-center flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Ticket Details Container */}
      {ticket && !loading && (
        <div className="space-y-6 animate-fadeIn">
          {/* Main Card Header */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                  <DeviceIcon className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">
                      {ticket.device?.brand} {ticket.device?.model}
                    </h2>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold uppercase">
                      {ticket.device?.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Ticket ID: <strong className="text-slate-800 dark:text-slate-200">#{ticket.ticketId}</strong> • Customer: {ticket.customer?.name} ({ticket.customer?.phoneMasked})
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={ticket.status} size="lg" />
                {invoice && (
                  <button
                    onClick={() => setShowInvoiceModal(true)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition shadow-sm"
                  >
                    <Receipt className="w-3.5 h-3.5 text-blue-600" />
                    <span>View Bill</span>
                  </button>
                )}
              </div>
            </div>

            {/* VISUAL STAGES PROGRESS STEPPER */}
            <div className="pt-8 pb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6 text-center">
                Repair Progression Pipeline
              </h3>

              <div className="relative">
                {/* Background line */}
                <div className="hidden sm:block absolute top-5 left-8 right-8 h-1 bg-slate-200 dark:bg-slate-800 -z-0"></div>

                {/* Stepper items */}
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 relative z-10">
                  {STEP_STAGES.map((stage, idx) => {
                    const isCompleted = idx <= currentStageIdx;
                    const isCurrent = idx === currentStageIdx;

                    return (
                      <div key={stage.key} className="flex flex-col items-center text-center space-y-2">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-md ${
                            isCurrent
                              ? 'bg-blue-600 text-white ring-4 ring-blue-500/20 scale-110'
                              : isCompleted
                              ? 'bg-emerald-500 text-white'
                              : 'bg-white dark:bg-slate-800 text-slate-400 border border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          {isCompleted && !isCurrent ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            <span>{idx + 1}</span>
                          )}
                        </div>
                        <span
                          className={`text-xs font-semibold ${
                            isCurrent
                              ? 'text-blue-600 dark:text-blue-400'
                              : isCompleted
                              ? 'text-slate-800 dark:text-slate-200'
                              : 'text-slate-400'
                          }`}
                        >
                          {stage.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Device & Status Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Issue Description & Estimates */}
            <div className="md:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Diagnosis & Service Information
              </h4>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Reported Issue:
                </span>
                <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">
                  {ticket.issueDescription}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">
                      Estimated Delivery Date
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                      {ticket.estimatedDeliveryDate
                        ? new Date(ticket.estimatedDeliveryDate).toLocaleDateString(undefined, {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })
                        : 'Under Assessment'}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                  <Receipt className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">
                      Estimated / Final Bill
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      ₹{ticket.finalCost || ticket.estimatedCost}
                    </span>
                    <span className={`ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      ticket.paymentStatus === 'PAID'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {ticket.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ready for pickup notification card if ready */}
              {ticket.status === 'READY_FOR_DELIVERY' && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 flex items-start gap-3">
                  <PackageCheck className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <h5 className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">
                      Your Device is Ready for Pickup!
                    </h5>
                    <p className="text-emerald-700 dark:text-emerald-400 mt-1">
                      Our certified technician has completed all hardware stress tests. Please visit our store counter with your Ticket ID #{ticket.ticketId} to collect your device.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Status History Timeline */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Work Log Timeline
              </h4>

              <div className="space-y-4 relative pl-4 before:content-[''] before:absolute before:top-2 before:bottom-2 before:left-[19px] before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {(ticket.statusHistory || []).map((h, i) => (
                  <div key={i} className="relative pl-6 space-y-1">
                    <div className="absolute left-0 top-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-white dark:ring-slate-900"></div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {h.status}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(h.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {h.note || 'Status updated.'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && invoice && (
        <InvoicePrintModal
          isOpen={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
          invoice={invoice}
        />
      )}
    </div>
  );
}
