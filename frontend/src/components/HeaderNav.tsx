"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp, Plus, User, ShieldCheck, Sparkles, BookOpen, BarChart3, Brain, Settings, LogOut } from "lucide-react";
import { CurrencySymbol, UserProfile } from "../types/portfolio";

interface HeaderNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currency: CurrencySymbol;
  setCurrency: (c: CurrencySymbol) => void;
  activeTrader: UserProfile;
  onOpenTraderModal: () => void;
  onOpenProfileSettings: () => void;
  onOpenAddModal: () => void;
  onLogout: () => void;
  totalTrades: number;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  activeTab,
  setActiveTab,
  currency,
  setCurrency,
  activeTrader,
  onOpenTraderModal,
  onOpenProfileSettings,
  onOpenAddModal,
  onLogout,
  totalTrades
}) => {
  const [timeStr, setTimeStr] = useState<string>("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: "dashboard", label: "Dashboard & Analytics", icon: BarChart3 },
    { id: "journal", label: "Trade Journal", icon: BookOpen },
    { id: "diagnostics", label: "AI Mistake Solver", icon: ShieldCheck },
    { id: "strategy", label: "Strategy Hub & Backtest", icon: Sparkles },
    { id: "copilot", label: "AI Trading Assistant", icon: Brain }
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab("dashboard")}>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 p-[2px] shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  TradeMatrix AI
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full">
                  Portfolio Manager
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">AI Trading Co-pilot & Mistake Diagnostic Engine</p>
            </div>
          </div>

          {/* User Profile & Quick Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Active Trader Profile Badge */}
            <button
              onClick={onOpenProfileSettings}
              title="Click to view and edit trader details"
              className="flex items-center space-x-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 rounded-xl transition-all shadow-md"
            >
              <span className="text-base">{activeTrader.avatar || "⚡"}</span>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-white leading-tight">{activeTrader.name}</div>
                <div className="text-[10px] text-cyan-400 font-mono flex items-center space-x-1">
                  <Settings className="w-2.5 h-2.5" />
                  <span>Edit Profile</span>
                </div>
              </div>
            </button>

            {/* Switch Account */}
            <button
              onClick={onOpenTraderModal}
              title="Switch Trader Account"
              className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-cyan-400 rounded-xl transition-all"
            >
              <User className="w-4 h-4" />
            </button>

            {/* Currency Selector */}
            <div className="hidden lg:flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
              {(["$", "₹", "€", "£"] as CurrencySymbol[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                    currency === c
                      ? "bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/20"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              title="Log Out"
              className="p-2.5 bg-slate-900 hover:bg-rose-950/50 border border-slate-800 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 rounded-xl transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Add Trade Button */}
            <button
              onClick={onOpenAddModal}
              className="hidden sm:flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus className="w-4 h-4" />
              <span>Log New Trade</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation (Desktop & Tablet) */}
        <nav className="hidden md:flex space-x-1 overflow-x-auto pb-3 pt-1 scrollbar-none border-t border-slate-900">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-slate-900 text-cyan-400 border border-cyan-500/30 shadow-md shadow-cyan-500/5"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-slate-500"}`} />
                <span>{item.label}</span>
                {item.id === "journal" && totalTrades > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-slate-800 text-slate-300 rounded-md font-mono">
                    {totalTrades}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
