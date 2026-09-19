import React, { useState, useEffect } from 'react';
import {
  Wrench,
  PackageCheck,
  Search,
  Clock,
  Boxes,
  IndianRupee,
  Plus,
  ArrowUpRight,
  Laptop,
  Smartphone,
  Monitor,
  AlertTriangle,
  MessageSquare,
  Mail,
  Receipt,
  ExternalLink,
  ChevronRight,
  Store,
  MapPin,
  Phone,
  QrCode,
  Trash2
} from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import WhatsAppModal from '../components/WhatsAppModal';
import EmailModal from '../components/EmailModal';
import ShopSetupModal from '../components/ShopSetupModal';
import DashboardGraphs from '../components/DashboardGraphs';
import { useSubscription } from '../context/SubscriptionContext';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard({ onNavigate }) {
  const { openPaywall } = useSubscription();
  const { admin } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showIntakeModal, setShowIntakeModal] = useState(false);
  const [showShopSetupModal, setShowShopSetupModal] = useState(false);
  const [whatsAppData, setWhatsAppData] = useState(null);
  const [emailData, setEmailData] = useState(null);

  // New ticket form
  const [newTicket, setNewTicket] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    deviceType: 'LAPTOP',
    brand: '',
    model: '',
    serialNumber: '',
    issueDescription: '',
    technician: 'Chief Tech',
    estimatedCost: '',
    laborCost: ''
  });

  // Prompt shop setup if opening the website right after login and not yet configured
  useEffect(() => {
    if (admin && admin.isConfigured === false) {
      setShowShopSetupModal(true);
    }
  }, [admin]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tickets/stats/dashboard');
      if (res.data.success) {
        setStats(res.data.stats);
        setRecentTickets(res.data.recentTickets || []);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      const res = await api.patch(`/tickets/${ticketId}/status`, {
        status: newStatus,
        sendAlerts: true
      });
      if (res.data.success) {
        fetchDashboardData();
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
        alert(err.response?.data?.message || 'Failed to update status');
      }
    }
  };

  const handleDeleteTicket = async (ticket) => {
    const id = ticket._id || ticket.id;
    const ticketLabel = ticket.ticketId ? `#${ticket.ticketId}` : 'this ticket';
    const confirmed = window.confirm(
      `Move repair ticket ${ticketLabel} (${ticket.customer?.name || 'Customer'}) to Trash Bin?\n\nIf deleted by mistake, you can restore it anytime from Tickets > Trash Bin & History.`
    );
    if (!confirmed) return;

    try {
      const res = await api.delete(`/tickets/${id}`);
      if (res.data.success) {
        setRecentTickets((prev) => prev.filter((t) => (t._id || t.id) !== id));
        fetchDashboardData();
      }
    } catch (err) {
      if (err.response?.status === 402) {
        openPaywall('Active subscription required to delete repair tickets');
      } else {
        alert(err.response?.data?.message || 'Failed to delete repair ticket');
      }
    }
  };

  const handleCreateIntake = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/tickets', {
        customer: {
          name: newTicket.customerName,
          phone: newTicket.customerPhone,
          email: newTicket.customerEmail
        },
        device: {
          type: newTicket.deviceType,
          brand: newTicket.brand,
          model: newTicket.model,
          serialNumber: newTicket.serialNumber
        },
        issueDescription: newTicket.issueDescription,
        technician: newTicket.technician,
        estimatedCost: Number(newTicket.estimatedCost) || 0,
        laborCost: Number(newTicket.laborCost) || 0,
        sendNotifications: true
      });

      if (res.data.success) {
        setShowIntakeModal(false);
        fetchDashboardData();

        setNewTicket({
          customerName: '',
          customerPhone: '',
          customerEmail: '',
          deviceType: 'LAPTOP',
          brand: '',
          model: '',
          serialNumber: '',
          issueDescription: '',
          technician: 'Chief Tech',
          estimatedCost: '',
          laborCost: ''
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
        openPaywall('Active subscription required to log new repairs');
      } else {
        alert(err.response?.data?.message || 'Error creating ticket');
      }
    }
  };

  const handleOpenWhatsAppPreview = async (ticket) => {
    try {
      const res = await api.post('/notifications/whatsapp/preview', {
        ticketId: ticket.ticketId,
        triggerType: ticket.status === 'READY_FOR_DELIVERY' ? 'READY_FOR_DELIVERY' : 'INTAKE_CONFIRMATION'
      });
      if (res.data.success) {
        setWhatsAppData({
          ticketId: ticket.ticketId,
          customerName: res.data.customerName,
          customerPhone: res.data.customerPhone,
          message: res.data.message,
          waUrl: res.data.waUrl,
          triggerType: ticket.status === 'READY_FOR_DELIVERY' ? 'READY_FOR_DELIVERY' : 'INTAKE_CONFIRMATION'
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {admin?.shopName || 'Shop Operations Dashboard'}
            </h1>
            <button
              onClick={() => setShowShopSetupModal(true)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition"
              title="Edit Shop Details (Name, Address, Gmail, Mobile, UPI ID)"
            >
              <Store className="w-4 h-4 text-blue-500" />
            </button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {admin?.address || 'Electronics Market'} • 📞 {admin?.phone || '+91 98765 43210'} • 💳 UPI: {admin?.upiId || 'apexrepair@upi'}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Shop Setup / Edit Button */}
          <button
            onClick={() => setShowShopSetupModal(true)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-sm transition"
            title="Edit Shop Name, Address, Gmail ID, Mobile, UPI ID"
          >
            <Store className="w-3.5 h-3.5 text-blue-500" />
            <span>Shop Profile</span>
          </button>

          <button
            onClick={() => onNavigate('admin-inventory')}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-sm transition"
          >
            <Boxes className="w-3.5 h-3.5 text-indigo-500" />
            <span>Inventory (+ / -)</span>
          </button>

          <button
            onClick={() => setShowIntakeModal(true)}
            className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Repair Intake</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Repairs */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-blue-600 dark:text-blue-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Repairs</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {stats?.activeTickets ?? 0}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {stats?.diagnosing ?? 0} diagnosing • {stats?.inRepair ?? 0} in repair
          </p>
        </div>

        {/* Ready For Delivery */}
        <div className="p-5 rounded-3xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Ready For Pickup</span>
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
            {stats?.readyForDelivery ?? 0}
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            Passed QA • Awaiting Customer
          </p>
        </div>

        {/* Total Revenue */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Collected Revenue</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            ₹{stats?.totalRevenue ? stats.totalRevenue.toLocaleString() : 0}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            ₹{stats?.pendingRevenue ? stats.pendingRevenue.toLocaleString() : 0} pending payment
          </p>
        </div>

        {/* Low Stock Alerts */}
        <div
          onClick={() => onNavigate('admin-inventory')}
          className="cursor-pointer p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 hover:border-amber-400 transition"
        >
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Stock Alerts</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {stats?.lowStockItems ?? 0}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <span>Parts below min threshold</span>
            <ChevronRight className="w-3 h-3 text-amber-500" />
          </p>
        </div>
      </div>

      {/* DASHBOARD INTERACTIVE GRAPHS (Weekly Trends, Device Category Shares, Revenue Split) */}
      <DashboardGraphs stats={stats} />

      {/* Recent Repairs Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Recent Repairs in Progress
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Change status, dispatch WhatsApp / Email updates, or generate bills.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {stats?.trashedCount > 0 && (
              <button
                type="button"
                onClick={() => onNavigate('admin-tickets', { tab: 'trash' })}
                className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-xl border border-rose-200 dark:border-rose-900"
              >
                <Trash2 className="w-3 h-3" />
                <span>Trash Bin ({stats.trashedCount})</span>
              </button>
            )}
            <button
              onClick={() => onNavigate('admin-tickets')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>View All Tickets</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Desktop Table View (>= 768px) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-semibold">
                <th className="pb-3 px-2">Ticket</th>
                <th className="pb-3 px-2">Customer / Device</th>
                <th className="pb-3 px-2">Current Status</th>
                <th className="pb-3 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {recentTickets.map((t) => (
                <tr key={t._id || t.ticketId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-3 px-2 font-bold text-slate-900 dark:text-white">
                    #{t.ticketId}
                  </td>
                  <td className="py-3 px-2">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      {t.device?.brand} {t.device?.model}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {t.customer?.name} • {t.customer?.phone}
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <select
                      value={t.status}
                      onChange={(e) => handleStatusChange(t._id || t.id, e.target.value)}
                      className="text-xs font-medium py-1 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="RECEIVED">Received</option>
                      <option value="DIAGNOSING">Diagnosing</option>
                      <option value="WAITING_PARTS">Waiting for Parts</option>
                      <option value="IN_REPAIR">In Repair</option>
                      <option value="QUALITY_CHECK">Quality Check</option>
                      <option value="READY_FOR_DELIVERY">Ready for Delivery</option>
                      <option value="DELIVERED">Delivered</option>
                    </select>
                  </td>
                  <td className="py-3 px-2 text-right space-x-1 whitespace-nowrap">
                    {/* WhatsApp trigger */}
                    <button
                      onClick={() => handleOpenWhatsAppPreview(t)}
                      title="Open WhatsApp Notification Preview"
                      className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 transition"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>

                    {/* Email trigger */}
                    {t.customer?.email && (
                      <button
                        onClick={() => setEmailData({
                          ticket: t,
                          triggerType: t.status === 'READY_FOR_DELIVERY' ? 'READY_FOR_DELIVERY' : 'INTAKE_CONFIRMATION'
                        })}
                        title="Send Email Update"
                        className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Live customer tracking link */}
                    <button
                      onClick={() => onNavigate('track', { query: t.ticketId })}
                      title="View Public Tracker"
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete ticket (Soft delete to Trash Bin) */}
                    <button
                      onClick={() => handleDeleteTicket(t)}
                      title="Move to Trash Bin"
                      className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View (< 768px) */}
        <div className="md:hidden space-y-3 pt-1">
          {recentTickets.map((t) => (
            <div
              key={t._id || t.ticketId}
              className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                  #{t.ticketId}
                </span>
                <select
                  value={t.status}
                  onChange={(e) => handleStatusChange(t._id || t.id, e.target.value)}
                  className="text-[11px] font-semibold py-1 px-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-blue-500 shadow-sm"
                >
                  <option value="RECEIVED">Received</option>
                  <option value="DIAGNOSING">Diagnosing</option>
                  <option value="WAITING_PARTS">Waiting Parts</option>
                  <option value="IN_REPAIR">In Repair</option>
                  <option value="QUALITY_CHECK">Quality Check</option>
                  <option value="READY_FOR_DELIVERY">Ready for Delivery</option>
                  <option value="DELIVERED">Delivered</option>
                </select>
              </div>

              <div>
                <div className="font-bold text-xs text-slate-900 dark:text-white">
                  {t.device?.brand} {t.device?.model}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {t.customer?.name} • <a href={`tel:${t.customer?.phone}`} className="text-blue-600 dark:text-blue-400 hover:underline">{t.customer?.phone}</a>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/70 dark:border-slate-700/60">
                <span className="text-[10px] uppercase font-bold text-slate-400">Quick Actions:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenWhatsAppPreview(t)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 text-xs font-semibold shadow-sm"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                  {t.customer?.email && (
                    <button
                      onClick={() => setEmailData({
                        ticket: t,
                        triggerType: t.status === 'READY_FOR_DELIVERY' ? 'READY_FOR_DELIVERY' : 'INTAKE_CONFIRMATION'
                      })}
                      className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 shadow-sm"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => onNavigate('track', { query: t.ticketId })}
                    className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-sm"
                    title="Track Page"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDeleteTicket(t)}
                    className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 shadow-sm hover:bg-rose-100 dark:hover:bg-rose-900/40 transition"
                    title="Move to Trash Bin"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SHOP SETUP / PROFILE MODAL (Opens right after login if unconfigured, or on click) */}
      <ShopSetupModal
        isOpen={showShopSetupModal}
        onClose={() => setShowShopSetupModal(false)}
        isFirstTime={admin && admin.isConfigured === false}
      />

      {/* NEW REPAIR INTAKE MODAL */}
      {showIntakeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
              New Repair Intake
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Logs the device, issues a Ticket ID, and triggers customer WhatsApp & Email receipts.
            </p>

            <form onSubmit={handleCreateIntake} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTicket.customerName}
                    onChange={(e) => setNewTicket({ ...newTicket, customerName: e.target.value })}
                    placeholder="e.g. Suresh Raina"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mobile Phone (WhatsApp) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={newTicket.customerPhone}
                    onChange={(e) => setNewTicket({ ...newTicket, customerPhone: e.target.value })}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Customer Email (For Automated Intake & Delivery Confirmation)
                </label>
                <input
                  type="email"
                  value={newTicket.customerEmail}
                  onChange={(e) => setNewTicket({ ...newTicket, customerEmail: e.target.value })}
                  placeholder="customer@gmail.com"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Device Type
                  </label>
                  <select
                    value={newTicket.deviceType}
                    onChange={(e) => setNewTicket({ ...newTicket, deviceType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="LAPTOP">Laptop</option>
                    <option value="DESKTOP">Desktop</option>
                    <option value="MOBILE">Mobile</option>
                    <option value="TABLET">Tablet</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Brand *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTicket.brand}
                    onChange={(e) => setNewTicket({ ...newTicket, brand: e.target.value })}
                    placeholder="e.g. Dell / Apple"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Model *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTicket.model}
                    onChange={(e) => setNewTicket({ ...newTicket, model: e.target.value })}
                    placeholder="e.g. XPS 15 / iPhone 13"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reported Issue Description *
                </label>
                <textarea
                  rows="2"
                  required
                  value={newTicket.issueDescription}
                  onChange={(e) => setNewTicket({ ...newTicket, issueDescription: e.target.value })}
                  placeholder="Describe failure symptoms, damage, or customer requests..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Estimated Cost (₹)
                  </label>
                  <input
                    type="number"
                    value={newTicket.estimatedCost}
                    onChange={(e) => setNewTicket({ ...newTicket, estimatedCost: e.target.value })}
                    placeholder="e.g. 2500"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Assigned Technician
                  </label>
                  <input
                    type="text"
                    value={newTicket.technician}
                    onChange={(e) => setNewTicket({ ...newTicket, technician: e.target.value })}
                    placeholder="e.g. Vikram Sharma"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowIntakeModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/25 transition"
                >
                  Create Intake & Notify Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WhatsApp Preview Modal */}
      {whatsAppData && (
        <WhatsAppModal
          isOpen={!!whatsAppData}
          onClose={() => setWhatsAppData(null)}
          data={whatsAppData}
        />
      )}

      {/* Email Modal */}
      {emailData && (
        <EmailModal
          isOpen={!!emailData}
          onClose={() => setEmailData(null)}
          ticket={emailData.ticket}
          triggerType={emailData.triggerType}
        />
      )}

      {/* Shop Setup / Profile Modal */}
      <ShopSetupModal
        isOpen={showShopSetupModal}
        onClose={() => setShowShopSetupModal(false)}
        isFirstTime={admin && admin.isConfigured === false}
      />
    </div>
  );
}
