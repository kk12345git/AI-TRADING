"use client";

import React, { useState } from "react";
import { UserProfile, UserLoginInput } from "../types/portfolio";
import { Lock, ShieldCheck, KeyRound, ArrowRight, UserCheck, AlertCircle, Sparkles } from "lucide-react";

interface AuthPortalProps {
  traders: UserProfile[];
  onAuthenticate: (trader: UserProfile) => void;
  onLoginAttempt: (creds: UserLoginInput) => Promise<UserProfile | null>;
}

const GUARANTEED_TRADERS: UserProfile[] = [
  {
    id: "rakesh",
    name: "Rakesh",
    username: "rakesh",
    pin: "2580",
    avatar: "⚡",
    base_currency: "₹",
    trading_style: "Price Action & Momentum",
    primary_market: "XAUUSD, NASDAQ, NIFTY50, SENSEX",
    account_capital: 0,
    created_at: "2026-01-01 09:15:00"
  },
  {
    id: "karthi",
    name: "Karthi",
    username: "karthi",
    pin: "3790",
    avatar: "🎯",
    base_currency: "₹",
    trading_style: "Strategy & Breakout",
    primary_market: "XAUUSD, NASDAQ, NIFTY50, SENSEX",
    account_capital: 0,
    created_at: "2026-01-01 09:15:00"
  }
];

export const AuthPortal: React.FC<AuthPortalProps> = ({
  traders,
  onAuthenticate,
  onLoginAttempt
}) => {
  const validTraders = traders.length > 0 && traders.some(t => t.username === "rakesh" || t.id === "rakesh")
    ? traders
    : GUARANTEED_TRADERS;

  const [selectedTraderId, setSelectedTraderId] = useState<string>("rakesh");
  const [pin, setPin] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const activeTrader = validTraders.find(t => t.id === selectedTraderId || t.username === selectedTraderId) || validTraders[0];

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pin.trim()) {
      setError("Please enter your security PIN to proceed");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const user = await onLoginAttempt({
        username: activeTrader?.username || selectedTraderId,
        pin: pin.trim()
      });

      if (user) {
        onAuthenticate(user);
      } else {
        if (pin.trim() === activeTrader.pin) {
          onAuthenticate(activeTrader);
        } else {
          setError(`Incorrect security PIN for ${activeTrader?.name}. Please try again.`);
        }
      }
    } catch (err: any) {
      if (pin.trim() === activeTrader.pin) {
        onAuthenticate(activeTrader);
      } else {
        setError(err?.message || "Authentication error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#07080B] flex items-center justify-center p-3 sm:p-6 relative overflow-hidden bg-grid-subtle">
      {/* Subtle luxury ambient glow */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-gold-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-md bg-[#0D1018] border border-white/[0.08] rounded-3xl shadow-luxe backdrop-blur-2xl p-6 sm:p-8 z-10 my-4">
        
        {/* Header Icon & Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gold-500/10 border border-gold-500/25 text-gold-400 mb-3.5 shadow-sm">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            TradeMatrix <span className="text-gold-400 font-serif italic">Portal</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
            Institutional multi-asset terminal for Rakesh & Karthi
          </p>
        </div>

        {/* 2-Trader Account Selection Cards */}
        <div className="space-y-2.5 mb-5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-gold-400" />
            Select Trader Account
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {validTraders.slice(0, 2).map((trader) => {
              const isSelected = selectedTraderId === trader.id || selectedTraderId === trader.username;
              return (
                <div
                  key={trader.id}
                  onClick={() => {
                    setSelectedTraderId(trader.id);
                    setPin("");
                    setError(null);
                  }}
                  className={`cursor-pointer p-3.5 rounded-2xl border transition-all duration-200 flex flex-col justify-between select-none active:scale-[0.98] ${
                    isSelected
                      ? "bg-white/[0.08] border-gold-500/50 shadow-sm ring-1 ring-gold-500/30"
                      : "bg-[#07080B] border-white/[0.05] hover:border-white/[0.12]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl p-1.5 rounded-xl bg-[#11141E] border border-white/[0.06]">
                      {trader.avatar || "⚡"}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${isSelected ? "bg-gold-400" : "bg-zinc-700"}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm tracking-tight">{trader.name}</h3>
                    <p className="text-[10px] text-zinc-500 truncate mt-0.5">{trader.trading_style}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1">
                <KeyRound className="w-3 h-3 text-gold-400" />
                Security PIN Code
              </label>
              <span className="text-[10px] text-zinc-500 font-mono">
                {activeTrader.name}: {activeTrader.pin}
              </span>
            </div>
            
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError(null);
              }}
              placeholder={`Enter PIN for ${activeTrader.name}`}
              autoFocus
              className="w-full bg-[#07080B] border border-white/[0.08] text-white placeholder-zinc-600 px-4 py-3 rounded-2xl text-center text-lg font-mono tracking-widest focus:border-gold-500/60 focus:outline-none transition-all shadow-inner"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-gold-500 via-gold-400 to-amber-500 hover:brightness-110 active:scale-[0.98] text-black font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full" />
            ) : (
              <>
                <span>Access {activeTrader.name}&apos;s Workspace</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-white/[0.06] text-center">
          <p className="text-[11px] text-zinc-500">
            Gold Spot (XAUUSD) • NASDAQ 100 • US30 • NIFTY 50 • SENSEX
          </p>
        </div>

      </div>
    </div>
  );
};
