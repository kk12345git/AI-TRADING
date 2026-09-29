"use client";

import React, { useState, useEffect } from "react";
import { Trade, TradeInput, InstrumentType, ActionType, CurrencySymbol } from "../types/portfolio";
import { X, Plus, Save, TrendingUp, TrendingDown, Calculator, Tag, Calendar, Clock, DollarSign, Check } from "lucide-react";

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
  "NIFTY50",
  "SENSEX"
] as const;

const STRATEGY_PRESETS = [
  "My Core Strategy",
  "Breakout & Retest",
  "Opening Range",
  "VWAP Bounce",
  "Quick Scalp"
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
  const [instrumentType, setInstrumentType] = useState<InstrumentType>("OPTIONS");
  const [action, setAction] = useState<ActionType>("BUY");
  const [quantity, setQuantity] = useState<number>(50);
  const [entryPrice, setEntryPrice] = useState<number>(100);
  const [exitPrice, setExitPrice] = useState<number>(135);
  const [manualPoints, setManualPoints] = useState<string>("");
  const [fees, setFees] = useState<number>(40);
  const [strategy, setStrategy] = useState<string>("My Core Strategy");
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (editingTrade) {
      setDate(editingTrade.date);
      setTime(editingTrade.time);
      setSymbol(editingTrade.symbol);
      setInstrumentType(editingTrade.instrument_type);
      setAction(editingTrade.action);
      setQuantity(editingTrade.quantity);
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
    }
  }, [editingTrade, isOpen]);

  // Compute points
  const autoPoints = action === "BUY"
    ? Number((exitPrice - entryPrice).toFixed(2))
    : Number((entryPrice - exitPrice).toFixed(2));

  const effectivePoints = manualPoints !== "" && !isNaN(Number(manualPoints))
    ? Number(manualPoints)
    : autoPoints;

  const grossPnl = Number((effectivePoints * quantity).toFixed(2));
  const netPnl = Number((grossPnl - (fees || 0)).toFixed(2));
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
        entry_price: entryPrice,
        exit_price: exitPrice,
        points: effectivePoints,
        fees: fees || 0,
        strategy: strategy.trim() || "My Strategy",
        notes: notes.trim()
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col my-0 sm:my-6 animate-in slide-in-from-bottom duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/70 shrink-0">
          <div className="flex items-center space-x-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
              action === "BUY" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
            }`}>
              {action === "BUY" ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {editingTrade ? "Edit Trade" : "Log Trade Entry & Exit"}
              </h2>
              <p className="text-[11px] text-slate-400">
                Points & Daily Profit/Loss Register
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/60 active:bg-slate-700 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Calculation Banner (Sticky & Clear) */}
        <div className={`px-5 py-3 border-b flex items-center justify-between shrink-0 ${
          isWin
            ? "bg-emerald-950/30 border-emerald-900/40 text-emerald-400"
            : isLoss
            ? "bg-rose-950/30 border-rose-900/40 text-rose-400"
            : "bg-slate-850 border-slate-800 text-slate-300"
        }`}>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 block">Points</span>
            <div className="text-lg sm:text-xl font-black">
              {effectivePoints > 0 ? `+${effectivePoints}` : effectivePoints} pts
            </div>
          </div>

          <div className="text-center">
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 block">Net P&L</span>
            <div className="text-xl sm:text-2xl font-black">
              {netPnl >= 0 ? `+${currency}${netPnl.toLocaleString()}` : `${currency}${netPnl.toLocaleString()}`}
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 block">Result</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
              isWin ? "bg-emerald-500/20 text-emerald-300" : isLoss ? "bg-rose-500/20 text-rose-300" : "bg-slate-800 text-slate-400"
            }`}>
              {isWin ? "PROFIT" : isLoss ? "LOSS" : "FLAT"}
            </span>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 pb-safe">
          
          {/* Action BUY / SELL Buttons */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
              Direction
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 border border-slate-800 rounded-2xl">
              <button
                type="button"
                onClick={() => setAction("BUY")}
                className={`py-3 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 active:scale-98 ${
                  action === "BUY" ? "bg-emerald-500 text-slate-950 shadow-md" : "text-slate-400 hover:text-white"
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                BUY / CALL (LONG)
              </button>
              <button
                type="button"
                onClick={() => setAction("SELL")}
                className={`py-3 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 active:scale-98 ${
                  action === "SELL" ? "bg-rose-500 text-slate-950 shadow-md" : "text-slate-400 hover:text-white"
                }`}
              >
                <TrendingDown className="w-4 h-4" />
                SELL / PUT (SHORT)
              </button>
            </div>
          </div>

          {/* Symbol / Instrument Selector: STRICTLY XAUUSD, NASDAQ, NIFTY50, SENSEX */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Instrument (4 Live Only)
              </label>
              <span className="text-[10px] text-cyan-400 font-mono font-bold">
                Selected: {symbol}
              </span>
            </div>
            
            {/* 4 Interactive Buttons for Live Instruments */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
              {ALLOWED_SYMBOLS.map((s) => {
                const isSelected = symbol === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSymbol(s)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-black tracking-wider transition-all flex items-center justify-center gap-1.5 border active:scale-95 ${
                      isSelected
                        ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20 font-black"
                        : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white"
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    <span>{s}</span>
                  </button>
                );
              })}
            </div>

            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="XAUUSD, NASDAQ, NIFTY50, or SENSEX"
              required
              className="w-full bg-slate-950 border border-slate-800 text-white px-3.5 py-2.5 rounded-xl text-xs font-mono focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-cyan-400" />
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2.5 rounded-xl text-xs focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-cyan-400" />
                Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2.5 rounded-xl text-xs focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Entry Price & Exit Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">
                Entry Price ({currency})
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="any"
                value={entryPrice}
                onChange={(e) => setEntryPrice(Number(e.target.value))}
                required
                className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2.5 rounded-xl text-sm font-mono font-bold focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">
                Exit Price ({currency})
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="any"
                value={exitPrice}
                onChange={(e) => setExitPrice(Number(e.target.value))}
                required
                className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2.5 rounded-xl text-sm font-mono font-bold focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Points (Auto or Manual Override) & Quantity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 mb-1 flex items-center justify-between">
                <span>Points (pts)</span>
                <span className="text-[9px] text-slate-500">Auto: {autoPoints}</span>
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="any"
                value={manualPoints}
                placeholder={String(autoPoints)}
                onChange={(e) => setManualPoints(e.target.value)}
                className="w-full bg-slate-950 border border-cyan-500/50 text-cyan-300 px-3 py-2.5 rounded-xl text-sm font-mono font-bold focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">
                Quantity / Lots
              </label>
              <input
                type="number"
                inputMode="numeric"
                min="1"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                required
                className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2.5 rounded-xl text-sm font-mono font-bold focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Quantity Fast Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-[10px] text-slate-500 mr-1">Quick Lots:</span>
            {[25, 50, 65, 75, 100, 200].map(q => (
              <button
                key={q}
                type="button"
                onClick={() => setQuantity(q)}
                className={`text-[11px] px-2 py-1 rounded-lg border font-mono transition-all ${
                  quantity === q ? "bg-cyan-500/20 text-cyan-300 border-cyan-500" : "bg-slate-800 text-slate-400 border-slate-700"
                }`}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Fees & Strategy */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">
                Fees / Brokerage ({currency})
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="any"
                value={fees}
                onChange={(e) => setFees(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-xl text-sm font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">
                Strategy Name
              </label>
              <input
                type="text"
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
                placeholder="Strategy tag..."
                className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-xl text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">
              Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. 5m breakout, trailed SL..."
              className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-xl text-xs focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Sticky Actions at bottom */}
          <div className="pt-2 sticky bottom-0 bg-slate-900 pb-1">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 active:scale-[0.98] text-slate-950 font-black text-sm shadow-xl shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
            >
              {editingTrade ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {editingTrade ? "Update Trade Entry" : "Save Trade to Register"}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
