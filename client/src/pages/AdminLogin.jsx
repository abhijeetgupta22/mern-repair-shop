import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  LogOut,
  CheckCircle2,
  UserPlus,
  Store,
  Phone,
  QrCode,
  User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin({ onNavigate }) {
  const { login, register, logout, isAuthenticated, admin } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'

  // Login form state
  const [loginEmail, setLoginEmail] = useState('admin@techfix.com');
  const [loginPassword, setLoginPassword] = useState('adminpassword123');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regShopName, setRegShopName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regUpiId, setRegUpiId] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const res = await login(loginEmail, loginPassword);
    setLoading(false);

    if (res.success) {
      onNavigate('admin-dashboard');
    } else {
      setError(res.message || 'Invalid email or password. Or create a new account.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    const payload = {
      name: regName.trim(),
      email: regEmail.trim().toLowerCase(),
      password: regPassword,
      shopName: regShopName.trim() || `${regName.trim()}'s Repair Care`,
      phone: regPhone.trim() || '+91 98765 43210',
      upiId: regUpiId.trim() || 'shop@upi',
      shopEmail: regEmail.trim().toLowerCase()
    };

    const res = await register(payload);
    setLoading(false);

    if (res.success) {
      setSuccess('Account created successfully with 28-Day Free Trial! Redirecting...');
      setTimeout(() => {
        onNavigate('admin-dashboard');
      }, 1000);
    } else {
      setError(res.message || 'Registration failed. Please check your details.');
    }
  };

  const handleFillDemo = () => {
    setLoginEmail('admin@techfix.com');
    setLoginPassword('adminpassword123');
    setError('');
  };

  // If already authenticated, display direct dashboard shortcut
  if (isAuthenticated && admin) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl p-8 space-y-6 text-center animate-fadeIn">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mb-2">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Already Signed In
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            You are logged in as <strong className="text-slate-800 dark:text-slate-200">{admin.name}</strong> ({admin.email}) for <strong className="text-blue-600">{admin.shopName}</strong>.
          </p>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => onNavigate('admin-dashboard')}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition"
            >
              <span>Go to Admin Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                logout();
                setError('');
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span>Sign Out to Switch Account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl p-6 sm:p-8 space-y-6 animate-fadeIn">
        {/* Logo & Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 mb-1">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Shop Admin Portal
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sign in with your email or register a new shop with a 28-day free trial.
          </p>
        </div>

        {/* Tab Toggle: Sign In vs Register */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
              setSuccess('');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition ${
              mode === 'login'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError('');
              setSuccess('');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition ${
              mode === 'register'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Create New Account</span>
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium text-center">
            {error}
          </div>
        )}

        {/* Success Notification */}
        {success && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-medium text-center">
            {success}
          </div>
        )}

        {/* ----------------- MODE 1: SIGN IN ----------------- */}
        {mode === 'login' && (
          <div className="space-y-4">
            {/* Demo Fast Login Pill */}
            <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center justify-between">
              <div className="text-xs">
                <span className="font-bold text-blue-700 dark:text-blue-300 block">Evaluation Demo Account</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">admin@techfix.com / adminpassword123</span>
              </div>
              <button
                type="button"
                onClick={handleFillDemo}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Fill Demo</span>
              </button>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="Enter your email..."
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password..."
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Want to use your own email?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Create account (28-day free trial)
                </button>
              </p>
            </div>
          </div>
        )}

        {/* ----------------- MODE 2: REGISTER NEW SHOP ----------------- */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            {/* Free Trial Banner */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 border border-blue-200 dark:border-blue-800 text-xs">
              <span className="font-bold text-blue-700 dark:text-blue-300 block">
                🎁 28-Day 100% Free Trial Included
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Full unlimited access for 28 days. No credit card or upfront fee required.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Your Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Your Login Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Password * (min 6 characters)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Create your password..."
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Shop Name
                </label>
                <div className="relative">
                  <Store className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={regShopName}
                    onChange={(e) => setRegShopName(e.target.value)}
                    placeholder="e.g. Apex Repair Hub"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Shop Mobile / WhatsApp
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Shop UPI ID (for Invoices & QR codes)
              </label>
              <div className="relative">
                <QrCode className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={regUpiId}
                  onChange={(e) => setRegUpiId(e.target.value)}
                  placeholder="yourshop@upi or phone@okicici"
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account & Start 28-Day Trial</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Sign In with your credentials
                </button>
              </p>
            </div>
          </form>
        )}

        <div className="text-center pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => onNavigate('home')}
            className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition"
          >
            ← Back to Customer Website
          </button>
        </div>
      </div>
    </div>
  );
}
