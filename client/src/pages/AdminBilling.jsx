import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Printer,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
  Clock,
  Trash2,
  CreditCard,
  QrCode,
  FileText
} from 'lucide-react';
import api from '../services/api';
import InvoicePrintModal from '../components/InvoicePrintModal';
import { useSubscription } from '../context/SubscriptionContext';

export default function AdminBilling({ initialTicketId = null }) {
  const { openPaywall } = useSubscription();
  const [invoices, setInvoices] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Selected Invoice for Print Preview
  const [printInvoice, setPrintInvoice] = useState(null);

  // New Invoice Modal
  const [showCreateModal, setShowCreateModal] = useState(!!initialTicketId);
  const [selectedTicketId, setSelectedTicketId] = useState(initialTicketId || '');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [deviceSummary, setDeviceSummary] = useState('');

  // Items
  const [items, setItems] = useState([
    { description: 'Repair Diagnostic & Labor Charge', type: 'LABOR', quantity: 1, unitPrice: 1000 }
  ]);
  const [laborFee, setLaborFee] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(18);
  const [paidAmount, setPaidAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  // Record Payment Modal
  const [paymentTarget, setPaymentTarget] = useState(null);
  const [recordAmount, setRecordAmount] = useState('');

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      const [invRes, tickRes, itemRes] = await Promise.all([
        api.get('/invoices', { params: { status: statusFilter, search } }),
        api.get('/tickets'),
        api.get('/inventory')
      ]);

      if (invRes.data.success) setInvoices(invRes.data.invoices || []);
      if (tickRes.data.success) setTickets(tickRes.data.tickets || []);
      if (itemRes.data.success) setInventory(itemRes.data.items || []);
    } catch (err) {
      console.error('Error fetching billing data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillingData();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBillingData();
  };

  // When ticket is selected in invoice modal, auto populate
  const handleTicketSelect = (tId) => {
    setSelectedTicketId(tId);
    const t = tickets.find(ticket => ticket.ticketId === tId);
    if (t) {
      setCustomerName(t.customer?.name || '');
      setCustomerPhone(t.customer?.phone || '');
      setCustomerEmail(t.customer?.email || '');
      setCustomerAddress(t.customer?.address || '');
      setDeviceSummary(`${t.device?.brand} ${t.device?.model} (${t.device?.type}) - ${t.issueDescription}`);
      setLaborFee(t.laborCost || 1000);
      setPaidAmount(t.paymentStatus === 'PAID' ? (t.finalCost || 0) : 0);
    }
  };

  const handleAddItem = () => {
    setItems([...items, { description: '', type: 'PART', quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const handleSelectFromInventory = (index, invItemSku) => {
    const found = inventory.find(i => i.sku === invItemSku);
    if (found) {
      const updated = [...items];
      updated[index] = {
        description: found.name,
        type: 'PART',
        quantity: 1,
        unitPrice: found.sellingPrice
      };
      setItems(updated);
    }
  };

  // Calculation helpers
  const itemsSum = items.reduce((acc, curr) => acc + (Number(curr.quantity) || 1) * (Number(curr.unitPrice) || 0), 0);
  const subtotal = itemsSum + (Number(laborFee) || 0);
  const discounted = Math.max(0, subtotal - (Number(discount) || 0));
  const taxAmount = Math.round((discounted * (Number(taxRate) || 0)) / 100);
  const totalAmount = discounted + taxAmount;
  const dueAmount = Math.max(0, totalAmount - (Number(paidAmount) || 0));

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/invoices', {
        ticketId: selectedTicketId || `REP-${Math.floor(1000 + Math.random() * 9000)}`,
        customer: {
          name: customerName,
          phone: customerPhone,
          email: customerEmail,
          address: customerAddress
        },
        deviceSummary,
        items,
        laborFee: Number(laborFee) || 0,
        discount: Number(discount) || 0,
        taxRate: Number(taxRate) || 18,
        paidAmount: Number(paidAmount) || 0,
        paymentMethod,
        paymentStatus: dueAmount === 0 ? 'PAID' : (Number(paidAmount) > 0 ? 'PARTIAL' : 'UNPAID')
      });

      if (res.data.success) {
        setShowCreateModal(false);
        fetchBillingData();
        setPrintInvoice(res.data.invoice);
      }
    } catch (err) {
      if (err.response?.status === 402) {
        openPaywall('Active subscription required to generate invoices');
      } else {
        alert(err.response?.data?.message || 'Failed to create invoice');
      }
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!paymentTarget) return;

    try {
      const res = await api.patch(`/invoices/${paymentTarget._id || paymentTarget.id}/payment`, {
        paidAmount: Number(recordAmount),
        paymentMethod: 'UPI'
      });

      if (res.data.success) {
        setPaymentTarget(null);
        setRecordAmount('');
        fetchBillingData();
      }
    } catch (err) {
      if (err.response?.status === 402) {
        openPaywall('Active subscription required to record payments');
      } else {
        alert(err.response?.data?.message || 'Failed to record payment');
      }
    }
  };

  // Metrics summary
  const totalBilled = invoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + (Number(inv.paidAmount) || 0), 0);
  const totalPending = invoices.reduce((sum, inv) => sum + (Number(inv.dueAmount) || 0), 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Billing & Invoicing Suite
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Interpret repair bills, add parts + labor, compute GST, record payments, and print tax invoices.
          </p>
        </div>

        <button
          onClick={() => {
            if (tickets.length > 0) handleTicketSelect(tickets[0].ticketId);
            setShowCreateModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition"
        >
          <Plus className="w-4 h-4" />
          <span>+ Generate New Invoice</span>
        </button>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Invoiced</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            ₹{totalBilled.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">{invoices.length} invoices generated</p>
        </div>

        <div className="p-5 rounded-3xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Collected Cash / UPI</span>
          <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
            ₹{totalPaid.toLocaleString()}
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400">Cleared payments</p>
        </div>

        <div className="p-5 rounded-3xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">Outstanding Balance</span>
          <div className="text-2xl font-black text-amber-700 dark:text-amber-300">
            ₹{totalPending.toLocaleString()}
          </div>
          <p className="text-[11px] text-amber-600 dark:text-amber-400">To be collected upon delivery</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoice #, ticket, customer..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600"
          />
        </form>

        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
          {['ALL', 'PAID', 'PARTIAL', 'UNPAID'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg transition ${
                statusFilter === status
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-sm font-bold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table & Mobile Cards */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Desktop Table (>= 768px) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-semibold">
                <th className="pb-3 px-3">Invoice #</th>
                <th className="pb-3 px-3">Ticket Ref</th>
                <th className="pb-3 px-3">Customer</th>
                <th className="pb-3 px-3 text-right">Total Amount</th>
                <th className="pb-3 px-3 text-right">Paid / Due</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3 text-right">Print / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {invoices.map((inv) => (
                <tr key={inv._id || inv.invoiceNumber} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                  <td className="py-3.5 px-3 font-mono font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                    {inv.invoiceNumber}
                    <div className="text-[10px] text-slate-400 font-sans font-normal">
                      {new Date(inv.issuedDate || inv.createdAt).toLocaleDateString()}
                    </div>
                  </td>

                  <td className="py-3.5 px-3 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                    #{inv.ticketId}
                  </td>

                  <td className="py-3.5 px-3">
                    <div className="font-bold text-slate-900 dark:text-white">{inv.customer?.name}</div>
                    <div className="text-[11px] text-slate-400">{inv.customer?.phone}</div>
                  </td>

                  <td className="py-3.5 px-3 text-right font-black text-slate-900 dark:text-white whitespace-nowrap">
                    ₹{inv.totalAmount}
                  </td>

                  <td className="py-3.5 px-3 text-right whitespace-nowrap">
                    <div className="text-emerald-600 font-semibold">Paid: ₹{inv.paidAmount || 0}</div>
                    {inv.dueAmount > 0 ? (
                      <div className="text-rose-500 font-bold">Due: ₹{inv.dueAmount}</div>
                    ) : (
                      <div className="text-[10px] text-slate-400">Cleared</div>
                    )}
                  </td>

                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      inv.paymentStatus === 'PAID'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {inv.paymentStatus} ({inv.paymentMethod || 'UPI'})
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-right space-x-1 whitespace-nowrap">
                    {inv.dueAmount > 0 && (
                      <button
                        onClick={() => {
                          setPaymentTarget(inv);
                          setRecordAmount(inv.dueAmount);
                        }}
                        className="px-2 py-1 text-[11px] font-bold rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 transition"
                      >
                        + Record Pay
                      </button>
                    )}

                    <button
                      onClick={() => setPrintInvoice(inv)}
                      title="Print Tax Invoice"
                      className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition inline-flex items-center gap-1"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-semibold">Print</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Invoice Cards View (< 768px) */}
        <div className="md:hidden space-y-3">
          {invoices.map((inv) => (
            <div
              key={inv._id || inv.invoiceNumber}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3"
            >
              {/* Header: Invoice # & Payment status pill */}
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
                    {inv.invoiceNumber}
                  </span>
                  <div className="text-[10px] text-slate-400">
                    {new Date(inv.issuedDate || inv.createdAt).toLocaleDateString()} • Ticket #{inv.ticketId}
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  inv.paymentStatus === 'PAID'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}>
                  {inv.paymentStatus}
                </span>
              </div>

              {/* Customer */}
              <div className="text-xs">
                <span className="font-bold text-slate-900 dark:text-white">{inv.customer?.name}</span>
                <span className="text-slate-400 ml-1.5">({inv.customer?.phone})</span>
              </div>

              {/* Amount Breakdown */}
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs">
                <div>
                  <div className="text-[10px] text-slate-400">Total Billed</div>
                  <div className="text-sm font-black text-slate-900 dark:text-white">₹{inv.totalAmount}</div>
                </div>
                <div className="text-right">
                  <div className="text-emerald-600 font-semibold">Paid: ₹{inv.paidAmount || 0}</div>
                  {inv.dueAmount > 0 ? (
                    <div className="text-rose-500 font-bold">Due: ₹{inv.dueAmount}</div>
                  ) : (
                    <div className="text-[10px] text-slate-400">Fully Cleared</div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-200 dark:border-slate-700/80">
                {inv.dueAmount > 0 && (
                  <button
                    onClick={() => {
                      setPaymentTarget(inv);
                      setRecordAmount(inv.dueAmount);
                    }}
                    className="flex-1 flex items-center justify-center gap-1 py-2 px-3 text-xs font-bold rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shadow-sm"
                  >
                    <span>+ Record Pay (₹{inv.dueAmount})</span>
                  </button>
                )}

                <button
                  onClick={() => setPrintInvoice(inv)}
                  className="flex items-center justify-center gap-1.5 py-2 px-4 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print A4 Invoice</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* GENERATE INVOICE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
              Interpret & Generate Repair Invoice
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Add parts from inventory, labor fees, and discounts to construct an itemized tax bill.
            </p>

            <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
              {/* Ticket Selection */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Attach to Repair Ticket
                </label>
                <select
                  value={selectedTicketId}
                  onChange={(e) => handleTicketSelect(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                >
                  <option value="">-- Standalone Invoice (No Ticket) --</option>
                  {tickets.map(t => (
                    <option key={t.ticketId} value={t.ticketId}>
                      #{t.ticketId} - {t.customer?.name} ({t.device?.brand} {t.device?.model})
                    </option>
                  ))}
                </select>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Customer Name *</label>
                  <input
                    type="text" required value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone *</label>
                  <input
                    type="text" required value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Device Service Summary</label>
                <input
                  type="text" value={deviceSummary}
                  onChange={(e) => setDeviceSummary(e.target.value)}
                  placeholder="e.g. Dell XPS 15 - Display cable replacement and thermal paste"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              {/* Line Items Builder */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">
                    Replaced Spares & Parts Items
                  </span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
                  >
                    + Add Line Item
                  </button>
                </div>

                {items.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex gap-2">
                      <select
                        onChange={(e) => handleSelectFromInventory(idx, e.target.value)}
                        className="w-1/3 px-2 py-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white text-[11px]"
                      >
                        <option value="">Quick select from stock...</option>
                        {inventory.map(inv => (
                          <option key={inv.sku} value={inv.sku}>
                            {inv.name} (₹{inv.sellingPrice})
                          </option>
                        ))}
                      </select>

                      <input
                        type="text"
                        placeholder="Item description / spare name"
                        value={item.description}
                        onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                        className="flex-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white text-[11px]"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-24">
                        <span className="text-[10px] text-slate-400 block">Quantity:</span>
                        <input
                          type="number" min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                          className="w-full px-2 py-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white text-xs"
                        />
                      </div>

                      <div className="w-32">
                        <span className="text-[10px] text-slate-400 block">Unit Price (₹):</span>
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                          className="w-full px-2 py-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white text-xs"
                        />
                      </div>

                      <div className="flex-1 text-right pt-3 font-bold text-slate-900 dark:text-white">
                        Total: ₹{(Number(item.quantity) || 1) * (Number(item.unitPrice) || 0)}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="pt-3 text-slate-400 hover:text-rose-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Charges & Discounts */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Labor / Service Fee (₹)</label>
                  <input
                    type="number" value={laborFee}
                    onChange={(e) => setLaborFee(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Discount (₹)</label>
                  <input
                    type="number" value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">GST Tax Rate (%)</label>
                  <input
                    type="number" value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Payment Details */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Paid Amount (₹)</label>
                  <input
                    type="number" value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="UPI">UPI / QR Code</option>
                    <option value="CASH">Cash</option>
                    <option value="CARD">Credit / Debit Card</option>
                    <option value="NET_BANKING">Net Banking</option>
                  </select>
                </div>
              </div>

              {/* Totals Preview */}
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex justify-between items-center">
                <div>
                  <span className="text-slate-500 text-xs">Calculated Net Payable:</span>
                  <div className="text-xl font-black text-blue-700 dark:text-blue-300">
                    ₹{totalAmount}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 text-xs">Due Balance:</span>
                  <div className={`text-base font-bold ${dueAmount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    ₹{dueAmount}
                  </div>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button" onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md"
                >
                  Generate Invoice & View
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {paymentTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Record Customer Payment
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Invoice #{paymentTarget.invoiceNumber} • Remaining Due: <strong>₹{paymentTarget.dueAmount}</strong>
            </p>

            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Amount Received (₹)
                </label>
                <input
                  type="number"
                  required
                  value={recordAmount}
                  onChange={(e) => setRecordAmount(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentTarget(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md"
                >
                  Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print Invoice Modal */}
      {printInvoice && (
        <InvoicePrintModal
          isOpen={!!printInvoice}
          onClose={() => setPrintInvoice(null)}
          invoice={printInvoice}
        />
      )}
    </div>
  );
}
