import React, { useState } from 'react';
import {
  TrendingUp,
  Laptop,
  Smartphone,
  Monitor,
  Tablet,
  IndianRupee,
  Activity,
  Layers,
  CheckCircle2,
  Clock,
  Wrench,
  PackageCheck
} from 'lucide-react';

export default function DashboardGraphs({ stats }) {
  const [activeTab, setActiveTab] = useState('trends'); // 'trends' | 'devices' | 'revenue'

  if (!stats) return null;

  const {
    dailyTrends = [],
    deviceBreakdown = { LAPTOP: 0, DESKTOP: 0, MOBILE: 0, TABLET: 0 },
    totalRevenue = 0,
    pendingRevenue = 0,
    stageFunnel = []
  } = stats;

  // Calculate totals for device breakdown
  const totalDevices = Object.values(deviceBreakdown).reduce((a, b) => a + b, 0) || 1;
  const laptopPct = Math.round(((deviceBreakdown.LAPTOP || 0) / totalDevices) * 100);
  const mobilePct = Math.round(((deviceBreakdown.MOBILE || 0) / totalDevices) * 100);
  const desktopPct = Math.round(((deviceBreakdown.DESKTOP || 0) / totalDevices) * 100);
  const tabletPct = Math.round(((deviceBreakdown.TABLET || 0) / totalDevices) * 100);

  // Maximum value for scaling 7-day trend bars
  const maxTrendVal = Math.max(...dailyTrends.map(d => Math.max(d.received, d.completed)), 4);

  // Revenue totals
  const totalBilled = totalRevenue + pendingRevenue || 1;
  const collectedPct = Math.round((totalRevenue / totalBilled) * 100);
  const pendingPct = 100 - collectedPct;

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-1 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-500" />
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
            Operational Analytics & Graphs
          </h3>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('trends')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'trends'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Weekly Trends
          </button>
          <button
            onClick={() => setActiveTab('devices')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'devices'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Device Shares
          </button>
          <button
            onClick={() => setActiveTab('revenue')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'revenue'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Revenue Chart
          </button>
        </div>
      </div>

      {/* GRAPH 1: 7-DAY REPAIR VOLUME TRENDS */}
      {activeTab === 'trends' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Daily Repair Volume (Last 7 Days)
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Comparison of new repair intakes logged vs devices repaired & ready.
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                <span className="text-slate-600 dark:text-slate-300 font-medium">New Intakes</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span className="text-slate-600 dark:text-slate-300 font-medium">Repaired / Completed</span>
              </span>
            </div>
          </div>

          {/* SVG & Bar Chart Visualization */}
          <div className="pt-4">
            <div className="grid grid-cols-7 gap-2 sm:gap-4 h-48 items-end border-b border-slate-200 dark:border-slate-800 pb-2">
              {dailyTrends.map((d, idx) => {
                const receivedHeightPct = Math.round((d.received / maxTrendVal) * 100);
                const completedHeightPct = Math.round((d.completed / maxTrendVal) * 100);

                return (
                  <div key={idx} className="flex flex-col items-center justify-end h-full group relative">
                    {/* Hover Tooltip */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] py-1 px-2 rounded shadow-lg pointer-events-none z-20 whitespace-nowrap">
                      {d.day}: {d.received} In, {d.completed} Out
                    </div>

                    {/* Dual Column Bars */}
                    <div className="flex items-end gap-1 sm:gap-2 w-full justify-center h-full">
                      {/* Received bar */}
                      <div
                        style={{ height: `${Math.max(receivedHeightPct, 12)}%` }}
                        className="w-3 sm:w-5 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md transition-all duration-500 hover:brightness-110 flex items-center justify-center text-[10px] text-white font-bold pb-0.5"
                      >
                        <span className="hidden sm:inline">{d.received}</span>
                      </div>

                      {/* Completed bar */}
                      <div
                        style={{ height: `${Math.max(completedHeightPct, 8)}%` }}
                        className="w-3 sm:w-5 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-md transition-all duration-500 hover:brightness-110 flex items-center justify-center text-[10px] text-white font-bold pb-0.5"
                      >
                        <span className="hidden sm:inline">{d.completed}</span>
                      </div>
                    </div>

                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-2">
                      {d.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stage Progression Funnel Summary */}
          {stageFunnel && stageFunnel.length > 0 && (
            <div className="pt-2">
              <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Live Workshop Pipeline Funnel
              </h5>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                {stageFunnel.map((s, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-center">
                    <span className="text-lg font-black text-slate-900 dark:text-white block">
                      {s.count}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase truncate block">
                      {s.stage}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* GRAPH 2: DEVICE CATEGORY DISTRIBUTION */}
      {activeTab === 'devices' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Device Category Share
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Breakdown of repairs distributed across Laptop, Mobile, Desktop, and Tablet repairs.
            </p>
          </div>

          {/* Horizontal Progress Bars */}
          <div className="space-y-4">
            {/* Laptops */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                  <Laptop className="w-4 h-4 text-blue-500" />
                  <span>Laptops & MacBooks ({deviceBreakdown.LAPTOP || 0} units)</span>
                </span>
                <span className="font-extrabold text-blue-600 dark:text-blue-400">{laptopPct}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  style={{ width: `${laptopPct}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-700"
                />
              </div>
            </div>

            {/* Mobile Phones */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                  <Smartphone className="w-4 h-4 text-emerald-500" />
                  <span>Mobile Phones & iPhones ({deviceBreakdown.MOBILE || 0} units)</span>
                </span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{mobilePct}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  style={{ width: `${mobilePct}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 transition-all duration-700"
                />
              </div>
            </div>

            {/* Desktop Computers */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                  <Monitor className="w-4 h-4 text-indigo-500" />
                  <span>Desktop Rigs & Workstations ({deviceBreakdown.DESKTOP || 0} units)</span>
                </span>
                <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{desktopPct}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  style={{ width: `${desktopPct}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-purple-500 transition-all duration-700"
                />
              </div>
            </div>

            {/* Tablets */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                  <Tablet className="w-4 h-4 text-amber-500" />
                  <span>Tablets & iPads ({deviceBreakdown.TABLET || 0} units)</span>
                </span>
                <span className="font-extrabold text-amber-600 dark:text-amber-400">{tabletPct}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  style={{ width: `${tabletPct}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-700"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GRAPH 3: FINANCIAL REVENUE COLLECTION */}
      {activeTab === 'revenue' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Revenue & Collection Split
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cleared payments via UPI/Cash versus outstanding balance to be collected on delivery.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block font-medium">Total Billed Volume:</span>
              <span className="text-xl font-black text-slate-900 dark:text-white">
                ₹{(totalRevenue + pendingRevenue).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Stacked Percentage Bar */}
          <div className="space-y-2">
            <div className="w-full h-6 rounded-2xl bg-slate-100 dark:bg-slate-800 flex overflow-hidden p-1 gap-1">
              <div
                style={{ width: `${collectedPct}%` }}
                className="h-full rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-400 flex items-center justify-center text-[11px] font-bold text-white transition-all duration-700"
              >
                {collectedPct > 15 ? `${collectedPct}% Cleared` : ''}
              </div>
              <div
                style={{ width: `${pendingPct}%` }}
                className="h-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-[11px] font-bold text-white transition-all duration-700"
              >
                {pendingPct > 15 ? `${pendingPct}% Due` : ''}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 block">
                  ✓ Collected (UPI / Cash / Card)
                </span>
                <span className="text-2xl font-black text-emerald-800 dark:text-emerald-200 mt-1 block">
                  ₹{totalRevenue.toLocaleString()}
                </span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
                  {collectedPct}% of all billed repair work
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                <span className="text-xs font-bold text-amber-700 dark:text-amber-300 block">
                  ⏳ Pending Customer Balances
                </span>
                <span className="text-2xl font-black text-amber-800 dark:text-amber-200 mt-1 block">
                  ₹{pendingRevenue.toLocaleString()}
                </span>
                <span className="text-[11px] text-amber-600 dark:text-amber-400">
                  Payable upon device pickup / delivery
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
