import React, { useState } from 'react';
import { Play, Pause, SkipForward, RotateCcw, FastForward, Activity } from 'lucide-react';
import { ReplayState } from '@/types';

interface ReplayBarProps {
  symbol: string;
  timeframe: string;
  replayState: ReplayState | null;
  onStepForward: () => void;
  onReset: () => void;
}

export const ReplayBar: React.FC<ReplayBarProps> = ({
  symbol,
  timeframe,
  replayState,
  onStepForward,
  onReset
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="h-full bg-slate-950 p-4 font-mono text-xs border-t border-slate-800 flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <RotateCcw className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-slate-100 text-sm">PAPER REPLAY MODE — {symbol} ({timeframe})</span>
        </div>

        <div className="flex items-center space-x-2 bg-slate-900 px-3 py-1 rounded border border-slate-800">
          <span className="text-slate-400">BAR:</span>
          <span className="font-bold text-emerald-400">
            {replayState ? `${replayState.current_index + 1} / ${replayState.total_candles}` : '0 / 0'}
          </span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center space-x-3 bg-slate-900 p-3 rounded-xl border border-slate-800 justify-center">
        <button
          onClick={onReset}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition"
          title="Reset Replay"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={onStepForward}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 font-bold text-white rounded-lg transition flex items-center space-x-1.5 shadow-lg shadow-emerald-600/30"
        >
          <SkipForward className="w-4 h-4" />
          <span>STEP CANDLE</span>
        </button>
      </div>

      {/* Signal Output at Replay Bar */}
      {replayState && (
        <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-bold">REPLAY STRATEGY EVALUATION:</span>
            <span className={`px-2 py-0.5 rounded font-black text-xs ${replayState.signal.signal === 'BUY' ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-slate-950'}`}>
              {replayState.signal.signal} ({replayState.signal.strategy_score}/100)
            </span>
          </div>
          <div className="text-[11px] text-slate-300">
            "{replayState.signal.ai_explanation.ai_comment}"
          </div>
        </div>
      )}
    </div>
  );
};
