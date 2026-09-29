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
  PieChart as PieIcon, Zap, CheckCircle2, ChevronRight, Printer, Download, Sparkles
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
  { id: "half_yearly", label: "Half-Yearly", desc: "H1 & H2", icon: "🌓" },
  { id: "annually", label: "Annually", desc: "Year-over-Year", icon: "🏆" }
];

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  report,
  currentTimeframe,
  onTimeframeChange,
  currency
}) => {
  const [activeChartTab, setActiveChartTab] = useState<"pnl" | "points" | "equity">("pnl");

  if (!report) {
    return (
      <div className="bg-[#0D1018] border border-white/[0.08] rounded-3xl p-12 text-center text-zinc-500 shadow-luxe">
        Loading analytics dashboard...
      </div>
    );
  }

  const breakdownData = report.timeframe_breakdown || [];
  const equityData = report.equity_curve || [];
  const strategyData = report.strategy_breakdown || [];

  const currentTfLabel = TIMEFRAME_OPTIONS.find(t => t.id === currentTimeframe)?.label || "Monthly";

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-5 pb-16 md:pb-6">
      
      {/* 1. Timeframe Selection Bar */}
      <div className="bg-[#0D1018] border border-white/[0.08] rounded-3xl p-4 sm:p-5 shadow-luxe">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3.5">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2.5 tracking-tight">
              <span className="p-2 rounded-xl bg-gold-500/10 text-gold-400 border border-gold-500/20">
                <BarChart2 className="w-4 h-4" />
              </span>
              <span>Periodic Performance Reports</span>
            </h2>

            {/* Print/Download Report Button (Mobile) */}
            <button
              onClick={handlePrintReport}
              className="sm:hidden px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 text-xs font-semibold flex items-center gap-1 border border-white/[0.06]"
            >
              <Printer className="w-3.5 h-3.5 text-gold-400" />
              <span>Print</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={handlePrintReport}
              className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 text-xs font-semibold flex items-center gap-1.5 border border-white/[0.07] transition-all"
            >
              <Printer className="w-3.5 h-3.5 text-gold-400" />
              <span>Generate / Print Report</span>
            </button>
          </div>
        </div>

        {/* Timeframe Options */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 sm:grid sm:grid-cols-6 no-scrollbar">
          {TIMEFRAME_OPTIONS.map((opt) => {
            const isSelected = currentTimeframe === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => onTimeframeChange(opt.id)}
                className={`p-2.5 sm:p-3 rounded-2xl border text-left transition-all shrink-0 w-32 sm:w-auto select-none ${
                  isSelected
                    ? "bg-white/[0.08] border-gold-500/50 shadow-sm ring-1 ring-gold-500/30"
                    : "bg-[#07080B] border-white/[0.05] hover:bg-white/[0.03] hover:border-white/[0.1]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-base sm:text-lg">{opt.icon}</span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-gold-400" />
                  )}
                </div>
                <div className="mt-1.5">
                  <div className="text-xs font-bold text-white tracking-tight">{opt.label}</div>
                  <div className="text-[10px] text-zinc-400 truncate">{opt.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Interactive Performance Chart */}
      <div className="bg-[#0D1018] border border-white/[0.08] rounded-3xl p-4 sm:p-6 shadow-luxe">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
              {activeChartTab === "pnl" && `${currentTfLabel} Net Profit & Loss (${currency})`}
              {activeChartTab === "points" && `${currentTfLabel} Points Captured (pts)`}
              {activeChartTab === "equity" && "Cumulative Equity Growth Curve"}
            </h3>
            <p className="text-[11px] text-zinc-400">
              Institutional visual performance comparing trading periods
            </p>
          </div>

          {/* Chart View Switcher */}
          <div className="flex bg-[#07080B] p-1 rounded-xl border border-white/[0.06] text-[11px] font-semibold overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveChartTab("pnl")}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeChartTab === "pnl" ? "bg-white/[0.1] text-white font-bold shadow-sm" : "text-zinc-400 hover:text-white"
              }`}
            >
              P&L Bars
            </button>
            <button
              onClick={() => setActiveChartTab("points")}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeChartTab === "points" ? "bg-white/[0.1] text-white font-bold shadow-sm" : "text-zinc-400 hover:text-white"
              }`}
            >
              Points Bars
            </button>
            <button
              onClick={() => setActiveChartTab("equity")}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeChartTab === "equity" ? "bg-white/[0.1] text-white font-bold shadow-sm" : "text-zinc-400 hover:text-white"
              }`}
            >
              Equity Curve
            </button>
          </div>
        </div>

        {/* CHART 1: PERIODIC PNL BARS */}
        {activeChartTab === "pnl" && (
          <div className="h-60 sm:h-72 w-full">
            {breakdownData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-zinc-500 text-xs">
                No trades data available for this timeframe.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={breakdownData} margin={{ top: 10, right: 5, left: -25, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.04)" />
                  <XAxis
                    dataKey="period_label"
                    stroke="#71717A"
                    fontSize={10}
                    tickLine={false}
                    angle={-25}
                    textAnchor="end"
                  />
                  <YAxis
                    stroke="#71717A"
                    fontSize={10}
                    tickLine={false}
                    tickFormatter={(val) => `${currency}${val}`}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0C0E14", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff", fontSize: "11px" }}
                    formatter={(value: any) => [
                      `${Number(value) >= 0 ? `+${currency}` : `-${currency}`}${Math.abs(Number(value)).toLocaleString()}`,
                      "Net P&L"
                    ]}
                    labelFormatter={(label) => `Period: ${label}`}
                  />
                  <ReferenceLine y={0} stroke="#3F3F46" strokeWidth={1} />
                  <Bar dataKey="net_pnl" radius={[4, 4, 0, 0]}>
                    {breakdownData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.net_pnl >= 0 ? "#10B981" : "#F43F5E"}
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
          <div className="h-60 sm:h-72 w-full">
            {breakdownData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-zinc-500 text-xs">
                No points data available for this timeframe.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={breakdownData} margin={{ top: 10, right: 5, left: -25, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.04)" />
                  <XAxis
                    dataKey="period_label"
                    stroke="#71717A"
                    fontSize={10}
                    tickLine={false}
                    angle={-25}
                    textAnchor="end"
                  />
                  <YAxis
                    stroke="#71717A"
                    fontSize={10}
                    tickLine={false}
                    tickFormatter={(val) => `${val} pts`}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0C0E14", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff", fontSize: "11px" }}
                    formatter={(value: any) => [`${Number(value) >= 0 ? `+${value}` : value} pts`, "Points"]}
                    labelFormatter={(label) => `Period: ${label}`}
                  />
                  <ReferenceLine y={0} stroke="#3F3F46" strokeWidth={1} />
                  <Bar dataKey="total_points" radius={[4, 4, 0, 0]}>
                    {breakdownData.map((entry, index) => (
                      <Cell
                        key={`pts-cell-${index}`}
                        fill={entry.total_points >= 0 ? "#E5B842" : "#F43F5E"}
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
          <div className="h-60 sm:h-72 w-full">
            {equityData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-zinc-500 text-xs">
                No equity curve data available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={equityData} margin={{ top: 10, right: 5, left: -25, bottom: 10 }}>
                  <defs>
                    <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E5B842" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#E5B842" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.04)" />
                  <XAxis dataKey="date" stroke="#71717A" fontSize={10} tickLine={false} />
                  <YAxis stroke="#71717A" fontSize={10} tickLine={false} tickFormatter={(val) => `${currency}${val}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0C0E14", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff", fontSize: "11px" }}
                    formatter={(value: any, name: any) => [
                      `${Number(value) >= 0 ? `+${currency}` : `-${currency}`}${Math.abs(Number(value)).toLocaleString()}`,
                      name === "cumulative_pnl" ? "Cumulative P&L" : "Daily P&L"
                    ]}
                  />
                  <ReferenceLine y={0} stroke="#3F3F46" strokeWidth={1} />
                  <Area
                    type="monotone"
                    dataKey="cumulative_pnl"
                    stroke="#E5B842"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#equityGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        )}

      </div>

      {/* 3. Periodic Performance Statement */}
      <div className="bg-[#0D1018] border border-white/[0.08] rounded-3xl overflow-hidden shadow-luxe">
        <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between bg-[#090A0F]">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Calendar className="w-4 h-4" />
            </span>
            <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight uppercase tracking-wider">
              {currentTfLabel} Report Statement
            </h3>
          </div>
          <span className="text-[11px] text-zinc-400 font-semibold font-mono">
            {breakdownData.length} {breakdownData.length === 1 ? "period" : "periods"}
          </span>
        </div>

        {/* 1. MOBILE PERIOD CARDS */}
        <div className="block md:hidden divide-y divide-white/[0.04] p-2 space-y-2">
          {breakdownData.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-xs">
              No data available for this timeframe.
            </div>
          ) : (
            breakdownData.map((row) => {
              const isWin = row.net_pnl > 0.05;
              const isLoss = row.net_pnl < -0.05;

              return (
                <div
                  key={row.period_label}
                  className="bg-[#07080B] border border-white/[0.06] rounded-2xl p-3.5 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-gold-400" />
                      {row.period_label}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                      isWin
                        ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                        : isLoss
                        ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
                        : "bg-white/[0.05] text-zinc-400 border-white/[0.08]"
                    }`}>
                      {isWin ? "PROFITABLE" : isLoss ? "LOSS" : "FLAT"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 bg-[#11141E] p-2.5 rounded-xl border border-white/[0.05]">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-zinc-400 block">Net P&L</span>
                      <span className={`text-base font-black font-mono ${isWin ? "text-emerald-400" : isLoss ? "text-rose-400" : "text-zinc-300"}`}>
                        {row.net_pnl >= 0 ? `+${currency}${row.net_pnl.toLocaleString()}` : `${currency}${row.net_pnl.toLocaleString()}`}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] uppercase font-bold text-zinc-400 block">Points</span>
                      <span className={`text-base font-black font-mono ${row.total_points >= 0 ? "text-gold-400" : "text-rose-400"}`}>
                        {row.total_points >= 0 ? `+${row.total_points}` : row.total_points} pts
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-zinc-400 pt-0.5 font-mono">
                    <span>
                      Trades: <strong className="text-white">{row.trades_count}</strong> ({row.wins}W / {row.losses}L)
                    </span>
                    <span className="text-emerald-400 font-bold">
                      {row.win_rate}% Win Rate
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 2. DESKTOP PERIOD TABLE */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#090A0F] text-zinc-400 uppercase text-[10px] tracking-widest font-semibold border-b border-white/[0.06]">
              <tr>
                <th className="py-3 px-5">Period</th>
                <th className="py-3 px-4 text-center">Trades</th>
                <th className="py-3 px-4 text-center">Wins / Losses</th>
                <th className="py-3 px-4">Win Rate %</th>
                <th className="py-3 px-4 text-right">Points Captured</th>
                <th className="py-3 px-5 text-right">Net Profit / Loss</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {breakdownData.map((row) => {
                const isWinPeriod = row.net_pnl > 0.05;
                const isLossPeriod = row.net_pnl < -0.05;

                return (
                  <tr key={row.period_label} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-5 font-bold text-white whitespace-nowrap">
                      <span className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold-400" />
                        {row.period_label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-zinc-300">
                      {row.trades_count}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap font-mono">
                      <span className="text-emerald-400 font-bold">{row.wins}W</span>
                      <span className="text-zinc-600 mx-1">•</span>
                      <span className="text-rose-400 font-bold">{row.losses}L</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-zinc-200 w-10 font-bold">{row.win_rate}%</span>
                        <div className="w-16 h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-gold-500 to-emerald-400 rounded-full"
                            style={{ width: `${Math.min(row.win_rate, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono whitespace-nowrap">
                      <span className={`font-bold px-2 py-0.5 rounded text-xs ${
                        row.total_points >= 0 ? "text-gold-400 bg-gold-500/10" : "text-rose-400 bg-rose-500/10"
                      }`}>
                        {row.total_points >= 0 ? `+${row.total_points}` : row.total_points} pts
                      </span>
                    </td>
                    <td className="py-3 px-5 text-right font-mono font-black text-sm whitespace-nowrap">
                      <span className={isWinPeriod ? "text-emerald-400" : isLossPeriod ? "text-rose-400" : "text-zinc-300"}>
                        {row.net_pnl >= 0 ? `+${currency}${row.net_pnl.toLocaleString()}` : `${currency}${row.net_pnl.toLocaleString()}`}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                        isWinPeriod
                          ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                          : isLossPeriod
                          ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
                          : "bg-white/[0.05] text-zinc-400 border-white/[0.08]"
                      }`}>
                        {isWinPeriod ? "PROFIT" : isLossPeriod ? "LOSS" : "FLAT"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
