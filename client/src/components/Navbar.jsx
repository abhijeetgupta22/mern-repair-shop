import React, { useState } from 'react';
import {
  Wrench,
  Search,
  ShieldCheck,
  User,
  ArrowRight,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onNavigate, currentPage }) {
  const { isAuthenticated, admin, logout } = useAuth();
  const [quickTrackQuery, setQuickTrackQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
              <div className="flex items-center gap-1.5 font-bold text-lg tracking-tight text-slate-900 dark:text-white">
                <span>{admin?.shopName || 'TechFix'}</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 uppercase tracking-widest font-extrabold">PRO</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 -mt-1 font-medium hidden sm:block">
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

            <div className="flex flex-col gap-2 pt-2">
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
              {isAuthenticated ? (
                <div className="space-y-2">
                  <a
                    href="#admin-dashboard"
                    onClick={(e) => handleNavClick('admin-dashboard', e)}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Admin Dashboard</span>
                  </a>
                  <button
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-rose-600 text-sm font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <a
                  href="#admin-login"
                  onClick={(e) => handleNavClick('admin-login', e)}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium bg-slate-50 dark:bg-slate-800"
                >
                  <User className="w-4 h-4" />
                  <span>Admin Login</span>
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
