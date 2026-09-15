import React from 'react';
import { Printer, X, Download, CheckCircle, ShieldCheck, QrCode } from 'lucide-react';

export default function InvoicePrintModal({ isOpen, onClose, invoice }) {
  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Modal Controls (Hidden in Print) */}
        <div className="no-print flex items-center justify-between p-4 px-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              Invoice #{invoice.invoiceNumber}
            </span>
            <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
              invoice.paymentStatus === 'PAID'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
            }`}>
              {invoice.paymentStatus}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Body */}
        <div className="overflow-y-auto p-8 bg-white text-slate-900 font-sans print:p-0 print:overflow-visible">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-6">
            <div>
              <div className="flex items-center gap-2 text-2xl font-black text-blue-600 tracking-tight">
                <span>TechFix</span>
                <span className="text-xs px-2 py-0.5 rounded bg-blue-600 text-white font-extrabold">PRO CARE</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Multi-Brand Laptop, Desktop & Mobile Repair Center</p>
              <p className="text-xs text-slate-600 mt-2">
                TechFix Hub, Electronics Market, Station Road<br />
                Phone: +91 98765 43210 • GSTIN: 29AAACT9812K1Z5
              </p>
            </div>

            <div className="text-right">
              <h1 className="text-2xl font-black text-slate-900 uppercase tracking-wider">TAX INVOICE</h1>
              <p className="text-xs font-bold text-slate-700 mt-1">#{invoice.invoiceNumber}</p>
              <p className="text-xs text-slate-500">Date: {new Date(invoice.issuedDate || Date.now()).toLocaleDateString()}</p>
              <p className="text-xs font-semibold text-blue-600 mt-1">Ticket Ref: #{invoice.ticketId}</p>
            </div>
          </div>

          {/* Customer & Device Information */}
          <div className="grid grid-cols-2 gap-6 mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <h4 className="font-bold text-slate-500 uppercase tracking-wider mb-2">Billed To Customer</h4>
              <p className="font-bold text-slate-900 text-sm">{invoice.customer?.name}</p>
              <p className="text-slate-600">{invoice.customer?.phone}</p>
              {invoice.customer?.email && <p className="text-slate-600">{invoice.customer?.email}</p>}
              {invoice.customer?.address && <p className="text-slate-600">{invoice.customer?.address}</p>}
            </div>

            <div>
              <h4 className="font-bold text-slate-500 uppercase tracking-wider mb-2">Service Device Summary</h4>
              <p className="font-bold text-slate-900 text-sm">{invoice.deviceSummary || 'Device Repair Service'}</p>
              <p className="text-slate-600 mt-1">Payment Method: <strong>{invoice.paymentMethod || 'CASH'}</strong></p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{invoice.warrantyInfo || '90 Days Service Warranty Included'}</span>
              </div>
            </div>
          </div>

          {/* Itemized Table */}
          <table className="w-full text-xs text-left border-collapse mb-6">
            <thead>
              <tr className="border-y-2 border-slate-800 bg-slate-100 text-slate-700">
                <th className="py-2.5 px-3 font-bold">#</th>
                <th className="py-2.5 px-3 font-bold">Description</th>
                <th className="py-2.5 px-3 font-bold">Type</th>
                <th className="py-2.5 px-3 font-bold text-center">Qty</th>
                <th className="py-2.5 px-3 font-bold text-right">Unit Price</th>
                <th className="py-2.5 px-3 font-bold text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {(invoice.items || []).map((item, idx) => (
                <tr key={idx}>
                  <td className="py-2.5 px-3 text-slate-500">{idx + 1}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-900">{item.description}</td>
                  <td className="py-2.5 px-3 text-slate-500">
                    <span className="px-1.5 py-0.5 rounded bg-slate-200 text-[10px] font-semibold">{item.type}</span>
                  </td>
                  <td className="py-2.5 px-3 text-center">{item.quantity}</td>
                  <td className="py-2.5 px-3 text-right">₹{item.unitPrice}</td>
                  <td className="py-2.5 px-3 text-right font-bold">₹{item.total}</td>
                </tr>
              ))}
              {invoice.laborFee > 0 && (
                <tr>
                  <td className="py-2.5 px-3 text-slate-500">{(invoice.items?.length || 0) + 1}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-900">Expert Diagnostic & Labor Service</td>
                  <td className="py-2.5 px-3 text-slate-500">
                    <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-semibold">LABOR</span>
                  </td>
                  <td className="py-2.5 px-3 text-center">1</td>
                  <td className="py-2.5 px-3 text-right">₹{invoice.laborFee}</td>
                  <td className="py-2.5 px-3 text-right font-bold">₹{invoice.laborFee}</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Totals Calculation */}
          <div className="flex justify-between items-start pt-2 border-t border-slate-200 mb-6 text-xs">
            <div className="max-w-xs space-y-2">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="font-bold text-slate-800 mb-1">Payment Instructions:</p>
                <p className="text-slate-600 text-[11px]">
                  UPI: <strong>techfix@upi</strong> • Cash & Cards accepted at counter.<br />
                  For instant payment verification, show this invoice.
                </p>
              </div>
              <p className="text-[11px] text-slate-500 italic">
                * Replaced parts carry a 90-day warranty against manufacturing defects. Physical and liquid damage void warranty.
              </p>
            </div>

            <div className="w-64 space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-semibold">₹{invoice.subtotal || invoice.totalAmount}</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Special Discount:</span>
                  <span>- ₹{invoice.discount}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>GST / Tax ({invoice.taxRate || 18}%):</span>
                <span>₹{invoice.taxAmount || 0}</span>
              </div>
              <div className="h-px bg-slate-300 my-1"></div>
              <div className="flex justify-between text-sm font-extrabold text-slate-900">
                <span>Total Payable:</span>
                <span className="text-blue-600">₹{invoice.totalAmount}</span>
              </div>
              <div className="flex justify-between text-slate-700 font-medium">
                <span>Paid Amount:</span>
                <span>₹{invoice.paidAmount || 0}</span>
              </div>
              <div className="flex justify-between font-bold text-rose-600">
                <span>Balance Due:</span>
                <span>₹{invoice.dueAmount || 0}</span>
              </div>
            </div>
          </div>

          {/* Footer & Signature */}
          <div className="pt-8 border-t border-slate-200 flex justify-between items-end text-xs text-slate-500">
            <div>
              <p className="font-bold text-slate-800">Authorized Signature</p>
              <p className="text-[10px] text-slate-400 mt-6">TechFix Pro Care Repair Hub</p>
            </div>
            <div className="text-right text-[11px]">
              <p>Thank you for choosing TechFix Pro Care!</p>
              <p>Visit us: www.techfixpro.com • Helpline: +91 98765 43210</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
