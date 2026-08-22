"use client";

import React, { useState } from "react";
import { Trade, CurrencySymbol } from "../types/portfolio";
import { Search, Filter, Trash2, Download, Upload, ArrowUpDown, Tag, AlertCircle } from "lucide-react";

interface TradeJournalTableProps {
  trades: Trade[];
  onDeleteTrade: (id: string) => void;
  currency: CurrencySymbol;
}

export const TradeJournalTable: React.FC<TradeJournalTableProps> = ({
  trades,
  onDeleteTrade,
  currency
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [assetFilter, setAssetFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [mistakeFilter, setMistakeFilter] = useState<string>("ALL");

  const filteredTrades = trades.filter((t) => {
    const matchesSearch =
      t.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.setup_tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.notes.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAsset = assetFilter === "ALL" || t.asset_class === assetFilter;
    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
    const matchesMistake =
      mistakeFilter === "ALL" ||
      (mistakeFilter === "CLEAN" ? t.mistake_tag === "None - Followed Plan" : t.mistake_tag !== "None - Followed Plan");

    return matchesSearch && matchesAsset && matchesStatus && matchesMistake;
  });

  const exportCSV = () => {
    if (!trades.length) return;
    const headers = ["ID", "Date", "Time", "Symbol", "Asset", "Action", "Qty", "Entry", "Exit", "Fees", "Net P&L", "Status", "Setup", "Mistake", "Notes"];
    const rows = trades.map(t => [
      t.id, t.date, t.time, t.symbol, t.asset_class, t.action, t.quantity, t.entry_price, t.exit_price, t.fees, t.net_pnl, t.status, t.setup_tag, t.mistake_tag, `"${t.notes.replace(/"/g, '""')}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `tradematrix_journal_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      
      {/* Search & Filter Bar */}
      <div className="p-4 bg-slate-900/70 border border-slate-800/80 rounded-2xl backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search symbol, setup, or notes..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Asset Filter */}
          <select
            value={assetFilter}
            onChange={(e) => setAssetFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Markets</option>
            <option value="Stocks">Stocks</option>
            <option value="Options">Options</option>
            <option value="Crypto">Crypto</option>
            <option value="Forex">Forex</option>
            <option value="Futures">Futures</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Outcomes</option>
            <option value="WIN">Winners Only</option>
            <option value="LOSS">Losses Only</option>
          </select>

          {/* Mistake Filter */}
          <select
            value={mistakeFilter}
            onChange={(e) => setMistakeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Executions</option>
            <option value="CLEAN">Followed Plan</option>
            <option value="MISTAKES">Contains Mistakes</option>
          </select>

          {/* Export CSV Button */}
          <button
            onClick={exportCSV}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-all"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </button>
        </div>

      </div>

      {/* Trade Log Table */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl backdrop-blur-md overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Symbol / Market</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4 text-right">Entry / Exit</th>
                <th className="py-3.5 px-4 text-right">Net P&L ({currency})</th>
                <th className="py-3.5 px-4">Setup Strategy</th>
                <th className="py-3.5 px-4">Execution / Mistake</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono">
              {filteredTrades.length > 0 ? (
                filteredTrades.map((t) => {
                  const isWin = t.status === "WIN";
                  const hasMistake = t.mistake_tag !== "None - Followed Plan";

                  return (
                    <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                      
                      {/* Date & Time */}
                      <td className="py-3.5 px-4 font-mono text-slate-400">
                        <div className="text-white font-semibold">{t.date}</div>
                        <div className="text-[10px] text-slate-500">{t.time}</div>
                      </td>

                      {/* Symbol & Market */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white tracking-wide">{t.symbol}</div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-sans">
                          {t.asset_class}
                        </span>
                      </td>

                      {/* Direction Type */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                          t.action === "BUY" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}>
                          {t.action} x{t.quantity}
                        </span>
                      </td>

                      {/* Entry / Exit */}
                      <td className="py-3.5 px-4 text-right font-mono">
                        <div className="text-slate-300">{currency}{t.entry_price}</div>
                        <div className="text-slate-400 text-[11px]">{currency}{t.exit_price}</div>
                      </td>

                      {/* Net P&L */}
                      <td className="py-3.5 px-4 text-right font-mono">
                        <div className={`font-black text-sm ${isWin ? "text-emerald-400" : "text-rose-400"}`}>
                          {currency}{t.net_pnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {t.pnl_percent > 0 ? `+${t.pnl_percent}%` : `${t.pnl_percent}%`}
                        </div>
                      </td>

                      {/* Setup Strategy */}
                      <td className="py-3.5 px-4 font-sans">
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[11px]">
                          <Tag className="w-3 h-3" />
                          <span>{t.setup_tag}</span>
                        </span>
                      </td>

                      {/* Mistake Tag */}
                      <td className="py-3.5 px-4 font-sans">
                        {hasMistake ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[11px] font-semibold">
                            <AlertCircle className="w-3 h-3" />
                            <span>{t.mistake_tag}</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-emerald-400 font-medium">✓ Plan Followed</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => onDeleteTrade(t.id)}
                          title="Delete Trade"
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 font-sans">
                    No trade entries match your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
