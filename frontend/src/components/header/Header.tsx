import React, { useState, useEffect } from 'react';
import { Search, Activity, ShieldCheck, Clock, Zap, Layers, RefreshCw } from 'lucide-react';
import { Instrument } from '@/types';
import { api } from '@/services/api';

interface HeaderProps {
  currentSymbol: string;
  currentExchange: string;
  currentTimeframe: string;
  onSelectInstrument: (symbol: string, exchange: string) => void;
  onSelectTimeframe: (tf: string) => void;
  marketStatus: string;
  dataHealth: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentSymbol,
  currentExchange,
  currentTimeframe,
  onSelectInstrument,
  onSelectTimeframe,
  marketStatus,
  dataHealth,
  activeTab,
  setActiveTab
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Instrument[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const timeframes = ['1m', '3m', '5m', '15m', '30m', '1H', '4H', '1D', '1W'];

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      setIsSearching(true);
      const timer = setTimeout(async () => {
        try {
          const res = await api.searchInstruments(searchQuery);
          setSearchResults(res);
        } catch (e) {
          console.error(e);
        } finally {
          setIsSearching(false);
        }
      }, 250);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  return (
    <header className="h-14 bg-slate-900/90 border-b border-slate-800 px-4 flex items-center justify-between text-xs select-none sticky top-0 z-50 backdrop-blur">
      {/* Left: Branding & Symbol Search */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-emerald-500/20">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="font-extrabold text-sm tracking-wide text-slate-100 flex items-center space-x-1.5">
              <span>MyTrade</span>
              <span className="text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded text-[10px] border border-emerald-500/30">AI INDICATOR</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">NSE & BSE STRATEGY ENGINE</div>
          </div>
        </div>

        {/* Exchange Tag */}
        <div className="flex items-center bg-slate-950 rounded-md p-1 border border-slate-800">
          <span className={`px-2 py-0.5 rounded font-bold transition ${currentExchange === 'NSE' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>
            NSE
          </span>
          <span className={`px-2 py-0.5 rounded font-bold transition ${currentExchange === 'BSE' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>
            BSE
          </span>
        </div>

        {/* Symbol Search Bar */}
        <div className="relative">
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1.5 w-64 focus-within:border-emerald-500/60 transition">
            <Search className="w-3.5 h-3.5 text-slate-400 mr-2" />
            <input
              type="text"
              placeholder="Search NSE/BSE symbol or option..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none w-full text-xs placeholder:text-slate-500 font-mono"
            />
          </div>

          {/* Search Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute left-0 mt-1 w-80 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-50 max-h-72 overflow-y-auto">
              {searchResults.map((item) => (
                <div
                  key={item.token || item.symbol}
                  onClick={() => {
                    onSelectInstrument(item.symbol, item.exchange);
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  className="p-2.5 hover:bg-slate-800 cursor-pointer flex items-center justify-between border-b border-slate-800/50 transition"
                >
                  <div>
                    <div className="font-bold text-slate-100 flex items-center space-x-1.5">
                      <span>{item.symbol}</span>
                      <span className="text-[10px] px-1 bg-slate-800 text-slate-400 rounded">{item.exchange}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">{item.name}</div>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${item.instrument_type === 'OPTION' ? 'bg-purple-950 text-purple-400 border border-purple-800' : 'bg-slate-800 text-slate-300'}`}>
                    {item.instrument_type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Middle: Timeframe Selector */}
      <div className="flex items-center bg-slate-950 p-1 rounded-md border border-slate-800 space-x-1">
        {timeframes.map((tf) => (
          <button
            key={tf}
            onClick={() => onSelectTimeframe(tf)}
            className={`px-2 py-1 rounded font-mono font-bold transition text-[11px] ${
              currentTimeframe === tf
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {tf}
          </button>
        ))}
      </div>

      {/* Right: Market Status, Data Health, Navigation Tabs */}
      <div className="flex items-center space-x-3">
        {/* Navigation Tabs */}
        <div className="flex items-center bg-slate-950 p-1 rounded-md border border-slate-800 space-x-1">
          {['CHART', 'OPTION CHAIN', 'REPLAY', 'BACKTEST', 'JOURNAL'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-2.5 py-1 rounded font-semibold text-[11px] transition ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Data Health & Status */}
        <div className="flex items-center space-x-2 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800 font-mono">
          <div className="flex items-center space-x-1.5">
            <div className={`w-2 h-2 rounded-full ${dataHealth === 'LIVE' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="text-[11px] font-bold text-slate-300">{dataHealth}</span>
          </div>
          <span className="text-slate-700">|</span>
          <span className="text-[11px] text-emerald-400 font-semibold">{marketStatus}</span>
        </div>

        {/* Authorized User Badge */}
        <div className="flex items-center space-x-1 bg-slate-800/80 px-2 py-1 rounded border border-slate-700 text-[10px] text-slate-300">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>AUTHORIZED</span>
        </div>

        {/* Live Broker Selector Dropdown */}
        <div className="flex items-center space-x-1.5 bg-slate-950 px-2 py-1 rounded border border-slate-800 font-mono text-[10px]">
          <Layers className="w-3 h-3 text-blue-400" />
          <select
            onChange={async (e) => {
              try {
                await api.switchBroker(e.target.value);
              } catch (err) {
                console.error(err);
              }
            }}
            className="bg-transparent text-slate-200 focus:outline-none font-bold cursor-pointer"
          >
            <option value="mock" className="bg-slate-900 text-slate-200">Mock Live Feed</option>
            <option value="zerodha" className="bg-slate-900 text-slate-200">Zerodha Kite API</option>
            <option value="dhan" className="bg-slate-900 text-slate-200">Dhan HQ API</option>
            <option value="fyers" className="bg-slate-900 text-slate-200">Fyers API v3</option>
            <option value="angelone" className="bg-slate-900 text-slate-200">AngelOne SmartAPI</option>
          </select>
        </div>
      </div>
    </header>
  );
};
