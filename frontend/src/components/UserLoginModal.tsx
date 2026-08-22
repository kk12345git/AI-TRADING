"use client";

import React, { useState } from "react";
import { UserProfile, CurrencySymbol } from "../types/portfolio";
import { X, User, UserPlus, CheckCircle2, Shield, Sparkles, LogIn } from "lucide-react";

interface UserLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  traders: UserProfile[];
  activeTrader: UserProfile;
  onSelectTrader: (trader: UserProfile) => void;
  onCreateTrader: (email: string, name: string, currency: CurrencySymbol) => void;
}

export const UserLoginModal: React.FC<UserLoginModalProps> = ({
  isOpen,
  onClose,
  traders,
  activeTrader,
  onSelectTrader,
  onCreateTrader
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<"select" | "create">("select");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currency, setCurrency] = useState<CurrencySymbol>("$");

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !name.trim()) return;
    onCreateTrader(email.trim(), name.trim(), currency);
    setName("");
    setEmail("");
    setMode("select");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Trader Account Switcher</h2>
              <p className="text-xs text-slate-400">Select or create a trader profile to view isolated portfolio data</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Mode Switcher Pills */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 border border-slate-800 rounded-xl">
            <button
              onClick={() => setMode("select")}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                mode === "select" ? "bg-cyan-500 text-slate-950 shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              Select Trader Profile
            </button>
            <button
              onClick={() => setMode("create")}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                mode === "create" ? "bg-cyan-500 text-slate-950 shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              + Create New Profile
            </button>
          </div>

          {mode === "select" ? (
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Available Trader Accounts ({traders.length})
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {traders.map((trader) => {
                  const isSelected = activeTrader.id === trader.id;

                  return (
                    <div
                      key={trader.id}
                      onClick={() => {
                        onSelectTrader(trader);
                        onClose();
                      }}
                      className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                        isSelected
                          ? "bg-slate-950 border-cyan-500/50 ring-2 ring-cyan-500/20 shadow-lg"
                          : "bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/50"
                      }`}
                    >
                      <div className="flex items-center space-x-3.5">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-lg">
                          {trader.avatar}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white flex items-center space-x-2">
                            <span>{trader.name}</span>
                            {isSelected && (
                              <span className="px-2 py-0.5 text-[9px] font-extrabold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-full">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 font-mono">{trader.email}</div>
                        </div>
                      </div>

                      <div className="text-right font-mono text-xs text-slate-400">
                        <span>Currency: {trader.base_currency}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe, David Miller"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. trader@example.com"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Default Display Currency</label>
                <div className="grid grid-cols-4 gap-2">
                  {(["$", "₹", "€", "£"] as CurrencySymbol[]).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCurrency(c)}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                        currency === c
                          ? "bg-cyan-500/20 border-cyan-500 text-cyan-400"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center space-x-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Create Fresh Trader Portfolio</span>
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
