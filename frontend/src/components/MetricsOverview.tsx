"use client";

import React from "react";
import { MetricsSummary, CurrencySymbol } from "../types/portfolio";
import {
  TrendingUp, TrendingDown, Target, Zap, Award, ShieldAlert,
  Percent, Scale, BarChart3, Crosshair
} from "lucide-react";

interface MetricsOverviewProps {
  metrics: MetricsSummary;
  currency: CurrencySymbol;
  accountCapital: number;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({
  metrics,
  currency,
  accountCapital
}) => {
  const isNetPositive = metrics.net_pnl >= 0;
  const isPointsPositive = metrics.total_points >= 0;
  const returnOnCapital = accountCapital > 0 ? ((metrics.net_pnl / accountCapital) * 100).toFixed(1) : "0.0";

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      
      {/* 1. Net P&L Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Net P&L</span>
          <span className={`p-2 rounded-xl text-xs font-bold ${
            isNetPositive ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
          }`}>
            {isNetPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          </span>
        </div>
        <div className="mt-3">
          <div className={`text-2xl md:text-3xl font-black tracking-tight ${isNetPositive ? "text-emerald-400" : "text-rose-400"}`}>
            {isNetPositive ? `+${currency}${metrics.net_pnl.toLocaleString()}` : `${currency}${metrics.net_pnl.toLocaleString()}`}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-semibold">
            <span>ROI on Capital:</span>
            <span className={Number(returnOnCapital) >= 0 ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
              {Number(returnOnCapital) >= 0 ? `+${returnOnCapital}%` : `${returnOnCapital}%`}
            </span>
          </p>
        </div>
      </div>

      {/* 2. Total Points Captured */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Points Captured</span>
          <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Zap className="w-4 h-4" />
          </span>
        </div>
        <div className="mt-3">
          <div className={`text-2xl md:text-3xl font-black tracking-tight ${isPointsPositive ? "text-cyan-400" : "text-rose-400"}`}>
            {isPointsPositive ? `+${metrics.total_points.toFixed(1)}` : metrics.total_points.toFixed(1)} pts
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-semibold">
            Avg: <span className="text-white font-bold">{metrics.avg_points_per_trade >= 0 ? `+${metrics.avg_points_per_trade}` : metrics.avg_points_per_trade} pts/trade</span>
          </p>
        </div>
      </div>

      {/* 3. Win Rate & Total Trades */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Win Rate</span>
          <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Target className="w-4 h-4" />
          </span>
        </div>
        <div className="mt-3">
          <div className="text-2xl md:text-3xl font-black text-amber-400 tracking-tight">
            {metrics.win_rate}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-semibold">
            <span className="text-emerald-400">{metrics.winning_trades}W</span> • <span className="text-rose-400">{metrics.losing_trades}L</span> ({metrics.total_trades} total)
          </p>
        </div>
      </div>

      {/* 4. Profit Factor & Best Day */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Profit Factor</span>
          <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Scale className="w-4 h-4" />
          </span>
        </div>
        <div className="mt-3">
          <div className="text-2xl md:text-3xl font-black text-purple-400 tracking-tight">
            {metrics.profit_factor > 0 ? metrics.profit_factor.toFixed(2) : "0.00"}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-semibold flex items-center justify-between">
            <span>Best Day:</span>
            <span className="text-emerald-400 font-bold">+{currency}{metrics.best_day_pnl.toLocaleString()}</span>
          </p>
        </div>
      </div>

    </div>
  );
};
