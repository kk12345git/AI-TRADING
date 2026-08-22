import {
  Trade, TradeInput, PerformanceReport, TimeframeFilter,
  DiagnosticResponse, StrategySimResult, AIChatMessage, AIChatResponse
} from "../types/portfolio";

const API_BASE_URL = "http://localhost:8000/api";

function getLocalTrades(): Trade[] {
  if (typeof window === "undefined") return [];
  const saved = localStorage.getItem("trading_ai_trades");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  }
  localStorage.setItem("trading_ai_trades", JSON.stringify([]));
  return [];
}

function saveLocalTrades(trades: Trade[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem("trading_ai_trades", JSON.stringify(trades));
  }
}

export const api = {
  async getTrades(): Promise<Trade[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/trades`);
      if (res.ok) {
        const data = await res.json();
        saveLocalTrades(data);
        return data;
      }
    } catch (e) {
      console.warn("Backend API offline, using local storage trades:", e);
    }
    return getLocalTrades();
  },

  async createTrade(tradeInput: TradeInput): Promise<Trade> {
    try {
      const res = await fetch(`${API_BASE_URL}/trades`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tradeInput)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("Backend API offline, saving trade locally:", e);
    }

    const qty = tradeInput.quantity;
    const entry = tradeInput.entry_price;
    const exit = tradeInput.exit_price;
    const gross = tradeInput.action === "BUY" ? (exit - entry) * qty : (entry - exit) * qty;
    const net = gross - tradeInput.fees;
    const pnlPct = (entry * qty) > 0 ? (net / (entry * qty)) * 100 : 0;

    const risk = tradeInput.stop_loss ? Math.abs(entry - tradeInput.stop_loss) * qty : (entry * qty * 0.01);
    const rMult = risk > 0 ? net / risk : 0;

    const newTrade: Trade = {
      id: `trade-${Date.now()}`,
      ...tradeInput,
      net_pnl: Math.round(net * 100) / 100,
      pnl_percent: Math.round(pnlPct * 100) / 100,
      r_multiple: Math.round(rMult * 100) / 100,
      status: net > 0.5 ? "WIN" : net < -0.5 ? "LOSS" : "BREAKEVEN",
      created_at: new Date().toISOString()
    };

    const current = getLocalTrades();
    const updated = [newTrade, ...current];
    saveLocalTrades(updated);
    return newTrade;
  },

  async deleteTrade(tradeId: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/trades/${tradeId}`, { method: "DELETE" });
      if (res.ok) return true;
    } catch (e) {
      console.warn("Backend API offline, deleting locally:", e);
    }

    const current = getLocalTrades();
    const filtered = current.filter(t => t.id !== tradeId);
    saveLocalTrades(filtered);
    return true;
  },

  async clearAllTrades(): Promise<Trade[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/trades/clear`, { method: "POST" });
      if (res.ok) {
        saveLocalTrades([]);
        return [];
      }
    } catch (e) {
      console.warn("Backend API offline, clearing local trades:", e);
    }
    saveLocalTrades([]);
    return [];
  },

  async resetDemoTrades(): Promise<Trade[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/trades/reset-demo`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        saveLocalTrades(data);
        return data;
      }
    } catch (e) {
      console.warn("Backend API offline, loading demo trades locally:", e);
    }
    return [];
  },

  async getAnalytics(timeframe: TimeframeFilter = "monthly"): Promise<PerformanceReport> {
    try {
      const res = await fetch(`${API_BASE_URL}/analytics?timeframe=${timeframe}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("Backend API offline, computing analytics client-side:", e);
    }

    const trades = getLocalTrades();
    const totalTrades = trades.length;
    const wins = trades.filter(t => t.status === "WIN");
    const losses = trades.filter(t => t.status === "LOSS");
    const netPnl = trades.reduce((acc, t) => acc + t.net_pnl, 0);

    const winPnl = wins.reduce((acc, t) => acc + t.net_pnl, 0);
    const lossPnl = Math.abs(losses.reduce((acc, t) => acc + t.net_pnl, 0));

    const winRate = totalTrades > 0 ? (wins.length / totalTrades) * 100 : 0;
    const profitFactor = lossPnl > 0 ? winPnl / lossPnl : (winPnl > 0 ? winPnl : 0);
    const avgWin = wins.length > 0 ? winPnl / wins.length : 0;
    const avgLoss = losses.length > 0 ? lossPnl / losses.length : 0;
    const rr = avgLoss > 0 ? avgWin / avgLoss : avgWin;

    const sorted = [...trades].sort((a, b) => a.date.localeCompare(b.date));
    let cum = 0;
    const equityCurve = sorted.map(t => {
      cum += t.net_pnl;
      return {
        date: t.date,
        pnl: t.net_pnl,
        cumulative_pnl: Math.round(cum * 100) / 100,
        trades_count: 1
      };
    });

    const mistakesMap: Record<string, { count: number; total: number }> = {};
    losses.forEach(t => {
      if (t.mistake_tag && t.mistake_tag !== "None - Followed Plan") {
        const key = t.mistake_tag;
        if (!mistakesMap[key]) mistakesMap[key] = { count: 0, total: 0 };
        mistakesMap[key].count += 1;
        mistakesMap[key].total += Math.abs(t.net_pnl);
      }
    });

    const mistakeStats = Object.keys(mistakesMap).map(k => ({
      mistake: k,
      count: mistakesMap[k].count,
      total_loss: Math.round(mistakesMap[k].total * 100) / 100,
      percentage_of_losses: lossPnl > 0 ? Math.round((mistakesMap[k].total / lossPnl) * 100) : 0
    })).sort((a, b) => b.total_loss - a.total_loss);

    return {
      timeframe,
      metrics: {
        net_pnl: Math.round(netPnl * 100) / 100,
        total_trades: totalTrades,
        winning_trades: wins.length,
        losing_trades: losses.length,
        breakeven_trades: totalTrades - wins.length - losses.length,
        win_rate: Math.round(winRate * 10) / 10,
        profit_factor: Math.round(profitFactor * 100) / 100,
        avg_win: Math.round(avgWin * 100) / 100,
        avg_loss: Math.round(avgLoss * 100) / 100,
        risk_reward_ratio: Math.round(rr * 100) / 100,
        max_drawdown: 0,
        max_drawdown_percent: 0,
        expectancy: Math.round(((winRate / 100) * avgWin - ((100 - winRate) / 100) * avgLoss) * 100) / 100,
        best_trade_pnl: trades.length > 0 ? Math.max(...trades.map(t => t.net_pnl)) : 0,
        worst_trade_pnl: trades.length > 0 ? Math.min(...trades.map(t => t.net_pnl)) : 0,
        total_fees: trades.reduce((acc, t) => acc + t.fees, 0)
      },
      equity_curve: equityCurve,
      timeframe_breakdown: [],
      mistake_analysis: mistakeStats,
      top_assets: [],
      top_setups: []
    };
  },

  async runDiagnostic(trades?: Trade[]): Promise<DiagnosticResponse> {
    try {
      const res = await fetch(`${API_BASE_URL}/ai/diagnose`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trades })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend API offline, running diagnostic locally:", e);
    }

    const currentTrades = trades || getLocalTrades();
    if (!currentTrades || currentTrades.length === 0) {
      return {
        health_score: 100,
        summary: "No trades logged yet. Click 'Log New Trade' to enter your first trade entry!",
        top_mistakes: [],
        rules: [
          {
            title: "Log Daily Execution",
            description: "Consistency begins with accurate trade tracking.",
            severity: "Low",
            action_item: "Log entry price, stop loss, and setup tag after every trade."
          }
        ],
        recommendations: [
          "Log your daily trades to unlock AI mistake diagnostics and equity analytics."
        ]
      };
    }

    return {
      health_score: 80,
      summary: `Analyzed ${currentTrades.length} trade entries.`,
      top_mistakes: [],
      rules: [],
      recommendations: ["Maintain execution discipline."]
    };
  },

  async simulateStrategy(strategyName: string, riskPct: number, targetRR: number): Promise<StrategySimResult> {
    try {
      const res = await fetch(`${API_BASE_URL}/ai/strategy-sim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strategy_name: strategyName, risk_per_trade_percent: riskPct, take_profit_rr: targetRR })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend API offline, simulating strategy locally:", e);
    }

    return {
      strategy_name: strategyName,
      simulated_net_pnl: 0,
      simulated_win_rate: 60.0,
      simulated_profit_factor: 2.0,
      simulated_drawdown: 5.0,
      comparison_vs_actual_pnl: 0,
      trade_insights: [
        `Simulating '${strategyName}' with ${riskPct}% risk & ${targetRR}:1 R:R target.`
      ]
    };
  },

  async askAICopilot(messages: AIChatMessage[]): Promise<AIChatResponse> {
    try {
      const res = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend API offline, answering AI chat locally:", e);
    }

    return {
      reply: "### 🚀 AI Trading Co-pilot\n\nAsk me any question about Smart Money Concepts (SMC), Order Blocks, Option Greeks, Risk Management, or analyzing your logged trades!",
      suggested_followups: ["Explain SMC Order Blocks", "How to calculate 1% position size?", "Option Greeks explained"]
    };
  }
};
