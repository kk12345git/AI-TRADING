"use client";

import React from "react";
import { MetricsSummary, TimeframeFilter, CurrencySymbol } from "../types/portfolio";
import { TrendingUp, TrendingDown, Target, Scale, ShieldAlert, Award, Activity } from "lucide-react";

interface MetricsOverviewProps {
  metrics: MetricsSummary;
  timeframe: TimeframeFilter;
  setTimeframe: (tf: TimeframeFilter) => void;
  currency: CurrencySymbol;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({
  metrics,
  timeframe,
  setTimeframe,
  currency
}) => {
  const isProfitable = metrics.net_pnl >= 0;

  const timeframes: { id: TimeframeFilter; label: string }[] = [
    { id: "daily", label: "Daily" },
    { id: "weekly", label: "Weekly" },
    { id: "monthly", label: "Monthly" },
    { id: "yearly", label: "Yearly" },
    { id: "all", label: "All Time" }
  ];

  const cards = [
    {
      title: "Net Profit / Loss",
      value: `${currency}${metrics.net_pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: `${metrics.winning_trades} Wins / ${metrics.losing_trades} Losses`,
      icon: isProfitable ? TrendingUp : TrendingDown,
      color: isProfitable ? "text-emerald-400" : "text-rose-400",
      bgColor: isProfitable ? "bg-emerald-500/10 border-emerald-500/20" : "bg-rose-500/10 border-rose-500/20"
    },
    {
      title: "Win Rate",
      value: `${metrics.win_rate}%`,
      subtitle: `${metrics.total_trades} Total Executed Trades`,
      icon: Target,
      color: metrics.win_rate >= 50 ? "text-cyan-400" : "text-amber-400",
      bgColor: "bg-cyan-500/10 border-cyan-500/20"
    },
    {
      title: "Profit Factor",
      value: `${metrics.profit_factor}`,
      subtitle: metrics.profit_factor >= 1.5 ? "Institutional Grade" : "Optimization Needed",
      icon: Scale,
      color: metrics.profit_factor >= 1.5 ? "text-indigo-400" : "text-amber-400",
      bgColor: "bg-indigo-500/10 border-indigo-500/20"
    },
    {
      title: "Risk-to-Reward (R:R)",
      value: `1:${metrics.risk_reward_ratio}`,
      subtitle: `Avg Win ${currency}${metrics.avg_win} vs Loss ${currency}${metrics.avg_loss}`,
      icon: Activity,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10 border-purple-500/20"
    },
    {
      title: "Max Drawdown",
      value: `${metrics.max_drawdown_percent}%`,
      subtitle: `Max Peak Drop: ${currency}${metrics.max_drawdown.toLocaleString()}`,
      icon: ShieldAlert,
      color: metrics.max_drawdown_percent < 15 ? "text-emerald-400" : "text-rose-400",
      bgColor: "bg-slate-800/50 border-slate-700/50"
    },
    {
      title: "Trade Expectancy",
      value: `${currency}${metrics.expectancy}`,
      subtitle: "Avg Expected P&L Per Trade",
      icon: Award,
      color: metrics.expectancy >= 0 ? "text-teal-400" : "text-rose-400",
      bgColor: "bg-slate-800/50 border-slate-700/50"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Timeframe Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900/70 border border-slate-800/80 rounded-2xl backdrop-blur-md">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <span>Portfolio Performance Snapshot</span>
          </h2>
          <p className="text-xs text-slate-400">Analyze performance metrics filtered by timeframe</p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
          {timeframes.map((tf) => (
            <button
              key={tf.id}
              onClick={() => setTimeframe(tf.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                timeframe === tf.id
                  ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`p-5 rounded-2xl border backdrop-blur-md transition-all hover:scale-[1.01] ${card.bgColor}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={`p-2 rounded-xl bg-slate-900/60 border border-slate-800 ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className={`text-2xl font-black tracking-tight ${card.color}`}>
                {card.value}
              </div>
              <div className="mt-1 text-xs text-slate-400 font-medium">
                {card.subtitle}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
