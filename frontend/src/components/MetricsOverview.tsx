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
      
      {/* 1. Account Capital Card */}
      <div className="bg-[#0D1018] border border-white/[0.08] rounded-3xl p-4.5 sm:p-5 shadow-luxe relative overflow-hidden group hover:border-gold-500/30 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5 text-gold-400" />
            Account Capital
          </span>
          <span className={`p-1.5 rounded-xl text-xs font-bold ${
            isCapitalPositive
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
          }`}>
            {isCapitalPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          </span>
        </div>
        <div className="mt-3">
          <div className={`text-xl sm:text-3xl font-black font-mono tracking-tight tabular-nums ${
            isCapitalPositive ? "text-emerald-400" : "text-rose-400"
          }`}>
            {currentCapital >= 0 ? `${currency}${currentCapital.toLocaleString()}` : `-${currency}${Math.abs(currentCapital).toLocaleString()}`}
          </div>
          <p className="text-[10px] sm:text-[11px] text-zinc-500 mt-1 font-mono font-medium flex items-center justify-between">
            <span>Base: {currency}{startingCapital}</span>
            <span className={isNetPositive ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
              {isNetPositive ? `+${currency}${metrics.net_pnl.toLocaleString()}` : `-${currency}${Math.abs(metrics.net_pnl).toLocaleString()}`}
            </span>
          </p>
        </div>
      </div>

      {/* 2. Total Points Captured Card */}
      <div className="bg-[#0D1018] border border-white/[0.08] rounded-3xl p-4.5 sm:p-5 shadow-luxe relative overflow-hidden group hover:border-gold-500/30 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-gold-400" />
            Points Captured
          </span>
          <span className="p-1.5 rounded-xl bg-gold-500/10 text-gold-400 border border-gold-500/20">
            <Zap className="w-3.5 h-3.5" />
          </span>
        </div>
        <div className="mt-3">
          <div className={`text-xl sm:text-3xl font-black font-mono tracking-tight tabular-nums ${
            isPointsPositive ? "text-gold-400" : "text-rose-400"
          }`}>
            {isPointsPositive ? `+${metrics.total_points.toFixed(1)}` : metrics.total_points.toFixed(1)} pts
          </div>
          <p className="text-[10px] sm:text-[11px] text-zinc-500 mt-1 font-mono font-medium">
            Avg: <span className="text-zinc-200 font-bold">{metrics.avg_points_per_trade >= 0 ? `+${metrics.avg_points_per_trade}` : metrics.avg_points_per_trade} pts/trade</span>
          </p>
        </div>
      </div>

      {/* 3. Win Rate & Trade Count */}
      <div className="bg-[#0D1018] border border-white/[0.08] rounded-3xl p-4.5 sm:p-5 shadow-luxe relative overflow-hidden group hover:border-gold-500/30 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-emerald-400" />
            Win Rate
          </span>
          <span className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Target className="w-3.5 h-3.5" />
          </span>
        </div>
        <div className="mt-3">
          <div className="text-xl sm:text-3xl font-black font-mono text-emerald-400 tracking-tight tabular-nums">
            {metrics.win_rate}%
          </div>
          <p className="text-[10px] sm:text-[11px] text-zinc-500 mt-1 font-mono font-medium">
            <span className="text-emerald-400 font-bold">{metrics.winning_trades}W</span> • <span className="text-rose-400 font-bold">{metrics.losing_trades}L</span> ({metrics.total_trades} trades)
          </p>
        </div>
      </div>

      {/* 4. Profit Factor & Best Day */}
      <div className="bg-[#0D1018] border border-white/[0.08] rounded-3xl p-4.5 sm:p-5 shadow-luxe relative overflow-hidden group hover:border-gold-500/30 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-zinc-400" />
            Profit Factor
          </span>
          <span className="p-1.5 rounded-xl bg-white/[0.05] text-zinc-300 border border-white/[0.08]">
            <Scale className="w-3.5 h-3.5" />
          </span>
        </div>
        <div className="mt-3">
          <div className="text-xl sm:text-3xl font-black font-mono text-white tracking-tight tabular-nums">
            {metrics.profit_factor > 0 ? metrics.profit_factor.toFixed(2) : "0.00"}
          </div>
          <p className="text-[10px] sm:text-[11px] text-zinc-500 mt-1 font-mono font-medium flex items-center justify-between">
            <span>Best Day:</span>
            <span className="text-emerald-400 font-bold">+{currency}{metrics.best_day_pnl.toLocaleString()}</span>
          </p>
        </div>
      </div>

    </div>
  );
};
