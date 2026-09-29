"use client";

import React, { useState, useEffect } from "react";
import { Trade, TradeInput, InstrumentType, ActionType, CurrencySymbol } from "../types/portfolio";
import {
  X, Plus, Save, TrendingUp, TrendingDown, Calculator,
  Calendar, Clock, DollarSign, Check, Info, ShieldCheck, Sparkles
} from "lucide-react";
import { INSTRUMENT_SPECS, getInstrumentSpec, calculateRealTradePnl } from "../types/instruments";
import { LotSizeCalculatorModal } from "./LotSizeCalculatorModal";

interface TradeLoggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTrade: (trade: TradeInput, editId?: string) => Promise<void>;
  editingTrade?: Trade | null;
  currency: CurrencySymbol;
  activeUserId: string;
}

export const ALLOWED_SYMBOLS = [
  "XAUUSD",
  "NASDAQ",
  "US30",
  "SPX500",
  "GER40",
  "NIFTY50",
  "BANKNIFTY",
  "SENSEX",
  "EURUSD",
  "BTCUSD"
] as const;

const STRATEGY_PRESETS = [
  "Price Action & Breakout",
  "Support / Resistance Bounce",
  "Opening Range Breakout",
  "VWAP & EMA Trend Following",
  "Momentum Scalp",
  "Supply & Demand Zone"
];

