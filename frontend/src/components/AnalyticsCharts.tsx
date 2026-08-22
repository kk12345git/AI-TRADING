"use client";

import React from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import { EquityPoint, PerformanceReport, CurrencySymbol } from "../types/portfolio";
import { TrendingUp, PieChart, BarChart2 } from "lucide-react";

interface AnalyticsChartsProps {
  report: PerformanceReport;
  currency: CurrencySymbol;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ report, currency }) => {
  const equityData = report.equity_curve || [];
  const mistakeData = report.mistake_analysis || [];
  const setupData = report.top_setups || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* Cumulative Equity Curve Chart */}
      <div className="p-6 bg-slate-900/70 border border-slate-800/80 rounded-2xl backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Cumulative Equity Curve
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">P&L Over Time</span>
        </div>

        <div className="h-64 w-full">
          {equityData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={equityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", color: "#fff", fontSize: "12px" }}
                  formatter={(value: any) => [`${currency}${Number(value).toLocaleString()}`, "Cumulative P&L"]}
                />
                <Area type="monotone" dataKey="cumulative_pnl" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#equityGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              No trade data available for equity curve chart.
            </div>
          )}
        </div>
      </div>

      {/* P&L Distribution Bar Chart */}
      <div className="p-6 bg-slate-900/70 border border-slate-800/80 rounded-2xl backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart2 className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Period P&L Distribution
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Daily/Weekly P&L</span>
        </div>

        <div className="h-64 w-full">
          {equityData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={equityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", color: "#fff", fontSize: "12px" }}
                  formatter={(value: any) => [`${currency}${Number(value).toLocaleString()}`, "Daily P&L"]}
                />
                <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                  {equityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? "#10b981" : "#f43f5e"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              No trade data available for distribution chart.
            </div>
          )}
        </div>
      </div>

      {/* Top Strategy Setups Performance */}
      <div className="p-6 bg-slate-900/70 border border-slate-800/80 rounded-2xl backdrop-blur-md space-y-4">
        <div className="flex items-center space-x-2">
          <PieChart className="w-5 h-5 text-purple-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Strategy Setups Breakdown
          </h3>
        </div>

        <div className="space-y-3">
          {setupData.map((setup, idx) => (
            <div key={idx} className="p-3 bg-slate-950/60 border border-slate-800/60 rounded-xl flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-200">{setup.name}</div>
                <div className="text-[11px] text-slate-400">{setup.count} Trades | Win Rate: {setup.win_rate}%</div>
              </div>
              <div className={`text-sm font-extrabold ${setup.net_pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {currency}{setup.net_pnl.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mistake Loss Impact Breakdown */}
      <div className="p-6 bg-slate-900/70 border border-slate-800/80 rounded-2xl backdrop-blur-md space-y-4">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Trading Mistakes Cost Impact
          </h3>
        </div>

        <div className="space-y-3">
          {mistakeData.length > 0 ? (
            mistakeData.map((m, idx) => (
              <div key={idx} className="p-3 bg-rose-950/20 border border-rose-500/20 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-rose-300">
                  <span>{m.mistake}</span>
                  <span>-{currency}{m.total_loss.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-500 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, m.percentage_of_losses)}%` }}
                  ></div>
                </div>
                <div className="text-[10px] text-slate-400 text-right">
                  {m.count} Trades ({m.percentage_of_losses}% of losses)
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-xs text-slate-400 bg-slate-950/40 rounded-xl">
              🎉 Zero mistakes recorded! Clean execution.
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
