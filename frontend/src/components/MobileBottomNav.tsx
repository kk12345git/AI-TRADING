"use client";

import React from "react";
import { BarChart2, BookOpen, Users, Plus, Settings } from "lucide-react";
import { UserProfile } from "../types/portfolio";

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAddModal: () => void;
  onOpenSettings: () => void;
  activeTrader: UserProfile;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onOpenSettings,
  activeTrader
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 md:hidden pb-safe">
      <div className="flex items-center justify-around h-16 px-2 relative">
        
        {/* Tab 1: Trade Register */}
        <button
          onClick={() => setActiveTab("register")}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            activeTab === "register" ? "text-cyan-400 font-bold" : "text-slate-400 hover:text-white"
          }`}
        >
          <BookOpen className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Register</span>
        </button>

        {/* Tab 2: Performance Reports & Dashboard */}
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            activeTab === "dashboard" ? "text-cyan-400 font-bold" : "text-slate-400 hover:text-white"
          }`}
        >
          <BarChart2 className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Reports</span>
        </button>

        {/* Center: Quick Take Trade Floating Action Button */}
        <div className="flex flex-col items-center justify-center px-2">
          <button
            onClick={onOpenAddModal}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 to-emerald-500 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-500/30 active:scale-95 transition-all -mt-5 border-4 border-slate-950"
            title="Log New Trade Entry"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
          <span className="text-[9px] font-bold text-slate-300 mt-0.5">Log Trade</span>
        </div>

        {/* Tab 3: 2 Traders Comparison */}
        <button
          onClick={() => setActiveTab("comparison")}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            activeTab === "comparison" ? "text-cyan-400 font-bold" : "text-slate-400 hover:text-white"
          }`}
        >
          <Users className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">2 Traders</span>
        </button>

        {/* Tab 4: Profile / Settings */}
        <button
          onClick={onOpenSettings}
          className="flex flex-col items-center justify-center flex-1 py-1 text-slate-400 hover:text-white transition-all"
        >
          <span className="text-base leading-none mb-0.5">{activeTrader.avatar || "⚡"}</span>
          <span className="text-[10px]">Profile</span>
        </button>

      </div>
    </div>
  );
};
