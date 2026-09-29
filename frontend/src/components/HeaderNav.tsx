"use client";

import React from "react";
import {
  TrendingUp, Plus, Users, ShieldCheck, BarChart2, BookOpen,
  Settings, LogOut, Lock, ArrowLeftRight, Wallet
} from "lucide-react";
import { CurrencySymbol, UserProfile } from "../types/portfolio";

interface HeaderNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currency: CurrencySymbol;
  setCurrency: (c: CurrencySymbol) => void;
  activeTrader: UserProfile;
  allTraders: UserProfile[];
  onSwitchTrader: (trader: UserProfile) => void;
  onOpenProfileSettings: () => void;
  onOpenAddModal: () => void;
  onLogout: () => void;
  totalTrades: number;
  netPnl?: number;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  activeTab,
  setActiveTab,
  currency,
  setCurrency,
  activeTrader,
  allTraders,
  onSwitchTrader,
  onOpenProfileSettings,
  onOpenAddModal,
  onLogout,
  totalTrades,
  netPnl = 0
}) => {
  const otherTrader = allTraders.find(t => t.id !== activeTrader.id) || allTraders[0];

  // Calculated Capital = Starting Capital (0) + Net P&L
  const currentCapital = Number(((activeTrader.account_capital || 0) + netPnl).toFixed(2));
  const isCapitalPositive = currentCapital >= 0;

  const navItems = [
    { id: "register", label: "Trade Register", desc: "Daily Points & P&L Log", icon: BookOpen },
    { id: "dashboard", label: "Performance Reports", desc: "Weekly, Monthly, Quarterly, Half, Annually", icon: BarChart2 },
    { id: "comparison", label: "Rakesh vs Karthi", desc: "2-Trader Comparison", icon: Users }
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800 shadow-2xl">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        
        {/* Main Bar */}
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Trader Badge */}
          <div
            className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer select-none"
            onClick={() => setActiveTab("register")}
          >
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-500 p-[2px] shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h1 className="text-base sm:text-xl font-black tracking-tight text-white">
                  TradeRegister
                </h1>
                <span className="px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                  {activeTrader.name}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium hidden sm:block">
                Points & Daily Profit/Loss Journal
              </p>
            </div>
          </div>

          {/* Center Tabs Navigation (Desktop) */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-black"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Active Trader & Capital */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Quick Switch between Rakesh & Karthi */}
            {otherTrader && otherTrader.id !== activeTrader.id && (
              <button
                onClick={() => onSwitchTrader(otherTrader)}
                title={`Switch trader to ${otherTrader.name}`}
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-xs text-slate-300 hover:text-white transition-all active:scale-95"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-cyan-400" />
                <span>Switch to {otherTrader.name}</span>
              </button>
            )}

            {/* Calculated Capital Display & Profile Pill */}
            <div
              onClick={onOpenProfileSettings}
              title="Click to view & edit trader profile"
              className="flex items-center space-x-2 px-2.5 sm:px-3 py-1.5 bg-slate-900 hover:bg-slate-850 border border-cyan-500/40 rounded-2xl cursor-pointer transition-all shadow-md group"
            >
              <span className="text-lg sm:text-xl p-1 rounded-xl bg-slate-950 border border-slate-800">
                {activeTrader.avatar || "⚡"}
              </span>
              <div className="text-left">
                <div className="text-[11px] sm:text-xs font-bold text-white leading-tight group-hover:text-cyan-400 transition-colors">
                  {activeTrader.name}
                </div>
                <div className={`text-[10px] sm:text-[11px] font-mono font-bold flex items-center gap-0.5 ${
                  isCapitalPositive ? "text-emerald-400" : "text-rose-400"
                }`}>
                  <Wallet className="w-3 h-3 text-cyan-400" />
                  {currentCapital >= 0 ? `${currency}${currentCapital.toLocaleString()}` : `-${currency}${Math.abs(currentCapital).toLocaleString()}`}
                </div>
              </div>
              <Settings className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-colors hidden sm:block ml-1" />
            </div>

            {/* Take New Trade Button (Desktop) */}
            <button
              onClick={onOpenAddModal}
              className="hidden sm:flex px-3.5 sm:px-4 py-2 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 active:scale-[0.98] text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-cyan-500/20 transition-all items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Log Trade</span>
            </button>

            {/* Lock / Logout Button */}
            <button
              onClick={onLogout}
              title="Lock application and logout"
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-900 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 text-xs font-semibold transition-all flex items-center space-x-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lock</span>
            </button>

          </div>

        </div>

      </div>
    </header>
  );
};
