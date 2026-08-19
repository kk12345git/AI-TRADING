import React, { useEffect, useState } from 'react';
import { BookOpen, Plus, ShieldCheck } from 'lucide-react';
import { JournalEntry } from '@/types';
import { api } from '@/services/api';

export const TradeJournalPanel: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  useEffect(() => {
    loadJournal();
  }, []);

  const loadJournal = async () => {
    try {
      const data = await api.getJournal();
      setEntries(data);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="h-full bg-slate-950 p-4 font-mono text-xs border-t border-slate-800 flex flex-col space-y-4 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-slate-100 text-sm">MY TRADE JOURNAL</span>
        </div>
        <span className="text-slate-400">{entries.length} LOGGED SETUPS</span>
      </div>

      {entries.length === 0 ? (
        <div className="bg-slate-900 p-8 rounded-xl border border-slate-800 text-center text-slate-400">
          No trade setups logged yet. Use the <span className="text-blue-400 font-bold">LOG SETUP TO TRADE JOURNAL</span> button on the AI Indicator panel to record live strategy setups.
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <div key={entry.id || entry.timestamp} className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-100">{entry.symbol}</span>
                  <span className="text-[10px] px-1 bg-slate-800 text-slate-400 rounded">{entry.exchange}</span>
                  <span className={`px-2 py-0.5 rounded font-black text-[10px] ${entry.direction === 'BUY' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-red-400'}`}>
                    {entry.direction}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">{entry.timestamp}</div>
              </div>

              <div className="grid grid-cols-4 gap-2 text-[11px] pt-1">
                <div>ENTRY: <span className="font-bold text-slate-200">₹{entry.entry}</span></div>
                <div>SL: <span className="font-bold text-red-400">₹{entry.sl}</span></div>
                <div>TARGET: <span className="font-bold text-emerald-400">₹{entry.target}</span></div>
                <div>SCORE: <span className="font-bold text-blue-400">{entry.strategy_score}/100</span></div>
              </div>

              <div className="text-[10px] text-slate-400 italic bg-slate-950 p-2 rounded">
                "{entry.ai_explanation}"
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
