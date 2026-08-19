'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/header/Header';
import { TradingChart } from '@/components/chart/TradingChart';
import { MyAiIndicatorSidebar } from '@/components/indicator/MyAiIndicatorSidebar';
import { OptionChainTable } from '@/components/options/OptionChainTable';
import { ReplayBar } from '@/components/replay/ReplayBar';
import { BacktestPanel } from '@/components/backtest/BacktestPanel';
import { TradeJournalPanel } from '@/components/journal/TradeJournalPanel';
import { api } from '@/services/api';
import { Candle, FullSignalPayload, OptionChainData, ReplayState } from '@/types';

export default function Home() {
  const [symbol, setSymbol] = useState('NIFTY 50');
  const [exchange, setExchange] = useState('NSE');
  const [timeframe, setTimeframe] = useState('5m');
  const [activeTab, setActiveTab] = useState('CHART');

  const [candles, setCandles] = useState<Candle[]>([]);
  const [signalData, setSignalData] = useState<FullSignalPayload | null>(null);
  const [optionData, setOptionData] = useState<OptionChainData | null>(null);
  const [replayState, setReplayState] = useState<ReplayState | null>(null);

  const [dataHealth, setDataHealth] = useState('LIVE');
  const [marketStatus, setMarketStatus] = useState('OPEN');

  // Load Market Data & Strategy Evaluation
  const refreshData = async () => {
    try {
      const [cRes, sRes, oRes] = await Promise.all([
        api.getCandles(symbol, exchange, timeframe, 150),
        api.getSignal(symbol, exchange, timeframe),
        api.getOptionChain(symbol, exchange)
      ]);
      setCandles(cRes);
      setSignalData(sRes);
      setOptionData(oRes);
      setDataHealth('LIVE');
      setMarketStatus(sRes.market_status || 'LIVE');
    } catch (e) {
      console.error(e);
      setDataHealth('STALE');
    }
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 2000);
    return () => clearInterval(interval);
  }, [symbol, exchange, timeframe]);

  // Handle WebSockets Tick Stream
  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://127.0.0.1:8000/ws/live';
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log('Connected to MyTrade AI Live Tick Feed');
    };

    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'TICK_UPDATE' && msg.symbol === symbol) {
          setSignalData(msg.signal);
        }
      } catch (e) {
        console.error(e);
      }
    };

    return () => {
      socket.close();
    };
  }, [symbol]);

  const handleSelectInstrument = (newSym: string, newEx: string) => {
    setSymbol(newSym);
    setExchange(newEx);
  };

  const handleLogTrade = async () => {
    if (!signalData) return;
    try {
      await api.addJournalEntry({
        timestamp: new Date().toLocaleString(),
        exchange: signalData.exchange,
        symbol: signalData.symbol,
        instrument: 'INDEX/STOCK',
        direction: signalData.signal === 'BUY' ? 'BUY' : 'SELL',
        setup: signalData.setup_5m,
        entry: signalData.price,
        sl: signalData.ai_explanation.trade_plan?.stop_loss || signalData.price * 0.99,
        target: signalData.ai_explanation.trade_plan?.target_1 || signalData.price * 1.02,
        strategy_score: signalData.strategy_score,
        conditions_met: signalData.conditions.filter(c => c.is_satisfied).map(c => c.name),
        ai_explanation: signalData.ai_explanation.ai_comment
      });
      alert('Strategy setup logged to Trade Journal!');
    } catch (e) {
      console.error(e);
    }
  };

  const handleStepReplay = async () => {
    try {
      const step = (replayState?.current_index || 30) + 1;
      const res = await api.stepReplay(symbol, timeframe, step);
      setReplayState(res);
      setCandles(res.signal ? candles.slice(0, step) : candles);
      setSignalData(res.signal);
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetReplay = async () => {
    try {
      const res = await api.stepReplay(symbol, timeframe, 30);
      setReplayState(res);
      setSignalData(res.signal);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Header Navigation */}
      <Header
        currentSymbol={symbol}
        currentExchange={exchange}
        currentTimeframe={timeframe}
        onSelectInstrument={handleSelectInstrument}
        onSelectTimeframe={setTimeframe}
        marketStatus={marketStatus}
        dataHealth={dataHealth}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Workspace Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left / Center Main Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Main Interactive Chart */}
          <div className="flex-1 relative">
            <TradingChart
              symbol={symbol}
              candles={candles}
              signalData={signalData}
              timeframe={timeframe}
            />
          </div>

          {/* Bottom Dock Panel (Option Chain / Replay / Backtest / Journal) */}
          {activeTab === 'OPTION CHAIN' && (
            <div className="h-[340px] shrink-0">
              <OptionChainTable
                optionData={optionData}
                onSelectExpiry={(exp) => {
                  if (optionData) {
                    api.getOptionChain(symbol, exchange, exp).then(setOptionData);
                  }
                }}
              />
            </div>
          )}

          {activeTab === 'REPLAY' && (
            <div className="h-[260px] shrink-0">
              <ReplayBar
                symbol={symbol}
                timeframe={timeframe}
                replayState={replayState}
                onStepForward={handleStepReplay}
                onReset={handleResetReplay}
              />
            </div>
          )}

          {activeTab === 'BACKTEST' && (
            <div className="h-[340px] shrink-0">
              <BacktestPanel
                symbol={symbol}
                exchange={exchange}
                timeframe={timeframe}
              />
            </div>
          )}

          {activeTab === 'JOURNAL' && (
            <div className="h-[320px] shrink-0">
              <TradeJournalPanel />
            </div>
          )}
        </div>

        {/* Right Sidebar: MY AI INDICATOR */}
        <MyAiIndicatorSidebar
          signalData={signalData}
          onLogTrade={handleLogTrade}
        />
      </div>
    </div>
  );
}
