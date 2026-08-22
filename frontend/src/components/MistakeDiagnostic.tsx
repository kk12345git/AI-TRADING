"use client";

import React, { useState } from "react";
import { DiagnosticResponse, CurrencySymbol } from "../types/portfolio";
import { ShieldCheck, AlertTriangle, CheckCircle, Sparkles, RefreshCw, Zap } from "lucide-react";

interface MistakeDiagnosticProps {
  diagnostic: DiagnosticResponse | null;
  onRefreshDiagnostic: () => void;
  currency: CurrencySymbol;
}

export const MistakeDiagnostic: React.FC<MistakeDiagnosticProps> = ({
  diagnostic,
  onRefreshDiagnostic,
  currency
}) => {
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    setLoading(true);
    await onRefreshDiagnostic();
    setTimeout(() => setLoading(false), 500);
  };

  if (!diagnostic) return null;

  const scoreColor =
    diagnostic.health_score >= 80
      ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
      : diagnostic.health_score >= 60
      ? "text-cyan-400 border-cyan-500/30 bg-cyan-500/10"
      : "text-rose-400 border-rose-500/30 bg-rose-500/10";

  return (
    <div className="space-y-6">
      
      {/* Top Health Score Banner */}
      <div className="p-6 bg-slate-900/80 border border-slate-800/80 rounded-3xl backdrop-blur-md flex flex-wrap items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center space-x-5">
          <div className={`w-20 h-20 rounded-2xl border-2 flex items-center justify-center flex-shrink-0 ${scoreColor}`}>
            <div className="text-center">
              <div className="text-2xl font-black">{diagnostic.health_score}</div>
              <div className="text-[10px] uppercase font-bold tracking-wider">Health</div>
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-white">AI Trade Execution Diagnostic</h2>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full">
                AI Pattern Engine
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              {diagnostic.summary}
            </p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-xl text-xs font-bold transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>Re-Run AI Diagnostic</span>
        </button>
      </div>

      {/* Primary Loss Drivers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Top Mistakes Cost List */}
        <div className="p-6 bg-slate-900/70 border border-slate-800/80 rounded-3xl backdrop-blur-md space-y-4">
          <div className="flex items-center space-x-2 text-rose-400">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Identified Execution Flaws
            </h3>
          </div>

          <div className="space-y-3">
            {diagnostic.top_mistakes.map((m, idx) => (
              <div key={idx} className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-white">{m.mistake}</div>
                  <div className="text-xs text-slate-400">{m.count} Triggers | {m.percentage_of_losses}% of Total Drawdown</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-extrabold text-rose-400">-{currency}{m.total_loss.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-500">Capital Loss</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tactical Recommendations */}
        <div className="p-6 bg-slate-900/70 border border-slate-800/80 rounded-3xl backdrop-blur-md space-y-4">
          <div className="flex items-center space-x-2 text-cyan-400">
            <Zap className="w-5 h-5" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Tactical Behavioral Recommendations
            </h3>
          </div>

          <div className="space-y-3">
            {diagnostic.recommendations.map((rec, idx) => (
              <div key={idx} className="p-4 bg-cyan-950/20 border border-cyan-500/20 rounded-2xl flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-slate-200 leading-relaxed font-medium">
                  {rec}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Prescribed Action Rules */}
      <div className="p-6 bg-slate-900/70 border border-slate-800/80 rounded-3xl backdrop-blur-md space-y-4">
        <div className="flex items-center space-x-2 text-indigo-400">
          <ShieldCheck className="w-5 h-5" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Targeted Trading Rules to Implement
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {diagnostic.rules.map((rule, idx) => (
            <div key={idx} className="p-5 bg-slate-950/80 border border-indigo-500/20 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold text-indigo-300">{rule.title}</div>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                  rule.severity === "High" ? "bg-rose-500/20 text-rose-400" : "bg-cyan-500/20 text-cyan-400"
                }`}>
                  {rule.severity} Priority
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{rule.description}</p>
              <div className="pt-2 border-t border-slate-800 text-xs font-semibold text-emerald-400 flex items-center space-x-1.5">
                <span>Action:</span>
                <span className="text-slate-300 font-normal">{rule.action_item}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
