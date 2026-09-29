"use client";

import React from "react";
import {
  TrendingUp, Plus, Users, ShieldCheck, BarChart2, BookOpen,
  Settings, LogOut, Lock, ArrowLeftRight, Wallet, Calculator
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
  onOpenCalculator?: () => void;
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
  onOpenCalculator,
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
    <header className="sticky top-0 z-40 bg-[#07080B]/90 backdrop-blur-xl border-b border-white/[0.07] shadow-2xl">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        
        {/* Main Bar */}
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Trader Badge */}
          <div
            className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer select-none"
            onClick={() => setActiveTab("register")}
          >
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-gold-500 via-amber-400 to-emerald-400 p-[1.5px] shadow-sm">
              <div className="w-full h-full bg-[#08090C] rounded-[14px] flex items-center justify-center">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-gold-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white font-sans">
                  TradeMatrix<span className="text-gold-400 font-serif italic ml-0.5">Terminal</span>
                </h1>
                <span className="px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase bg-gold-500/10 text-gold-400 border border-gold-500/25 rounded-full tracking-wider">
                  {activeTrader.name}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-zinc-400 font-medium hidden sm:block">
                Institutional Lot Sizing & Performance Register
              </p>
            </div>
          </div>

          {/* Center Tabs Navigation (Desktop) */}
          <nav className="hidden md:flex items-center space-x-1 bg-[#0F121C] p-1.5 rounded-2xl border border-white/[0.06] shadow-sm">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-white/[0.1] text-white border border-white/[0.12] shadow-sm font-bold"
                      : "text-zinc-400 hover:text-white hover:bg-white/[0.03]"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-gold-400" : "text-zinc-400"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            
            {/* Real-time Lot Sizer & Calculator Shortcut Button */}
            {onOpenCalculator && (
              <button
                onClick={onOpenCalculator}
                title="Open Real-time Lot Size & Risk Calculator"
                className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 bg-[#121622] hover:bg-[#181D2C] border border-gold-500/30 rounded-xl text-xs text-gold-300 transition-all active:scale-95 shadow-sm"
              >
                <Calculator className="w-3.5 h-3.5 text-gold-400" />
                <span className="font-semibold">Lot Sizer</span>
              </button>
            )}

            {/* Quick Switch between Rakesh & Karthi */}
            {otherTrader && otherTrader.id !== activeTrader.id && (
              <button
                onClick={() => onSwitchTrader(otherTrader)}
                title={`Switch trader to ${otherTrader.name}`}
                className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 bg-[#121622] hover:bg-[#181D2C] border border-white/[0.08] rounded-xl text-xs text-zinc-300 hover:text-white transition-all active:scale-95"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-gold-400" />
                <span className="text-[11px] font-medium">{otherTrader.name}</span>
              </button>
            )}

            {/* Calculated Capital Display & Profile Pill */}
            <div
              onClick={onOpenProfileSettings}
              title="Click to view & edit trader profile"
              className="flex items-center space-x-2 px-2.5 sm:px-3 py-1.5 bg-[#11141E] hover:bg-[#151926] border border-white/[0.08] hover:border-gold-500/40 rounded-2xl cursor-pointer transition-all shadow-luxe-sm group"
            >
              <span className="text-base sm:text-lg p-1 rounded-xl bg-[#07080B] border border-white/[0.06]">
                {activeTrader.avatar || "⚡"}
              </span>
              <div className="text-left">
                <div className="text-[11px] sm:text-xs font-semibold text-zinc-200 leading-tight group-hover:text-gold-400 transition-colors">
                  {activeTrader.name}
                </div>
                <div className={`text-[10px] sm:text-[11px] font-mono font-bold flex items-center gap-1 ${
                  isCapitalPositive ? "text-emerald-400" : "text-rose-400"
                }`}>
                  <Wallet className="w-2.5 h-2.5 text-zinc-500" />
                  {currentCapital >= 0 ? `${currency}${currentCapital.toLocaleString()}` : `-${currency}${Math.abs(currentCapital).toLocaleString()}`}
                </div>
              </div>
              <Settings className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 transition-colors hidden sm:block ml-1" />
            </div>

            {/* Log Trade Button (Desktop) */}
            <button
              onClick={onOpenAddModal}
              className="hidden sm:flex px-3.5 sm:px-4 py-2 bg-gradient-to-r from-gold-500 to-amber-500 hover:brightness-110 active:scale-[0.98] text-black font-black rounded-xl text-xs shadow-md transition-all items-center space-x-1.5"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Log Trade</span>
            </button>

            {/* Lock / Logout Button */}
            <button
              onClick={onLogout}
              title="Lock application and logout"
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#11141E] hover:bg-rose-950/30 border border-white/[0.06] hover:border-rose-500/30 text-zinc-400 hover:text-rose-400 text-xs font-semibold transition-all flex items-center space-x-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Lock</span>
            </button>

          </div>

        </div>

      </div>
    </header>
  );
};
