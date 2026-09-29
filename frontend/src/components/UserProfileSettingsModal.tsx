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
  const [capital, setCapital] = useState(user.account_capital || 0);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#0D1018] border border-white/[0.08] rounded-3xl shadow-luxe overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.07] bg-[#090A0F]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gold-500/10 border border-gold-500/25 flex items-center justify-center text-gold-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Trader Profile & Account Settings</h2>
              <p className="text-xs text-zinc-400">Personalize trader name, credentials, capital, and default currency</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] rounded-xl transition-all border border-white/[0.05]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Avatar Icon */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Avatar Icon</label>
            <div className="flex flex-wrap gap-2">
              {avatars.map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => setAvatar(av)}
                  className={`w-10 h-10 rounded-xl text-lg border flex items-center justify-center transition-all ${
                    avatar === av
                      ? "bg-gold-500/20 border-gold-500 text-gold-300 ring-1 ring-gold-500/30"
                      : "bg-[#07080B] border-white/[0.06] text-zinc-400 hover:border-white/[0.12]"
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5">Trader Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-[#07080B] border border-white/[0.08] text-white px-3.5 py-2.5 rounded-xl text-sm focus:border-gold-500/50 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5 flex items-center gap-1">
                <KeyRound className="w-3 h-3 text-gold-400" />
                Security PIN Code
              </label>
              <input
                type="password"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                required
                className="w-full bg-[#07080B] border border-white/[0.08] text-white px-3.5 py-2.5 rounded-xl text-sm font-mono tracking-widest focus:border-gold-500/50 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5">Base Currency</label>
              <div className="grid grid-cols-3 gap-2">
                {(["₹", "$", "€"] as CurrencySymbol[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCurrency(c)}
                    className={`py-2 rounded-xl text-sm font-bold border transition-all ${
                      currency === c
                        ? "bg-gold-500/20 border-gold-500 text-gold-300 ring-1 ring-gold-500/30"
                        : "bg-[#07080B] border-white/[0.06] text-zinc-400 hover:border-white/[0.12]"
                    }`}
                  >
                    {c} {c === "₹" ? "INR" : c === "$" ? "USD" : "EUR"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5">Base Capital Balance</label>
              <input
                type="number"
                value={capital}
                onChange={(e) => setCapital(Number(e.target.value))}
                required
                className="w-full bg-[#07080B] border border-white/[0.08] text-white px-3.5 py-2.5 rounded-xl text-sm font-mono font-bold focus:border-gold-500/50 focus:outline-none"
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">Net P&L adds dynamically onto this base</span>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5">Trading Philosophy / Strategy Style</label>
            <input
              type="text"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              placeholder="e.g. Price Action & Momentum, Support & Resistance..."
              className="w-full bg-[#07080B] border border-white/[0.08] text-white px-3.5 py-2.5 rounded-xl text-sm focus:border-gold-500/50 focus:outline-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-gold-500 to-amber-500 hover:brightness-110 active:scale-[0.98] text-black font-black text-sm shadow-md transition-all flex items-center justify-center gap-2"
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
