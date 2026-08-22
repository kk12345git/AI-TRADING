"use client";

import React from "react";
import { BarChart3, BookOpen, ShieldCheck, Sparkles, Brain, User, Plus } from "lucide-react";

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAddModal: () => void;
  onOpenProfileModal: () => void;
  totalTrades: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onOpenProfileModal,
  totalTrades
}) => {
  const items = [
    { id: "dashboard", label: "Analytics", icon: BarChart3 },
    { id: "journal", label: "Journal", icon: BookOpen, count: totalTrades },
    { id: "diagnostics", label: "Diagnostics", icon: ShieldCheck },
    { id: "strategy", label: "Strategy", icon: Sparkles },
    { id: "copilot", label: "AI Copilot", icon: Brain }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/80 px-2 py-2 shadow-2xl">
      <div className="flex items-center justify-around">
        
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center space-y-1 p-2 rounded-xl transition-all relative ${
                isActive ? "text-cyan-400 font-bold" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.id === "journal" && totalTrades > 0 && (
                  <span className="absolute -top-1.5 -right-2 px-1 py-0.2 text-[9px] font-mono font-bold bg-cyan-500 text-slate-950 rounded-full">
                    {totalTrades}
                  </span>
                )}
              </div>
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}

        {/* Floating Quick Add Button */}
        <button
          onClick={onOpenAddModal}
          className="p-2.5 bg-gradient-to-tr from-cyan-500 to-indigo-600 text-slate-950 font-bold rounded-2xl shadow-lg shadow-cyan-500/30 flex items-center justify-center transform active:scale-95"
        >
          <Plus className="w-5 h-5 text-slate-950" />
        </button>

        {/* Profile Settings */}
        <button
          onClick={onOpenProfileModal}
          className="flex flex-col items-center justify-center space-y-1 p-2 rounded-xl text-slate-500 hover:text-slate-300 transition-all"
        >
          <User className="w-5 h-5" />
          <span className="text-[10px]">Profile</span>
        </button>

      </div>
    </div>
  );
};
