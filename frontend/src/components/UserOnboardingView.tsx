"use client";

import React, { useState } from "react";
import { UserOnboardInput, CurrencySymbol, TradingStyle, AssetClass } from "../types/portfolio";
import { TrendingUp, UserPlus, LogIn, ShieldCheck, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";

interface UserOnboardingViewProps {
  onLogin: (email: string) => Promise<boolean>;
  onOnboard: (input: UserOnboardInput) => Promise<void>;
}

export const UserOnboardingView: React.FC<UserOnboardingViewProps> = ({ onLogin, onOnboard }) => {
  const [mode, setMode] = useState<"login" | "onboard">("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Onboarding fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currency, setCurrency] = useState<CurrencySymbol>("$");
  const [style, setStyle] = useState<TradingStyle>("Day Trader");
  const [market, setMarket] = useState<AssetClass>("Stocks");
  const [capital, setCapital] = useState<number>(10000);
  const [riskPct, setRiskPct] = useState<number>(1.0);
  const [goals, setGoals] = useState("Consistency & Risk Discipline");

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) return;
    setLoading(true);
    setErrorMsg("");

    const success = await onLogin(loginEmail.trim());
    if (!success) {
      setErrorMsg("No trader profile found for this email. Please complete onboarding below!");
      setEmail(loginEmail);
      setMode("onboard");
    }
    setLoading(false);
  };

  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !name.trim()) return;
    setLoading(true);

    await onOnboard({
      email: email.trim(),
      name: name.trim(),
      avatar: "⚡",
      base_currency: currency,
      trading_style: style,
      primary_market: market,
      account_capital: Number(capital),
      risk_per_trade_pct: Number(riskPct),
      trading_goals: goals.trim()
    });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Glow Backdrops */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative w-full max-w-xl bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-8">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 p-[2px] shadow-lg shadow-cyan-500/25">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            TradeMatrix AI
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            AI-Powered Trading Portfolio Manager, Mistake Diagnostic & Strategy Engine
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 border border-slate-800 rounded-2xl">
          <button
            onClick={() => { setMode("login"); setErrorMsg(""); }}
            className={`py-2.5 text-xs font-bold rounded-xl transition-all ${
              mode === "login"
                ? "bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Trader Login
          </button>
          <button
            onClick={() => setMode("onboard")}
            className={`py-2.5 text-xs font-bold rounded-xl transition-all ${
              mode === "onboard"
                ? "bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Create Trader Profile
          </button>
        </div>

        {/* Login Form */}
        {mode === "login" ? (
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Enter Your Email Address</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="e.g. trader@domain.com"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                required
              />
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 font-medium">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center space-x-2"
            >
              <span>{loading ? "Logging in..." : "Open My Portfolio"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center text-xs text-slate-500">
              Don't have a profile yet?{" "}
              <button
                type="button"
                onClick={() => setMode("onboard")}
                className="text-cyan-400 font-semibold underline hover:text-cyan-300"
              >
                Complete Onboarding
              </button>
            </div>
          </form>
        ) : (
          /* Onboarding Form */
          <form onSubmit={handleOnboardSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Trader Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. alex@domain.com"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                  required
                />
              </div>
            </div>

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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Account Capital</label>
                <input
                  type="number"
                  value={capital}
                  onChange={(e) => setCapital(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Risk / Trade (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={riskPct}
                  onChange={(e) => setRiskPct(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  required
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

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Trading Goals & Rules</label>
              <textarea
                rows={2}
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                placeholder="What is your primary trading focus? e.g. Eliminate FOMO, Stick to 1:2 R:R"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center space-x-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>{loading ? "Creating Profile..." : "Create My Portfolio & Launch App"}</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
