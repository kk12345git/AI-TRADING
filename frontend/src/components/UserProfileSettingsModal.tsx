"use client";

import React, { useState } from "react";
import { UserProfile, UserUpdateInput, CurrencySymbol, TradingStyle, AssetClass } from "../types/portfolio";
import { X, UserCheck, Save, DollarSign, Shield, Target, Sliders } from "lucide-react";

interface UserProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateProfile: (updated: UserUpdateInput) => void;
}

export const UserProfileSettingsModal: React.FC<UserProfileSettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateProfile
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState(user.avatar || "⚡");
  const [currency, setCurrency] = useState<CurrencySymbol>(user.base_currency || "$");
  const [style, setStyle] = useState<TradingStyle>(user.trading_style || "Day Trader");
  const [market, setMarket] = useState<AssetClass>(user.primary_market || "Stocks");
  const [capital, setCapital] = useState(user.account_capital || 10000);
  const [riskPct, setRiskPct] = useState(user.risk_per_trade_pct || 1.0);
  const [goals, setGoals] = useState(user.trading_goals || "Consistency & Risk Control");

  const avatars = ["⚡", "📈", "🧠", "🚀", "🎯", "📊", "👑", "🔥"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name: name.trim(),
      avatar,
      base_currency: currency,
      trading_style: style,
      primary_market: market,
      account_capital: Number(capital),
      risk_per_trade_pct: Number(riskPct),
      trading_goals: goals.trim()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Trader Profile & Portfolio Settings</h2>
              <p className="text-xs text-slate-400">View and edit your personal trader details & risk parameters</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Avatar & Name */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Avatar Icon</label>
              <div className="flex flex-wrap gap-1.5">
                {avatars.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => setAvatar(av)}
                    className={`w-8 h-8 rounded-lg text-sm border flex items-center justify-center transition-all ${
                      avatar === av ? "bg-cyan-500/20 border-cyan-500 text-white shadow-md" : "bg-slate-950 border-slate-800 hover:bg-slate-800"
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Trader Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-bold"
                required
              />
            </div>
          </div>

          {/* Email (Readonly) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Account Email (Readonly)</label>
            <input
              type="text"
              value={user.email}
              disabled
              className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-800/60 rounded-xl text-xs text-slate-400 font-mono"
            />
          </div>

          {/* Style & Market */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Trading Style</label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value as TradingStyle)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Day Trader">Day Trader</option>
                <option value="Scalper">Scalper</option>
                <option value="Swing Trader">Swing Trader</option>
                <option value="Position Trader">Position Trader</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Primary Market</label>
              <select
                value={market}
                onChange={(e) => setMarket(e.target.value as AssetClass)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Stocks">Stocks / Equity</option>
                <option value="Options">Options</option>
                <option value="Crypto">Crypto</option>
                <option value="Forex">Forex</option>
                <option value="Futures">Futures</option>
              </select>
            </div>
          </div>

          {/* Account Capital, Risk %, Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Account Capital</label>
              <input
                type="number"
                value={capital}
                onChange={(e) => setCapital(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Risk / Trade (%)</label>
              <input
                type="number"
                step="0.1"
                value={riskPct}
                onChange={(e) => setRiskPct(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Display Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencySymbol)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-bold"
              >
                <option value="$">USD ($)</option>
                <option value="₹">INR (₹)</option>
                <option value="€">EUR (€)</option>
                <option value="£">GBP (£)</option>
              </select>
            </div>
          </div>

          {/* Goals */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Trading Goals & Rules</label>
            <textarea
              rows={2}
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Submit */}
          <div className="pt-3 flex justify-end space-x-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/25 transition-all flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile Changes</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
