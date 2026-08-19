import React from 'react';
import { OptionChainData } from '@/types';
import { Layers, Activity, TrendingUp, TrendingDown } from 'lucide-react';

interface OptionChainTableProps {
  optionData: OptionChainData | null;
  onSelectExpiry: (expiry: string) => void;
}

export const OptionChainTable: React.FC<OptionChainTableProps> = ({
  optionData,
  onSelectExpiry
}) => {
  if (!optionData) {
    return (
      <div className="h-full bg-slate-950 p-6 flex flex-col items-center justify-center text-slate-500 font-mono text-xs">
        <Activity className="w-6 h-6 animate-spin text-blue-500 mb-2" />
        <span>Loading Live NSE Option Chain Data...</span>
      </div>
    );
  }

  const {
    underlying_symbol,
    spot_price,
    atm_strike,
    expiries,
    selected_expiry,
    strikes,
    pcr,
    sentiment,
    call_oi_total,
    put_oi_total
  } = optionData;

  return (
    <div className="h-full bg-slate-950 flex flex-col font-mono text-xs select-none border-t border-slate-800">
      {/* Option Chain Control Bar */}
      <div className="h-10 bg-slate-900 px-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-purple-400" />
            <span className="font-bold text-slate-100">{underlying_symbol} OPTION CHAIN</span>
            <span className="text-slate-400">SPOT: <span className="text-emerald-400 font-bold">{spot_price.toFixed(2)}</span></span>
          </div>

          {/* Expiry Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-slate-500">EXPIRY:</span>
            <select
              value={selected_expiry}
              onChange={(e) => onSelectExpiry(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-purple-500"
            >
              {expiries.map((exp) => (
                <option key={exp} value={exp}>
                  {exp}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* PCR & OI Sentiment Badges */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
            <span className="text-slate-400">PCR:</span>
            <span className={`font-bold ${pcr > 1.0 ? 'text-emerald-400' : 'text-red-400'}`}>{pcr.toFixed(2)}</span>
            <span className={`text-[10px] px-1 rounded font-bold ${sentiment === 'BULLISH' ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'}`}>
              {sentiment}
            </span>
          </div>

          <div className="text-[11px] text-slate-400">
            CALL OI: <span className="text-red-400 font-bold">{(call_oi_total / 100000).toFixed(2)}L</span> |
            PUT OI: <span className="text-emerald-400 font-bold">{(put_oi_total / 100000).toFixed(2)}L</span>
          </div>
        </div>
      </div>

      {/* Main Option Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-900/90 sticky top-0 border-b border-slate-800 text-[11px] text-slate-400">
            <tr>
              <th colSpan={5} className="py-1.5 px-3 text-center bg-red-950/40 text-red-400 border-r border-slate-800">CALLS (CE)</th>
              <th className="py-1.5 px-4 text-center bg-slate-900 text-slate-200">STRIKE</th>
              <th colSpan={5} className="py-1.5 px-3 text-center bg-emerald-950/40 text-emerald-400 border-l border-slate-800">PUTS (PE)</th>
            </tr>
            <tr className="border-t border-slate-800 text-[10px]">
              <th className="py-1 px-2 text-right">CE IV</th>
              <th className="py-1 px-2 text-right">CE VOLUME</th>
              <th className="py-1 px-2 text-right">CE ΔOI</th>
              <th className="py-1 px-2 text-right">CE OI</th>
              <th className="py-1 px-2 text-right border-r border-slate-800">CE LTP</th>

              <th className="py-1 px-4 text-center bg-slate-900">STRIKE PRICE</th>

              <th className="py-1 px-2 text-left border-l border-slate-800">PE LTP</th>
              <th className="py-1 px-2 text-left">PE OI</th>
              <th className="py-1 px-2 text-left">PE ΔOI</th>
              <th className="py-1 px-2 text-left">PE VOLUME</th>
              <th className="py-1 px-2 text-left">PE IV</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
            {strikes.map((s) => {
              const isAtm = s.strike === atm_strike;
              const isCeItm = s.strike < spot_price;
              const isPeItm = s.strike > spot_price;

              return (
                <tr
                  key={s.strike}
                  className={`hover:bg-slate-800/50 transition ${
                    isAtm ? 'bg-purple-950/40 font-bold border-y-2 border-purple-500/60' : ''
                  }`}
                >
                  {/* CALLS SIDE */}
                  <td className={`py-1.5 px-2 text-right ${isCeItm ? 'bg-red-950/20 text-slate-300' : 'text-slate-400'}`}>{s.ce_iv}%</td>
                  <td className={`py-1.5 px-2 text-right ${isCeItm ? 'bg-red-950/20' : ''}`}>{s.ce_volume.toLocaleString()}</td>
                  <td className={`py-1.5 px-2 text-right ${s.ce_change_oi >= 0 ? 'text-emerald-400' : 'text-red-400'} ${isCeItm ? 'bg-red-950/20' : ''}`}>
                    {s.ce_change_oi >= 0 ? `+${s.ce_change_oi.toLocaleString()}` : s.ce_change_oi.toLocaleString()}
                  </td>
                  <td className={`py-1.5 px-2 text-right font-semibold text-slate-200 ${isCeItm ? 'bg-red-950/20' : ''}`}>{s.ce_oi.toLocaleString()}</td>
                  <td className={`py-1.5 px-2 text-right font-bold text-red-400 border-r border-slate-800 ${isCeItm ? 'bg-red-950/30' : ''}`}>
                    ₹{s.ce_ltp.toFixed(2)}
                  </td>

                  {/* STRIKE PRICE */}
                  <td className={`py-1.5 px-4 text-center font-black ${isAtm ? 'text-purple-300 bg-purple-900/60' : 'text-slate-100 bg-slate-900'}`}>
                    {s.strike} {isAtm && <span className="text-[9px] bg-purple-500 text-white px-1 rounded ml-1">ATM</span>}
                  </td>

                  {/* PUTS SIDE */}
                  <td className={`py-1.5 px-2 text-left font-bold text-emerald-400 border-l border-slate-800 ${isPeItm ? 'bg-emerald-950/30' : ''}`}>
                    ₹{s.pe_ltp.toFixed(2)}
                  </td>
                  <td className={`py-1.5 px-2 text-left font-semibold text-slate-200 ${isPeItm ? 'bg-emerald-950/20' : ''}`}>{s.pe_oi.toLocaleString()}</td>
                  <td className={`py-1.5 px-2 text-left ${s.pe_change_oi >= 0 ? 'text-emerald-400' : 'text-red-400'} ${isPeItm ? 'bg-emerald-950/20' : ''}`}>
                    {s.pe_change_oi >= 0 ? `+${s.pe_change_oi.toLocaleString()}` : s.pe_change_oi.toLocaleString()}
                  </td>
                  <td className={`py-1.5 px-2 text-left ${isPeItm ? 'bg-emerald-950/20' : ''}`}>{s.pe_volume.toLocaleString()}</td>
                  <td className={`py-1.5 px-2 text-left ${isPeItm ? 'bg-emerald-950/20 text-slate-300' : 'text-slate-400'}`}>{s.pe_iv}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
