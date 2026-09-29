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
      setError("Please enter your security PIN");
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
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-3 sm:p-6 relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/4 left-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      <div className="relative w-full max-w-lg bg-slate-900/95 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl p-5 sm:p-8 z-10 my-4">
        
        {/* Header Icon & Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 text-cyan-400 mb-3 shadow-lg shadow-cyan-500/10">
            <Lock className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Trader Authentication Gate
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            Select your account to access your personal trade register and reports
          </p>
        </div>

        {/* 2-Trader Account Selection Cards */}
        <div className="space-y-2.5 mb-5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
            Select Trader (2 Persons)
          </label>
          <div className="grid grid-cols-2 gap-2.5">
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
                  className={`cursor-pointer p-3 sm:p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between select-none active:scale-[0.98] ${
                    isSelected
                      ? "bg-slate-850 border-cyan-500 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500"
                      : "bg-slate-950/70 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl p-1.5 rounded-xl bg-slate-900 border border-slate-800">
                      {trader.avatar || "⚡"}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${
                      isSelected
                        ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                        : "bg-slate-800 text-slate-400 border-slate-700"
                    }`}>
                      {trader.username}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-white text-sm truncate">{trader.name}</h3>
                    <p className="text-[10px] text-emerald-400 font-mono mt-0.5 font-semibold">
                      {trader.base_currency} {trader.account_capital.toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PIN Entry Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                PIN for {activeTrader?.name}
              </label>
              <span className="text-[10px] text-cyan-400">
                Default: <strong className="text-cyan-300">{activeTrader?.pin || "1234"}</strong>
              </span>
            </div>
            <div className="relative">
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={8}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError(null);
                }}
                placeholder="Enter 4-digit PIN..."
                className="w-full bg-slate-950 border border-slate-700/80 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-white placeholder-slate-500 px-4 py-3 rounded-xl text-center text-lg tracking-widest font-mono transition-all outline-none"
                autoFocus
              />
            </div>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 active:scale-[0.98] text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block animate-spin mr-1">⏳</span>
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
            Enter Dashboard & Register
            <ArrowRight className="w-4 h-4 ml-0.5" />
          </button>
        </form>

        {/* 1-Tap Quick Unlock for fast mobile testing */}
        <div className="mt-5 pt-4 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-500 mb-2 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            1-Tap Quick Access:
          </p>
          <div className="flex items-center justify-center gap-2">
            {traders.slice(0, 2).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleQuickDemoUnlock(t)}
                className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 active:bg-slate-600 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
              >
                <span>{t.avatar}</span>
                <span>{t.name.split(" ")[0]}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
