"use client";

import React, { useState, useEffect } from "react";
import { UserProfile, CurrencySymbol, PerformanceReport } from "../types/portfolio";
import { api } from "../services/api";
import { Users, TrendingUp, TrendingDown, Target, Zap, Award, Scale } from "lucide-react";

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
        Loading 2-Trader comparison metrics...
      </div>
    );
  }

  const trader1 = data[0];
  const trader2 = data[1];

  if (!trader1 || !trader2) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center text-slate-400">
        Need at least 2 trader accounts to display comparison.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Users className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-xl font-black text-white">Dual Trader Benchmark Comparison</h2>
            <p className="text-xs text-slate-400">
              Side-by-side performance comparison of {trader1.trader.name} vs {trader2.trader.name}
            </p>
          </div>
        </div>
      </div>

      {/* Comparison Cards Side-by-Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[trader1, trader2].map(({ trader, report }, idx) => {
          const m = report.metrics;
          const isProfit = m.net_pnl >= 0;

          return (
            <div
              key={trader.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-2 rounded-2xl bg-slate-950 border border-slate-800">
                    {trader.avatar}
                  </span>
                  <div>
                    <h3 className="text-lg font-black text-white">{trader.name}</h3>
                    <p className="text-xs text-slate-400">{trader.trading_style}</p>
                  </div>
                </div>

                <button
                  onClick={() => onSelectTrader(trader)}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold transition-all"
                >
                  View Journal
                </button>
              </div>

              {/* Top Numbers */}
              <div className="grid grid-cols-2 gap-3 my-5">
                <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Net P&L</span>
                  <span className={`text-2xl font-black mt-1 block ${isProfit ? "text-emerald-400" : "text-rose-400"}`}>
                    {isProfit ? `+${currency}${m.net_pnl.toLocaleString()}` : `${currency}${m.net_pnl.toLocaleString()}`}
                  </span>
                </div>

                <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Points Captured</span>
                  <span className={`text-2xl font-black mt-1 block ${m.total_points >= 0 ? "text-cyan-400" : "text-rose-400"}`}>
                    {m.total_points >= 0 ? `+${m.total_points}` : m.total_points} pts
                  </span>
                </div>
              </div>

              {/* Detailed Metrics Table */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-800/60">
                  <span className="text-slate-400">Win Rate:</span>
                  <span className="font-bold text-amber-400">{m.win_rate}% ({m.winning_trades}W / {m.losing_trades}L)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800/60">
                  <span className="text-slate-400">Total Trades Registered:</span>
                  <span className="font-bold text-white">{m.total_trades}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800/60">
                  <span className="text-slate-400">Profit Factor:</span>
                  <span className="font-bold text-purple-400">{m.profit_factor > 0 ? m.profit_factor.toFixed(2) : "0.00"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800/60">
                  <span className="text-slate-400">Avg Points per Trade:</span>
                  <span className="font-bold text-cyan-400">{m.avg_points_per_trade >= 0 ? `+${m.avg_points_per_trade}` : m.avg_points_per_trade} pts</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800/60">
                  <span className="text-slate-400">Best Day Profit:</span>
                  <span className="font-bold text-emerald-400">+{currency}{m.best_day_pnl.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-400">Account Capital:</span>
                  <span className="font-bold text-slate-200">{currency}{trader.account_capital.toLocaleString()}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
