import React from 'react';
import {
  LayoutDashboard,
  Wrench,
  Boxes,
  Receipt,
  CreditCard,
  MessageSquare,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Zap,
  AlertCircle,
  Store
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';

export default function Sidebar({ currentPage, onNavigate, onOpenShopProfile }) {
  const { admin, logout } = useAuth();
  const { subscription, openPaywall } = useSubscription();

  const isExpired = subscription?.isExpired || subscription?.status === 'EXPIRED';

  const navItems = [
    { id: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'admin-tickets', label: 'Repair Tickets', icon: Wrench },
    { id: 'admin-inventory', label: 'Inventory (+ / -)', icon: Boxes },
    { id: 'admin-billing', label: 'Billing & Invoices', icon: Receipt },
    { id: 'admin-subscription', label: 'Subscription Plan', icon: CreditCard, highlight: isExpired },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 transition-colors duration-200">
      {/* Top Section */}
      <div className="p-4 space-y-4">
        {/* Admin profile chip */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
              {admin?.name?.charAt(0) || 'A'}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                {admin?.shopName || 'TechFix Hub'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {admin?.name || 'Administrator'}
              </p>
            </div>
          </div>

          {/* Subscription tier pill */}
          <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Plan:</span>
            {isExpired ? (
              <span
                onClick={() => openPaywall('Subscription Expired')}
                className="cursor-pointer font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 hover:underline"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                Expired (Renew)
              </span>
            ) : (
              <span className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                {subscription?.plan || 'PRO'} ACTIVE
              </span>
            )}
          </div>

          {/* Shop Setup / Profile Button */}
          <button
            onClick={onOpenShopProfile}
            className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 text-xs font-semibold border border-blue-200/60 dark:border-blue-800/60 transition shadow-sm"
            title="Update Shop Name, Address, Gmail ID, Mobile & UPI ID"
          >
            <Store className="w-3.5 h-3.5 text-blue-500" />
            <span>Shop Profile & UPI</span>
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                } ${item.highlight ? 'ring-2 ring-rose-500/40 bg-rose-50 dark:bg-rose-950/30' : ''}`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-white' : item.highlight ? 'text-rose-500' : 'text-slate-500 dark:text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <button
          onClick={() => onNavigate('home')}
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5" />
            Customer Website
          </span>
          <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">View</span>
        </button>

        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out Admin</span>
        </button>
      </div>
    </aside>
  );
}
