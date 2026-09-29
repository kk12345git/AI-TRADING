"use client";

import React, { useState } from "react";
import {
  X, Calculator, ShieldCheck, TrendingUp, Info, Check,
  Coins, Scale, Sparkles, HelpCircle, Layers, ArrowRight
} from "lucide-react";
import { INSTRUMENT_SPECS, getInstrumentSpec, calculateRealTradePnl } from "../types/instruments";
import { CurrencySymbol } from "../types/portfolio";

interface LotSizeCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: CurrencySymbol;
  initialSymbol?: string;
  onApplyLotToTrade?: (symbol: string, lot: number) => void;
}

export const LotSizeCalculatorModal: React.FC<LotSizeCalculatorModalProps> = ({
  isOpen,
  onClose,
  currency,
  initialSymbol = "XAUUSD",
  onApplyLotToTrade
}) => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>(initialSymbol || "XAUUSD");
  const [activeTab, setActiveTab] = useState<"position_calc" | "point_matrix" | "research_guide">("position_calc");

  // Position Sizing State
  const [accountBalance, setAccountBalance] = useState<number>(1000);
  const [riskPercent, setRiskPercent] = useState<number>(1.0); // 1%
  const [stopLossPoints, setStopLossPoints] = useState<number>(10);
  const [entryPrice, setEntryPrice] = useState<number>(2685.0);

  // Live Point Value Tester State
  const [testLots, setTestLots] = useState<number>(0.01);
  const [testPoints, setTestPoints] = useState<number>(1.0);
  const [testFees, setTestFees] = useState<number>(0);

  if (!isOpen) return null;

  const currentSpec = getInstrumentSpec(selectedSymbol);

  // 1. Position Sizing Calculation
  // Risk Amount ($ or ₹) = Balance * (Risk% / 100)
  // Recommended Lots = Risk Amount / (SL Points * Point Multiplier)
  const riskAmount = Number(((accountBalance * riskPercent) / 100).toFixed(2));
  const denominator = stopLossPoints * currentSpec.pointMultiplier;
  const rawLot = denominator > 0 ? riskAmount / denominator : 0;
  
  // Format lot according to instrument step
  let recommendedLot = currentSpec.minLot;
  if (currentSpec.category === "INDEX_FUTURES") {
    recommendedLot = Math.max(1, Math.floor(rawLot));
  } else {
    recommendedLot = Math.max(currentSpec.minLot, Number(rawLot.toFixed(2)));
  }

  // Contract units for recommended lot
  const recommendedUnits = (recommendedLot * currentSpec.contractSize).toLocaleString();

  // 2. Real-time test calculation
  const { grossPnl, netPnl, multiplier, contractUnits } = calculateRealTradePnl(
    selectedSymbol,
    testLots,
    testPoints,
    testFees
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#0C0E14] border border-white/[0.08] rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-white/[0.07] bg-[#090A0F] shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gold-500/10 border border-gold-500/20 text-gold-400 flex items-center justify-center shadow-sm">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Real-Time Lot Size & Risk Calculator
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Exact Contract Specs
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Institutional point values, contract sizes, and position risk modeling
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] active:bg-white/[0.12] rounded-xl transition-all border border-white/[0.05]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center px-6 pt-3 pb-1 border-b border-white/[0.05] bg-[#0C0E14] gap-2 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab("position_calc")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === "position_calc"
                ? "bg-white/[0.08] text-white border border-white/[0.12] shadow-sm font-bold"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.03]"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-gold-400" />
            <span>Position Risk Sizer</span>
          </button>

          <button
            onClick={() => setActiveTab("point_matrix")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === "point_matrix"
                ? "bg-white/[0.08] text-white border border-white/[0.12] shadow-sm font-bold"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.03]"
            }`}
          >
            <Coins className="w-3.5 h-3.5 text-emerald-400" />
            <span>Live Point-to-P&L Tester</span>
          </button>

          <button
            onClick={() => setActiveTab("research_guide")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === "research_guide"
                ? "bg-white/[0.08] text-white border border-white/[0.12] shadow-sm font-bold"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.03]"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            <span>All Instruments Matrix</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-sm">
          
          {/* Instrument Selector Pill Bar */}
          <div>
            <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 mb-2 block">
              Active Instrument
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {Object.keys(INSTRUMENT_SPECS).map((sym) => {
                const spec = INSTRUMENT_SPECS[sym];
                const isSelected = selectedSymbol === sym;
                return (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => {
                      setSelectedSymbol(sym);
                      setTestLots(spec.defaultLot);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "bg-gold-500/10 border-gold-500/40 text-white shadow-sm ring-1 ring-gold-500/30"
                        : "bg-[#11141E] border-white/[0.05] text-zinc-400 hover:text-white hover:border-white/[0.1]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-white">{sym}</span>
                      <span className="text-[9px] font-semibold text-zinc-500">{spec.currencySymbol}</span>
                    </div>
                    <div className="text-[10px] text-zinc-400 truncate mt-0.5">
                      {spec.category.replace("_", " ")}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Instrument Live Spec Pill */}
          <div className="p-3.5 rounded-2xl bg-[#11141E] border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white font-mono">{currentSpec.symbol}</span>
                <span className="text-[10px] text-zinc-400">({currentSpec.name})</span>
              </div>
              <p className="text-[11px] text-gold-400/90 font-medium mt-0.5">
                {currentSpec.formulaDescription}
              </p>
            </div>
            <div className="text-right sm:text-right shrink-0">
              <span className="text-[10px] uppercase font-semibold text-zinc-500 block">Contract Multiplier</span>
              <span className="text-xs font-mono font-bold text-emerald-400">
                1 pt = {currentSpec.currencySymbol}{(1.0 * currentSpec.pointMultiplier).toFixed(2)} / lot
              </span>
            </div>
          </div>

          {/* TAB 1: POSITION RISK SIZER */}
          {activeTab === "position_calc" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                {/* Account Capital */}
                <div className="bg-[#11141E] border border-white/[0.06] rounded-2xl p-3.5">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 block mb-1">
                    Account Balance ({currentSpec.currencySymbol})
                  </label>
                  <input
                    type="number"
                    value={accountBalance}
                    onChange={(e) => setAccountBalance(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-[#07080B] border border-white/[0.08] text-white px-3 py-2 rounded-xl text-sm font-mono font-bold focus:border-gold-500/50 focus:outline-none"
                  />
                  <span className="text-[10px] text-zinc-500 mt-1 block">Your portfolio equity</span>
                </div>

                {/* Risk Percentage */}
                <div className="bg-[#11141E] border border-white/[0.06] rounded-2xl p-3.5">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">
                      Risk Per Trade (%)
                    </label>
                    <span className="text-[10px] font-mono text-gold-400 font-bold">
                      {currentSpec.currencySymbol}{riskAmount}
                    </span>
                  </div>
                  <input
                    type="number"
                    step="0.25"
                    min="0.1"
                    max="10"
                    value={riskPercent}
                    onChange={(e) => setRiskPercent(Number(e.target.value))}
                    className="w-full bg-[#07080B] border border-white/[0.08] text-white px-3 py-2 rounded-xl text-sm font-mono font-bold focus:border-gold-500/50 focus:outline-none"
                  />
                  <div className="flex gap-1 mt-1.5">
                    {[0.5, 1.0, 1.5, 2.0].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRiskPercent(r)}
                        className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                          riskPercent === r ? "bg-gold-500/20 text-gold-300 font-bold" : "text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        {r}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stop Loss in Points */}
                <div className="bg-[#11141E] border border-white/[0.06] rounded-2xl p-3.5">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 block mb-1">
                    Stop Loss Distance ({currentSpec.pointName})
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={stopLossPoints}
                    onChange={(e) => setStopLossPoints(Math.max(0.1, Number(e.target.value)))}
                    className="w-full bg-[#07080B] border border-white/[0.08] text-white px-3 py-2 rounded-xl text-sm font-mono font-bold focus:border-gold-500/50 focus:outline-none"
                  />
                  <span className="text-[10px] text-zinc-500 mt-1 block">Expected SL price delta</span>
                </div>

              </div>

              {/* Recommended Lot Size Result Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#121622] to-[#0A0D14] border border-gold-500/30 shadow-luxe flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-gold-400 block mb-1">
                    Institutional Recommended Position Size
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                      {recommendedLot}
                    </span>
                    <span className="text-sm font-bold text-zinc-400 uppercase">
                      {currentSpec.category === "INDEX_FUTURES" ? "Lots" : "Standard Lots"}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Total Contract Exposure: <span className="text-white font-mono font-bold">{recommendedUnits} units</span> • Total Risk at SL: <span className="text-rose-400 font-mono font-bold">{currentSpec.currencySymbol}{riskAmount}</span>
                  </p>
                </div>

                {onApplyLotToTrade && (
                  <button
                    onClick={() => {
                      onApplyLotToTrade(selectedSymbol, recommendedLot);
                      onClose();
                    }}
                    className="px-5 py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-black font-black text-xs transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 shrink-0"
                  >
                    <span>Use {recommendedLot} Lots in Trade</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: LIVE POINT-TO-PNL TESTER */}
          {activeTab === "point_matrix" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#11141E] border border-white/[0.06] space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 block mb-1">
                      Lot Size Traded
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={testLots}
                      onChange={(e) => setTestLots(Math.max(0.001, Number(e.target.value)))}
                      className="w-full bg-[#07080B] border border-white/[0.08] text-white px-3 py-2 rounded-xl text-sm font-mono font-bold focus:border-emerald-500 focus:outline-none"
                    />
                    <div className="flex gap-1 mt-1.5 overflow-x-auto no-scrollbar">
                      {currentSpec.quickLots.map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => setTestLots(q)}
                          className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                            testLots === q ? "bg-emerald-500/20 text-emerald-300 font-bold" : "text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 block mb-1">
                      Points Captured (+ or -)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={testPoints}
                      onChange={(e) => setTestPoints(Number(e.target.value))}
                      className="w-full bg-[#07080B] border border-white/[0.08] text-white px-3 py-2 rounded-xl text-sm font-mono font-bold focus:border-emerald-500 focus:outline-none"
                    />
                    <div className="flex gap-1 mt-1.5">
                      {[1, 5, 10, 25, 50].map((pt) => (
                        <button
                          key={pt}
                          type="button"
                          onClick={() => setTestPoints(pt)}
                          className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                            testPoints === pt ? "bg-emerald-500/20 text-emerald-300 font-bold" : "text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          {pt}pt
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 block mb-1">
                      Brokerage / Fees ({currentSpec.currencySymbol})
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={testFees}
                      onChange={(e) => setTestFees(Number(e.target.value))}
                      className="w-full bg-[#07080B] border border-white/[0.08] text-white px-3 py-2 rounded-xl text-sm font-mono font-bold focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Instant Calculation Preview Card */}
                <div className="p-4 rounded-xl bg-[#090A0F] border border-white/[0.05] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 block">
                      Live Formula Breakdown
                    </span>
                    <span className="text-xs font-mono text-zinc-300 block mt-0.5">
                      {testPoints} pts × {testLots} lots × {multiplier} multiplier = {currentSpec.currencySymbol}{grossPnl.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 block">
                      Net P&L Result
                    </span>
                    <span className={`text-xl sm:text-2xl font-black font-mono ${
                      netPnl >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}>
                      {netPnl >= 0 ? `+${currentSpec.currencySymbol}${netPnl.toLocaleString()}` : `-${currentSpec.currencySymbol}${Math.abs(netPnl).toLocaleString()}`}
                    </span>
                  </div>
                </div>

              </div>

              {/* Exact user example callout */}
              {selectedSymbol === "XAUUSD" && (
                <div className="p-3.5 rounded-xl bg-gold-500/10 border border-gold-500/20 text-xs text-gold-300/90 flex items-start gap-2">
                  <Info className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white">Exact Real-Time Gold Spot Specification:</span>
                    <p className="mt-0.5 text-[11px] leading-relaxed">
                      Trading <strong>0.01 lot</strong> on XAUUSD represents <strong>1 troy ounce</strong>. If you capture <strong>1.00 point</strong> ($1 move, e.g. $2685 → $2686), your profit is exactly <strong>$1.00 USD</strong>.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ALL INSTRUMENTS RESEARCH MATRIX */}
          {activeTab === "research_guide" && (
            <div className="space-y-3">
              <div className="overflow-x-auto rounded-2xl border border-white/[0.06] bg-[#11141E]">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.06] bg-[#090A0F] text-zinc-400 uppercase text-[10px] font-bold tracking-wider">
                      <th className="py-3 px-4">Instrument</th>
                      <th className="py-3 px-3">Contract Size</th>
                      <th className="py-3 px-3">Min Lot</th>
                      <th className="py-3 px-3">Point Multiplier</th>
                      <th className="py-3 px-4">1 Point Move Profit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04] text-zinc-300">
                    {Object.values(INSTRUMENT_SPECS).map((spec) => (
                      <tr key={spec.symbol} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-white flex items-center gap-2">
                          <span>{spec.symbol}</span>
                          <span className="text-[10px] text-zinc-500 font-normal">({spec.name})</span>
                        </td>
                        <td className="py-3 px-3 font-mono">{spec.contractSize}</td>
                        <td className="py-3 px-3 font-mono">{spec.minLot}</td>
                        <td className="py-3 px-3 font-mono text-gold-400">×{spec.pointMultiplier}</td>
                        <td className="py-3 px-4 font-medium text-emerald-400">
                          {spec.formulaDescription}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-white/[0.07] bg-[#090A0F] flex items-center justify-between text-xs text-zinc-400 shrink-0">
          <span className="text-[11px]">
            Institutional Tick & Point Model • Updated for Live Trading
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white font-semibold text-xs transition-all"
          >
            Close Calculator
          </button>
        </div>

      </div>
    </div>
  );
};
