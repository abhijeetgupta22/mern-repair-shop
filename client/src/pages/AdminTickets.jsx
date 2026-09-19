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
  AlertCircle
} from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import WhatsAppModal from '../components/WhatsAppModal';
import EmailModal from '../components/EmailModal';
import { useSubscription } from '../context/SubscriptionContext';

export default function AdminTickets({ onNavigate }) {
  const { openPaywall } = useSubscription();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [deviceFilter, setDeviceFilter] = useState('ALL');

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
      }
    } catch (err) {
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, deviceFilter]);

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
              </div>
            </div>
          ))}
        </div>
      </div>

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
