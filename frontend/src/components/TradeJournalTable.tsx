"use client";

import React, { useState } from "react";
import { Trade, DailyTradeGroup, CurrencySymbol } from "../types/portfolio";
import {
  Calendar, Clock, TrendingUp, TrendingDown, Edit3, Trash2,
  Plus, Search, Filter, Layers, Download, CheckCircle, AlertTriangle, ArrowRight
} from "lucide-react";

interface TradeJournalTableProps {
  trades: Trade[];
  dailyGroups: DailyTradeGroup[];
  currency: CurrencySymbol;
  onOpenAddModal: () => void;
  onEditTrade: (trade: Trade) => void;
  onDeleteTrade: (tradeId: string) => void;
  onClearTrades: () => void;
}

export const TradeJournalTable: React.FC<TradeJournalTableProps> = ({
  trades,
  dailyGroups,
  currency,
  onOpenAddModal,
  onEditTrade,
  onDeleteTrade,
  onClearTrades
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("" );
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"day_grouped" | "flat">("day_grouped");

  // Filtering
  const filteredTrades = trades.filter((t) => {
    const matchesSearch =
      t.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.strategy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.date.includes(searchTerm);
    const matchesStatus =
      filterStatus === "ALL" ||
      (filterStatus === "WIN" && t.status === "WIN") ||
      (filterStatus === "LOSS" && t.status === "LOSS") ||
      (filterStatus === "BREAKEVEN" && t.status === "BREAKEVEN");
    return matchesSearch && matchesStatus;
  });

  // Export to CSV
  const handleExportCSV = () => {
    if (trades.length === 0) return;
    const headers = ["Date", "Time", "Symbol", "Type", "Action", "Qty", "Entry", "Exit", "Points", "Net PnL", "Status", "Strategy", "Notes"];
    const rows = trades.map(t => [
      t.date,
      t.time,
      `"${t.symbol}"`,
      t.instrument_type,
      t.action,
      t.quantity,
      t.entry_price,
      t.exit_price,
      t.points,
      t.net_pnl,
      t.status,
      `"${t.strategy}"`,
      `"${t.notes.replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `trade_register_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalPoints = trades.reduce((s, t) => s + t.points, 0);
  const totalPnl = trades.reduce((s, t) => s + t.net_pnl, 0);

  return (
    <div className="space-y-5 pb-16 md:pb-6">
      
      {/* Top Action & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Layers className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white">Daily Trade Register</h2>
              <p className="text-[11px] text-slate-400">
                Log entries, exits, points captured, and profit/loss
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle (desktop only) */}
            <div className="hidden sm:flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
              <button
                onClick={() => setViewMode("day_grouped")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === "day_grouped" ? "bg-cyan-500 text-slate-950 font-bold shadow" : "text-slate-400 hover:text-white"
                }`}
              >
                By Day
              </button>
              <button
                onClick={() => setViewMode("flat")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === "flat" ? "bg-cyan-500 text-slate-950 font-bold shadow" : "text-slate-400 hover:text-white"
                }`}
              >
                All List
              </button>
            </div>

            {/* Export CSV */}
            <button
              onClick={handleExportCSV}
              disabled={trades.length === 0}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5 border border-slate-700 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span> CSV
            </button>

            {/* Take New Trade */}
            <button
              onClick={onOpenAddModal}
              className="px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 active:scale-98 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Log Trade</span>
            </button>
          </div>
        </div>

        {/* Quick Search & Outcome Filters */}
        <div className="mt-3.5 pt-3.5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search symbol, strategy, date..."
              className="w-full bg-slate-950 border border-slate-800 text-white placeholder-slate-500 pl-8 pr-3 py-2 rounded-xl text-xs focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto pb-0.5">
            {["ALL", "WIN", "LOSS", "BREAKEVEN"].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap ${
                  filterStatus === st
                    ? st === "WIN"
                      ? "bg-emerald-500 text-slate-950 font-bold"
                      : st === "LOSS"
                      ? "bg-rose-500 text-slate-950 font-bold"
                      : "bg-cyan-500 text-slate-950 font-bold"
                    : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                {st === "ALL" ? "All" : st === "WIN" ? "Wins" : st === "LOSS" ? "Losses" : "BE"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-slate-900 border border-slate-800 p-3 sm:p-4 rounded-2xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Trades</span>
          <span className="text-lg sm:text-xl font-black text-white mt-0.5 block">{trades.length}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3 sm:p-4 rounded-2xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Points</span>
          <span className={`text-lg sm:text-xl font-black mt-0.5 block ${totalPoints >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {totalPoints >= 0 ? `+${totalPoints.toFixed(1)}` : totalPoints.toFixed(1)} pts
          </span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3 sm:p-4 rounded-2xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Net P&L</span>
          <span className={`text-lg sm:text-xl font-black mt-0.5 block ${totalPnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {totalPnl >= 0 ? `+${currency}${totalPnl.toLocaleString()}` : `${currency}${totalPnl.toLocaleString()}`}
          </span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3 sm:p-4 rounded-2xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Win Rate</span>
          <span className="text-lg sm:text-xl font-black text-cyan-400 mt-0.5 block">
            {trades.length > 0 ? `${((trades.filter(t => t.status === "WIN").length / trades.length) * 100).toFixed(1)}%` : "0%"}
          </span>
        </div>
      </div>

      {/* DAY-GROUPED REGISTER */}
      {viewMode === "day_grouped" && (
        <div className="space-y-4">
          {dailyGroups.length === 0 ? (
            <div className="text-center py-14 bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
              <Layers className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-white">No Trades Recorded</h3>
              <p className="text-xs text-slate-400 mt-1 mb-3">
                Log your first trade with entry, exit, and points
              </p>
              <button
                onClick={onOpenAddModal}
                className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
              >
                Log Trade Now
              </button>
            </div>
          ) : (
            dailyGroups.map((group) => {
              const isProfitDay = group.total_pnl > 0.05;
              const isLossDay = group.total_pnl < -0.05;

              const dateObj = new Date(group.date);
              const formattedDate = !isNaN(dateObj.getTime())
                ? dateObj.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })
                : group.date;

              return (
                <div
                  key={group.date}
                  className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl"
                >
                  {/* Day Summary Header */}
                  <div className={`px-4 sm:px-6 py-3.5 border-b flex flex-wrap items-center justify-between gap-2.5 ${
                    isProfitDay
                      ? "bg-emerald-950/25 border-emerald-900/30"
                      : isLossDay
                      ? "bg-rose-950/25 border-rose-900/30"
                      : "bg-slate-950/40 border-slate-800"
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        isProfitDay ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}>
                        <Calendar className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="text-sm sm:text-base font-black text-white">{formattedDate}</h3>
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            isProfitDay
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : isLossDay
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                              : "bg-slate-800 text-slate-400"
                          }`}>
                            {isProfitDay ? "PROFIT DAY" : isLossDay ? "LOSS DAY" : "FLAT"}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {group.trades_count} {group.trades_count === 1 ? "trade" : "trades"} • {group.wins}W / {group.losses}L ({group.win_rate}%)
                        </p>
                      </div>
                    </div>

                    {/* Day Aggregates */}
                    <div className="flex items-center gap-4 ml-auto sm:ml-0">
                      <div className="text-right">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Day Points</span>
                        <span className={`text-sm sm:text-base font-black ${group.total_points >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {group.total_points >= 0 ? `+${group.total_points}` : group.total_points} pts
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Day Net P&L</span>
                        <span className={`text-base sm:text-lg font-black ${group.total_pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {group.total_pnl >= 0 ? `+${currency}${group.total_pnl.toLocaleString()}` : `${currency}${group.total_pnl.toLocaleString()}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 1. MOBILE TRADE CARDS (Visible on mobile screens) */}
                  <div className="block md:hidden divide-y divide-slate-800/60 p-2 sm:p-3 space-y-2">
                    {group.trades.map((trade) => {
                      const isWin = trade.status === "WIN";
                      const isLoss = trade.status === "LOSS";

                      return (
                        <div
                          key={trade.id}
                          className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3.5 space-y-2.5 transition-all"
                        >
                          {/* Row 1: Symbol, Action badge, Time */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`font-bold px-2 py-0.5 rounded text-[10px] flex items-center gap-1 ${
                                trade.action === "BUY"
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              }`}>
                                {trade.action === "BUY" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                {trade.action}
                              </span>
                              <span className="font-bold text-white text-sm">{trade.symbol}</span>
                            </div>
                            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {trade.time}
                            </span>
                          </div>

                          {/* Row 2: Points badge, Net P&L in big bold */}
                          <div className="flex items-center justify-between bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                            <div>
                              <span className="text-[9px] uppercase font-bold text-slate-400 block">Points</span>
                              <span className={`text-sm font-black font-mono ${trade.points >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                                {trade.points >= 0 ? `+${trade.points}` : trade.points} pts
                              </span>
                            </div>

                            <div className="text-center">
                              <span className="text-[9px] uppercase font-bold text-slate-400 block">Execution</span>
                              <span className="text-xs font-mono text-slate-300">
                                {currency}{trade.entry_price} → {currency}{trade.exit_price}
                              </span>
                            </div>

                            <div className="text-right">
                              <span className="text-[9px] uppercase font-bold text-slate-400 block">Net P&L</span>
                              <span className={`text-base font-black font-mono ${isWin ? "text-emerald-400" : isLoss ? "text-rose-400" : "text-slate-300"}`}>
                                {trade.net_pnl >= 0 ? `+${currency}${trade.net_pnl.toLocaleString()}` : `${currency}${trade.net_pnl.toLocaleString()}`}
                              </span>
                            </div>
                          </div>

                          {/* Row 3: Strategy & Actions */}
                          <div className="flex items-center justify-between text-xs pt-1">
                            <span className="text-[10px] text-slate-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 truncate max-w-[180px]">
                              {trade.strategy || "My Strategy"}
                            </span>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => onEditTrade(trade)}
                                className="px-2.5 py-1 rounded-lg bg-slate-850 hover:bg-slate-800 text-cyan-400 border border-slate-700 text-xs font-semibold flex items-center gap-1 active:scale-95"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => onDeleteTrade(trade.id)}
                                className="p-1 rounded-lg bg-slate-850 hover:bg-rose-950 text-rose-400 border border-slate-700 active:scale-95"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* 2. DESKTOP TABLE (Hidden on mobile) */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider font-semibold border-b border-slate-800">
                        <tr>
                          <th className="py-3 px-4">Time</th>
                          <th className="py-3 px-4">Symbol / Scrip</th>
                          <th className="py-3 px-4">Action</th>
                          <th className="py-3 px-4 text-right">Entry</th>
                          <th className="py-3 px-4 text-right">Exit</th>
                          <th className="py-3 px-4 text-right">Points</th>
                          <th className="py-3 px-4 text-right">Qty</th>
                          <th className="py-3 px-4 text-right">Net P&L</th>
                          <th className="py-3 px-4">Strategy</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {group.trades.map((trade) => {
                          const isWin = trade.status === "WIN";
                          const isLoss = trade.status === "LOSS";

                          return (
                            <tr key={trade.id} className="hover:bg-slate-800/40 transition-colors">
                              <td className="py-3 px-4 font-mono text-slate-300 whitespace-nowrap">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-slate-500" />
                                  {trade.time}
                                </span>
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap">
                                <span className="font-bold text-white block">{trade.symbol}</span>
                                <span className="text-[10px] text-slate-500 uppercase">{trade.instrument_type}</span>
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap">
                                <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded text-[10px] ${
                                  trade.action === "BUY"
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                }`}>
                                  {trade.action === "BUY" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                  {trade.action}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right font-mono text-slate-300">
                                {currency}{trade.entry_price}
                              </td>
                              <td className="py-3 px-4 text-right font-mono text-slate-300">
                                {currency}{trade.exit_price}
                              </td>
                              <td className="py-3 px-4 text-right whitespace-nowrap">
                                <span className={`font-black font-mono px-2 py-0.5 rounded ${
                                  trade.points >= 0
                                    ? "text-emerald-400 bg-emerald-500/10"
                                    : "text-rose-400 bg-rose-500/10"
                                }`}>
                                  {trade.points >= 0 ? `+${trade.points}` : trade.points} pts
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right font-mono text-slate-400">
                                {trade.quantity}
                              </td>
                              <td className="py-3 px-4 text-right whitespace-nowrap">
                                <span className={`font-bold font-mono text-sm ${
                                  isWin ? "text-emerald-400" : isLoss ? "text-rose-400" : "text-slate-300"
                                }`}>
                                  {trade.net_pnl >= 0 ? `+${currency}${trade.net_pnl.toLocaleString()}` : `${currency}${trade.net_pnl.toLocaleString()}`}
                                </span>
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap">
                                <span className="text-[11px] text-slate-300 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                                  {trade.strategy || "Strategy"}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => onEditTrade(trade)}
                                    title="Edit Trade"
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-all"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => onDeleteTrade(trade.id)}
                                    title="Delete Trade"
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-all"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* FLAT TABLE VIEW (Desktop / Tablet) */}
      {viewMode === "flat" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Symbol</th>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4 text-right">Entry</th>
                  <th className="py-3.5 px-4 text-right">Exit</th>
                  <th className="py-3.5 px-4 text-right">Points</th>
                  <th className="py-3.5 px-4 text-right">Qty</th>
                  <th className="py-3.5 px-4 text-right">Net P&L</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Strategy</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredTrades.map((trade) => {
                  const isWin = trade.status === "WIN";
                  const isLoss = trade.status === "LOSS";
                  return (
                    <tr key={trade.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-300 whitespace-nowrap">
                        {trade.date} {trade.time}
                      </td>
                      <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                        {trade.symbol}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                          trade.action === "BUY" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                        }`}>
                          {trade.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-300">
                        {currency}{trade.entry_price}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-300">
                        {currency}{trade.exit_price}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold whitespace-nowrap">
                        <span className={trade.points >= 0 ? "text-emerald-400" : "text-rose-400"}>
                          {trade.points >= 0 ? `+${trade.points}` : trade.points} pts
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-400">
                        {trade.quantity}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold whitespace-nowrap">
                        <span className={isWin ? "text-emerald-400" : isLoss ? "text-rose-400" : "text-slate-300"}>
                          {trade.net_pnl >= 0 ? `+${currency}${trade.net_pnl.toLocaleString()}` : `${currency}${trade.net_pnl.toLocaleString()}`}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          isWin ? "bg-emerald-500/10 text-emerald-400" : isLoss ? "bg-rose-500/10 text-rose-400" : "bg-slate-800 text-slate-400"
                        }`}>
                          {trade.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                        {trade.strategy}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onEditTrade(trade)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteTrade(trade.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Clear Register Button */}
      {trades.length > 0 && (
        <div className="flex justify-end pt-1">
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to clear all trades in your register?")) {
                onClearTrades();
              }
            }}
            className="text-xs text-rose-400/80 hover:text-rose-300 underline font-medium transition-colors"
          >
            Clear Entire Trade Register for this Trader
          </button>
        </div>
      )}

    </div>
  );
};
