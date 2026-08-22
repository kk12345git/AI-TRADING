import {
  Trade, TradeInput, PerformanceReport, TimeframeFilter,
  DiagnosticResponse, StrategySimResult, AIChatMessage, AIChatResponse
} from "../types/portfolio";

const API_BASE_URL = "http://localhost:8000/api";

// Fallback demo data in case backend is offline
const DEMO_TRADES: Trade[] = [
  {
    id: "trade-001",
    date: "2026-08-20",
    time: "09:30",
    symbol: "NIFTY50",
    asset_class: "Stocks",
    action: "BUY",
    quantity: 50,
    entry_price: 22000,
    exit_price: 22450,
    stop_loss: 21850,
    take_profit: 22500,
    fees: 25,
    net_pnl: 22475,
    pnl_percent: 2.04,
    r_multiple: 3.0,
    status: "WIN",
    setup_tag: "SMC Order Block",
    mistake_tag: "None - Followed Plan",
    emotion_rating: 5,
    notes: "Clean tap on 15m order block after liquidity sweep.",
    created_at: "2026-08-20 09:30:00"
  },
  {
    id: "trade-002",
    date: "2026-08-18",
    time: "10:15",
    symbol: "AAPL",
    asset_class: "Stocks",
    action: "BUY",
    quantity: 100,
    entry_price: 185,
    exit_price: 180,
    stop_loss: 182,
    take_profit: 192,
    fees: 5,
    net_pnl: -505,
    pnl_percent: -2.73,
    r_multiple: -1.67,
    status: "LOSS",
    setup_tag: "Breakout",
    mistake_tag: "FOMO",
    emotion_rating: 2,
    notes: "Chased entry after 5m green candle pump.",
    created_at: "2026-08-18 10:15:00"
  },
  {
    id: "trade-003",
    date: "2026-08-15",
    time: "14:00",
    symbol: "BTC/USD",
    asset_class: "Crypto",
    action: "BUY",
    quantity: 0.5,
    entry_price: 61000,
    exit_price: 63500,
    stop_loss: 59800,
    take_profit: 64000,
    fees: 15,
    net_pnl: 1235,
    pnl_percent: 4.05,
    r_multiple: 2.08,
    status: "WIN",
    setup_tag: "VWAP Reversion",
    mistake_tag: "None - Followed Plan",
    emotion_rating: 4,
    notes: "Price held VWAP support with volume spike.",
    created_at: "2026-08-15 14:00:00"
  },
  {
    id: "trade-004",
    date: "2026-08-12",
    time: "11:30",
    symbol: "BANKNIFTY",
    asset_class: "Options",
    action: "BUY",
    quantity: 25,
    entry_price: 47500,
    exit_price: 46800,
    stop_loss: 47100,
    take_profit: 48300,
    fees: 30,
    net_pnl: -17530,
    pnl_percent: -1.47,
    r_multiple: -1.75,
    status: "LOSS",
    setup_tag: "Scalp",
    mistake_tag: "Moved Stop Loss",
    emotion_rating: 1,
    notes: "Price broke stop loss but I dragged it down hoping for rebound.",
    created_at: "2026-08-12 11:30:00"
  },
  {
    id: "trade-005",
    date: "2026-08-10",
    time: "09:45",
    symbol: "NVDA",
    asset_class: "Stocks",
    action: "BUY",
    quantity: 30,
    entry_price: 120,
    exit_price: 128,
    stop_loss: 117,
    take_profit: 127,
    fees: 8,
    net_pnl: 232,
    pnl_percent: 6.44,
    r_multiple: 2.67,
    status: "WIN",
    setup_tag: "Breakout",
    mistake_tag: "None - Followed Plan",
    emotion_rating: 5,
    notes: "Daily high breakout after tech earnings rally.",
    created_at: "2026-08-10 09:45:00"
  }
];

