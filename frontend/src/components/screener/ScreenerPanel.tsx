import React, { useState } from 'react';
import { Filter, SlidersHorizontal, ArrowUpRight, ArrowDownRight, CheckCircle2, Zap } from 'lucide-react';

interface ScreenerStock {
  symbol: string;
  exchange: string;
  name: string;
  price: number;
  change_pct: number;
  signal: 'BUY' | 'SELL' | 'WAIT';
  score: number;
  rsi: number;
  pattern: string;
  fvg: boolean;
  volume_surge: boolean;
  pcr: number;
}

const MOCK_SCREENER_DATA: ScreenerStock[] = [
  { symbol: 'NIFTY 50', exchange: 'NSE', name: 'NIFTY 50 Index', price: 24078.30, change_pct: 0.60, signal: 'BUY', score: 92, rsi: 62.4, pattern: 'Bullish FVG + VWAP Hold', fvg: true, volume_surge: true, pcr: 1.25 },
  { symbol: 'RELIANCE', exchange: 'NSE', name: 'Reliance Industries', price: 3020.50, change_pct: 1.07, signal: 'BUY', score: 88, rsi: 58.9, pattern: 'BOS Breakout', fvg: true, volume_surge: true, pcr: 1.18 },
  { symbol: 'TATAMOTORS', exchange: 'NSE', name: 'Tata Motors Ltd', price: 1080.00, change_pct: 2.08, signal: 'BUY', score: 85, rsi: 67.2, pattern: 'Volume Profile POC Jump', fvg: true, volume_surge: true, pcr: 1.15 },
  { symbol: 'INFY', exchange: 'NSE', name: 'Infosys Ltd', price: 1890.80, change_pct: 1.31, signal: 'BUY', score: 82, rsi: 54.1, pattern: 'Bullish MACD Divergence', fvg: false, volume_surge: false, pcr: 1.08 },
  { symbol: 'HDFCBANK', exchange: 'NSE', name: 'HDFC Bank Ltd', price: 1645.00, change_pct: 0.78, signal: 'BUY', score: 80, rsi: 56.0, pattern: 'VWAP Support Bounce', fvg: false, volume_surge: true, pcr: 1.10 },
  { symbol: 'BANKNIFTY', exchange: 'NSE', name: 'NIFTY Bank Index', price: 52410.50, change_pct: -0.23, signal: 'WAIT', score: 64, rsi: 48.5, pattern: 'Consolidation near Support', fvg: false, volume_surge: false, pcr: 0.95 },
  { symbol: 'ICICIBANK', exchange: 'NSE', name: 'ICICI Bank Ltd', price: 1185.30, change_pct: -0.69, signal: 'SELL', score: 35, rsi: 41.2, pattern: 'Bearish FVG Rejection', fvg: true, volume_surge: false, pcr: 0.78 },
  { symbol: 'TCS', exchange: 'NSE', name: 'Tata Consultancy Services', price: 4350.25, change_pct: -0.35, signal: 'WAIT', score: 55, rsi: 49.0, pattern: 'Inside Bar Range', fvg: false, volume_surge: false, pcr: 0.92 }
];

interface ScreenerPanelProps {
  onSelectSymbol: (symbol: string, exchange: string) => void;
}

export const ScreenerPanel: React.FC<ScreenerPanelProps> = ({ onSelectSymbol }) => {
  const [signalFilter, setSignalFilter] = useState<'ALL' | 'BUY' | 'SELL' | 'WAIT'>('ALL');
  const [minScore, setMinScore] = useState<number>(0);

  const filtered = MOCK_SCREENER_DATA.filter(s => {
    const matchSig = signalFilter === 'ALL' || s.signal === signalFilter;
    const matchScore = s.score >= minScore;
    return matchSig && matchScore;
  });

  return (
    <div className="w-full h-full bg-slate-950 p-4 flex flex-col font-mono text-xs select-none overflow-hidden">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
          <span className="font-extrabold text-sm tracking-wider text-slate-100">TRADINGVIEW TECHNICAL SCREENER</span>
          <span className="bg-emerald-950 text-emerald-400 text-[10px] px-2 py-0.5 rounded border border-emerald-800">NSE & BSE SCANNER</span>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center space-x-2">
          <span className="text-slate-400 text-[10px]">SIGNAL:</span>
          {['ALL', 'BUY', 'SELL', 'WAIT'].map((sig) => (
            <button
              key={sig}
              onClick={() => setSignalFilter(sig as any)}
              className={`px-2.5 py-1 rounded text-[10px] font-bold transition ${
                signalFilter === sig ? 'bg-blue-600 text-white shadow' : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {sig}
            </button>
          ))}

          <button
            onClick={() => setMinScore(minScore === 80 ? 0 : 80)}
            className={`px-2.5 py-1 rounded text-[10px] font-bold border transition ${
              minScore === 80 ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            HIGH SCORE ONLY (&gt;80)
          </button>
        </div>
      </div>

      {/* Stocks Table */}
      <div className="flex-1 overflow-y-auto mt-3 border border-slate-800 rounded-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900 text-slate-400 text-[10px] border-b border-slate-800 sticky top-0 z-10">
              <th className="p-2.5">SYMBOL</th>
              <th className="p-2.5">PRICE</th>
              <th className="p-2.5">CHG %</th>
              <th className="p-2.5">SIGNAL</th>
              <th className="p-2.5">SCORE</th>
              <th className="p-2.5">RSI (14)</th>
              <th className="p-2.5">PCR</th>
              <th className="p-2.5">PATTERN / SETUP</th>
              <th className="p-2.5 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900">
            {filtered.map((stock) => (
              <tr key={stock.symbol} className="hover:bg-slate-900/60 transition">
                <td className="p-2.5 font-bold text-slate-100 flex items-center space-x-1.5">
                  <span>{stock.symbol}</span>
                  <span className="text-[9px] px-1 bg-slate-900 text-slate-400 rounded border border-slate-800">{stock.exchange}</span>
                </td>
                <td className="p-2.5 text-slate-200 font-bold">{stock.price.toFixed(2)}</td>
                <td className={`p-2.5 font-bold ${stock.change_pct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {stock.change_pct >= 0 ? '+' : ''}{stock.change_pct.toFixed(2)}%
                </td>
                <td className="p-2.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                    stock.signal === 'BUY' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' :
                    (stock.signal === 'SELL' ? 'bg-red-950 text-red-400 border-red-800' : 'bg-amber-950 text-amber-400 border-amber-800')
                  }`}>
                    {stock.signal}
                  </span>
                </td>
                <td className="p-2.5 font-bold text-slate-100">
                  <span className={stock.score >= 80 ? 'text-emerald-400 font-black' : 'text-slate-300'}>{stock.score}/100</span>
                </td>
                <td className="p-2.5 text-slate-300">{stock.rsi}</td>
                <td className="p-2.5 text-slate-300 font-bold">{stock.pcr}</td>
                <td className="p-2.5 text-slate-400">{stock.pattern}</td>
                <td className="p-2.5 text-right">
                  <button
                    onClick={() => onSelectSymbol(stock.symbol, stock.exchange)}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[10px] font-bold transition"
                  >
                    OPEN CHART
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
