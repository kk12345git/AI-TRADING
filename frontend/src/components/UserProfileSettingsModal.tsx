"use client";

import React, { useState } from "react";
import { UserProfile, UserUpdateInput, CurrencySymbol } from "../types/portfolio";
import { X, UserCheck, Save, DollarSign, KeyRound, Shield, Tag } from "lucide-react";

interface UserProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateProfile: (updated: UserUpdateInput) => Promise<void>;
}

export const UserProfileSettingsModal: React.FC<UserProfileSettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateProfile
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(user.name);
  const [pin, setPin] = useState(user.pin || "1234");
  const [avatar, setAvatar] = useState(user.avatar || "⚡");
  const [currency, setCurrency] = useState<CurrencySymbol>(user.base_currency || "₹");
  const [style, setStyle] = useState(user.trading_style || "Options & Price Action");
  const [capital, setCapital] = useState(user.account_capital || 100000);
  const [loading, setLoading] = useState(false);

  const avatars = ["⚡", "🎯", "👑", "🚀", "📈", "🔥", "💎", "🦁"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await onUpdateProfile({
        name: name.trim(),
        pin: pin.trim(),
        avatar,
        base_currency: currency,
        trading_style: style.trim(),
        account_capital: Number(capital)
      });
      onClose();
    } catch (err) {
      console.error("Error updating profile:", err);
    } finally {
      setLoading(false);
    }
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
              <h2 className="text-base font-bold text-white">Trader Profile & Account Settings</h2>
              <p className="text-xs text-slate-400">Personalize name, PIN credentials, capital, and currency</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Avatar & Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Avatar Icon</label>
            <div className="flex flex-wrap gap-2">
              {avatars.map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => setAvatar(av)}
                  className={`w-10 h-10 rounded-xl text-lg border flex items-center justify-center transition-all ${
                    avatar === av ? "bg-cyan-500/20 border-cyan-500 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500" : "bg-slate-950 border-slate-800 hover:bg-slate-800"
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Trader Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-2.5 rounded-xl text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                Security PIN / Password
              </label>
              <input
                type="text"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 text-white font-mono px-4 py-2.5 rounded-xl text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Base Currency Symbol
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(["₹", "$", "€", "£"] as CurrencySymbol[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCurrency(c)}
                    className={`py-2 rounded-xl text-sm font-bold border transition-all ${
                      currency === c
                        ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-md"
                        : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Trading Capital ({currency})
              </label>
              <input
                type="number"
                value={capital}
                onChange={(e) => setCapital(Number(e.target.value))}
                required
                className="w-full bg-slate-950 border border-slate-800 text-white font-mono px-4 py-2.5 rounded-xl text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Trading Style / Focus
            </label>
            <input
              type="text"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              placeholder="e.g. NIFTY Options Buyer, Price Action Trader..."
              className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-2.5 rounded-xl text-sm focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
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
              <Save className="w-4 h-4" />
              Save Profile Settings
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
