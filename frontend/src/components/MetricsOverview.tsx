"use client";

import React from "react";
import { MetricsSummary, CurrencySymbol } from "../types/portfolio";
import {
  TrendingUp, TrendingDown, Target, Zap, Award, ShieldAlert,
  Percent, Scale, BarChart3, Crosshair, Wallet
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
  // Dynamic Capital Calculation: Starting Capital + Net Profit/Loss
  const startingCapital = Number(accountCapital) || 0;
  const currentCapital = Number((startingCapital + metrics.net_pnl).toFixed(2));
  const isCapitalPositive = currentCapital >= 0;
  const isNetPositive = metrics.net_pnl >= 0;
  const isPointsPositive = metrics.total_points >= 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
      
      {/* 1. Dynamic Capital Amount Card (Calculated from 0 + Profit/Loss) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl relative overflow-hidden ring-1 ring-cyan-500/30">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5 text-cyan-400" />
            Account Capital
          </span>
          <span className={`p-1.5 sm:p-2 rounded-xl text-xs font-bold ${
            isCapitalPositive ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
          }`}>
            {isCapitalPositive ? <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </span>
        </div>
        <div className="mt-2.5 sm:mt-3">
          <div className={`text-xl sm:text-3xl font-black tracking-tight ${isCapitalPositive ? "text-emerald-400" : "text-rose-400"}`}>
            {currentCapital >= 0 ? `${currency}${currentCapital.toLocaleString()}` : `-${currency}${Math.abs(currentCapital).toLocaleString()}`}
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1 font-semibold flex items-center justify-between">
            <span>Base: {currency}{startingCapital}</span>
            <span className={isNetPositive ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
              {isNetPositive ? `+${currency}${metrics.net_pnl.toLocaleString()}` : `-${currency}${Math.abs(metrics.net_pnl).toLocaleString()}`}
            </span>
          </p>
        </div>
      </div>

      {/* 2. Total Points Captured */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            Points Captured
          </span>
          <span className="p-1.5 sm:p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </span>
        </div>
        <div className="mt-2.5 sm:mt-3">
          <div className={`text-xl sm:text-3xl font-black tracking-tight ${isPointsPositive ? "text-cyan-400" : "text-rose-400"}`}>
            {isPointsPositive ? `+${metrics.total_points.toFixed(1)}` : metrics.total_points.toFixed(1)} pts
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1 font-semibold">
            Avg: <span className="text-white font-bold">{metrics.avg_points_per_trade >= 0 ? `+${metrics.avg_points_per_trade}` : metrics.avg_points_per_trade} pts/trade</span>
          </p>
        </div>
      </div>

      {/* 3. Win Rate & Trade Count */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-amber-400" />
            Win Rate
          </span>
          <span className="p-1.5 sm:p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </span>
        </div>
        <div className="mt-2.5 sm:mt-3">
          <div className="text-xl sm:text-3xl font-black text-amber-400 tracking-tight">
            {metrics.win_rate}%
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1 font-semibold">
            <span className="text-emerald-400 font-bold">{metrics.winning_trades}W</span> • <span className="text-rose-400 font-bold">{metrics.losing_trades}L</span> ({metrics.total_trades} trades)
          </p>
        </div>
      </div>

      {/* 4. Profit Factor & Best Day */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-purple-400" />
            Profit Factor
          </span>
          <span className="p-1.5 sm:p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Scale className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </span>
        </div>
        <div className="mt-2.5 sm:mt-3">
          <div className="text-xl sm:text-3xl font-black text-purple-400 tracking-tight">
            {metrics.profit_factor > 0 ? metrics.profit_factor.toFixed(2) : "0.00"}
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1 font-semibold flex items-center justify-between">
            <span>Best Day:</span>
            <span className="text-emerald-400 font-bold">+{currency}{metrics.best_day_pnl.toLocaleString()}</span>
          </p>
        </div>
      </div>

    </div>
  );
};
