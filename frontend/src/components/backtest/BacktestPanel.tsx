import React, { useState } from 'react';
import { Play, TrendingUp, Award, AlertCircle, BarChart3, RefreshCw } from 'lucide-react';
import { BacktestResult } from '@/types';
import { api } from '@/services/api';

interface BacktestPanelProps {
  symbol: string;
  exchange: string;
  timeframe: string;
}

export const BacktestPanel: React.FC<BacktestPanelProps> = ({
  symbol,
  exchange,
  timeframe
}) => {
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRunBacktest = async () => {
    setIsLoading(true);
    try {
      const res = await api.runBacktest(symbol, exchange, timeframe);
      setResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full bg-slate-950 p-4 font-mono text-xs border-t border-slate-800 flex flex-col space-y-4 overflow-y-auto">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-4 h-4 text-blue-400" />
          <span className="font-bold text-slate-100 text-sm">STRATEGY BACKTESTING ENGINE</span>
          <span className="text-slate-500 font-mono">[{symbol} - {timeframe}]</span>
        </div>

        <button
          onClick={handleRunBacktest}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-bold rounded-xl transition flex items-center space-x-2 shadow-lg shadow-blue-600/30"
        >
          {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          <span>RUN BACKTEST</span>
        </button>
      </div>

      {result ? (
        <div className="space-y-4">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-6 gap-3 text-center">
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-500">TOTAL TRADES</div>
              <div className="font-black text-lg text-slate-100 mt-0.5">{result.total_trades}</div>
            </div>
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-500">WIN RATE</div>
              <div className="font-black text-lg text-emerald-400 mt-0.5">{result.win_rate}%</div>
            </div>
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-500">PROFIT FACTOR</div>
              <div className="font-black text-lg text-blue-400 mt-0.5">{result.profit_factor}</div>
            </div>
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-500">TOTAL RETURN</div>
              <div className="font-black text-lg text-emerald-400 mt-0.5">+{result.total_return_pct}%</div>
            </div>
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-500">MAX DRAWDOWN</div>
              <div className="font-black text-lg text-red-400 mt-0.5">-{result.max_drawdown_pct}%</div>
            </div>
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-500">AVG R-MULTIPLE</div>
              <div className="font-black text-lg text-purple-400 mt-0.5">{result.avg_r}R</div>
            </div>
          </div>

          {/* Trade Execution History */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-3">
            <div className="font-bold text-slate-200 mb-2">EXECUTED TRADES LOG</div>
            <div className="max-h-48 overflow-y-auto">
              <table className="w-full text-left text-[11px]">
                <thead className="text-slate-500 border-b border-slate-800 sticky top-0 bg-slate-900">
                  <tr>
                    <th className="py-1">#</th>
                    <th className="py-1">DIR</th>
                    <th className="py-1">ENTRY</th>
                    <th className="py-1">EXIT</th>
                    <th className="py-1">SL</th>
                    <th className="py-1">TARGET</th>
                    <th className="py-1 text-right">P/L (₹)</th>
                    <th className="py-1 text-right">RESULT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {result.trades.map((t) => (
                    <tr key={t.trade_no} className="hover:bg-slate-800/40">
                      <td className="py-1 text-slate-400">{t.trade_no}</td>
                      <td className="py-1 font-bold text-emerald-400">{t.direction}</td>
                      <td className="py-1 text-slate-200">₹{t.entry_price}</td>
                      <td className="py-1 text-slate-200">₹{t.exit_price}</td>
                      <td className="py-1 text-red-400">₹{t.stop_loss}</td>
                      <td className="py-1 text-emerald-400">₹{t.target}</td>
                      <td className={`py-1 text-right font-bold ${t.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {t.pnl >= 0 ? `+₹${t.pnl}` : `-₹${Math.abs(t.pnl)}`}
                      </td>
                      <td className="py-1 text-right">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${t.result === 'WIN' ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'}`}>
                          {t.result}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 p-8 rounded-xl border border-slate-800 text-center text-slate-400">
          Click <span className="text-blue-400 font-bold">RUN BACKTEST</span> to simulate custom strategy performance against historical NSE data.
        </div>
      )}
    </div>
  );
};
