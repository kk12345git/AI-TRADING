"use client";

import React, { useState } from "react";
import { TradeInput, AssetClass, ActionType, CurrencySymbol } from "../types/portfolio";
import { X, PlusCircle, DollarSign, Calculator, AlertTriangle, Smile } from "lucide-react";

interface TradeLoggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (trade: TradeInput) => void;
  currency: CurrencySymbol;
}

export const TradeLoggerModal: React.FC<TradeLoggerModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currency
}) => {
  if (!isOpen) return null;

  const today = new Date().toISOString().split("T")[0];

  const [date, setDate] = useState<string>(today);
  const [time, setTime] = useState<string>("09:30");
  const [symbol, setSymbol] = useState<string>("NIFTY50");
  const [assetClass, setAssetClass] = useState<AssetClass>("Stocks");
  const [action, setAction] = useState<ActionType>("BUY");
  const [quantity, setQuantity] = useState<number>(50);
  const [entryPrice, setEntryPrice] = useState<number>(22000);
  const [exitPrice, setExitPrice] = useState<number>(22400);
  const [stopLoss, setStopLoss] = useState<number>(21850);
  const [takeProfit, setTakeProfit] = useState<number>(22500);
  const [fees, setFees] = useState<number>(20);
  const [setupTag, setSetupTag] = useState<string>("SMC Order Block");
  const [mistakeTag, setMistakeTag] = useState<string>("None - Followed Plan");
  const [emotionRating, setEmotionRating] = useState<number>(4);
  const [notes, setNotes] = useState<string>("");

  const setups = ["Breakout", "SMC Order Block", "Trend Following", "Scalp", "VWAP Reversion", "Supply/Demand", "ORB Breakout", "Custom Strategy"];
  const mistakes = ["None - Followed Plan", "FOMO", "Over-leveraged", "Moved Stop Loss", "Chased Entry", "Greed", "Revenge Trade", "Early Exit", "Execution Error"];

  // Realtime calculated preview
  const gross = action === "BUY" ? (exitPrice - entryPrice) * quantity : (entryPrice - exitPrice) * quantity;
  const netPnl = Math.round((gross - fees) * 100) / 100;
  const isWin = netPnl > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol || quantity <= 0 || entryPrice <= 0 || exitPrice <= 0) return;

    onSubmit({
      date,
      time,
      symbol: symbol.toUpperCase().trim(),
      asset_class: assetClass,
      action,
      quantity: Number(quantity),
      entry_price: Number(entryPrice),
      exit_price: Number(exitPrice),
      stop_loss: stopLoss ? Number(stopLoss) : undefined,
      take_profit: takeProfit ? Number(takeProfit) : undefined,
      fees: Number(fees),
      setup_tag: setupTag,
      mistake_tag: mistakeTag,
      emotion_rating: Number(emotionRating),
      notes: notes.trim()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Log Daily Trade</h2>
              <p className="text-xs text-slate-400">Enter trade parameters & behavioral tags for analysis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Quick P&L Preview Bar */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${
            isWin ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-rose-500/10 border-rose-500/30 text-rose-400"
          }`}>
            <div className="flex items-center space-x-2">
              <Calculator className="w-5 h-5" />
              <span className="text-xs font-semibold uppercase tracking-wider">Estimated Net P&L</span>
            </div>
            <div className="text-xl font-black font-mono">
              {currency}{netPnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>

          {/* Row 1: Symbol, Market Type, Action */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Symbol / Ticker</label>
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder="e.g. NIFTY50, AAPL, BTC/USD"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Asset Class</label>
              <select
                value={assetClass}
                onChange={(e) => setAssetClass(e.target.value as AssetClass)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Stocks">Stocks / Equity</option>
                <option value="Options">Options</option>
                <option value="Crypto">Crypto</option>
                <option value="Forex">Forex</option>
                <option value="Futures">Futures</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Direction</label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 border border-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setAction("BUY")}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                    action === "BUY" ? "bg-emerald-500 text-slate-950 shadow-md" : "text-slate-400 hover:text-white"
                  }`}
                >
                  BUY / LONG
                </button>
                <button
                  type="button"
                  onClick={() => setAction("SELL")}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                    action === "SELL" ? "bg-rose-500 text-white shadow-md" : "text-slate-400 hover:text-white"
                  }`}
                >
                  SELL / SHORT
                </button>
              </div>
            </div>
          </div>

          {/* Row 2: Date, Time, Quantity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Trade Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Execution Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Quantity / Lots</label>
              <input
                type="number"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                required
              />
            </div>
          </div>

          {/* Row 3: Entry, Exit, Stop Loss, Take Profit */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Entry Price ({currency})</label>
              <input
                type="number"
                step="any"
                value={entryPrice}
                onChange={(e) => setEntryPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Exit Price ({currency})</label>
              <input
                type="number"
                step="any"
                value={exitPrice}
                onChange={(e) => setExitPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Stop Loss ({currency})</label>
              <input
                type="number"
                step="any"
                value={stopLoss}
                onChange={(e) => setStopLoss(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Take Profit ({currency})</label>
              <input
                type="number"
                step="any"
                value={takeProfit}
                onChange={(e) => setTakeProfit(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          {/* Row 4: Setup Tag & Mistake Tag */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Strategy / Setup Tag</label>
              <select
                value={setupTag}
                onChange={(e) => setSetupTag(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                {setups.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 text-rose-300 flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Behavioral Mistake Tag</span>
              </label>
              <select
                value={mistakeTag}
                onChange={(e) => setMistakeTag(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-rose-500/30 rounded-xl text-xs text-rose-300 focus:outline-none focus:border-rose-500"
              >
                {mistakes.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 5: Emotion Rating & Brokerage Fees */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Emotional Rating</span>
                <span className="text-cyan-400 font-mono">{emotionRating} / 5</span>
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={emotionRating}
                onChange={(e) => setEmotionRating(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>1 - Extremely Tilted</span>
                <span>3 - Calm</span>
                <span>5 - Complete Flow</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Fees & Commission ({currency})</label>
              <input
                type="number"
                step="any"
                value={fees}
                onChange={(e) => setFees(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          {/* Row 6: Journal Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Journal Notes & Observations</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Why did you enter this trade? Did you follow your rules?"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex items-center justify-end space-x-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/25 transition-all"
            >
              Save Trade Entry
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
