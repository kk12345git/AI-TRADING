"use client";

import React, { useState } from "react";
import { UserProfile, UserLoginInput } from "../types/portfolio";
import { Lock, ShieldCheck, KeyRound, ArrowRight, UserCheck, AlertCircle, Sparkles } from "lucide-react";

interface AuthPortalProps {
  traders: UserProfile[];
  onAuthenticate: (trader: UserProfile) => void;
  onLoginAttempt: (creds: UserLoginInput) => Promise<UserProfile | null>;
}

export const AuthPortal: React.FC<AuthPortalProps> = ({
  traders,
  onAuthenticate,
  onLoginAttempt
}) => {
  const [selectedTraderId, setSelectedTraderId] = useState<string>(traders[0]?.id || "trader_1");
  const [pin, setPin] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const activeTrader = traders.find(t => t.id === selectedTraderId) || traders[0];

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pin.trim()) {
      setError("Please enter the security PIN");
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
        setError(`Incorrect PIN for ${activeTrader?.name || "this trader"}. Please try again.`);
      }
    } catch (err: any) {
      setError(err?.message || "Authentication error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoUnlock = (trader: UserProfile) => {
    setSelectedTraderId(trader.id);
    setPin(trader.pin);
    setError(null);
    onAuthenticate(trader);
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      <div className="relative w-full max-w-xl bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl p-8 md:p-10 z-10">
        
        {/* Header Icon & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 text-cyan-400 mb-4 shadow-lg shadow-cyan-500/10">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Trade Register & Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Secure Trader Authentication Gate • Select your account to view personal trade register and performance
          </p>
        </div>

        {/* 2-Trader Account Selection Cards */}
        <div className="space-y-3 mb-6">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-cyan-400" />
            Select Trader Account (2 Authorized Users)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {traders.slice(0, 2).map((trader) => {
              const isSelected = selectedTraderId === trader.id;
              return (
                <div
                  key={trader.id}
                  onClick={() => {
                    setSelectedTraderId(trader.id);
                    setPin("");
                    setError(null);
                  }}
                  className={`cursor-pointer relative p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                    isSelected
                      ? "bg-slate-800/90 border-cyan-500 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500"
                      : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-850"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl p-2 rounded-xl bg-slate-900 border border-slate-700/60">
                      {trader.avatar || "⚡"}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isSelected
                        ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                        : "bg-slate-800 text-slate-400 border-slate-700"
                    }`}>
                      {trader.username}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-white text-base">{trader.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{trader.trading_style}</p>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-2">
                      <span>Capital:</span>
                      <span className="font-semibold text-emerald-400">{trader.base_currency} {trader.account_capital.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PIN Entry Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                Enter Security PIN for {activeTrader?.name}
              </label>
              <span className="text-[11px] text-cyan-400/80">
                Default PIN: <strong className="text-cyan-300">{activeTrader?.pin || "1234"}</strong>
              </span>
            </div>
            <div className="relative">
              <input
                type="password"
                maxLength={10}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError(null);
                }}
                placeholder="Enter 4-digit security PIN..."
                className="w-full bg-slate-950 border border-slate-700/80 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-white placeholder-slate-500 px-4 py-3.5 rounded-xl text-center text-lg tracking-widest font-mono transition-all outline-none"
                autoFocus
              />
            </div>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 active:scale-[0.99] text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block animate-spin mr-2">⏳</span>
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
            Authenticate & Open Dashboard
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </form>

        {/* Quick Testing 1-Click Access Buttons */}
        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-500 mb-3 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Instant One-Click Login for Testing:
          </p>
          <div className="flex items-center justify-center gap-2">
            {traders.slice(0, 2).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleQuickDemoUnlock(t)}
                className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
              >
                <span>{t.avatar}</span>
                <span>Enter as {t.name.split(" ")[0]}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
