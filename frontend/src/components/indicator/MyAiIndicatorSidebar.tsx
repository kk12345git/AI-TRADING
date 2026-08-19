import React from 'react';
import {
  CheckCircle2, XCircle, AlertTriangle, Zap, ShieldAlert,
  ArrowUpRight, Target, Clock, Activity, ChevronRight, Info
} from 'lucide-react';
import { FullSignalPayload } from '@/types';

interface MyAiIndicatorSidebarProps {
  signalData: FullSignalPayload | null;
  onLogTrade: () => void;
}

export const MyAiIndicatorSidebar: React.FC<MyAiIndicatorSidebarProps> = ({
  signalData,
  onLogTrade
}) => {
  if (!signalData) {
    return (
      <div className="w-96 bg-slate-900/90 border-l border-slate-800 p-4 flex flex-col items-center justify-center text-slate-500 font-mono text-xs">
        <Activity className="w-6 h-6 animate-spin text-emerald-500 mb-2" />
        <span>Evaluating My Trading Strategy...</span>
      </div>
    );
  }

  const {
    signal,
    strategy_score,
    setup_lifecycle,
    trend_15m,
    setup_5m,
    entry_1m,
    conditions,
    ai_explanation,
    price
  } = signalData;

  const signalColors = {
    BUY: 'bg-emerald-600 text-white border-emerald-400 glow-green',
    SELL: 'bg-red-600 text-white border-red-400 glow-red',
    WAIT: 'bg-amber-500 text-slate-950 border-amber-300 glow-yellow',
    INVALID: 'bg-slate-700 text-slate-300 border-slate-500'
  };

  const tp = ai_explanation?.trade_plan;

  return (
    <aside className="w-[380px] bg-slate-900/95 border-l border-slate-800 flex flex-col h-full overflow-y-auto text-xs select-none">
      {/* Sidebar Header */}
      <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-emerald-400" />
          <span className="font-extrabold text-sm tracking-wider text-slate-100 font-mono">MY AI INDICATOR</span>
        </div>
        <div className="flex items-center space-x-1.5 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 font-mono text-[10px] text-slate-300">
          <Clock className="w-3 h-3 text-blue-400" />
          <span>{setup_lifecycle}</span>
        </div>
      </div>

      <div className="p-3.5 space-y-3.5">
        {/* 1. SIGNAL & STRATEGY SCORE BANNER */}
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400 font-mono tracking-wider">STRATEGY SIGNAL</div>
              <div className={`mt-1 px-4 py-1.5 rounded-lg border font-black text-lg tracking-widest text-center shadow-lg font-mono ${signalColors[signal]}`}>
                {signal}
              </div>
            </div>

            {/* Score Radial Meter */}
            <div className="flex flex-col items-center">
              <div className="text-[10px] text-slate-400 font-mono">STRATEGY SCORE</div>
              <div className="relative w-14 h-14 flex items-center justify-center mt-1">
                <svg className="w-14 h-14 transform -rotate-90">
                  <circle cx="28" cy="28" r="22" stroke="#1E293B" strokeWidth="4" fill="transparent" />
                  <circle
                    cx="28" cy="28" r="22"
                    stroke={strategy_score >= 80 ? '#10B981' : (strategy_score >= 50 ? '#F59E0B' : '#EF4444')}
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={138}
                    strokeDashoffset={138 - (138 * strategy_score) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute font-black text-sm font-mono text-slate-100">{strategy_score}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. MULTI-TIMEFRAME ANALYSIS */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 font-mono">
          <div className="text-[10px] font-bold text-slate-400 tracking-wider">MULTI-TIMEFRAME ALIGNMENT</div>
          <div className="grid grid-cols-3 gap-2 text-[11px]">
            <div className="bg-slate-900 p-2 rounded border border-slate-800/80">
              <div className="text-[9px] text-slate-500">15M TREND</div>
              <div className={`font-bold mt-0.5 ${trend_15m === 'BULLISH' ? 'text-emerald-400' : 'text-red-400'}`}>
                {trend_15m === 'BULLISH' ? '✓ Bullish' : '✗ Bearish'}
              </div>
            </div>
            <div className="bg-slate-900 p-2 rounded border border-slate-800/80">
              <div className="text-[9px] text-slate-500">5M SETUP</div>
              <div className="font-bold mt-0.5 text-amber-400 truncate">
                {setup_5m.includes('Continuation') ? '✓ HH / HL' : 'Ranging'}
              </div>
            </div>
            <div className="bg-slate-900 p-2 rounded border border-slate-800/80">
              <div className="text-[9px] text-slate-500">1M ENTRY</div>
              <div className={`font-bold mt-0.5 ${entry_1m.includes('Confirmed') ? 'text-emerald-400' : 'text-amber-400'}`}>
                {entry_1m.includes('Confirmed') ? '✓ Trigger' : '✗ Wait'}
              </div>
            </div>
          </div>
        </div>

        {/* INSTITUTIONAL INDICATORS: Volume Profile, FVG, MACD Divergence, Fibonacci */}
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3 font-mono">
          <div className="text-[10px] font-bold text-slate-400 tracking-wider text-emerald-400">INSTITUTIONAL METRICS</div>
          
          {/* Volume Profile */}
          {signalData.volume_profile && (
            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
              <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1">
                <span>VOLUME PROFILE (70% VA)</span>
                <span className="text-emerald-400">POC: {signalData.volume_profile.poc}</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                <div className="bg-slate-950 p-1 rounded border border-slate-800">
                  <div className="text-[8px] text-slate-500">VAL (Low)</div>
                  <div className="font-bold text-slate-200">{signalData.volume_profile.val}</div>
                </div>
                <div className="bg-slate-950 p-1 rounded border border-emerald-900/50 bg-emerald-950/20">
                  <div className="text-[8px] text-emerald-400">POC (Point Control)</div>
                  <div className="font-bold text-emerald-300">{signalData.volume_profile.poc}</div>
                </div>
                <div className="bg-slate-950 p-1 rounded border border-slate-800">
                  <div className="text-[8px] text-slate-500">VAH (High)</div>
                  <div className="font-bold text-slate-200">{signalData.volume_profile.vah}</div>
                </div>
              </div>
            </div>
          )}

          {/* MACD Divergence */}
          {signalData.macd_divergence && (
            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-[9px] text-slate-500">MACD DIVERGENCE</div>
                <div className={`font-bold text-[11px] ${signalData.macd_divergence.type.includes('BULLISH') ? 'text-emerald-400' : (signalData.macd_divergence.type.includes('BEARISH') ? 'text-red-400' : 'text-slate-400')}`}>
                  {signalData.macd_divergence.type.replace('_', ' ')}
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${signalData.macd_divergence.strength === 'STRONG' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                {signalData.macd_divergence.strength}
              </span>
            </div>
          )}

          {/* Fair Value Gaps (FVG) */}
          {signalData.fair_value_gaps && signalData.fair_value_gaps.length > 0 && (
            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
              <div className="text-[9px] text-slate-500">ACTIVE FAIR VALUE GAPS (FVG)</div>
              <div className="grid grid-cols-2 gap-1.5">
                {signalData.fair_value_gaps.slice(0, 4).map((fvg, idx) => (
                  <div key={idx} className={`p-1.5 rounded border text-[10px] ${fvg.type === 'BULLISH' ? 'bg-emerald-950/30 border-emerald-900/50 text-emerald-300' : 'bg-red-950/30 border-red-900/50 text-red-300'}`}>
                    <div className="font-bold text-[9px]">{fvg.type} FVG</div>
                    <div>{fvg.bottom} - {fvg.top}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Auto Fibonacci Levels */}
          {signalData.fibonacci_levels && (
            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 space-y-1">
              <div className="text-[9px] text-slate-500 mb-1">AUTO FIBONACCI RETRACEMENTS</div>
              <div className="grid grid-cols-3 gap-1 text-[9px] text-center">
                <div className="bg-slate-950 p-1 rounded border border-slate-800">
                  <span className="text-slate-500">0.382:</span> <span className="font-bold text-slate-200">{signalData.fibonacci_levels.fib_382}</span>
                </div>
                <div className="bg-slate-950 p-1 rounded border border-amber-900/40 bg-amber-950/20">
                  <span className="text-amber-400">0.500:</span> <span className="font-bold text-amber-300">{signalData.fibonacci_levels.fib_500}</span>
                </div>
                <div className="bg-slate-950 p-1 rounded border border-emerald-900/40 bg-emerald-950/20">
                  <span className="text-emerald-400">0.618:</span> <span className="font-bold text-emerald-300">{signalData.fibonacci_levels.fib_618}</span>
                </div>
              </div>
            </div>
          )}
        </div>


        {/* 3. STRATEGY CONDITION CHECKLIST */}
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[11px] text-slate-200 tracking-wider font-mono">MY STRATEGY CONDITIONS</span>
            <span className="text-[10px] text-emerald-400 font-mono">{conditions.filter(c => c.is_satisfied).length}/{conditions.length} MET</span>
          </div>

          <div className="space-y-1.5 font-mono">
            {conditions.map((cond) => (
              <div
                key={cond.id}
                className={`p-2 rounded-lg border flex items-center justify-between text-[11px] transition ${
                  cond.is_satisfied
                    ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-200'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {cond.is_satisfied ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                  )}
                  <div>
                    <div className="font-semibold text-slate-200">{cond.name}</div>
                    <div className="text-[10px] text-slate-400">{cond.rule_text}</div>
                  </div>
                </div>
                {cond.current_value && (
                  <div className="text-right text-[10px]">
                    <div className="font-bold text-slate-300">{cond.current_value}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 4. TRADE PLAN (ENTRY / SL / TARGETS) */}
        {tp && (
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 font-mono">
            <div className="flex items-center justify-between text-slate-200 font-bold text-[11px]">
              <span className="flex items-center space-x-1.5">
                <Target className="w-3.5 h-3.5 text-blue-400" />
                <span>TRADE EXECUTION PLAN</span>
              </span>
              <span className="text-[10px] text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                R:R {tp.risk_reward || '1:2.5'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <div className="text-[9px] text-slate-500">ENTRY ZONE</div>
                <div className="font-bold text-slate-100 mt-0.5">{tp.entry_zone || `${price}`}</div>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <div className="text-[9px] text-red-400">STOP LOSS (SL)</div>
                <div className="font-bold text-red-400 mt-0.5">{tp.stop_loss || '—'}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5 text-[10px]">
              <div className="bg-slate-900 p-1.5 rounded border border-slate-800 text-center">
                <div className="text-[9px] text-emerald-500">TARGET 1</div>
                <div className="font-bold text-emerald-400 mt-0.5">{tp.target_1 || '—'}</div>
              </div>
              <div className="bg-slate-900 p-1.5 rounded border border-slate-800 text-center">
                <div className="text-[9px] text-emerald-500">TARGET 2</div>
                <div className="font-bold text-emerald-400 mt-0.5">{tp.target_2 || '—'}</div>
              </div>
              <div className="bg-slate-900 p-1.5 rounded border border-slate-800 text-center">
                <div className="text-[9px] text-emerald-500">TARGET 3</div>
                <div className="font-bold text-emerald-400 mt-0.5">{tp.target_3 || '—'}</div>
              </div>
            </div>
          </div>
        )}

        {/* 5. TRIGGER & INVALIDATION */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 font-mono text-[11px]">
          <div className="flex items-start space-x-2 text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-200">MISSING CONFIRMATION:</span>
              <p className="text-[10px] text-amber-200/80 mt-0.5">{ai_explanation.trigger_required}</p>
            </div>
          </div>
          <div className="flex items-start space-x-2 text-slate-400 pt-1 border-t border-slate-800">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-300">INVALIDATION LEVEL:</span>
              <p className="text-[10px] text-red-300/80 mt-0.5">{ai_explanation.invalidation}</p>
            </div>
          </div>
        </div>

        {/* 6. AI EXPLANATION LAYER */}
        <div className="bg-gradient-to-b from-slate-950 to-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center space-x-1.5 text-emerald-400 font-mono font-bold text-[11px]">
            <Info className="w-3.5 h-3.5" />
            <span>AI EXPLANATION LAYER</span>
          </div>
          <p className="text-slate-300 leading-relaxed font-sans text-xs bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
            "{ai_explanation.ai_comment}"
          </p>
        </div>

        {/* Log Trade Button */}
        <button
          onClick={onLogTrade}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 font-mono font-bold text-white rounded-xl shadow-lg transition flex items-center justify-center space-x-2"
        >
          <span>LOG SETUP TO TRADE JOURNAL</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
