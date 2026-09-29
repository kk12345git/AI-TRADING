"use client";

import React, { useState } from "react";
import {
  PerformanceReport, TimeframeFilter, CurrencySymbol, TimeframeAggregation
} from "../types/portfolio";
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine, Cell
} from "recharts";
import {
  Calendar, TrendingUp, TrendingDown, Layers, BarChart2,
  PieChart as PieIcon, Zap, CheckCircle2, ChevronRight
} from "lucide-react";

interface AnalyticsChartsProps {
  report: PerformanceReport | null;
  currentTimeframe: TimeframeFilter;
  onTimeframeChange: (tf: TimeframeFilter) => void;
  currency: CurrencySymbol;
}

const TIMEFRAME_OPTIONS: { id: TimeframeFilter; label: string; desc: string; icon: string }[] = [
  { id: "daily", label: "Daily", desc: "Day-by-Day", icon: "📅" },
  { id: "weekly", label: "Weekly", desc: "Week-by-Week", icon: "📊" },
  { id: "monthly", label: "Monthly", desc: "Month-by-Month", icon: "📆" },
  { id: "quarterly", label: "Quarterly", desc: "Q1, Q2, Q3, Q4", icon: "📈" },
  { id: "half_yearly", label: "Half-Yearly", desc: "H1 (Jan-Jun) & H2 (Jul-Dec)", icon: "🌓" },
  { id: "annually", label: "Annually", desc: "Year-over-Year", icon: "🏆" }
];

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  report,
  currentTimeframe,
  onTimeframeChange,
  currency
}) => {
  const [activeChartTab, setActiveChartTab] = useState<"pnl" | "equity" | "points">("pnl");

  if (!report) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500">
        Loading analytics dashboard...
      </div>
    );
  }

  const breakdownData = report.timeframe_breakdown || [];
  const equityData = report.equity_curve || [];
  const strategyData = report.strategy_breakdown || [];

  return (
    <div className="space-y-6">
      
      {/* 1. Timeframe Selection Bar (Daily, Weekly, Monthly, Quarterly, Half-Yearly, Annually) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <BarChart2 className="w-5 h-5" />
              </span>
              Periodic Performance Dashboard
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select periodic aggregation: evaluate points captured and profit/loss across weekly, monthly, quarterly, half-yearly, and annually views
            </p>
          </div>
        </div>

        {/* Timeframe Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {TIMEFRAME_OPTIONS.map((opt) => {
            const isSelected = currentTimeframe === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => onTimeframeChange(opt.id)}
                className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden ${
                  isSelected
                    ? "bg-slate-850 border-cyan-500 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500"
                    : "bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">{opt.icon}</span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  )}
                </div>
                <div className="mt-2">
                  <span className={`block text-xs font-black uppercase tracking-wider ${
                    isSelected ? "text-cyan-400" : "text-white"
                  }`}>
                    {opt.label}
                  </span>
                  <span className="text-[10px] text-slate-400 line-clamp-1">
                    {opt.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Visual Interactive Charts Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-white">
              {activeChartTab === "pnl" && `${TIMEFRAME_OPTIONS.find(t => t.id === currentTimeframe)?.label} Net Profit & Loss (${currency})`}
              {activeChartTab === "equity" && "Cumulative Account Growth & Equity Curve"}
              {activeChartTab === "points" && `${TIMEFRAME_OPTIONS.find(t => t.id === currentTimeframe)?.label} Points Captured / Lost (pts)`}
            </h3>
            <p className="text-xs text-slate-400">
              Visual periodic breakdown comparing profitable vs losing periods
            </p>
          </div>

          {/* Chart View Switcher */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveChartTab("pnl")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeChartTab === "pnl" ? "bg-cyan-500 text-slate-950 font-bold shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              P&L Bar Chart
            </button>
            <button
              onClick={() => setActiveChartTab("points")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeChartTab === "points" ? "bg-cyan-500 text-slate-950 font-bold shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              Points Chart
            </button>
            <button
              onClick={() => setActiveChartTab("equity")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeChartTab === "equity" ? "bg-cyan-500 text-slate-950 font-bold shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              Cumulative Equity
            </button>
          </div>
        </div>

        {/* CHART 1: PERIODIC PNL BARS */}
        {activeChartTab === "pnl" && (
          <div className="h-72 w-full">
            {breakdownData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                No trades data available for this timeframe.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={breakdownData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="period_label"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) => `${currency}${val}`}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", color: "#fff", fontSize: "12px" }}
                    formatter={(value: any, name: any) => [
                      `${Number(value) >= 0 ? `+${currency}` : `-${currency}`}${Math.abs(Number(value)).toLocaleString()}`,
                      "Net P&L"
                    ]}
                    labelFormatter={(label) => `Period: ${label}`}
                  />
                  <ReferenceLine y={0} stroke="#475569" strokeWidth={1} />
                  <Bar dataKey="net_pnl" radius={[6, 6, 0, 0]}>
                    {breakdownData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.net_pnl >= 0 ? "#10b981" : "#f43f5e"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        )}

        {/* CHART 2: PERIODIC POINTS BARS */}
        {activeChartTab === "points" && (
          <div className="h-72 w-full">
            {breakdownData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                No points data available for this timeframe.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={breakdownData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="period_label"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) => `${val} pts`}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", color: "#fff", fontSize: "12px" }}
                    formatter={(value: any) => [`${Number(value) >= 0 ? `+${value}` : value} pts`, "Points"]}
                    labelFormatter={(label) => `Period: ${label}`}
                  />
                  <ReferenceLine y={0} stroke="#475569" strokeWidth={1} />
                  <Bar dataKey="total_points" radius={[6, 6, 0, 0]}>
                    {breakdownData.map((entry, index) => (
                      <Cell
                        key={`pts-cell-${index}`}
                        fill={entry.total_points >= 0 ? "#06b6d4" : "#f43f5e"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        )}

        {/* CHART 3: CUMULATIVE EQUITY AREA CHART */}
        {activeChartTab === "equity" && (
          <div className="h-72 w-full">
            {equityData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                No equity curve data available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={equityData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                  <defs>
                    <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(val) => `${currency}${val}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", color: "#fff", fontSize: "12px" }}
                    formatter={(value: any, name: any) => [
                      `${Number(value) >= 0 ? `+${currency}` : `-${currency}`}${Math.abs(Number(value)).toLocaleString()}`,
                      name === "cumulative_pnl" ? "Cumulative P&L" : "Daily P&L"
                    ]}
                  />
                  <ReferenceLine y={0} stroke="#475569" strokeWidth={1} />
                  <Area
                    type="monotone"
                    dataKey="cumulative_pnl"
                    stroke="#06b6d4"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#equityGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        )}

      </div>

      {/* 3. Periodic Performance Breakdown Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Calendar className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              {TIMEFRAME_OPTIONS.find(t => t.id === currentTimeframe)?.label} Performance Statement
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {breakdownData.length} {breakdownData.length === 1 ? "period" : "periods"} recorded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-5">Period</th>
                <th className="py-3.5 px-4 text-center">Trades</th>
                <th className="py-3.5 px-4 text-center">Wins / Losses</th>
                <th className="py-3.5 px-4">Win Rate %</th>
                <th className="py-3.5 px-4 text-right">Points Captured</th>
                <th className="py-3.5 px-5 text-right">Net Profit / Loss</th>
                <th className="py-3.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {breakdownData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500">
                    No data available for the selected timeframe.
                  </td>
                </tr>
              ) : (
                breakdownData.map((row) => {
                  const isWinPeriod = row.net_pnl > 0.05;
                  const isLossPeriod = row.net_pnl < -0.05;

                  return (
                    <tr key={row.period_label} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-5 font-bold text-white whitespace-nowrap">
                        <span className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                          {row.period_label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-slate-300">
                        {row.trades_count}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className="text-emerald-400 font-semibold">{row.wins}W</span>
                        <span className="text-slate-500 mx-1">•</span>
                        <span className="text-rose-400 font-semibold">{row.losses}L</span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-200 w-10 font-bold">{row.win_rate}%</span>
                          <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full"
                              style={{ width: `${Math.min(row.win_rate, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono whitespace-nowrap">
                        <span className={`font-black px-2 py-0.5 rounded text-xs ${
                          row.total_points >= 0 ? "text-emerald-400 bg-emerald-500/10" : "text-rose-400 bg-rose-500/10"
                        }`}>
                          {row.total_points >= 0 ? `+${row.total_points}` : row.total_points} pts
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right font-mono font-black text-sm whitespace-nowrap">
                        <span className={isWinPeriod ? "text-emerald-400" : isLossPeriod ? "text-rose-400" : "text-slate-300"}>
                          {row.net_pnl >= 0 ? `+${currency}${row.net_pnl.toLocaleString()}` : `${currency}${row.net_pnl.toLocaleString()}`}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          isWinPeriod
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : isLossPeriod
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            : "bg-slate-800 text-slate-400 border border-slate-700"
                        }`}>
                          {isWinPeriod ? "PROFIT" : isLossPeriod ? "LOSS" : "BREAKEVEN"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Strategy Performance Breakdown */}
      {strategyData.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
              <Zap className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Strategy / Setup Performance Breakdown
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {strategyData.map((st) => (
              <div
                key={st.name}
                className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{st.name}</span>
                    <span className="text-[10px] font-semibold text-slate-400 px-2 py-0.5 rounded bg-slate-800">
                      {st.trades_count} trades
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Win Rate:</span>
                    <span className="font-bold text-amber-400">{st.win_rate}%</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Points:</span>
                    <span className={`font-bold ${st.total_points >= 0 ? "text-cyan-400" : "text-rose-400"}`}>
                      {st.total_points >= 0 ? `+${st.total_points}` : st.total_points} pts
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Net Return:</span>
                  <span className={`font-black text-sm ${st.net_pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {st.net_pnl >= 0 ? `+${currency}${st.net_pnl.toLocaleString()}` : `${currency}${st.net_pnl.toLocaleString()}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