export const TradeLoggerModal: React.FC<TradeLoggerModalProps> = ({
  isOpen,
  onClose,
  onSaveTrade,
  editingTrade,
  currency,
  activeUserId
}) => {
  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split("T")[0];
  const nowTime = new Date().toTimeString().slice(0, 5);

  const [date, setDate] = useState<string>(todayStr);
  const [time, setTime] = useState<string>(nowTime);
  const [symbol, setSymbol] = useState<string>("XAUUSD");
  const [instrumentType, setInstrumentType] = useState<InstrumentType>("COMMODITY" as any);
  const [action, setAction] = useState<ActionType>("BUY");
  const [quantity, setQuantity] = useState<number>(0.01); // Lot size
  const [entryPrice, setEntryPrice] = useState<number>(2685.0);
  const [exitPrice, setExitPrice] = useState<number>(2686.0);
  const [manualPoints, setManualPoints] = useState<string>("");
  const [fees, setFees] = useState<number>(0);
  const [strategy, setStrategy] = useState<string>("Price Action & Breakout");
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isCalcModalOpen, setIsCalcModalOpen] = useState<boolean>(false);

  // Synchronize when editing or switching symbol
  useEffect(() => {
    if (editingTrade) {
      setDate(editingTrade.date);
      setTime(editingTrade.time);
      setSymbol(editingTrade.symbol);
      setInstrumentType(editingTrade.instrument_type);
      setAction(editingTrade.action);
      setQuantity(editingTrade.lots || editingTrade.quantity || 0.01);
      setEntryPrice(editingTrade.entry_price);
      setExitPrice(editingTrade.exit_price);
      setManualPoints(String(editingTrade.points));
      setFees(editingTrade.fees);
      setStrategy(editingTrade.strategy);
      setNotes(editingTrade.notes);
    } else {
      setDate(new Date().toISOString().split("T")[0]);
      setTime(new Date().toTimeString().slice(0, 5));
      setManualPoints("");
      const spec = getInstrumentSpec(symbol);
      setQuantity(spec.defaultLot);
    }
  }, [editingTrade, isOpen]);

  const currentSpec = getInstrumentSpec(symbol);

  // Handle symbol change
  const handleSelectSymbol = (newSym: string) => {
    setSymbol(newSym);
    const spec = getInstrumentSpec(newSym);
    setQuantity(spec.defaultLot);
    if (newSym === "XAUUSD") {
      setEntryPrice(2685.0);
      setExitPrice(2686.0);
    } else if (newSym === "NASDAQ") {
      setEntryPrice(20150.0);
      setExitPrice(20170.0);
    } else if (newSym === "US30") {
      setEntryPrice(42100.0);
      setExitPrice(42150.0);
    } else if (newSym === "NIFTY50") {
      setEntryPrice(25800.0);
      setExitPrice(25825.0);
    } else if (newSym === "BANKNIFTY") {
      setEntryPrice(53500.0);
      setExitPrice(53550.0);
    } else if (newSym === "SENSEX") {
      setEntryPrice(84200.0);
      setExitPrice(84250.0);
    }
  };

  // Compute points
  const autoPoints = action === "BUY"
    ? Number((exitPrice - entryPrice).toFixed(2))
    : Number((entryPrice - exitPrice).toFixed(2));

  const effectivePoints = manualPoints !== "" && !isNaN(Number(manualPoints))
    ? Number(manualPoints)
    : autoPoints;

  // Real-time exact contract & point multiplier calculation
  const { grossPnl, netPnl, multiplier, contractUnits } = calculateRealTradePnl(
    symbol,
    quantity,
    effectivePoints,
    fees || 0
  );

  const isWin = netPnl > 0.05;
  const isLoss = netPnl < -0.05;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol.trim() || quantity <= 0) return;

    setLoading(true);
    try {
      const tradeInput: TradeInput = {
        user_id: activeUserId,
        date,
        time,
        symbol: symbol.trim(),
        instrument_type: instrumentType,
        action,
        quantity,
        lots: quantity,
        entry_price: entryPrice,
        exit_price: exitPrice,
        points: effectivePoints,
        fees: fees || 0,
        strategy: strategy.trim() || "Price Action",
        notes: notes.trim(),
        point_multiplier: multiplier,
        contract_units: contractUnits
      };

      await onSaveTrade(tradeInput, editingTrade ? editingTrade.id : undefined);
      onClose();
    } catch (err) {
      console.error("Error saving trade:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md">
        <div className="relative w-full max-w-2xl bg-[#0C0E14] border-t sm:border border-white/[0.08] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[94vh] flex flex-col my-0 sm:my-4 animate-in slide-in-from-bottom duration-200">
          
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07] bg-[#08090C] shrink-0">
            <div className="flex items-center space-x-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold border ${
                action === "BUY"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-400 border-rose-500/20"
              }`}>
                {action === "BUY" ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">
                  {editingTrade ? "Edit Trade Entry" : "Log Trade & Calculate Real Lot P&L"}
                </h2>
                <p className="text-[11px] text-zinc-400">
                  Exact contract sizing & point multiplier engine
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCalcModalOpen(true)}
                className="px-2.5 py-1.5 rounded-xl bg-gold-500/10 hover:bg-gold-500/20 text-gold-400 border border-gold-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
                title="Open Real-time Lot Sizer"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Lot Sizer</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 text-zinc-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] rounded-xl transition-all border border-white/[0.05]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Real-time Calculation Summary Banner */}
          <div className={`px-6 py-3.5 border-b flex items-center justify-between shrink-0 transition-colors ${
            isWin
              ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-400"
              : isLoss
              ? "bg-rose-950/20 border-rose-500/20 text-rose-400"
              : "bg-[#11141E] border-white/[0.06] text-zinc-300"
          }`}>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest opacity-80 block">Points Captured</span>
              <div className="text-lg sm:text-xl font-mono font-black">
                {effectivePoints > 0 ? `+${effectivePoints}` : effectivePoints} {currentSpec.pointName}
              </div>
            </div>

            <div className="text-center">
              <span className="text-[10px] uppercase font-bold tracking-widest opacity-80 block">Real Net P&L</span>
              <div className="text-xl sm:text-2xl font-mono font-black tracking-tight">
                {netPnl >= 0 ? `+${currentSpec.currencySymbol}${netPnl.toLocaleString()}` : `-${currentSpec.currencySymbol}${Math.abs(netPnl).toLocaleString()}`}
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold tracking-widest opacity-80 block">Contract Multiplier</span>
              <div className="text-xs font-mono font-bold mt-0.5 text-zinc-300">
                ×{multiplier} ({currentSpec.currency})
              </div>
            </div>
          </div>

          {/* Scrollable Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4.5 overflow-y-auto flex-1">
            
            {/* Direction BUY / SELL Buttons */}
            <div>
              <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 mb-1.5 block">
                Trade Direction
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-[#07080B] border border-white/[0.06] rounded-2xl">
                <button
                  type="button"
                  onClick={() => setAction("BUY")}
                  className={`py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                    action === "BUY"
                      ? "bg-emerald-500 text-black shadow-md font-black"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  BUY / LONG
                </button>
                <button
                  type="button"
                  onClick={() => setAction("SELL")}
                  className={`py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                    action === "SELL"
                      ? "bg-rose-500 text-black shadow-md font-black"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <TrendingDown className="w-4 h-4" />
                  SELL / SHORT
                </button>
              </div>
            </div>

            {/* Instrument Selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">
                  Select Instrument ({currentSpec.exchange})
                </label>
                <span className="text-[11px] text-gold-400 font-mono font-bold">
                  {currentSpec.name}
                </span>
              </div>
              
              {/* Quick Select Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 mb-2">
                {ALLOWED_SYMBOLS.map((s) => {
                  const isSelected = symbol === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleSelectSymbol(s)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-mono font-bold tracking-wider transition-all flex items-center justify-center gap-1 border active:scale-95 ${
                        isSelected
                          ? "bg-gold-500/15 border-gold-500/50 text-gold-300 shadow-sm"
                          : "bg-[#11141E] border-white/[0.05] text-zinc-400 hover:border-white/[0.12] hover:text-white"
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3] text-gold-400" />}
                      <span>{s}</span>
                    </button>
                  );
                })}
              </div>

              {/* Research Specification Explainer Pill */}
              <div className="p-3 rounded-xl bg-gradient-to-r from-gold-500/10 via-[#11141E] to-[#11141E] border border-gold-500/20 text-xs">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-zinc-200 font-semibold block">
                      {currentSpec.formulaDescription}
                    </span>
                    <span className="text-[11px] text-zinc-400 block mt-0.5">
                      {currentSpec.exampleText}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-gold-400" />
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full bg-[#07080B] border border-white/[0.08] text-white px-3 py-2 rounded-xl text-xs focus:border-gold-500/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-gold-400" />
                  Time
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                  className="w-full bg-[#07080B] border border-white/[0.08] text-white px-3 py-2 rounded-xl text-xs focus:border-gold-500/50 focus:outline-none"
                />
              </div>
            </div>

            {/* Entry & Exit Prices */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 mb-1 block">
                  Entry Price ({currentSpec.currencySymbol})
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(Number(e.target.value))}
                  required
                  className="w-full bg-[#07080B] border border-white/[0.08] text-white px-3.5 py-2.5 rounded-xl text-sm font-mono font-bold focus:border-gold-500/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 mb-1 block">
                  Exit Price ({currentSpec.currencySymbol})
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  value={exitPrice}
                  onChange={(e) => setExitPrice(Number(e.target.value))}
                  required
                  className="w-full bg-[#07080B] border border-white/[0.08] text-white px-3.5 py-2.5 rounded-xl text-sm font-mono font-bold focus:border-gold-500/50 focus:outline-none"
                />
              </div>
            </div>

            {/* Points (pts) & Lot Size (Lots) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-gold-400">
                    Points ({currentSpec.pointName})
                  </label>
                  <span className="text-[9px] text-zinc-500 font-mono">
                    Auto: {autoPoints}
                  </span>
                </div>
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  value={manualPoints}
                  placeholder={String(autoPoints)}
                  onChange={(e) => setManualPoints(e.target.value)}
                  className="w-full bg-[#07080B] border border-gold-500/30 text-gold-300 px-3.5 py-2.5 rounded-xl text-sm font-mono font-bold focus:border-gold-500 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-white">
                    Lot Size ({currentSpec.category === "INDEX_FUTURES" ? "Lots" : "Standard Lots"})
                  </label>
                  <span className="text-[9px] text-zinc-500 font-mono">
                    Min: {currentSpec.minLot}
                  </span>
                </div>
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min="0.001"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  required
                  className="w-full bg-[#07080B] border border-white/[0.08] text-white px-3.5 py-2.5 rounded-xl text-sm font-mono font-bold focus:border-gold-500/50 focus:outline-none"
                />
              </div>
            </div>

            {/* Quick Lots Buttons tailored to this instrument */}
            <div>
              <span className="text-[10px] text-zinc-500 mr-1.5 font-medium">Quick Lots:</span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mt-1 no-scrollbar">
                {currentSpec.quickLots.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setQuantity(q)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border font-mono transition-all ${
                      quantity === q
                        ? "bg-gold-500/20 text-gold-300 border-gold-500/60 font-bold"
                        : "bg-[#11141E] text-zinc-400 border-white/[0.06] hover:border-white/[0.12]"
                    }`}
                  >
                    {q} {currentSpec.category === "INDEX_FUTURES" ? "lot" : ""}
                  </button>
                ))}
              </div>
            </div>

            {/* Real Calculation Live Breakdown Box */}
            <div className="p-3.5 rounded-xl bg-[#090A0F] border border-white/[0.06] text-xs font-mono space-y-1">
              <div className="flex items-center justify-between text-zinc-400">
                <span>Calculated Volume:</span>
                <span className="text-white font-bold">{contractUnits} units / shares</span>
              </div>
              <div className="flex items-center justify-between text-zinc-400">
                <span>Real-time Formula:</span>
                <span className="text-gold-400 font-bold">
                  {effectivePoints} pts × {quantity} lots × {multiplier} = {currentSpec.currencySymbol}{grossPnl.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Fees & Strategy */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 mb-1 block">
                  Fees / Brokerage ({currentSpec.currencySymbol})
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  value={fees}
                  onChange={(e) => setFees(Number(e.target.value))}
                  className="w-full bg-[#07080B] border border-white/[0.08] text-white px-3 py-2 rounded-xl text-sm font-mono focus:border-gold-500/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 mb-1 block">
                  Strategy Tag
                </label>
                <select
                  value={strategy}
                  onChange={(e) => setStrategy(e.target.value)}
                  className="w-full bg-[#07080B] border border-white/[0.08] text-white px-3 py-2 rounded-xl text-xs focus:border-gold-500/50 focus:outline-none"
                >
                  {STRATEGY_PRESETS.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 mb-1 block">
                Trade Reflection / Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Key price action observations, confluence, execution notes..."
                className="w-full bg-[#07080B] border border-white/[0.08] text-white px-3 py-2 rounded-xl text-xs focus:border-gold-500/50 focus:outline-none"
              />
            </div>

            {/* Sticky Actions at bottom */}
            <div className="pt-2 sticky bottom-0 bg-[#0C0E14] pb-1">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-gold-500 via-gold-400 to-amber-500 hover:brightness-110 active:scale-[0.99] text-black font-black text-sm shadow-luxe transition-all flex items-center justify-center gap-2"
              >
                {editingTrade ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {editingTrade ? "Update Trade Entry" : "Save Trade to Register"}
              </button>
            </div>

          </form>

        </div>
      </div>

      {/* Lot Sizer / Position Sizer Modal */}
      <LotSizeCalculatorModal
        isOpen={isCalcModalOpen}
        onClose={() => setIsCalcModalOpen(false)}
        currency={currency}
        initialSymbol={symbol}
        onApplyLotToTrade={(sym, lot) => {
          setSymbol(sym);
          setQuantity(lot);
        }}
      />
    </>
  );
};
