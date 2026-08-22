"use client";

import React, { useState } from "react";
import { StrategySimResult, CurrencySymbol } from "../types/portfolio";
import { Sparkles, Play, Shield, Sliders, CheckCircle2, TrendingUp } from "lucide-react";

interface AIStrategyHubProps {
  onSimulateStrategy: (name: string, riskPct: number, targetRR: number) => Promise<StrategySimResult>;
  currency: CurrencySymbol;
}

export const AIStrategyHub: React.FC<AIStrategyHubProps> = ({ onSimulateStrategy, currency }) => {
  const [selectedStrategy, setSelectedStrategy] = useState<string>("SMC Order Block & Liquidity Sweep");
  const [riskPct, setRiskPct] = useState<number>(1.0);
  const [targetRR, setTargetRR] = useState<number>(2.0);
  const [simResult, setSimResult] = useState<StrategySimResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const predefinedStrategies = [
    {
      name: "SMC Order Block & Liquidity Sweep",
      tag: "Institutional SMC",
      desc: "Identify 1H/4H Order Blocks with FVG. Wait for 5m liquidity sweep before entering with 1:2.5 R:R target.",
      winRate: "62.0%",
      pf: "2.15"
    },
    {
      name: "VWAP Mean Reversion & Volatility Filter",
      tag: "Day Trading",
      desc: "Short overextended price when +2 Standard Deviation above VWAP with RSI divergence.",
      winRate: "65.0%",
      pf: "1.75"
    },
    {
      name: "ORB Breakout + ATR Trailing Stop",
      tag: "Momentum",
      desc: "Enter on 15-minute Opening Range Breakout with high volume. Trail stop loss at 1.5x ATR.",
      winRate: "52.0%",
      pf: "2.05"
    }
  ];

  const handleRunSim = async () => {
    setLoading(true);
    const res = await onSimulateStrategy(selectedStrategy, riskPct, targetRR);
    setSimResult(res);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 bg-slate-900/80 border border-slate-800/80 rounded-3xl backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-white">AI Quantitative Strategy Engine</h2>
            <span className="px-2.5 py-0.5 text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full">
              Backtest Simulator
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Test institutional strategies against your logged market execution history
          </p>
        </div>
      </div>

      {/* Strategy Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {predefinedStrategies.map((strat, idx) => (
          <div
            key={idx}
            onClick={() => setSelectedStrategy(strat.name)}
            className={`p-5 rounded-2xl border cursor-pointer transition-all ${
              selectedStrategy === strat.name
                ? "bg-slate-900 border-purple-500/50 ring-2 ring-purple-500/20 shadow-xl"
                : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                {strat.tag}
              </span>
              <div className="text-xs font-mono text-emerald-400 font-bold">
                WR {strat.winRate}
              </div>
            </div>
            <h3 className="text-sm font-bold text-white mb-1.5">{strat.name}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{strat.desc}</p>
          </div>
        ))}
      </div>

      {/* Backtest Parameters & Run Bar */}
      <div className="p-6 bg-slate-900/70 border border-slate-800/80 rounded-3xl backdrop-blur-md space-y-4">
        <div className="flex items-center space-x-2 text-purple-400">
          <Sliders className="w-5 h-5" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Strategy Simulation Parameters
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex justify-between">
              <span>Risk Per Trade (% Capital)</span>
              <span className="text-purple-400 font-mono">{riskPct}%</span>
            </label>
            <input
              type="range"
              min="0.5"
              max="5.0"
              step="0.5"
              value={riskPct}
              onChange={(e) => setRiskPct(Number(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex justify-between">
              <span>Target Risk:Reward (R:R)</span>
              <span className="text-purple-400 font-mono">1:{targetRR}</span>
            </label>
            <input
              type="range"
              min="1.0"
              max="5.0"
              step="0.5"
              value={targetRR}
              onChange={(e) => setTargetRR(Number(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleRunSim}
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center space-x-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{loading ? "Simulating..." : "Run AI Simulation"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Simulation Results Display */}
      {simResult && (
        <div className="p-6 bg-slate-900/80 border border-purple-500/30 rounded-3xl backdrop-blur-md space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white">Simulation Results: {simResult.strategy_name}</h3>
              <p className="text-xs text-slate-400">Comparison of quantitative strategy vs actual logged trades</p>
            </div>
            <div className="text-right font-mono">
              <div className="text-xs text-slate-400">Net Improvement</div>
              <div className={`text-base font-black ${simResult.comparison_vs_actual_pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {simResult.comparison_vs_actual_pnl >= 0 ? "+" : ""}{currency}{simResult.comparison_vs_actual_pnl.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 text-center">
              <div className="text-xs text-slate-400 font-medium">Simulated P&L</div>
              <div className="text-lg font-black text-emerald-400 mt-1">{currency}{simResult.simulated_net_pnl.toLocaleString()}</div>
            </div>

            <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 text-center">
              <div className="text-xs text-slate-400 font-medium">Simulated Win Rate</div>
              <div className="text-lg font-black text-cyan-400 mt-1">{simResult.simulated_win_rate}%</div>
            </div>

            <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 text-center">
              <div className="text-xs text-slate-400 font-medium">Profit Factor</div>
              <div className="text-lg font-black text-indigo-400 mt-1">{simResult.simulated_profit_factor}</div>
            </div>

            <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 text-center">
              <div className="text-xs text-slate-400 font-medium">Simulated Max DD</div>
              <div className="text-lg font-black text-purple-400 mt-1">{simResult.simulated_drawdown}%</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">AI Strategy Insights:</div>
            <div className="space-y-2">
              {simResult.trade_insights.map((insight, i) => (
                <div key={i} className="flex items-start space-x-2 text-xs text-slate-300 bg-slate-950/40 p-3 rounded-xl border border-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
