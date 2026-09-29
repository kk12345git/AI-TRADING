"use client";

import React, { useState } from "react";
import { Trade, DailyTradeGroup, CurrencySymbol } from "../types/portfolio";
import {
  Calendar, Clock, TrendingUp, TrendingDown, Edit3, Trash2,
  Plus, Search, Filter, Layers, Download, CheckCircle, AlertTriangle, ArrowRight,
  Calculator, Sparkles
} from "lucide-react";
import { getInstrumentSpec } from "../types/instruments";
import { LotSizeCalculatorModal } from "./LotSizeCalculatorModal";

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
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"day_grouped" | "flat">("day_grouped");
  const [isCalcOpen, setIsCalcOpen] = useState<boolean>(false);

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
    const headers = ["Date", "Time", "Symbol", "Type", "Action", "Lots", "Units", "Entry", "Exit", "Points", "Net PnL", "Status", "Strategy", "Notes"];
    const rows = trades.map(t => {
      const spec = getInstrumentSpec(t.symbol);
      const lots = t.lots || t.quantity;
      const units = t.contract_units || (lots * spec.contractSize);
      return [
        t.date,
        t.time,
        `"${t.symbol}"`,
        t.instrument_type,
        t.action,
        lots,
        units,
        t.entry_price,
        t.exit_price,
        t.points,
        t.net_pnl,
        t.status,
        `"${t.strategy}"`,
        `"${t.notes.replace(/"/g, '""')}"`
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `tradematrix_register_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalPoints = trades.reduce((s, t) => s + t.points, 0);
  const totalPnl = trades.reduce((s, t) => s + t.net_pnl, 0);

  return (
    <div className="space-y-5 pb-16 md:pb-6">
      
      {/* Top Action & Search Bar */}
      <div className="bg-[#0D1018] border border-white/[0.08] rounded-3xl p-4 sm:p-5 shadow-luxe">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-gold-500/10 text-gold-400 border border-gold-500/20 shadow-sm">
              <Layers className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Daily Trade Register
                </h2>
                <span className="text-[10px] font-mono text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.06]">
                  {trades.length} entries
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Exact lot size pricing, point multiplier calculations, and journal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Real-time Lot Sizer Button */}
            <button
              onClick={() => setIsCalcOpen(true)}
              className="px-3 py-2 rounded-xl bg-gold-500/10 hover:bg-gold-500/20 text-gold-300 border border-gold-500/30 text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <Calculator className="w-3.5 h-3.5 text-gold-400" />
              <span>Lot Calculator</span>
            </button>

            {/* View Mode Toggle (desktop only) */}
            <div className="hidden sm:flex bg-[#07080B] p-1 rounded-xl border border-white/[0.06] text-xs font-semibold">
              <button
                onClick={() => setViewMode("day_grouped")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === "day_grouped" ? "bg-white/[0.1] text-white font-bold shadow-sm" : "text-zinc-400 hover:text-white"
                }`}
              >
                By Day
              </button>
              <button
                onClick={() => setViewMode("flat")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === "flat" ? "bg-white/[0.1] text-white font-bold shadow-sm" : "text-zinc-400 hover:text-white"
                }`}
              >
                All List
              </button>
            </div>

            {/* Export CSV */}
            <button
              onClick={handleExportCSV}
              disabled={trades.length === 0}
              className="px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5 border border-white/[0.07] disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>

            {/* Log Trade Button */}
            <button
              onClick={onOpenAddModal}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-gold-500 to-amber-500 hover:brightness-110 active:scale-98 text-black font-black text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Log Trade</span>
            </button>
          </div>
        </div>

        {/* Quick Search & Outcome Filters */}
        <div className="mt-3.5 pt-3.5 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search symbol, strategy, date (e.g. XAUUSD)..."
              className="w-full bg-[#07080B] border border-white/[0.08] text-white placeholder-zinc-500 pl-8 pr-3 py-2 rounded-xl text-xs focus:border-gold-500/50 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto pb-0.5 no-scrollbar">
            {["ALL", "WIN", "LOSS", "BREAKEVEN"].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap ${
                  filterStatus === st
                    ? st === "WIN"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold"
                      : st === "LOSS"
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold"
                      : "bg-white/[0.1] text-white border border-white/[0.15] font-bold"
                    : "bg-[#07080B] text-zinc-400 hover:text-white border border-white/[0.05]"
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
        <div className="bg-[#0D1018] border border-white/[0.07] p-3.5 sm:p-4 rounded-2xl shadow-luxe-sm">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Total Trades</span>
          <span className="text-lg sm:text-xl font-black font-mono text-white mt-0.5 block">{trades.length}</span>
        </div>
        <div className="bg-[#0D1018] border border-white/[0.07] p-3.5 sm:p-4 rounded-2xl shadow-luxe-sm">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Total Points</span>
          <span className={`text-lg sm:text-xl font-black font-mono mt-0.5 block ${totalPoints >= 0 ? "text-gold-400" : "text-rose-400"}`}>
            {totalPoints >= 0 ? `+${totalPoints.toFixed(1)}` : totalPoints.toFixed(1)} pts
          </span>
        </div>
        <div className="bg-[#0D1018] border border-white/[0.07] p-3.5 sm:p-4 rounded-2xl shadow-luxe-sm">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Total Real P&L</span>
          <span className={`text-lg sm:text-xl font-black font-mono mt-0.5 block ${totalPnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {totalPnl >= 0 ? `+${currency}${totalPnl.toLocaleString()}` : `${currency}${totalPnl.toLocaleString()}`}
          </span>
        </div>
        <div className="bg-[#0D1018] border border-white/[0.07] p-3.5 sm:p-4 rounded-2xl shadow-luxe-sm">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Win Rate</span>
          <span className="text-lg sm:text-xl font-black font-mono text-emerald-400 mt-0.5 block">
            {trades.length > 0 ? `${((trades.filter(t => t.status === "WIN").length / trades.length) * 100).toFixed(1)}%` : "0%"}
          </span>
        </div>
      </div>

      {/* DAY-GROUPED REGISTER */}
      {viewMode === "day_grouped" && (
        <div className="space-y-4">
          {dailyGroups.length === 0 ? (
            <div className="text-center py-16 bg-[#0D1018] border border-white/[0.07] rounded-3xl p-6">
              <Layers className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-white">No Trades Recorded</h3>
              <p className="text-xs text-zinc-400 mt-1 mb-4">
                Log your first trade with real lot sizing and point calculation
              </p>
              <button
                onClick={onOpenAddModal}
                className="px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-black font-black text-xs transition-all shadow-md"
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
                  className="bg-[#0D1018] border border-white/[0.08] rounded-3xl overflow-hidden shadow-luxe"
                >
                  {/* Day Summary Header */}
                  <div className={`px-5 sm:px-6 py-3.5 border-b flex flex-wrap items-center justify-between gap-2.5 ${
                    isProfitDay
                      ? "bg-emerald-950/20 border-emerald-500/20"
                      : isLossDay
                      ? "bg-rose-950/20 border-rose-500/20"
                      : "bg-[#090A0F] border-white/[0.06]"
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        isProfitDay
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}>
                        <Calendar className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">{formattedDate}</h3>
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            isProfitDay
                              ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                              : isLossDay
                              ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
                              : "bg-white/[0.05] text-zinc-400 border-white/[0.08]"
                          }`}>
                            {isProfitDay ? "PROFIT DAY" : isLossDay ? "LOSS DAY" : "FLAT"}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400">
                          {group.trades_count} {group.trades_count === 1 ? "trade" : "trades"} • {group.wins}W / {group.losses}L ({group.win_rate}%)
                        </p>
                      </div>
                    </div>

                    {/* Day Aggregates */}
                    <div className="flex items-center gap-4 ml-auto sm:ml-0">
                      <div className="text-right">
                        <span className="text-[9px] uppercase font-bold text-zinc-400 block">Day Points</span>
                        <span className={`text-sm sm:text-base font-mono font-bold ${group.total_points >= 0 ? "text-gold-400" : "text-rose-400"}`}>
                          {group.total_points >= 0 ? `+${group.total_points}` : group.total_points} pts
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[9px] uppercase font-bold text-zinc-400 block">Day Net P&L</span>
                        <span className={`text-base sm:text-lg font-mono font-black ${group.total_pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {group.total_pnl >= 0 ? `+${currency}${group.total_pnl.toLocaleString()}` : `${currency}${group.total_pnl.toLocaleString()}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 1. MOBILE TRADE CARDS */}
                  <div className="block md:hidden divide-y divide-white/[0.04] p-3 space-y-2.5">
                    {group.trades.map((trade) => {
                      const spec = getInstrumentSpec(trade.symbol);
                      const isWin = trade.status === "WIN";
                      const isLoss = trade.status === "LOSS";
                      const lots = trade.lots || trade.quantity;

                      return (
                        <div
                          key={trade.id}
                          className="bg-[#07080B] border border-white/[0.06] rounded-2xl p-3.5 space-y-2.5 shadow-sm"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`font-bold px-2 py-0.5 rounded text-[10px] flex items-center gap-1 border ${
                                trade.action === "BUY"
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                  : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                              }`}>
                                {trade.action === "BUY" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                {trade.action}
                              </span>
                              <span className="font-mono font-bold text-white text-sm">{trade.symbol}</span>
                              <span className="text-[10px] text-gold-400 font-mono">
                                {lots} {spec.category === "INDEX_FUTURES" ? "lot" : "lots"}
                              </span>
                            </div>
                            <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {trade.time}
                            </span>
                          </div>

                          <div className="flex items-center justify-between bg-[#11141E] p-2.5 rounded-xl border border-white/[0.05]">
                            <div>
                              <span className="text-[9px] uppercase font-bold text-zinc-400 block">Points</span>
                              <span className={`text-sm font-mono font-bold ${trade.points >= 0 ? "text-gold-400" : "text-rose-400"}`}>
                                {trade.points >= 0 ? `+${trade.points}` : trade.points} pts
                              </span>
                            </div>

                            <div className="text-center">
                              <span className="text-[9px] uppercase font-bold text-zinc-400 block">Formula</span>
                              <span className="text-[10px] font-mono text-zinc-400">
                                {trade.points} × {lots} × {trade.point_multiplier || spec.pointMultiplier}
                              </span>
                            </div>

                            <div className="text-right">
                              <span className="text-[9px] uppercase font-bold text-zinc-400 block">Real P&L</span>
                              <span className={`text-base font-mono font-black ${isWin ? "text-emerald-400" : isLoss ? "text-rose-400" : "text-zinc-300"}`}>
                                {trade.net_pnl >= 0 ? `+${currency}${trade.net_pnl.toLocaleString()}` : `${currency}${trade.net_pnl.toLocaleString()}`}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs pt-0.5">
                            <span className="text-[10px] text-zinc-400 px-2 py-0.5 rounded bg-white/[0.03] border border-white/[0.05] truncate max-w-[180px]">
                              {trade.strategy || "Price Action"}
                            </span>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => onEditTrade(trade)}
                                className="px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-gold-400 border border-white/[0.08] text-xs font-semibold flex items-center gap-1 active:scale-95"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => onDeleteTrade(trade.id)}
                                className="p-1 rounded-lg bg-white/[0.05] hover:bg-rose-950 text-rose-400 border border-white/[0.08] active:scale-95"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* 2. DESKTOP TABLE */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#090A0F] text-zinc-400 uppercase text-[10px] tracking-widest font-semibold border-b border-white/[0.06]">
                        <tr>
                          <th className="py-3.5 px-4">Time</th>
                          <th className="py-3.5 px-4">Instrument</th>
                          <th className="py-3.5 px-4">Direction</th>
                          <th className="py-3.5 px-4 text-right">Entry</th>
                          <th className="py-3.5 px-4 text-right">Exit</th>
                          <th className="py-3.5 px-4 text-right">Points</th>
                          <th className="py-3.5 px-4 text-right">Lot Size</th>
                          <th className="py-3.5 px-4 text-right">Real Net P&L</th>
                          <th className="py-3.5 px-4">Strategy</th>
                          <th className="py-3.5 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {group.trades.map((trade) => {
                          const spec = getInstrumentSpec(trade.symbol);
                          const isWin = trade.status === "WIN";
                          const isLoss = trade.status === "LOSS";
                          const lots = trade.lots || trade.quantity;

                          return (
                            <tr key={trade.id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="py-3.5 px-4 font-mono text-zinc-400 whitespace-nowrap">
                                <span className="flex items-center gap-1.5">
                                  <Clock className="w-3 h-3 text-zinc-500" />
                                  {trade.time}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <span className="font-mono font-bold text-white block">{trade.symbol}</span>
                                <span className="text-[10px] text-zinc-500">{spec.category.replace("_", " ")}</span>
                              </td>
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded text-[10px] border ${
                                  trade.action === "BUY"
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                    : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                }`}>
                                  {trade.action === "BUY" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                  {trade.action}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right font-mono text-zinc-300">
                                {currency}{trade.entry_price}
                              </td>
                              <td className="py-3.5 px-4 text-right font-mono text-zinc-300">
                                {currency}{trade.exit_price}
                              </td>
                              <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                <span className={`font-mono font-bold px-2 py-0.5 rounded ${
                                  trade.points >= 0
                                    ? "text-gold-400 bg-gold-500/10"
                                    : "text-rose-400 bg-rose-500/10"
                                }`}>
                                  {trade.points >= 0 ? `+${trade.points}` : trade.points} pts
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right font-mono whitespace-nowrap">
                                <span className="text-white font-bold">{lots} lot</span>
                                <span className="text-[10px] text-zinc-500 block">
                                  (×{trade.point_multiplier || spec.pointMultiplier})
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                <span className={`font-mono font-black text-sm ${
                                  isWin ? "text-emerald-400" : isLoss ? "text-rose-400" : "text-zinc-300"
                                }`}>
                                  {trade.net_pnl >= 0 ? `+${currency}${trade.net_pnl.toLocaleString()}` : `${currency}${trade.net_pnl.toLocaleString()}`}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <span className="text-[11px] text-zinc-300 px-2.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">
                                  {trade.strategy || "Price Action"}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => onEditTrade(trade)}
                                    title="Edit Trade"
                                    className="p-1.5 rounded-lg text-zinc-400 hover:text-gold-400 hover:bg-white/[0.05] transition-all"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => onDeleteTrade(trade.id)}
                                    title="Delete Trade"
                                    className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-white/[0.05] transition-all"
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

      {/* FLAT TABLE VIEW */}
      {viewMode === "flat" && (
        <div className="bg-[#0D1018] border border-white/[0.08] rounded-3xl overflow-hidden shadow-luxe">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#090A0F] text-zinc-400 uppercase text-[10px] tracking-widest font-semibold border-b border-white/[0.06]">
                <tr>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Symbol</th>
                  <th className="py-3.5 px-4">Direction</th>
                  <th className="py-3.5 px-4 text-right">Entry</th>
                  <th className="py-3.5 px-4 text-right">Exit</th>
                  <th className="py-3.5 px-4 text-right">Points</th>
                  <th className="py-3.5 px-4 text-right">Lots</th>
                  <th className="py-3.5 px-4 text-right">Net P&L</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Strategy</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredTrades.map((trade) => {
                  const spec = getInstrumentSpec(trade.symbol);
                  const isWin = trade.status === "WIN";
                  const isLoss = trade.status === "LOSS";
                  const lots = trade.lots || trade.quantity;

                  return (
                    <tr key={trade.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 font-mono text-zinc-400 whitespace-nowrap">
                        {trade.date} {trade.time}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-white whitespace-nowrap">
                        {trade.symbol}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`font-bold px-2 py-0.5 rounded text-[10px] border ${
                          trade.action === "BUY"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        }`}>
                          {trade.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-zinc-300">
                        {currency}{trade.entry_price}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-zinc-300">
                        {currency}{trade.exit_price}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold whitespace-nowrap">
                        <span className={trade.points >= 0 ? "text-gold-400" : "text-rose-400"}>
                          {trade.points >= 0 ? `+${trade.points}` : trade.points} pts
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-zinc-300 whitespace-nowrap">
                        {lots} lot
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-black whitespace-nowrap">
                        <span className={isWin ? "text-emerald-400" : isLoss ? "text-rose-400" : "text-zinc-300"}>
                          {trade.net_pnl >= 0 ? `+${currency}${trade.net_pnl.toLocaleString()}` : `${currency}${trade.net_pnl.toLocaleString()}`}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          isWin
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : isLoss
                            ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                            : "bg-white/[0.04] text-zinc-400 border-white/[0.08]"
                        }`}>
                          {trade.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-zinc-300 whitespace-nowrap">
                        {trade.strategy}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onEditTrade(trade)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-gold-400 hover:bg-white/[0.05]"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteTrade(trade.id)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-white/[0.05]"
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

      {/* Lot Sizer Modal Triggered From Table */}
      <LotSizeCalculatorModal
        isOpen={isCalcOpen}
        onClose={() => setIsCalcOpen(false)}
        currency={currency}
      />

    </div>
  );
};
