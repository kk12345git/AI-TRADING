"use client";

import React, { useState, useEffect } from "react";
import { Trade, TradeInput, InstrumentType, ActionType, CurrencySymbol } from "../types/portfolio";
import { X, Plus, Save, TrendingUp, TrendingDown, Calculator, Tag, Calendar, Clock, DollarSign } from "lucide-react";

interface TradeLoggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTrade: (trade: TradeInput, editId?: string) => Promise<void>;
  editingTrade?: Trade | null;
  currency: CurrencySymbol;
  activeUserId: string;
}

const QUICK_SYMBOLS = [
  "NIFTY 25000 CE",
  "NIFTY 25000 PE",
  "BANKNIFTY 54000 CE",
  "BANKNIFTY 54000 PE",
  "FINNIFTY",
  "SENSEX",
  "RELIANCE",
  "HDFCBANK",
  "BTC/USDT"
];

const STRATEGY_PRESETS = [
  "My Core Strategy",
  "Breakout & Retest",
  "Opening Range Breakout",
  "VWAP Pullback",
  "Trend Continuation",
  "Support / Resistance Bounce",
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
  const [symbol, setSymbol] = useState<string>("NIFTY 25000 CE");
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

  // Populate form if editing
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

  // Compute calculated points
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
        strategy: strategy.trim() || "My Custom Strategy",
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
              action === "BUY" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
            }`}>
              {action === "BUY" ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {editingTrade ? "Edit Trade Entry" : "Register Trade Entry & Exit"}
              </h2>
              <p className="text-xs text-slate-400">
                Enter execution details, points captured/lost, and daily profit/loss
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Calculation Banner */}
        <div className={`px-6 py-4 border-b flex flex-wrap items-center justify-between gap-4 ${
          isWin
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
            : isLoss
            ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
            : "bg-slate-800/40 border-slate-800 text-slate-300"
        }`}>
          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold opacity-75">Points Captured / Lost:</span>
            <div className="text-xl font-black">
              {effectivePoints > 0 ? `+${effectivePoints}` : effectivePoints} pts
            </div>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold opacity-75">Net Trade P&L:</span>
            <div className="text-2xl font-black">
              {netPnl > 0 ? `+${currency}${netPnl.toLocaleString()}` : `${currency}${netPnl.toLocaleString()}`}
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] uppercase tracking-wider font-semibold opacity-75">Result:</span>
            <div className="font-bold text-sm">
              {isWin ? "✅ PROFITABLE" : isLoss ? "❌ LOSS" : "⚪ BREAKEVEN"}
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Row 1: Action (BUY/SELL) & Instrument Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
                Trade Direction
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 border border-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setAction("BUY")}
                  className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    action === "BUY" ? "bg-emerald-500 text-slate-950 shadow-md" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  BUY / LONG
                </button>
                <button
                  type="button"
                  onClick={() => setAction("SELL")}
                  className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    action === "SELL" ? "bg-rose-500 text-slate-950 shadow-md" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <TrendingDown className="w-3.5 h-3.5" />
                  SELL / SHORT
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
                Instrument Type
              </label>
              <select
                value={instrumentType}
                onChange={(e) => setInstrumentType(e.target.value as InstrumentType)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3.5 py-2.5 text-sm focus:border-cyan-500 focus:outline-none"
              >
                <option value="OPTIONS">OPTIONS (CE / PE)</option>
                <option value="FUTURES">FUTURES</option>
                <option value="EQUITY">EQUITY / STOCKS</option>
                <option value="CRYPTO">CRYPTO</option>
                <option value="FOREX">FOREX</option>
              </select>
            </div>
          </div>

          {/* Row 2: Symbol & Quick Presets */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Symbol / Instrument
              </label>
              <span className="text-[11px] text-slate-500">Fast chips available</span>
            </div>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="e.g. NIFTY 25000 CE, BANKNIFTY 54000 PE, RELIANCE..."
              required
              className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-2.5 rounded-xl text-sm focus:border-cyan-500 focus:outline-none"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {QUICK_SYMBOLS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSymbol(s)}
                  className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 font-mono"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Row 3: Date, Time & Quantity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-xl text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-xl text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
                Quantity / Lots
              </label>
              <input
                type="number"
                min="0.01"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                required
                className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-xl text-sm focus:border-cyan-500 focus:outline-none font-mono"
              />
              <div className="flex gap-1 mt-1">
                {[25, 50, 75, 100].map(q => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setQuantity(q)}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 hover:text-white"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Row 4: Entry Price, Exit Price, Points & Brokerage */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 block">
                Entry Price ({currency})
              </label>
              <input
                type="number"
                step="any"
                value={entryPrice}
                onChange={(e) => setEntryPrice(Number(e.target.value))}
                required
                className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-xl text-sm focus:border-cyan-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 block">
                Exit Price ({currency})
              </label>
              <input
                type="number"
                step="any"
                value={exitPrice}
                onChange={(e) => setExitPrice(Number(e.target.value))}
                required
                className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-xl text-sm focus:border-cyan-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-1 block flex items-center justify-between">
                <span>Points (pts)</span>
                <span className="text-[10px] text-slate-500">or auto</span>
              </label>
              <input
                type="number"
                step="any"
                value={manualPoints}
                placeholder={String(autoPoints)}
                onChange={(e) => setManualPoints(e.target.value)}
                className="w-full bg-slate-950 border border-cyan-500/50 text-cyan-300 px-3 py-2 rounded-xl text-sm focus:border-cyan-400 focus:outline-none font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 block">
                Fees / Charges ({currency})
              </label>
              <input
                type="number"
                step="any"
                value={fees}
                onChange={(e) => setFees(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-xl text-sm focus:border-cyan-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Row 5: Strategy / Setup Name */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-cyan-400" />
              Strategy / Setup Used
            </label>
            <input
              type="text"
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
              placeholder="e.g. My Core Strategy, Breakout, Scalp..."
              className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-xl text-sm focus:border-cyan-500 focus:outline-none"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {STRATEGY_PRESETS.map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStrategy(st)}
                  className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300"
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Row 6: Notes */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
              Trade Notes & Learnings
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Waited for 5-min candle close above resistance, followed target cleanly..."
              className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-xl text-sm focus:border-cyan-500 focus:outline-none resize-none"
            />
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 text-sm font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2"
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
