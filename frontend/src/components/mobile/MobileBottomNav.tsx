import React from 'react';
import { BarChart2, Cpu, Layers, Star, SlidersHorizontal, BookOpen } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab
}) => {
  const navItems = [
    { key: 'CHART', label: 'Chart', icon: BarChart2 },
    { key: 'WATCHLIST', label: 'Watchlist', icon: Star },
    { key: 'SIGNALS', label: 'AI Signals', icon: Cpu },
    { key: 'SCREENER', label: 'Screener', icon: SlidersHorizontal },
    { key: 'OPTION CHAIN', label: 'Options', icon: Layers },
    { key: 'JOURNAL', label: 'Journal', icon: BookOpen },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-slate-950/95 border-t border-slate-800 flex items-center justify-around z-50 backdrop-blur select-none">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.key || (item.key === 'SIGNALS' && activeTab === 'SIGNALS');
        return (
          <button
            key={item.key}
            onClick={() => setActiveTab(item.key)}
            className={`flex flex-col items-center justify-center w-full h-full space-y-0.5 transition ${
              isActive ? 'text-emerald-400 font-bold' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
            <span className="text-[10px] tracking-tight">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