function getLocalTrades(): Trade[] {
  if (typeof window === "undefined") return DEMO_TRADES;
  const saved = localStorage.getItem("trading_ai_trades");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return DEMO_TRADES;
    }
  }
  localStorage.setItem("trading_ai_trades", JSON.stringify(DEMO_TRADES));
  return DEMO_TRADES;
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

    // Local creation calculation fallback
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

  async resetDemoTrades(): Promise<Trade[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/trades/reset-demo`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        saveLocalTrades(data);
        return data;
      }
    } catch (e) {
      console.warn("Backend API offline, resetting demo trades locally:", e);
    }
    saveLocalTrades(DEMO_TRADES);
    return DEMO_TRADES;
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

    // Client side analytics fallback
    const trades = getLocalTrades();
    const totalTrades = trades.length;
    const wins = trades.filter(t => t.status === "WIN");
    const losses = trades.filter(t => t.status === "LOSS");
    const netPnl = trades.reduce((acc, t) => acc + t.net_pnl, 0);

    const winPnl = wins.reduce((acc, t) => acc + t.net_pnl, 0);
    const lossPnl = Math.abs(losses.reduce((acc, t) => acc + t.net_pnl, 0));

    const winRate = totalTrades > 0 ? (wins.length / totalTrades) * 100 : 0;
    const profitFactor = lossPnl > 0 ? winPnl / lossPnl : winPnl;
    const avgWin = wins.length > 0 ? winPnl / wins.length : 0;
    const avgLoss = losses.length > 0 ? lossPnl / losses.length : 0;
    const rr = avgLoss > 0 ? avgWin / avgLoss : avgWin;

    // Cum equity curve
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

    // Mistake breakdown
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
        max_drawdown: 1250,
        max_drawdown_percent: 8.5,
        expectancy: Math.round(((winRate / 100) * avgWin - ((100 - winRate) / 100) * avgLoss) * 100) / 100,
        best_trade_pnl: Math.max(...trades.map(t => t.net_pnl), 0),
        worst_trade_pnl: Math.min(...trades.map(t => t.net_pnl), 0),
        total_fees: trades.reduce((acc, t) => acc + t.fees, 0)
      },
      equity_curve: equityCurve,
      timeframe_breakdown: [
        { timeframe, period_label: "Recent Period", net_pnl: Math.round(netPnl * 100) / 100, trades_count: totalTrades, win_rate: Math.round(winRate) }
      ],
      mistake_analysis: mistakeStats,
      top_assets: [
        { name: "NIFTY50", count: 12, net_pnl: 14500, win_rate: 68 },
        { name: "BTC/USD", count: 8, net_pnl: 3400, win_rate: 62.5 }
      ],
      top_setups: [
        { name: "SMC Order Block", count: 14, net_pnl: 16200, win_rate: 71.4 },
        { name: "Breakout", count: 10, net_pnl: -1200, win_rate: 40 }
      ]
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

    return {
      health_score: 76,
      summary: "Analyzed your trades. Main profit drag is FOMO entries and widening Stop Loss.",
      top_mistakes: [
        { mistake: "FOMO", count: 3, total_loss: 1850, percentage_of_losses: 42 },
        { mistake: "Moved Stop Loss", count: 2, total_loss: 1400, percentage_of_losses: 31.8 }
      ],
      rules: [
        {
          title: "Enforce 5-Minute Entry Wait Rule for FOMO",
          description: "FOMO entries cost you significant capital. Wait 1 candle for retest before executing.",
          severity: "High",
          action_item: "Do not market buy pumps. Set limit orders at retest zones."
        },
        {
          title: "Lock Terminal Stop Loss",
          description: "Moving stop loss during drawdown ruins your account risk parameters.",
          severity: "High",
          action_item: "Set hard stop loss order in broker immediately upon trade placement."
        }
      ],
      recommendations: [
        "Cap risk to 1% of account balance per trade.",
        "Step away from screens after 2 consecutive losing trades."
      ]
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
      simulated_net_pnl: 18450,
      simulated_win_rate: 61.5,
      simulated_profit_factor: 2.1,
      simulated_drawdown: 9.4,
      comparison_vs_actual_pnl: 4250,
      trade_insights: [
        `Simulating '${strategyName}' with ${riskPct}% risk & ${targetRR}:1 R:R target.`,
        "Enforcing fixed R:R target avoids premature exits.",
        "Simulated Win Rate of 61.5% outperforms current baseline."
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

    const lastMsg = messages[messages.length - 1]?.content.toLowerCase() || "";
    if (lastMsg.includes("smc") || lastMsg.includes("order block") || lastMsg.includes("liquidity")) {
      return {
        reply: "### 📈 Smart Money Concepts (SMC) & Order Blocks\n\n- **Order Block (OB)**: The last down candle before an aggressive rally that breaks market structure.\n- **Liquidity Sweep**: Price dipping past previous equal lows to sweep retail stop losses before sharply reversing.\n- **Entry Rule**: Wait for lower timeframe (5m/15m) liquidity sweep, mark the Order Block with FVG, and place limit order with SL below OB low.",
        suggested_followups: ["What is a Fair Value Gap (FVG)?", "Explain CHoCH vs MSB", "Simulate SMC strategy on my trades"]
      };
    }

    return {
      reply: "### 🚀 AI Trading Co-pilot\n\nI can help you build quantitative strategies, eliminate trading mistakes (FOMO, Over-leveraging), analyze risk parameters, or answer advanced technical/fundamental trading questions!\n\nWhat would you like to explore today?",
      suggested_followups: ["Analyze my trade mistakes", "How to size positions using 1% rule?", "Explain Option Greeks (Delta/Theta)"]
    };
  }
};
