"use client";

import React, { useState, useEffect } from "react";
import { HeaderNav } from "../components/HeaderNav";
import { MetricsOverview } from "../components/MetricsOverview";
import { AnalyticsCharts } from "../components/AnalyticsCharts";
import { TradeJournalTable } from "../components/TradeJournalTable";
import { TradeLoggerModal } from "../components/TradeLoggerModal";
import { MistakeDiagnostic } from "../components/MistakeDiagnostic";
import { AIStrategyHub } from "../components/AIStrategyHub";
import { AICopilotChat } from "../components/AICopilotChat";

import { api } from "../services/api";
import {
  Trade, TradeInput, PerformanceReport, TimeframeFilter,
  CurrencySymbol, DiagnosticResponse, StrategySimResult, AIChatMessage
} from "../types/portfolio";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [currency, setCurrency] = useState<CurrencySymbol>("$");
  const [timeframe, setTimeframe] = useState<TimeframeFilter>("monthly");

  const [trades, setTrades] = useState<Trade[]>([]);
  const [report, setReport] = useState<PerformanceReport | null>(null);
  const [diagnostic, setDiagnostic] = useState<DiagnosticResponse | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const fetchedTrades = await api.getTrades();
      setTrades(fetchedTrades);

      const fetchedReport = await api.getAnalytics(timeframe);
      setReport(fetchedReport);

      const fetchedDiag = await api.runDiagnostic(fetchedTrades);
      setDiagnostic(fetchedDiag);
    } catch (e) {
      console.error("Error loading application data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [timeframe]);

  const handleCreateTrade = async (input: TradeInput) => {
    const created = await api.createTrade(input);
    const updatedTrades = [created, ...trades];
    setTrades(updatedTrades);

    // Refresh analytics & diagnostic
    const newReport = await api.getAnalytics(timeframe);
    setReport(newReport);

    const newDiag = await api.runDiagnostic(updatedTrades);
    setDiagnostic(newDiag);
  };

  const handleDeleteTrade = async (id: string) => {
    await api.deleteTrade(id);
    const updatedTrades = trades.filter((t) => t.id !== id);
    setTrades(updatedTrades);

    const newReport = await api.getAnalytics(timeframe);
    setReport(newReport);

    const newDiag = await api.runDiagnostic(updatedTrades);
    setDiagnostic(newDiag);
  };

  const handleResetDemoData = async () => {
    const demoTrades = await api.resetDemoTrades();
    setTrades(demoTrades);

    const newReport = await api.getAnalytics(timeframe);
    setReport(newReport);

    const newDiag = await api.runDiagnostic(demoTrades);
    setDiagnostic(newDiag);
  };

  const handleRefreshDiagnostic = async () => {
    const newDiag = await api.runDiagnostic(trades);
    setDiagnostic(newDiag);
  };

  const handleSimulateStrategy = async (name: string, riskPct: number, targetRR: number): Promise<StrategySimResult> => {
    return await api.simulateStrategy(name, riskPct, targetRR);
  };

  const handleSendAIChat = async (messages: AIChatMessage[]) => {
    return await api.askAICopilot(messages);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Navigation Header */}
      <HeaderNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currency={currency}
        setCurrency={setCurrency}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onResetDemoData={handleResetDemoData}
        totalTrades={trades.length}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {loading && !report ? (
          <div className="h-96 flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin"></div>
            <p className="text-xs text-slate-400 font-mono">Loading Trade Matrix Engine...</p>
          </div>
        ) : (
          <>
            {/* Tab 1: Dashboard & Performance Analytics */}
            {activeTab === "dashboard" && report && (
              <div className="space-y-8">
                <MetricsOverview
                  metrics={report.metrics}
                  timeframe={timeframe}
                  setTimeframe={setTimeframe}
                  currency={currency}
                />
                <AnalyticsCharts report={report} currency={currency} />
              </div>
            )}

            {/* Tab 2: Trade Journal */}
            {activeTab === "journal" && (
              <TradeJournalTable
                trades={trades}
                onDeleteTrade={handleDeleteTrade}
                currency={currency}
              />
            )}

            {/* Tab 3: AI Mistake Solver & Diagnostic */}
            {activeTab === "diagnostics" && (
              <MistakeDiagnostic
                diagnostic={diagnostic}
                onRefreshDiagnostic={handleRefreshDiagnostic}
                currency={currency}
              />
            )}

            {/* Tab 4: AI Strategy Hub & Backtest */}
            {activeTab === "strategy" && (
              <AIStrategyHub
                onSimulateStrategy={handleSimulateStrategy}
                currency={currency}
              />
            )}

            {/* Tab 5: AI Co-pilot Chat */}
            {activeTab === "copilot" && (
              <AICopilotChat
                onSendMessage={handleSendAIChat}
                currency={currency}
              />
            )}
          </>
        )}

      </main>

      {/* Log New Trade Modal */}
      <TradeLoggerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateTrade}
        currency={currency}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <p>TradeMatrix AI • Advanced Portfolio Manager & AI Trade Co-pilot</p>
      </footer>
    </div>
  );
}
