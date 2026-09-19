import React, { useState } from 'react';
import {
  Wrench,
  Search,
  Laptop,
  Smartphone,
  Monitor,
  ShieldCheck,
  Clock,
  CheckCircle2,
  PhoneCall,
  ArrowRight,
  Sparkles,
  Award,
  Zap,
  Cpu,
  BatteryCharging,
  Layers
} from 'lucide-react';

export default function PublicHome({ onNavigate }) {
  const [trackId, setTrackId] = useState('');
  const [intakeSuccess, setIntakeSuccess] = useState(false);
  const [quickForm, setQuickForm] = useState({
    name: '',
    phone: '',
    deviceType: 'LAPTOP',
    issue: ''
  });

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (trackId.trim()) {
      onNavigate('track', { query: trackId.trim() });
    }
  };

  const handleQuickIntake = (e) => {
    e.preventDefault();
    setIntakeSuccess(true);
    setTimeout(() => setIntakeSuccess(false), 4000);
    setQuickForm({ name: '', phone: '', deviceType: 'LAPTOP', issue: '' });
  };

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 bg-gradient-to-b from-blue-50/70 via-white to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-950 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Certified Multi-Brand Repair & Diagnostics Station</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Fast, Reliable Repairs for <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                Laptops, Desktops & Mobiles
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Same-day diagnostics, genuine replacement parts, 90-day warranty, and <strong>live status tracking</strong> with instant WhatsApp & Email delivery updates.
            </p>

            {/* LIVE TICKET TRACKING BOX */}
            <div className="max-w-xl mx-auto mt-8 bg-white dark:bg-slate-900 p-2.5 sm:p-3 rounded-2xl shadow-xl shadow-blue-500/10 border-2 border-blue-500/30 dark:border-blue-500/40">
              <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={trackId}
                    onChange={(e) => setTrackId(e.target.value)}
                    placeholder="Enter Ticket ID (e.g. REP-1002) or Phone..."
                    className="w-full pl-11 pr-4 py-3 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium placeholder-slate-400"
                  />
                </div>
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md shadow-blue-600/30 transition transform active:scale-95"
                >
                  <span>Track Status</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
              <div className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
                <span>Try Demo Tickets:</span>
                <button
                  type="button"
                  onClick={() => onNavigate('track', { query: 'REP-1002' })}
                  className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  REP-1002 (Ready)
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => onNavigate('track', { query: 'REP-1001' })}
                  className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  REP-1001 (In Repair)
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Expert Repair Solutions
          </h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            From cracked OLED screens to micro-soldering motherboard chips, our lab handles it all.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Laptop Care */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition group">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-5 group-hover:scale-110 transition">
              <Laptop className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Laptop Repairs
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Apple MacBook, Dell, HP, Lenovo, Asus, Acer, and MSI laptops.
            </p>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                <span>Screen & Hinges Replacement</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                <span>Keyboard & Trackpad Swaps</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                <span>Liquid Damage Ultrasonic Cleaning</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                <span>Battery Replacement & Thermal Paste</span>
              </li>
            </ul>
          </div>

          {/* Desktop Care */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-5 group-hover:scale-110 transition">
              <Monitor className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Desktop & Gaming PCs
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Custom rigs, office workstations, All-in-Ones & high-end workstations.
            </p>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                <span>BSOD, Crashing & No-Display Fixes</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                <span>SMPS Power Supply & GPU Testing</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                <span>High-Speed NVMe SSD & RAM Upgrades</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                <span>Windows 11 Setup & Secure Data Recovery</span>
              </li>
            </ul>
          </div>

          {/* Mobile Care */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-110 transition">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Smartphone & Tablets
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Apple iPhone, iPad, Samsung Galaxy, OnePlus, Xiaomi, and Google Pixel.
            </p>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span>OEM OLED / AMOLED Screen Fixes</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span>Type-C & Lightning Port Replacement</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span>Certified OEM Battery Replacement</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span>Microphone, Speaker & Camera Repairs</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Trust & Guarantee Badges */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center sm:text-left">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-base">90-Day Warranty</h4>
                <p className="text-xs text-blue-100">On all replacement parts</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-base">24-48 Hr Turnaround</h4>
                <p className="text-xs text-blue-100">Fast diagnostic & repairs</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-base">WhatsApp Alerts</h4>
                <p className="text-xs text-blue-100">Live progress at every step</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-base">Genuine OEM Spares</h4>
                <p className="text-xs text-blue-100">Direct distributor sourcing</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Book a visit / intake request */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg">
          <div className="text-center space-y-2 mb-6">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              Need a Fast Device Diagnostic?
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Submit your device details for a free upfront repair estimate and priority queue.
            </p>
          </div>

          {intakeSuccess && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm text-center font-semibold">
              🎉 Thank you! Your request has been logged. Our technician will call you within 15 minutes!
            </div>
          )}

          <form onSubmit={handleQuickIntake} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Your Full Name
              </label>
              <input
                type="text"
                required
                value={quickForm.name}
                onChange={(e) => setQuickForm({ ...quickForm, name: e.target.value })}
                placeholder="e.g. Ramesh Kumar"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mobile Number (for WhatsApp Updates)
              </label>
              <input
                type="tel"
                required
                value={quickForm.phone}
                onChange={(e) => setQuickForm({ ...quickForm, phone: e.target.value })}
                placeholder="e.g. +91 98765 43210"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Device Category
              </label>
              <select
                value={quickForm.deviceType}
                onChange={(e) => setQuickForm({ ...quickForm, deviceType: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="LAPTOP">Laptop (MacBook / Windows)</option>
                <option value="DESKTOP">Desktop / Gaming Rig</option>
                <option value="MOBILE">Mobile Phone (iPhone / Android)</option>
                <option value="TABLET">Tablet / iPad</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Problem Description
              </label>
              <input
                type="text"
                required
                value={quickForm.issue}
                onChange={(e) => setQuickForm({ ...quickForm, issue: e.target.value })}
                placeholder="e.g. Screen cracked, not turning on"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="sm:col-span-2 mt-2">
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md transition"
              >
                Submit Repair Intake Request
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
