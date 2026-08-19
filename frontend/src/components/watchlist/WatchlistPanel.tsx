import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Star, Search, Plus, Filter } from 'lucide-react';

interface WatchlistItem {
  symbol: string;
  name: string;
  exchange: string;
  price: number;
  change: number;
  p_change: number;
  high: number;
  low: number;
  category: 'INDICES' | 'EQUITIES' | 'BANKING' | 'IT';
}

const DEFAULT_WATCHLIST: WatchlistItem[] = [
  { symbol: 'NIFTY 50', name: 'NIFTY 50 Index', exchange: 'NSE', price: 24078.30, change: 142.50, p_change: 0.60, high: 24120.00, low: 23980.00, category: 'INDICES' },
  { symbol: 'BANKNIFTY', name: 'NIFTY Bank Index', exchange: 'NSE', price: 52410.50, change: -120.30, p_change: -0.23, high: 52600.00, low: 52200.00, category: 'INDICES' },
  { symbol: 'FINNIFTY', name: 'NIFTY Financial Services', exchange: 'NSE', price: 23680.00, change: 85.10, p_change: 0.36, high: 23750.00, low: 23590.00, category: 'INDICES' },
  { symbol: 'SENSEX', name: 'BSE SENSEX Index', exchange: 'BSE', price: 81500.00, change: 410.00, p_change: 0.51, high: 81650.00, low: 81200.00, category: 'INDICES' },
  { symbol: 'RELIANCE', name: 'Reliance Industries', exchange: 'NSE', price: 3020.50, change: 32.10, p_change: 1.07, high: 3045.00, low: 2995.00, category: 'EQUITIES' },
  { symbol: 'TCS', name: 'Tata Consultancy Services', exchange: 'NSE', price: 4350.25, change: -15.40, p_change: -0.35, high: 4380.00, low: 4330.00, category: 'IT' },
  { symbol: 'INFY', name: 'Infosys Ltd', exchange: 'NSE', price: 1890.80, change: 24.50, p_change: 1.31, high: 1905.00, low: 1870.00, category: 'IT' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', exchange: 'NSE', price: 1645.00, change: 12.80, p_change: 0.78, high: 1655.00, low: 1630.00, category: 'BANKING' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', exchange: 'NSE', price: 1185.30, change: -8.20, p_change: -0.69, high: 1198.00, low: 1180.00, category: 'BANKING' },
  { symbol: 'SBIN', name: 'State Bank of India', exchange: 'NSE', price: 825.40, change: 14.20, p_change: 1.75, high: 830.00, low: 812.00, category: 'BANKING' },
  { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd', exchange: 'NSE', price: 1080.00, change: 22.00, p_change: 2.08, high: 1092.00, low: 1060.00, category: 'EQUITIES' }
];

interface WatchlistPanelProps {
  onSelectSymbol: (symbol: string, exchange: string) => void;
  activeSymbol: string;
}

export const WatchlistPanel: React.FC<WatchlistPanelProps> = ({
  onSelectSymbol,
  activeSymbol
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  const filteredItems = DEFAULT_WATCHLIST.filter((item) => {
    const matchesCat = filterCategory === 'ALL' || item.category === filterCategory;
    const matchesSearch = item.symbol.toLowerCase().includes(search.toLowerCase()) || item.name.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="w-full h-full bg-slate-950 border-r border-slate-800 flex flex-col font-mono text-xs select-none overflow-hidden">
      {/* Watchlist Header */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span className="font-extrabold text-slate-100 tracking-wider text-sm">MARKET WATCHLIST</span>
        </div>
        <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">NSE & BSE LIVE</span>
      </div>

      {/* Search Bar & Category Filter */}
      <div className="p-2 bg-slate-950 border-b border-slate-800 space-y-2">
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded px-2 py-1">
          <Search className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
          <input
            type="text"
            placeholder="Search watchlist..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent focus:outline-none text-slate-200 text-xs w-full placeholder:text-slate-500 font-mono"
          />
        </div>

        <div className="flex items-center space-x-1 overflow-x-auto text-[10px] no-scrollbar">
          {['ALL', 'INDICES', 'EQUITIES', 'BANKING', 'IT'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-2 py-0.5 rounded font-bold transition whitespace-nowrap ${
                filterCategory === cat
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Watchlist Symbol List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-900/60">
        {filteredItems.map((item) => {
          const isSelected = activeSymbol === item.symbol;
          const isPositive = item.p_change >= 0;
          return (
            <div
              key={item.symbol}
              onClick={() => onSelectSymbol(item.symbol, item.exchange)}
              className={`p-2.5 hover:bg-slate-900/80 cursor-pointer flex items-center justify-between transition ${
                isSelected ? 'bg-slate-900 border-l-2 border-emerald-400' : ''
              }`}
            >
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-slate-100 text-xs">{item.symbol}</span>
                  <span className="text-[9px] px-1 bg-slate-900 text-slate-400 rounded border border-slate-800">{item.exchange}</span>
                </div>
                <div className="text-[10px] text-slate-500 truncate max-w-[120px]">{item.name}</div>
              </div>

              <div className="text-right">
                <div className="font-bold text-slate-100">{item.price.toFixed(2)}</div>
                <div className={`text-[10px] font-bold flex items-center justify-end space-x-0.5 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isPositive ? <TrendingUp className="w-3 h-3 inline" /> : <TrendingDown className="w-3 h-3 inline" />}
                  <span>{isPositive ? '+' : ''}{item.p_change.toFixed(2)}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
