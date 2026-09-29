"use client";

import React from "react";
import {
  TrendingUp, Plus, Users, ShieldCheck, BarChart2, BookOpen,
  Settings, LogOut, Lock, ArrowLeftRight
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
  totalTrades
}) => {
  const otherTrader = allTraders.find(t => t.id !== activeTrader.id) || allTraders[0];

  const navItems = [
    { id: "dashboard", label: "Performance Dashboard", desc: "Weekly, Monthly, Quarterly, Half, Annually", icon: BarChart2 },
    { id: "register", label: "Trade Register", desc: "Daily Points & P&L Log", icon: BookOpen },
    { id: "comparison", label: "Traders Comparison", desc: "Trader 1 vs Trader 2", icon: Users }
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Bar */}
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & App Name */}
          <div
            className="flex items-center space-x-3 cursor-pointer select-none"
            onClick={() => setActiveTab("dashboard")}
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-500 p-[2px] shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-black tracking-tight text-white">
                  TradeRegister <span className="text-cyan-400 font-medium text-sm">PRO</span>
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                  Authenticated
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Points & P&L Register • Periodic Performance Reports
              </p>
            </div>
          </div>

          {/* Center Tabs Navigation */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Active Trader & Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Quick Switch between the 2 Persons */}
            {otherTrader && otherTrader.id !== activeTrader.id && (
              <button
                onClick={() => onSwitchTrader(otherTrader)}
                title={`Switch to ${otherTrader.name}`}
                className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-xs text-slate-300 hover:text-white transition-all"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-cyan-400" />
                <span>Switch to {otherTrader.name.split(" ")[0]}</span>
              </button>
            )}

            {/* Active Trader Profile Pill */}
            <div
              onClick={onOpenProfileSettings}
              title="Click to view & edit trader profile"
              className="flex items-center space-x-2.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-850 border border-cyan-500/40 rounded-2xl cursor-pointer transition-all shadow-md group"
            >
              <span className="text-xl p-1 rounded-xl bg-slate-950 border border-slate-800">
                {activeTrader.avatar || "⚡"}
              </span>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-white leading-tight group-hover:text-cyan-400 transition-colors">
                  {activeTrader.name}
                </div>
                <div className="text-[10px] text-emerald-400 font-mono">
                  {currency}{activeTrader.account_capital.toLocaleString()}
                </div>
              </div>
              <Settings className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-colors hidden sm:block ml-1" />
            </div>

            {/* Take New Trade Button */}
            <button
              onClick={onOpenAddModal}
              className="px-3.5 sm:px-4 py-2 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 active:scale-[0.98] text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Take Trade</span>
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

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden items-center justify-between pb-3 pt-1 border-t border-slate-900 gap-1 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold text-center flex items-center justify-center space-x-1 whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-cyan-500 text-slate-950 font-black"
                    : "text-slate-400 hover:text-white bg-slate-900"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
