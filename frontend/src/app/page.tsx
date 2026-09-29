"use client";

import React, { useState, useEffect } from "react";
import { HeaderNav } from "../components/HeaderNav";
import { MetricsOverview } from "../components/MetricsOverview";
import { AnalyticsCharts } from "../components/AnalyticsCharts";
import { TradeJournalTable } from "../components/TradeJournalTable";
import { TradeLoggerModal } from "../components/TradeLoggerModal";
import { UserProfileSettingsModal } from "../components/UserProfileSettingsModal";
import { TraderComparisonView } from "../components/TraderComparisonView";
import { AuthPortal } from "../components/AuthPortal";
import { MobileBottomNav } from "../components/MobileBottomNav";

import { api } from "../services/api";
import {
  Trade, TradeInput, PerformanceReport, TimeframeFilter,
  CurrencySymbol, UserProfile, UserLoginInput, UserUpdateInput
} from "../types/portfolio";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<string>("register");
  const [timeframe, setTimeframe] = useState<TimeframeFilter>("monthly");

  const [traders, setTraders] = useState<UserProfile[]>([]);
  const [activeTrader, setActiveTrader] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const [trades, setTrades] = useState<Trade[]>([]);
  const [report, setReport] = useState<PerformanceReport | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize App: load traders list. ALWAYS require authentication gate first on open/refresh!
  const initApp = async () => {
    setLoading(true);
    try {
      const fetchedTraders = await api.getUsers();
      setTraders(fetchedTraders);
      // Strictly keep unauthenticated so authentication gate is always displayed first
      setIsAuthenticated(false);

      const activeId = api.getActiveUserId();
      if (activeId) {
        const found = fetchedTraders.find(u => u.id === activeId);
        if (found) {
          setActiveTrader(found);
        }
      }
    } catch (e) {
      console.error("Error initializing app:", e);
    } finally {
      setLoading(false);
    }
  };

  // Load Trader's trades and periodic analytics report
  const loadTraderData = async (user: UserProfile, tf: TimeframeFilter) => {
    setLoading(true);
    try {
      const fetchedTrades = await api.getTrades(user.id);
      setTrades(fetchedTrades);

      const fetchedReport = await api.getAnalytics(user.id, tf);
      setReport(fetchedReport);
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
    if (activeTrader && isAuthenticated) {
      loadTraderData(activeTrader, timeframe);
    }
  }, [activeTrader, isAuthenticated, timeframe]);

  // Auth Handlers
  const handleAuthenticate = (trader: UserProfile) => {
    api.setActiveUserId(trader.id);
    setActiveTrader(trader);
    setIsAuthenticated(true);
  };

  const handleLoginAttempt = async (creds: UserLoginInput): Promise<UserProfile | null> => {
    return await api.loginUser(creds);
  };

  const handleLogout = () => {
    api.logout();
    setIsAuthenticated(false);
    setActiveTrader(null);
  };

  const handleSwitchTrader = (targetTrader: UserProfile) => {
    api.setActiveUserId(targetTrader.id);
    setActiveTrader(targetTrader);
    // When switching trader, open authentication gate for that trader
    setIsAuthenticated(false);
  };

  // Trade CRUD Handlers
  const handleSaveTrade = async (input: TradeInput, editId?: string) => {
    if (!activeTrader) return;
    input.user_id = activeTrader.id;

    if (editId) {
      await api.updateTrade(editId, input);
    } else {
      await api.createTrade(input);
    }

    setEditingTrade(null);
    await loadTraderData(activeTrader, timeframe);
  };

  const handleEditTrade = (trade: Trade) => {
    setEditingTrade(trade);
    setIsAddModalOpen(true);
  };

  const handleDeleteTrade = async (tradeId: string) => {
    if (!activeTrader) return;
    if (window.confirm("Delete this trade from your register?")) {
      await api.deleteTrade(tradeId, activeTrader.id);
      await loadTraderData(activeTrader, timeframe);
    }
  };

  const handleClearTrades = async () => {
    if (!activeTrader) return;
    await api.clearTrades(activeTrader.id);
    await loadTraderData(activeTrader, timeframe);
  };

  const handleUpdateProfile = async (updated: UserUpdateInput) => {
    if (!activeTrader) return;
    const res = await api.updateUser(activeTrader.id, updated);
    if (res) {
      setActiveTrader(res);
      const all = await api.getUsers();
      setTraders(all);
    }
  };

  // 1. If not authenticated, ALWAYS show 2-Trader Authentication Portal
  if (!isAuthenticated || !activeTrader) {
    return (
      <AuthPortal
        traders={traders}
        onAuthenticate={handleAuthenticate}
        onLoginAttempt={handleLoginAttempt}
      />
    );
  }

  const currency = activeTrader.base_currency || "₹";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Top Header Navigation */}
      <HeaderNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currency={currency}
        setCurrency={(c) => handleUpdateProfile({ base_currency: c })}
        activeTrader={activeTrader}
        allTraders={traders}
        onSwitchTrader={handleSwitchTrader}
        onOpenProfileSettings={() => setIsSettingsModalOpen(true)}
        onOpenAddModal={() => {
          setEditingTrade(null);
          setIsAddModalOpen(true);
        }}
        onLogout={handleLogout}
        totalTrades={trades.length}
        netPnl={report?.metrics.net_pnl || 0}
      />

      {/* Main Content with bottom padding on mobile for MobileBottomNav */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-7 space-y-6 pb-24 md:pb-8">
        
        {/* KPI Cards Overview (Always visible on top of Dashboard and Register) */}
        {report && (
          <MetricsOverview
            metrics={report.metrics}
            currency={currency}
            accountCapital={activeTrader.account_capital}
          />
        )}

        {/* TAB 1: TRADE REGISTER (DAILY POINTS & P&L) */}
        {activeTab === "register" && (
          <TradeJournalTable
            trades={trades}
            dailyGroups={report?.daily_groups || []}
            currency={currency}
            onOpenAddModal={() => {
              setEditingTrade(null);
              setIsAddModalOpen(true);
            }}
            onEditTrade={handleEditTrade}
            onDeleteTrade={handleDeleteTrade}
            onClearTrades={handleClearTrades}
          />
        )}

        {/* TAB 2: PERIODIC DASHBOARD (DAILY, WEEKLY, MONTHLY, QUARTERLY, HALF, ANNUALLY) */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <AnalyticsCharts
              report={report}
              currentTimeframe={timeframe}
              onTimeframeChange={(tf) => setTimeframe(tf)}
              currency={currency}
            />
          </div>
        )}

        {/* TAB 3: DUAL TRADERS COMPARISON */}
        {activeTab === "comparison" && (
          <TraderComparisonView
            traders={traders}
            currency={currency}
            onSelectTrader={(t) => {
              handleSwitchTrader(t);
              setActiveTab("register");
            }}
          />
        )}

      </main>

      {/* Mobile Bottom Navigation Bar (Fixed at bottom on phones) */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => {
          setEditingTrade(null);
          setIsAddModalOpen(true);
        }}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        activeTrader={activeTrader}
      />

      {/* Modals */}
      <TradeLoggerModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTrade(null);
        }}
        onSaveTrade={handleSaveTrade}
        editingTrade={editingTrade}
        currency={currency}
        activeUserId={activeTrader.id}
      />

      <UserProfileSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        user={activeTrader}
        onUpdateProfile={handleUpdateProfile}
      />

    </div>
  );
}
