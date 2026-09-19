import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Search,
  Plus,
  Filter,
  MessageSquare,
  Mail,
  Receipt,
  ExternalLink,
  Laptop,
  Smartphone,
  Monitor,
  Phone,
  User,
  Calendar,
  AlertCircle,
  Trash2,
  RotateCcw,
  History,
  CheckCircle2,
  RefreshCw,
  Info
} from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import WhatsAppModal from '../components/WhatsAppModal';
import EmailModal from '../components/EmailModal';
import { useSubscription } from '../context/SubscriptionContext';

export default function AdminTickets({ onNavigate, initialTab = 'active' }) {
  const { openPaywall } = useSubscription();
  const [tickets, setTickets] = useState([]);
  const [trashedTickets, setTrashedTickets] = useState([]);
  const [trashedCount, setTrashedCount] = useState(0);
  const [activeTab, setActiveTab] = useState(initialTab || 'active'); // 'active' | 'trash'
  const [loading, setLoading] = useState(true);
  const [loadingTrash, setLoadingTrash] = useState(false);
  const [search, setSearch] = useState('');
  const [trashSearch, setTrashSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [deviceFilter, setDeviceFilter] = useState('ALL');
  const [toastMessage, setToastMessage] = useState(null); // { text, type, ticketId, label, canUndo }

  // Modals
  const [whatsAppData, setWhatsAppData] = useState(null);
  const [emailData, setEmailData] = useState(null);
  const [showIntakeModal, setShowIntakeModal] = useState(false);

  // New ticket state
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    type: 'LAPTOP',
    brand: '',
    model: '',
    serial: '',
    issue: '',
    estimatedCost: '',
    laborCost: '',
    technician: 'Vikram Sharma'
  });

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (deviceFilter !== 'ALL') params.deviceType = deviceFilter;
      if (search) params.search = search;

      const res = await api.get('/tickets', { params });
      if (res.data.success) {
        setTickets(res.data.tickets || []);
        if (res.data.trashedTotal !== undefined) {
          setTrashedCount(res.data.trashedTotal);
        }
      }
    } catch (err) {
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrashedTickets = async () => {
    try {
      setLoadingTrash(true);
      const res = await api.get('/tickets/trash/all');
      if (res.data.success) {
        setTrashedTickets(res.data.tickets || []);
        setTrashedCount(res.data.count || 0);
      }
    } catch (err) {
      console.error('Error fetching trash tickets:', err);
    } finally {
      setLoadingTrash(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchTrashedTickets();
  }, [statusFilter, deviceFilter]);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTickets();
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      const res = await api.patch(`/tickets/${ticketId}/status`, {
        status: newStatus,
        sendAlerts: true
      });
      if (res.data.success) {
        fetchTickets();
        if (res.data.notificationAlert?.whatsapp) {
          setWhatsAppData({
            ticketId: res.data.ticket.ticketId,
            customerName: res.data.ticket.customer?.name,
            customerPhone: res.data.ticket.customer?.phone,
            message: res.data.notificationAlert.whatsapp.message,
            waUrl: res.data.notificationAlert.whatsapp.url,
            triggerType: 'READY_FOR_DELIVERY'
          });
        }
      }
    } catch (err) {
      if (err.response?.status === 402) {
        openPaywall('Active subscription required to change ticket status');
      } else {
        alert(err.response?.data?.message || 'Error updating status');
      }
    }
  };

  // Move ticket to Trash Bin (soft delete)
  const handleDeleteTicket = async (ticket) => {
    const id = ticket._id || ticket.id;
    const ticketLabel = ticket.ticketId ? `#${ticket.ticketId}` : 'this ticket';
    const confirmed = window.confirm(
      `Move ticket ${ticketLabel} (${ticket.customer?.name || 'Customer'} - ${ticket.device?.brand || ''} ${ticket.device?.model || ''}) to the Trash Bin?\n\nIf deleted by mistake, you can restore it anytime from the Trash Bin & History tab.`
    );
    if (!confirmed) return;

    try {
      const res = await api.delete(`/tickets/${id}`);
      if (res.data.success) {
        setTickets((prev) => prev.filter((t) => (t._id || t.id) !== id));
        fetchTrashedTickets();
        setToastMessage({
          text: `Ticket ${ticketLabel} moved to Trash Bin.`,
          ticketId: id,
          label: ticketLabel,
          canUndo: true
        });
        setTimeout(() => {
          setToastMessage((prev) => (prev?.ticketId === id ? null : prev));
        }, 10000);
      }
    } catch (err) {
      if (err.response?.status === 402) {
        openPaywall('Active subscription required to delete repair tickets');
      } else {
        alert(err.response?.data?.message || 'Failed to delete repair ticket');
      }
    }
  };

  // Restore ticket from Trash Bin
  const handleRestoreTicket = async (ticketOrId, label = '') => {
    const id = typeof ticketOrId === 'object' ? (ticketOrId._id || ticketOrId.id) : ticketOrId;
    const ticketLabel = label || (typeof ticketOrId === 'object' && ticketOrId.ticketId ? `#${ticketOrId.ticketId}` : 'Ticket');

    try {
      const res = await api.post(`/tickets/${id}/restore`);
      if (res.data.success) {
        setTrashedTickets((prev) => prev.filter((t) => (t._id || t.id) !== id));
        fetchTickets();
        fetchTrashedTickets();
        setToastMessage({
          text: `${ticketLabel} restored successfully and returned to active repairs!`,
          type: 'success',
          canUndo: false
        });
        setTimeout(() => setToastMessage(null), 5000);
      }
    } catch (err) {
      if (err.response?.status === 402) {
        openPaywall('Active subscription required to restore repair tickets');
      } else {
        alert(err.response?.data?.message || 'Failed to restore ticket');
      }
    }
  };

  // Permanently erase ticket from database
  const handlePermanentDelete = async (ticket) => {
    const id = ticket._id || ticket.id;
    const ticketLabel = ticket.ticketId ? `#${ticket.ticketId}` : 'this ticket';
    const confirmed = window.confirm(
      `⚠️ PERMANENT DELETION WARNING:\n\nAre you sure you want to permanently destroy ticket ${ticketLabel}?\n\nThis action CANNOT be undone and will erase this ticket forever from your database.`
    );
    if (!confirmed) return;

    try {
      const res = await api.delete(`/tickets/${id}/permanent`);
      if (res.data.success) {
        setTrashedTickets((prev) => prev.filter((t) => (t._id || t.id) !== id));
        setToastMessage({
          text: `Ticket ${ticketLabel} permanently erased from database.`,
          type: 'info',
          canUndo: false
        });
        setTimeout(() => setToastMessage(null), 4000);
      }
    } catch (err) {
      if (err.response?.status === 402) {
        openPaywall('Active subscription required to permanently delete tickets');
      } else {
        alert(err.response?.data?.message || 'Failed to permanently delete ticket');
      }
    }
  };

  // Empty entire Trash Bin
  const handleEmptyTrash = async () => {
    if (!trashedTickets.length) return;
    const confirmed = window.confirm(
      `⚠️ EMPTY TRASH BIN CONFIRMATION:\n\nAre you sure you want to permanently delete all ${trashedTickets.length} ticket(s) in the Trash Bin?\n\nThis cannot be undone.`
    );
    if (!confirmed) return;

    try {
      const res = await api.post('/tickets/trash/empty');
      if (res.data.success) {
        setTrashedTickets([]);
        setTrashedCount(0);
        setToastMessage({
          text: `Trash Bin emptied (${res.data.deletedCount || 0} tickets permanently erased).`,
          type: 'info',
          canUndo: false
        });
        setTimeout(() => setToastMessage(null), 4000);
      }
    } catch (err) {
      if (err.response?.status === 402) {
        openPaywall('Active subscription required to empty trash bin');
      } else {
        alert(err.response?.data?.message || 'Failed to empty trash bin');
      }
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/tickets', {
        customer: { name: form.name, phone: form.phone, email: form.email },
        device: { type: form.type, brand: form.brand, model: form.model, serialNumber: form.serial },
        issueDescription: form.issue,
        estimatedCost: Number(form.estimatedCost) || 0,
        laborCost: Number(form.laborCost) || 0,
        technician: form.technician,
        sendNotifications: true
      });

      if (res.data.success) {
        setShowIntakeModal(false);
        fetchTickets();
        setForm({
          name: '', phone: '', email: '', type: 'LAPTOP', brand: '', model: '',
          serial: '', issue: '', estimatedCost: '', laborCost: '', technician: 'Vikram Sharma'
        });

        if (res.data.notifications?.whatsapp) {
          setWhatsAppData({
            ticketId: res.data.ticket.ticketId,
            customerName: res.data.ticket.customer.name,
            customerPhone: res.data.ticket.customer.phone,
            message: res.data.notifications.whatsapp.message,
            waUrl: res.data.notifications.whatsapp.url,
            triggerType: 'INTAKE_CONFIRMATION'
          });
        }
      }
    } catch (err) {
      if (err.response?.status === 402) {
        openPaywall('Active subscription required to create repair tickets');
      } else {
        alert(err.response?.data?.message || 'Error creating ticket');
      }
    }
  };

  const handleWhatsAppTrigger = async (ticket) => {
    try {
      const triggerType = ticket.status === 'READY_FOR_DELIVERY' ? 'READY_FOR_DELIVERY' : 'INTAKE_CONFIRMATION';
      const res = await api.post('/notifications/whatsapp/preview', {
        ticketId: ticket.ticketId,
        triggerType
      });
      if (res.data.success) {
        setWhatsAppData({
          ticketId: ticket.ticketId,
          customerName: res.data.customerName,
          customerPhone: res.data.customerPhone,
          message: res.data.message,
          waUrl: res.data.waUrl,
          triggerType
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredTrash = trashedTickets.filter((t) => {
    if (!trashSearch) return true;
    const q = trashSearch.toLowerCase();
    return (
      (t.ticketId && t.ticketId.toLowerCase().includes(q)) ||
      (t.customer?.name && t.customer.name.toLowerCase().includes(q)) ||
      (t.customer?.phone && t.customer.phone.includes(q)) ||
      (t.device?.brand && t.device.brand.toLowerCase().includes(q)) ||
      (t.device?.model && t.device.model.toLowerCase().includes(q)) ||
      (t.issueDescription && t.issueDescription.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Repair Tickets Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track diagnostics, update stages, and dispatch WhatsApp/Email notifications.
          </p>
        </div>

        <button
          onClick={() => setShowIntakeModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Repair Intake</span>
        </button>
      </div>

      {/* Floating Action / Undo Notification Banner */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xl flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2 text-xs font-semibold">
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 flex-shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-blue-400 dark:text-blue-600 flex-shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>

          <div className="flex items-center gap-2">
            {toastMessage.canUndo && toastMessage.ticketId && (
              <button
                onClick={() => handleRestoreTicket(toastMessage.ticketId, toastMessage.label)}
                className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 transition shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Undo / Restore</span>
              </button>
            )}
            <button
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white dark:hover:text-slate-900 text-xs px-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* View Switcher: Active Repairs vs Trash Bin & History */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('active')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'active'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Active Tickets</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              activeTab === 'active' ? 'bg-blue-800 text-blue-100' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}>
              {tickets.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('trash')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'trash'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Trash Bin & History</span>
            {trashedCount > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeTab === 'trash' ? 'bg-rose-800 text-white' : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
              }`}>
                {trashedCount}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'trash' && trashedTickets.length > 0 && (
          <button
            type="button"
            onClick={handleEmptyTrash}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 hover:bg-rose-100 text-xs font-bold transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Empty Trash Bin</span>
          </button>
        )}
      </div>

      {activeTab === 'active' && (
        <>
          {/* Filters & Search Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ticket, customer, phone, brand..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="RECEIVED">Received</option>
            <option value="DIAGNOSING">Diagnosing</option>
            <option value="WAITING_PARTS">Waiting Parts</option>
            <option value="IN_REPAIR">In Repair</option>
            <option value="QUALITY_CHECK">Quality Check</option>
            <option value="READY_FOR_DELIVERY">Ready for Delivery</option>
            <option value="DELIVERED">Delivered</option>
          </select>

          {/* Device Filter */}
          <select
            value={deviceFilter}
            onChange={(e) => setDeviceFilter(e.target.value)}
            className="text-xs py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
          >
            <option value="ALL">All Devices</option>
            <option value="LAPTOP">Laptops</option>
            <option value="DESKTOP">Desktops</option>
            <option value="MOBILE">Mobiles</option>
            <option value="TABLET">Tablets</option>
          </select>
        </div>
      </div>

      {/* Tickets Table & Mobile Cards */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Desktop Table (>= 768px) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-semibold">
                <th className="pb-3 px-3">Ticket ID</th>
                <th className="pb-3 px-3">Customer Info</th>
                <th className="pb-3 px-3">Device & Issue</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3">Cost / Pay</th>
                <th className="pb-3 px-3 text-right">Dispatch & Bill</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {tickets.map((t) => (
                <tr key={t._id || t.ticketId} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                  <td className="py-3 px-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                    #{t.ticketId}
                    <div className="text-[10px] text-slate-400 font-normal">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      {t.customer?.name}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <a href={`tel:${t.customer?.phone}`} className="hover:underline">{t.customer?.phone}</a>
                    </div>
                  </td>

                  <td className="py-3 px-3 max-w-xs">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      {t.device?.brand} {t.device?.model}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {t.issueDescription}
                    </p>
                  </td>

                  <td className="py-3 px-3 whitespace-nowrap">
                    <select
                      value={t.status}
                      onChange={(e) => handleStatusChange(t._id || t.id, e.target.value)}
                      className="text-xs font-semibold py-1 px-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="RECEIVED">Received</option>
                      <option value="DIAGNOSING">Diagnosing</option>
                      <option value="WAITING_PARTS">Waiting for Parts</option>
                      <option value="IN_REPAIR">In Repair</option>
                      <option value="QUALITY_CHECK">Quality Check</option>
                      <option value="READY_FOR_DELIVERY">Ready for Delivery</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </td>

                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="font-bold text-slate-900 dark:text-white">
                      ₹{t.finalCost || t.estimatedCost || 0}
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      t.paymentStatus === 'PAID'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {t.paymentStatus || 'UNPAID'}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-right space-x-1 whitespace-nowrap">
                    {/* WhatsApp Action */}
                    <button
                      onClick={() => handleWhatsAppTrigger(t)}
                      title="Preview / Send WhatsApp Update"
                      className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 transition"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>

                    {/* Email Action */}
                    <button
                      onClick={() => setEmailData({
                        ticket: t,
                        triggerType: t.status === 'READY_FOR_DELIVERY' ? 'READY_FOR_DELIVERY' : 'INTAKE_CONFIRMATION'
                      })}
                      title="Send Customer Email"
                      className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition"
                    >
                      <Mail className="w-4 h-4" />
                    </button>

                    {/* Billing Shortcut */}
                    <button
                      onClick={() => onNavigate('admin-billing', { ticketId: t.ticketId })}
                      title="Create / View Invoice"
                      className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition"
                    >
                      <Receipt className="w-4 h-4" />
                    </button>

                    {/* Public Live Track */}
                    <button
                      onClick={() => onNavigate('track', { query: t.ticketId })}
                      title="Open Public Customer View"
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>

                    {/* Delete Ticket (Soft Delete to Trash Bin) */}
                    <button
                      onClick={() => handleDeleteTicket(t)}
                      title="Move to Trash Bin"
                      className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View (< 768px) */}
        <div className="md:hidden space-y-3">
          {tickets.map((t) => (
            <div
              key={t._id || t.ticketId}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3"
            >
              {/* Header: Ticket ID & Payment pill */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                    #{t.ticketId}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  t.paymentStatus === 'PAID'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}>
                  {t.paymentStatus || 'UNPAID'} • ₹{t.finalCost || t.estimatedCost || 0}
                </span>
              </div>

              {/* Customer & Device */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 dark:text-white">{t.customer?.name}</span>
                  <a
                    href={`tel:${t.customer?.phone}`}
                    className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{t.customer?.phone}</span>
                  </a>
                </div>
                <div className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  {t.device?.brand} {t.device?.model}
                </div>
                {t.issueDescription && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                    {t.issueDescription}
                  </p>
                )}
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Status:
                </label>
                <select
                  value={t.status}
                  onChange={(e) => handleStatusChange(t._id || t.id, e.target.value)}
                  className="w-full text-xs font-semibold py-2 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 shadow-sm"
                >
                  <option value="RECEIVED">Received</option>
                  <option value="DIAGNOSING">Diagnosing</option>
                  <option value="WAITING_PARTS">Waiting for Parts</option>
                  <option value="IN_REPAIR">In Repair</option>
                  <option value="QUALITY_CHECK">Quality Check</option>
                  <option value="READY_FOR_DELIVERY">Ready for Delivery</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-slate-200 dark:border-slate-700/80">
                <button
                  onClick={() => handleWhatsAppTrigger(t)}
                  className="flex-1 flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 text-xs font-bold shadow-sm"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
                <button
                  onClick={() => setEmailData({
                    ticket: t,
                    triggerType: t.status === 'READY_FOR_DELIVERY' ? 'READY_FOR_DELIVERY' : 'INTAKE_CONFIRMATION'
                  })}
                  className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 shadow-sm"
                  title="Send Email"
                >
                  <Mail className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onNavigate('admin-billing', { ticketId: t.ticketId })}
                  className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  title="Bill & Invoice"
                >
                  <Receipt className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onNavigate('track', { query: t.ticketId })}
                  className="p-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-sm"
                  title="Track Page"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteTicket(t)}
                  className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 shadow-sm hover:bg-rose-100 dark:hover:bg-rose-900/40 transition"
                  title="Move to Trash Bin"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )}

  {/* TRASH BIN & DELETION HISTORY VIEW */}
  {activeTab === 'trash' && (
    <div className="space-y-4 animate-fadeIn">
      {/* Informational Protection Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3">
        <History className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs">
          <span className="font-bold text-amber-900 dark:text-amber-200 block">
            Trash Bin & Accidental Deletion Protection
          </span>
          <p className="text-amber-800 dark:text-amber-300 mt-0.5">
            Tickets deleted by mistake are stored safely here with all customer info, diagnostics, and billing history. Click <strong className="text-emerald-700 dark:text-emerald-300">"Restore"</strong> to immediately return any ticket back to active repairs.
          </p>
        </div>
      </div>

      {/* Trash Search & Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={trashSearch}
            onChange={(e) => setTrashSearch(e.target.value)}
            placeholder="Search deleted tickets..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={fetchTrashedTickets}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Refresh Trash Bin"
          >
            <RefreshCw className={`w-4 h-4 ${loadingTrash ? 'animate-spin' : ''}`} />
          </button>

          {trashedTickets.length > 0 && (
            <button
              type="button"
              onClick={handleEmptyTrash}
              className="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-xs font-bold transition flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Empty Trash ({trashedTickets.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {filteredTrash.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
          <div className="w-14 h-14 rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Trash2 className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
            {trashSearch ? 'No deleted tickets matching search' : 'Trash Bin is empty'}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {trashSearch
              ? 'Try searching with a different ticket ID or customer name.'
              : 'No tickets have been deleted. If a ticket is deleted in the future, you can recover it here.'}
          </p>
          <button
            type="button"
            onClick={() => setActiveTab('active')}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm"
          >
            Return to Active Tickets
          </button>
        </div>
      ) : (
        <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {/* Desktop Table for Trashed Items */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-semibold">
                  <th className="pb-3 px-3">Ticket ID</th>
                  <th className="pb-3 px-3">Deleted When</th>
                  <th className="pb-3 px-3">Customer Info</th>
                  <th className="pb-3 px-3">Device & Issue</th>
                  <th className="pb-3 px-3">Status / Cost</th>
                  <th className="pb-3 px-3 text-right">Recovery Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredTrash.map((t) => (
                  <tr key={t._id || t.ticketId} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      <span className="line-through text-slate-400 mr-1.5">#{t.ticketId}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                        IN TRASH
                      </span>
                    </td>

                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                      <div className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <History className="w-3.5 h-3.5 text-amber-500" />
                        <span>{new Date(t.deletedAt || t.updatedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(t.deletedAt || t.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {t.customer?.name}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{t.customer?.phone}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3 max-w-xs">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {t.device?.brand} {t.device?.model}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {t.issueDescription}
                      </p>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-bold text-slate-900 dark:text-white">
                        ₹{t.finalCost || t.estimatedCost || 0}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        Was: {t.status}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right space-x-2 whitespace-nowrap">
                      {/* Restore Button */}
                      <button
                        type="button"
                        onClick={() => handleRestoreTicket(t)}
                        title="Restore ticket back to active repairs"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restore</span>
                      </button>

                      {/* Delete Forever Button */}
                      <button
                        type="button"
                        onClick={() => handlePermanentDelete(t)}
                        title="Permanently erase forever from database"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 font-bold text-xs transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Forever</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards for Trashed Items */}
          <div className="md:hidden space-y-3">
            {filteredTrash.map((t) => (
              <div
                key={t._id || t.ticketId}
                className="p-4 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="line-through text-slate-400 font-bold text-xs">#{t.ticketId}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                      DELETED
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <History className="w-3 h-3 text-amber-500" />
                    <span>{new Date(t.deletedAt || t.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white">
                    {t.customer?.name} • <span className="text-slate-500 font-normal">{t.customer?.phone}</span>
                  </div>
                  <div className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">
                    {t.device?.brand} {t.device?.model}
                  </div>
                  {t.issueDescription && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                      {t.issueDescription}
                    </p>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-rose-200/80 dark:border-rose-900/60">
                  <button
                    type="button"
                    onClick={() => handleRestoreTicket(t)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore Ticket</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePermanentDelete(t)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 font-bold text-xs transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Forever</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )}

      {/* Intake Modal */}
      {showIntakeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
              New Repair Intake
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Creates ticket and dispatches customer notification.
            </p>

            <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Customer Name *</label>
                  <input
                    type="text" required value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Customer Name"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">WhatsApp Phone *</label>
                  <input
                    type="tel" required value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Customer Email</label>
                <input
                  type="email" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="customer@example.com"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Device Type</label>
                  <select
                    value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="LAPTOP">Laptop</option>
                    <option value="DESKTOP">Desktop</option>
                    <option value="MOBILE">Mobile</option>
                    <option value="TABLET">Tablet</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Brand *</label>
                  <input
                    type="text" required value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    placeholder="e.g. Dell"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Model *</label>
                  <input
                    type="text" required value={form.model}
                    onChange={(e) => setForm({ ...form, model: e.target.value })}
                    placeholder="e.g. XPS 13"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Reported Issue *</label>
                <textarea
                  rows="2" required value={form.issue}
                  onChange={(e) => setForm({ ...form, issue: e.target.value })}
                  placeholder="Describe failure details..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Estimated Cost (₹)</label>
                  <input
                    type="number" value={form.estimatedCost}
                    onChange={(e) => setForm({ ...form, estimatedCost: e.target.value })}
                    placeholder="3000"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Technician</label>
                  <input
                    type="text" value={form.technician}
                    onChange={(e) => setForm({ ...form, technician: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button" onClick={() => setShowIntakeModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md"
                >
                  Create & Notify Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modals */}
      {whatsAppData && (
        <WhatsAppModal
          isOpen={!!whatsAppData}
          onClose={() => setWhatsAppData(null)}
          data={whatsAppData}
        />
      )}

      {emailData && (
        <EmailModal
          isOpen={!!emailData}
          onClose={() => setEmailData(null)}
          ticket={emailData.ticket}
          triggerType={emailData.triggerType}
        />
      )}
    </div>
  );
}
