import React, { useState } from 'react';
import {
  Wrench,
  Search,
  ShieldCheck,
  User,
  ArrowRight,
  Menu,
  X,
  LogOut,
  QrCode
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import ShareModal from './ShareModal';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onNavigate, currentPage }) {
  const { isAuthenticated, admin, logout } = useAuth();
  const [quickTrackQuery, setQuickTrackQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (quickTrackQuery.trim()) {
      onNavigate('track', { query: quickTrackQuery.trim() });
      setQuickTrackQuery('');
      setMobileMenuOpen(false);
    }
  };

  const handleNavClick = (page, e) => {
    if (e) e.preventDefault();
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <a
            href="#home"
            onClick={(e) => handleNavClick('home', e)}
            className="flex items-center gap-3 cursor-pointer group select-none flex-shrink-0 text-inherit no-underline"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
              <Wrench className="w-5 h-5 transform group-hover:rotate-45 transition-transform duration-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white">
                <span className="truncate max-w-[130px] sm:max-w-[240px] md:max-w-none">{admin?.shopName || 'TechFix'}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 uppercase tracking-widest font-extrabold flex-shrink-0">PRO</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 -mt-0.5 font-medium hidden sm:block">
                Laptop • Desktop • Mobile Care
              </p>
            </div>
          </a>

          {/* Quick Track Input */}
          <form
            onSubmit={handleTrackSubmit}
            className="hidden md:flex items-center relative max-w-xs w-full"
          >
            <Search className="w-4 h-4 absolute left-3 text-slate-400" />
            <input
              type="text"
              value={quickTrackQuery}
              onChange={(e) => setQuickTrackQuery(e.target.value)}
              placeholder="Track Ticket ID (e.g. REP-1002)..."
              className="w-full pl-9 pr-8 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100 placeholder-slate-400 transition"
            />
            {quickTrackQuery && (
              <button
                type="submit"
                className="absolute right-2 text-blue-600 hover:text-blue-700"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Desktop Nav Actions */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="#home"
              onClick={(e) => handleNavClick('home', e)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition ${
                currentPage === 'home'
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Services
            </a>

            <a
              href="#track"
              onClick={(e) => handleNavClick('track', e)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition ${
                currentPage === 'track'
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Live Tracker
            </a>

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

            <ThemeToggle />

            {/* Share QR Code Button */}
            <button
              onClick={() => setShareOpen(true)}
              title="Share / Scan Website QR Code"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-blue-400 dark:hover:border-blue-500 transition shadow-sm"
            >
              <QrCode className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="hidden sm:inline">Share QR</span>
            </button>

            {/* Admin Authentication Link / Suite Button */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <a
                  href="#admin-dashboard"
                  onClick={(e) => handleNavClick('admin-dashboard', e)}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-sm transition"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin Suite</span>
                </a>
                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-500 hover:text-rose-600 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <a
                href="#admin-login"
                onClick={(e) => handleNavClick('admin-login', e)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-blue-500 text-sm font-semibold transition ${
                  currentPage === 'admin-login'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Admin Login</span>
              </a>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <form onSubmit={handleTrackSubmit} className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={quickTrackQuery}
                onChange={(e) => setQuickTrackQuery(e.target.value)}
                placeholder="Track Ticket ID..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              />
            </form>

            <div className="flex flex-col gap-1.5 pt-2">
              {isAuthenticated ? (
                <>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 pt-1">
                    Admin Workspace
                  </div>
                  <a
                    href="#admin-dashboard"
                    onClick={(e) => handleNavClick('admin-dashboard', e)}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                  >
                    <span>📊</span>
                    <span>Dashboard & Graphs</span>
                  </a>
                  <a
                    href="#admin-tickets"
                    onClick={(e) => handleNavClick('admin-tickets', e)}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                  >
                    <span>🔧</span>
                    <span>Repair Tickets</span>
                  </a>
                  <a
                    href="#admin-inventory"
                    onClick={(e) => handleNavClick('admin-inventory', e)}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                  >
                    <span>📦</span>
                    <span>Inventory (+ / -)</span>
                  </a>
                  <a
                    href="#admin-billing"
                    onClick={(e) => handleNavClick('admin-billing', e)}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                  >
                    <span>🧾</span>
                    <span>Billing & Invoices</span>
                  </a>
                  <a
                    href="#admin-subscription"
                    onClick={(e) => handleNavClick('admin-subscription', e)}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                  >
                    <span>💳</span>
                    <span>Subscription Plan</span>
                  </a>

                  <div className="h-px bg-slate-200 dark:bg-slate-800 my-1" />

                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 pt-1">
                    Public Views
                  </div>
                </>
              ) : null}

              <a
                href="#home"
                onClick={(e) => handleNavClick('home', e)}
                className="text-left px-3 py-2 text-sm font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
              >
                Services
              </a>
              <a
                href="#track"
                onClick={(e) => handleNavClick('track', e)}
                className="text-left px-3 py-2 text-sm font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
              >
                Live Tracker
              </a>
              <button
                onClick={() => { setShareOpen(true); setMobileMenuOpen(false); }}
                className="flex items-center gap-2 text-left px-3 py-2 text-sm font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-blue-600 dark:text-blue-400"
              >
                <QrCode className="w-4 h-4" />
                <span>Share / Scan Website QR</span>
              </button>

              {isAuthenticated ? (
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="flex items-center justify-center gap-2 w-full mt-2 px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-800/80 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-sm font-bold"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              ) : (
                <a
                  href="#admin-login"
                  onClick={(e) => handleNavClick('admin-login', e)}
                  className="flex items-center justify-center gap-2 w-full mt-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold bg-slate-50 dark:bg-slate-800"
                >
                  <User className="w-4 h-4" />
                  <span>Admin Login</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Share QR Modal */}
        <ShareModal isOpen={shareOpen} onClose={() => setShareOpen(false)} />
      </div>
    </header>
  );
}
