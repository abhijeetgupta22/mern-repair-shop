import React, { useState } from 'react';
import {
  LayoutDashboard,
  Wrench,
  Boxes,
  Receipt,
  MoreHorizontal,
  CreditCard,
  Store,
  QrCode,
  ExternalLink,
  LogOut,
  X,
  Zap,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';

export default function MobileBottomNav({ currentPage, onNavigate, onOpenShopProfile }) {
  const { admin, logout } = useAuth();
  const { subscription, openPaywall } = useSubscription();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const isExpired = subscription?.isExpired || subscription?.status === 'EXPIRED';

  const navItems = [
    { id: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'admin-tickets', label: 'Tickets', icon: Wrench },
    { id: 'admin-inventory', label: 'Inventory', icon: Boxes },
    { id: 'admin-billing', label: 'Billing', icon: Receipt },
  ];

  const handleNav = (page) => {
    onNavigate(page);
    setShowMoreMenu(false);
  };

  return (
    <>
      {/* Slide-up "More" Drawer for Mobile */}
      {showMoreMenu && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 rounded-t-3xl shadow-2xl p-5 space-y-4 max-h-[80vh] overflow-y-auto animate-slideUp">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                  {admin?.name?.charAt(0) || 'A'}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[200px]">
                    {admin?.shopName || 'TechFix Hub'}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate max-w-[200px]">
                    {admin?.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="grid grid-cols-1 gap-2 text-xs">
              {/* Subscription Pill */}
              <button
                onClick={() => handleNav('admin-subscription')}
                className={`w-full flex items-center justify-between p-3 rounded-2xl border transition ${
                  isExpired
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200'
                }`}
              >
                <span className="flex items-center gap-2.5 font-bold">
                  <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Subscription Plan</span>
                </span>
                {isExpired ? (
                  <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase">
                    Expired
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-black uppercase">
                    Active ({subscription?.daysRemaining ?? 28}d left)
                  </span>
                )}
              </button>

              {/* Shop Setup / Profile */}
              <button
                onClick={() => {
                  setShowMoreMenu(false);
                  onOpenShopProfile();
                }}
                className="w-full flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 font-bold transition"
              >
                <Store className="w-4 h-4 text-indigo-500" />
                <span>Shop Profile, Address & UPI ID</span>
              </button>

              {/* Customer Website */}
              <button
                onClick={() => handleNav('home')}
                className="w-full flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 font-bold transition"
              >
                <ExternalLink className="w-4 h-4 text-slate-500" />
                <span>View Public Customer Website</span>
              </button>

              {/* Sign Out */}
              <button
                onClick={() => {
                  setShowMoreMenu(false);
                  logout();
                }}
                className="w-full flex items-center justify-center gap-2 p-3 mt-2 rounded-2xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 font-bold border border-rose-200 dark:border-rose-800/80 transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] px-2 py-1.5">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-w-[56px] ${
                  active
                    ? 'text-blue-600 dark:text-blue-400 font-bold scale-105'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className={`p-1 rounded-lg ${active ? 'bg-blue-50 dark:bg-blue-950/60' : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
              </button>
            );
          })}

          {/* More / Menu Button */}
          <button
            onClick={() => setShowMoreMenu(true)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-w-[56px] relative ${
              showMoreMenu || currentPage === 'admin-subscription'
                ? 'text-blue-600 dark:text-blue-400 font-bold scale-105'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <div className="p-1 rounded-lg relative">
              <MoreHorizontal className="w-5 h-5" />
              {isExpired && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
