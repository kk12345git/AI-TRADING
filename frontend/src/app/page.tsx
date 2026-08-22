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
import { UserLoginModal } from "../components/UserLoginModal";
import { UserOnboardingView } from "../components/UserOnboardingView";
import { UserProfileSettingsModal } from "../components/UserProfileSettingsModal";
import { MobileBottomNav } from "../components/MobileBottomNav";

import { api } from "../services/api";
import {
  Trade, TradeInput, PerformanceReport, TimeframeFilter,
  CurrencySymbol, UserProfile, UserOnboardInput, UserUpdateInput,
  DiagnosticResponse, StrategySimResult, AIChatMessage
} from "../types/portfolio";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [currency, setCurrency] = useState<CurrencySymbol>("$");
  const [timeframe, setTimeframe] = useState<TimeframeFilter>("monthly");

  const [traders, setTraders] = useState<UserProfile[]>([]);
  const [activeTrader, setActiveTrader] = useState<UserProfile | null>(null);

  const [trades, setTrades] = useState<Trade[]>([]);
  const [report, setReport] = useState<PerformanceReport | null>(null);
  const [diagnostic, setDiagnostic] = useState<DiagnosticResponse | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isTraderModalOpen, setIsTraderModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Initial Load: check traders list and active trader profile
  const initApp = async () => {
    setLoading(true);
    try {
      const fetchedUsers = await api.getUsers();
      setTraders(fetchedUsers);

      const activeId = api.getActiveUserId();
      if (activeId) {
        const found = fetchedUsers.find(u => u.id === activeId);
        if (found) {
          setActiveTrader(found);
          setCurrency(found.base_currency);
        } else if (fetchedUsers.length > 0) {
          setActiveTrader(fetchedUsers[0]);
          setCurrency(fetchedUsers[0].base_currency);
        }
      }
    } catch (e) {
      console.error("Error initializing app:", e);
    } finally {
      setLoading(false);
    }
  };

  const loadTraderData = async (user: UserProfile, tf: TimeframeFilter) => {
    setLoading(true);
    try {
      const fetchedTrades = await api.getTrades(user.id);
      setTrades(fetchedTrades);

      const fetchedReport = await api.getAnalytics(user.id, tf);
      setReport(fetchedReport);

      const fetchedDiag = await api.runDiagnostic(user.id, fetchedTrades);
      setDiagnostic(fetchedDiag);
    } catch (e) {
      console.error("Error loading trader data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initApp();
  }, []);

  useEffect(() => {
    if (activeTrader) {
      loadTraderData(activeTrader, timeframe);
    }
  }, [activeTrader, timeframe]);

  // Auth / Login / Onboard Actions
  const handleLogin = async (email: string): Promise<boolean> => {
    const user = await api.loginUser(email);
    if (user) {
      setActiveTrader(user);
      setCurrency(user.base_currency);
      const allUsers = await api.getUsers();
      setTraders(allUsers);
      return true;
    }
    return false;
  };

  const handleOnboard = async (input: UserOnboardInput) => {
    const user = await api.onboardUser(input);
    setActiveTrader(user);
    setCurrency(user.base_currency);
    const allUsers = await api.getUsers();
    setTraders(allUsers);
  };

  const handleUpdateProfile = async (input: UserUpdateInput) => {
    if (!activeTrader) return;
    const updated = await api.updateUserProfile(activeTrader.id, input);
    if (updated) {
      setActiveTrader(updated);
      setCurrency(updated.base_currency);
      const allUsers = await api.getUsers();
      setTraders(allUsers);
    }
  };

  const handleSelectTrader = (trader: UserProfile) => {
    api.setActiveUserId(trader.id);
    setActiveTrader(trader);
    setCurrency(trader.base_currency);
  };

  const handleLogout = () => {
    api.setActiveUserId(null);
    setActiveTrader(null);
    setTrades([]);
    setReport(null);
    setDiagnostic(null);
  };

  // Trade Actions
  const handleCreateTrade = async (input: TradeInput) => {
    if (!activeTrader) return;
    input.user_id = activeTrader.id;
    const created = await api.createTrade(input);
    const updatedTrades = [created, ...trades];
    setTrades(updatedTrades);

    const newReport = await api.getAnalytics(activeTrader.id, timeframe);
    setReport(newReport);

    const newDiag = await api.runDiagnostic(activeTrader.id, updatedTrades);
    setDiagnostic(newDiag);
  };

  const handleDeleteTrade = async (id: string) => {
    if (!activeTrader) return;
    await api.deleteTrade(activeTrader.id, id);
    const updatedTrades = trades.filter((t) => t.id !== id);
    setTrades(updatedTrades);

    const newReport = await api.getAnalytics(activeTrader.id, timeframe);
    setReport(newReport);

    const newDiag = await api.runDiagnostic(activeTrader.id, updatedTrades);
    setDiagnostic(newDiag);
  };

  const handleRefreshDiagnostic = async () => {
    if (!activeTrader) return;
    const newDiag = await api.runDiagnostic(activeTrader.id, trades);
    setDiagnostic(newDiag);
  };

  const handleSimulateStrategy = async (name: string, riskPct: number, targetRR: number): Promise<StrategySimResult> => {
    if (!activeTrader) throw new Error("No active trader");
    return await api.simulateStrategy(activeTrader.id, name, riskPct, targetRR);
  };

  const handleSendAIChat = async (messages: AIChatMessage[]) => {
    if (!activeTrader) throw new Error("No active trader");
    return await api.askAICopilot(activeTrader.id, messages);
  };

  // Render Login & Onboarding View if no active trader profile
  if (!activeTrader && !loading) {
    return <UserOnboardingView onLogin={handleLogin} onOnboard={handleOnboard} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 pb-20 md:pb-8">
      
      {/* Navigation Header */}
      {activeTrader && (
        <HeaderNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currency={currency}
          setCurrency={setCurrency}
          activeTrader={activeTrader}
          onOpenTraderModal={() => setIsTraderModalOpen(true)}
          onOpenProfileSettings={() => setIsSettingsModalOpen(true)}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onLogout={handleLogout}
          totalTrades={trades.length}
        />
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        
        {loading && !report ? (
          <div className="h-96 flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin"></div>
            <p className="text-xs text-slate-400 font-mono">Loading Trader Portfolio Matrix...</p>
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

      {/* User Login & Account Switcher Modal */}
      <UserLoginModal
        isOpen={isTraderModalOpen}
        onClose={() => setIsTraderModalOpen(false)}
        traders={traders}
        activeTrader={activeTrader!}
        onSelectTrader={handleSelectTrader}
        onCreateTrader={async (email, name, c) => {
          await handleOnboard({
            email,
            name,
            avatar: "⚡",
            base_currency: c,
            trading_style: "Day Trader",
            primary_market: "Stocks",
            account_capital: 10000,
            risk_per_trade_pct: 1.0,
            trading_goals: "Consistency & Risk Discipline"
          });
        }}
      />

      {/* User Profile Settings Modal */}
      {activeTrader && (
        <UserProfileSettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          user={activeTrader}
          onUpdateProfile={handleUpdateProfile}
        />
      )}

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenProfileModal={() => setIsSettingsModalOpen(true)}
        totalTrades={trades.length}
      />

      {/* Footer */}
      <footer className="hidden md:block border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <p>TradeMatrix AI • Multi-Trader Portfolio Manager & AI Trade Co-pilot</p>
      </footer>
    </div>
  );
}
