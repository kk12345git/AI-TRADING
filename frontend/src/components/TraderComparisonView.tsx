"use client";

import React, { useState, useEffect } from "react";
import { UserProfile, CurrencySymbol, PerformanceReport } from "../types/portfolio";
import { api } from "../services/api";
import { Users, TrendingUp, TrendingDown, Target, Zap, Award, Scale, Wallet } from "lucide-react";

interface TraderComparisonViewProps {
  traders: UserProfile[];
  currency: CurrencySymbol;
  onSelectTrader: (trader: UserProfile) => void;
}

export const TraderComparisonView: React.FC<TraderComparisonViewProps> = ({
  traders,
  currency,
  onSelectTrader
}) => {
  const [data, setData] = useState<{ trader: UserProfile; report: PerformanceReport }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchBoth = async () => {
      setLoading(true);
      try {
        const results = [];
        for (const t of traders.slice(0, 2)) {
          const rep = await api.getAnalytics(t.id, "monthly");
          results.push({ trader: t, report: rep });
        }
        setData(results);
      } catch (e) {
        console.error("Error loading comparison:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchBoth();
  }, [traders]);

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500">
        Loading Rakesh & Karthi performance comparison...
      </div>
    );
  }

  const rakesh = data.find(d => d.trader.username === "rakesh" || d.trader.id === "rakesh") || data[0];
  const karthi = data.find(d => d.trader.username === "karthi" || d.trader.id === "karthi") || data[1];

  if (!rakesh || !karthi) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center text-slate-400">
        Need both Rakesh and Karthi accounts to display comparison.
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-16 md:pb-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Users className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white">Dual Trader Benchmark: Rakesh vs Karthi</h2>
            <p className="text-xs text-slate-400">
              Side-by-side performance, capital balance, points, and win rates
            </p>
          </div>
        </div>
      </div>

      {/* Comparison Cards Side-by-Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[rakesh, karthi].map(({ trader, report }) => {
          const m = report.metrics;
          const startingCapital = Number(trader.account_capital) || 0;
          const currentCapital = Number((startingCapital + m.net_pnl).toFixed(2));
          const isProfit = m.net_pnl >= 0;
          const isCapitalPositive = currentCapital >= 0;

          return (
            <div
              key={trader.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-2 rounded-2xl bg-slate-950 border border-slate-800">
                    {trader.avatar}
                  </span>
                  <div>
                    <h3 className="text-lg font-black text-white flex items-center gap-1.5">
                      <span>{trader.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono font-normal">({trader.username})</span>
                    </h3>
                    <p className="text-xs text-slate-400">{trader.trading_style}</p>
                  </div>
                </div>

                <button
                  onClick={() => onSelectTrader(trader)}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold transition-all active:scale-95"
                >
                  Open Journal
                </button>
              </div>

              {/* Capital & PnL Highlight */}
              <div className="grid grid-cols-2 gap-2.5 my-4">
                <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                    <Wallet className="w-3 h-3 text-cyan-400" />
                    Calculated Capital
                  </span>
                  <span className={`text-xl sm:text-2xl font-black mt-1 block ${isCapitalPositive ? "text-emerald-400" : "text-rose-400"}`}>
                    {currentCapital >= 0 ? `${currency}${currentCapital.toLocaleString()}` : `-${currency}${Math.abs(currentCapital).toLocaleString()}`}
                  </span>
                  <span className="text-[10px] text-slate-500">Base: {currency}{startingCapital}</span>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Points</span>
                  <span className={`text-xl sm:text-2xl font-black mt-1 block ${m.total_points >= 0 ? "text-cyan-400" : "text-rose-400"}`}>
                    {m.total_points >= 0 ? `+${m.total_points}` : m.total_points} pts
                  </span>
                  <span className="text-[10px] text-slate-500">{m.total_trades} trades</span>
                </div>
              </div>

              {/* Detailed Metrics Table */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-800/60">
                  <span className="text-slate-400">Net Profit / Loss:</span>
                  <span className={`font-bold font-mono ${isProfit ? "text-emerald-400" : "text-rose-400"}`}>
                    {m.net_pnl >= 0 ? `+${currency}${m.net_pnl.toLocaleString()}` : `${currency}${m.net_pnl.toLocaleString()}`}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800/60">
                  <span className="text-slate-400">Win Rate:</span>
                  <span className="font-bold text-amber-400">{m.win_rate}% ({m.winning_trades}W / {m.losing_trades}L)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800/60">
                  <span className="text-slate-400">Profit Factor:</span>
                  <span className="font-bold text-purple-400">{m.profit_factor > 0 ? m.profit_factor.toFixed(2) : "0.00"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800/60">
                  <span className="text-slate-400">Avg Points per Trade:</span>
                  <span className="font-bold text-cyan-400">{m.avg_points_per_trade >= 0 ? `+${m.avg_points_per_trade}` : m.avg_points_per_trade} pts</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-400">Best Day Profit:</span>
                  <span className="font-bold text-emerald-400">+{currency}{m.best_day_pnl.toLocaleString()}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
