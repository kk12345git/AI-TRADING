import {
  Trade, TradeInput, PerformanceReport, TimeframeFilter,
  UserProfile, UserLoginInput, UserUpdateInput,
  MetricsSummary, TimeframeAggregation, DailyTradeGroup, EquityPoint, StrategyStat
} from "../types/portfolio";

const API_BASE_URL = "http://localhost:8000/api";

const DEFAULT_USERS: UserProfile[] = [
  {
    id: "trader_1",
    name: "Trader 1 (Alpha)",
    username: "trader1",
    pin: "1234",
    avatar: "⚡",
    base_currency: "₹",
    trading_style: "Index Options & Momentum",
    primary_market: "NIFTY / BANKNIFTY",
    account_capital: 100000,
    created_at: "2026-01-01 09:15:00"
  },
  {
    id: "trader_2",
    name: "Trader 2 (Pro)",
    username: "trader2",
    pin: "5678",
    avatar: "🎯",
    base_currency: "₹",
    trading_style: "Price Action & Swing",
    primary_market: "Equities & Futures",
    account_capital: 150000,
    created_at: "2026-01-01 09:15:00"
  }
];

function getLocalUsers(): UserProfile[] {
  if (typeof window === "undefined") return DEFAULT_USERS;
  const saved = localStorage.getItem("trade_reg_users");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {}
  }
  saveLocalUsers(DEFAULT_USERS);
  return DEFAULT_USERS;
}

function saveLocalUsers(users: UserProfile[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem("trade_reg_users", JSON.stringify(users));
  }
}

function getLocalTrades(userId: string): Trade[] {
  if (typeof window === "undefined") return [];
  const saved = localStorage.getItem(`trade_reg_trades_${userId}`);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {}
  }
  return [];
}

function saveLocalTrades(userId: string, trades: Trade[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(`trade_reg_trades_${userId}`, JSON.stringify(trades));
  }
}

function getActiveUserId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("trade_reg_active_user");
}

function setActiveUserId(id: string | null) {
  if (typeof window !== "undefined") {
    if (id) localStorage.setItem("trade_reg_active_user", id);
    else localStorage.removeItem("trade_reg_active_user");
  }
}

// Client-side analytics fallback engine
function computeClientAnalytics(trades: Trade[], timeframe: TimeframeFilter): PerformanceReport {
  if (trades.length === 0) {
    return {
      user_id: "",
      timeframe,
      metrics: {
        net_pnl: 0,
        total_points: 0,
        total_trades: 0,
        winning_trades: 0,
        losing_trades: 0,
        breakeven_trades: 0,
        win_rate: 0,
        profit_factor: 0,
        avg_win: 0,
        avg_loss: 0,
        avg_points_per_trade: 0,
        risk_reward_ratio: 0,
        max_drawdown: 0,
        best_trade_pnl: 0,
        worst_trade_pnl: 0,
        best_day_pnl: 0,
        worst_day_pnl: 0,
        total_fees: 0
      },
      equity_curve: [],
      timeframe_breakdown: [],
      daily_groups: [],
      strategy_breakdown: []
    };
  }

  const sortedTrades = [...trades].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  const winning = sortedTrades.filter(t => t.status === "WIN");
  const losing = sortedTrades.filter(t => t.status === "LOSS");
  const breakeven = sortedTrades.filter(t => t.status === "BREAKEVEN");

  const totalTrades = sortedTrades.length;
  const winCount = winning.length;
  const lossCount = losing.length;
  const winRate = totalTrades > 0 ? Number(((winCount / totalTrades) * 100).toFixed(1)) : 0;

  const totalWinPnl = winning.reduce((s, t) => s + t.net_pnl, 0);
  const totalLossPnl = Math.abs(losing.reduce((s, t) => s + t.net_pnl, 0));
  const netPnl = Number(sortedTrades.reduce((s, t) => s + t.net_pnl, 0).toFixed(2));
  const totalPoints = Number(sortedTrades.reduce((s, t) => s + t.points, 0).toFixed(2));
  const totalFees = Number(sortedTrades.reduce((s, t) => s + t.fees, 0).toFixed(2));

  const avgWin = winCount > 0 ? Number((totalWinPnl / winCount).toFixed(2)) : 0;
  const avgLoss = lossCount > 0 ? Number((totalLossPnl / lossCount).toFixed(2)) : 0;
  const avgPoints = totalTrades > 0 ? Number((totalPoints / totalTrades).toFixed(2)) : 0;
  const profitFactor = totalLossPnl > 0 ? Number((totalWinPnl / totalLossPnl).toFixed(2)) : (totalWinPnl > 0 ? totalWinPnl : 0);
  const rrRatio = avgLoss > 0 ? Number((avgWin / avgLoss).toFixed(2)) : avgWin;

  const bestTradePnl = Math.max(...sortedTrades.map(t => t.net_pnl));
  const worstTradePnl = Math.min(...sortedTrades.map(t => t.net_pnl));

  // Daily grouping
  const dayMap: { [date: string]: Trade[] } = {};
  for (const t of sortedTrades) {
    if (!dayMap[t.date]) dayMap[t.date] = [];
    dayMap[t.date].push(t);
  }

  const dailyTotals = Object.entries(dayMap).map(([_, trs]) => trs.reduce((s, t) => s + t.net_pnl, 0));
  const bestDayPnl = dailyTotals.length > 0 ? Math.max(...dailyTotals) : 0;
  const worstDayPnl = dailyTotals.length > 0 ? Math.min(...dailyTotals) : 0;

  // Equity Curve
  let cumPnl = 0;
  let cumPts = 0;
  let peak = 0;
  let maxDd = 0;
  const equity_curve: EquityPoint[] = [];

  for (const date of Object.keys(dayMap).sort()) {
    const dTrades = dayMap[date];
    const dPnl = dTrades.reduce((s, t) => s + t.net_pnl, 0);
    const dPts = dTrades.reduce((s, t) => s + t.points, 0);
    cumPnl += dPnl;
    cumPts += dPts;

    if (cumPnl > peak) peak = cumPnl;
    const dd = peak - cumPnl;
    if (dd > maxDd) maxDd = dd;

    equity_curve.push({
      date,
      pnl: Number(dPnl.toFixed(2)),
      points: Number(dPts.toFixed(2)),
      cumulative_pnl: Number(cumPnl.toFixed(2)),
      cumulative_points: Number(cumPts.toFixed(2)),
      trades_count: dTrades.length
    });
  }

  // Daily Groups (newest days first)
  const daily_groups: DailyTradeGroup[] = Object.keys(dayMap)
    .sort((a, b) => b.localeCompare(a))
    .map(date => {
      const dTrs = dayMap[date].sort((a, b) => b.time.localeCompare(a.time));
      const totPnl = dTrs.reduce((s, t) => s + t.net_pnl, 0);
      const totPts = dTrs.reduce((s, t) => s + t.points, 0);
      const w = dTrs.filter(t => t.status === "WIN").length;
      const l = dTrs.filter(t => t.status === "LOSS").length;
      return {
        date,
        total_pnl: Number(totPnl.toFixed(2)),
        total_points: Number(totPts.toFixed(2)),
        trades_count: dTrs.length,
        wins: w,
        losses: l,
        win_rate: dTrs.length > 0 ? Number(((w / dTrs.length) * 100).toFixed(1)) : 0,
        trades: dTrs
      };
    });

  // Timeframe Breakdown
  const tfGroups: { [key: string]: Trade[] } = {};
  for (const t of sortedTrades) {
    const d = new Date(t.date);
    let key = t.date;
    const year = isNaN(d.getFullYear()) ? "2026" : d.getFullYear();
    const month = isNaN(d.getMonth()) ? 0 : d.getMonth() + 1;

    if (timeframe === "daily") {
      key = t.date;
    } else if (timeframe === "weekly") {
      // Simple ISO week approximation
      const weekNum = Math.ceil((d.getDate()) / 7);
      key = `${year}-W${String(weekNum).padStart(2, "0")}`;
    } else if (timeframe === "monthly") {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      key = `${year}-${String(month).padStart(2, "0")} (${monthNames[month - 1] || "Month"})`;
    } else if (timeframe === "quarterly") {
      const q = Math.ceil(month / 3);
      key = `${year}-Q${q}`;
    } else if (timeframe === "half_yearly") {
      const h = month <= 6 ? 1 : 2;
      key = `${year}-H${h} (Half ${h})`;
    } else if (timeframe === "annually") {
      key = `${year}`;
    }

    if (!tfGroups[key]) tfGroups[key] = [];
    tfGroups[key].push(t);
  }

  const timeframe_breakdown: TimeframeAggregation[] = Object.keys(tfGroups).sort().map(key => {
    const grp = tfGroups[key];
    const pnl = grp.reduce((s, t) => s + t.net_pnl, 0);
    const pts = grp.reduce((s, t) => s + t.points, 0);
    const w = grp.filter(t => t.status === "WIN").length;
    const l = grp.filter(t => t.status === "LOSS").length;
    return {
      timeframe,
      period_label: key,
      net_pnl: Number(pnl.toFixed(2)),
      total_points: Number(pts.toFixed(2)),
      trades_count: grp.length,
      wins: w,
      losses: l,
      win_rate: grp.length > 0 ? Number(((w / grp.length) * 100).toFixed(1)) : 0
    };
  });

  // Strategy Breakdown
  const stratMap: { [key: string]: Trade[] } = {};
  for (const t of sortedTrades) {
    const name = t.strategy || "General Setup";
    if (!stratMap[name]) stratMap[name] = [];
    stratMap[name].push(t);
  }
  const strategy_breakdown: StrategyStat[] = Object.entries(stratMap).map(([name, trs]) => {
    const pnl = trs.reduce((s, t) => s + t.net_pnl, 0);
    const pts = trs.reduce((s, t) => s + t.points, 0);
    const w = trs.filter(t => t.status === "WIN").length;
    return {
      name,
      trades_count: trs.length,
      net_pnl: Number(pnl.toFixed(2)),
      total_points: Number(pts.toFixed(2)),
      win_rate: trs.length > 0 ? Number(((w / trs.length) * 100).toFixed(1)) : 0
    };
  }).sort((a, b) => b.net_pnl - a.net_pnl);

  return {
    user_id: "",
    timeframe,
    metrics: {
      net_pnl: netPnl,
      total_points: totalPoints,
      total_trades: totalTrades,
      winning_trades: winCount,
      losing_trades: lossCount,
      breakeven_trades: breakeven.length,
      win_rate: winRate,
      profit_factor: profitFactor,
      avg_win: avgWin,
      avg_loss: avgLoss,
      avg_points_per_trade: avgPoints,
      risk_reward_ratio: rrRatio,
      max_drawdown: Number(maxDd.toFixed(2)),
      best_trade_pnl: Number(bestTradePnl.toFixed(2)),
      worst_trade_pnl: Number(worstTradePnl.toFixed(2)),
      best_day_pnl: Number(bestDayPnl.toFixed(2)),
      worst_day_pnl: Number(worstDayPnl.toFixed(2)),
      total_fees: totalFees
    },
    equity_curve,
    timeframe_breakdown,
    daily_groups,
    strategy_breakdown
  };
}

export const api = {
  // --- USERS & AUTH ---

  async getUsers(): Promise<UserProfile[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/users`);
      if (res.ok) {
        const users = await res.json();
        saveLocalUsers(users);
        return users;
      }
    } catch (e) {
      console.warn("Backend offline, using local users:", e);
    }
    return getLocalUsers();
  },

  async loginUser(credentials: UserLoginInput): Promise<UserProfile | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials)
      });
      if (res.ok) {
        const user = await res.json();
        setActiveUserId(user.id);
        return user;
      }
    } catch (e) {
      console.warn("Backend offline, validating login locally:", e);
    }

    // Local validation fallback
    const users = getLocalUsers();
    const cleanUser = credentials.username.trim().toLowerCase();
    const cleanPin = credentials.pin.trim();
    const found = users.find(u =>
      (u.username.toLowerCase() === cleanUser || u.id.toLowerCase() === cleanUser) &&
      u.pin.trim() === cleanPin
    );

    if (found) {
      setActiveUserId(found.id);
      return found;
    }
    return null;
  },

  async updateUser(userId: string, data: UserUpdateInput): Promise<UserProfile | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const updated = await res.json();
        const users = getLocalUsers().map(u => u.id === userId ? updated : u);
        saveLocalUsers(users);
        return updated;
      }
    } catch (e) {
      console.warn("Backend offline, updating user locally:", e);
    }

    const users = getLocalUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index] = { ...users[index], ...data };
      saveLocalUsers(users);
      return users[index];
    }
    return null;
  },

  getActiveUserId,
  setActiveUserId,

  logout() {
    setActiveUserId(null);
  },

  // --- TRADES REGISTER CRUD ---

  async getTrades(userId: string): Promise<Trade[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/trades?user_id=${userId}`);
      if (res.ok) {
        const trades = await res.json();
        saveLocalTrades(userId, trades);
        return trades;
      }
    } catch (e) {
      console.warn("Backend offline, fetching local trades:", e);
    }
    return getLocalTrades(userId);
  },

  async createTrade(input: TradeInput): Promise<Trade> {
    try {
      const res = await fetch(`${API_BASE_URL}/trades`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
      });
      if (res.ok) {
        const trade = await res.json();
        if (input.user_id) {
          const current = getLocalTrades(input.user_id);
          saveLocalTrades(input.user_id, [trade, ...current]);
        }
        return trade;
      }
    } catch (e) {
      console.warn("Backend offline, creating trade locally:", e);
    }

    // Local trade creation
    const userId = input.user_id || "trader_1";
    const action = input.action.toUpperCase();
    const pts = input.points !== undefined && input.points !== null
      ? Number(input.points)
      : (action === "BUY" ? Number((input.exit_price - input.entry_price).toFixed(2)) : Number((input.entry_price - input.exit_price).toFixed(2)));
    const grossPnl = pts * input.quantity;
    const netPnl = Number((grossPnl - (input.fees || 0)).toFixed(2));
    const pnlPct = input.entry_price > 0 ? Number(((pts / input.entry_price) * 100).toFixed(2)) : 0;
    const status = netPnl > 0.05 ? "WIN" : (netPnl < -0.05 ? "LOSS" : "BREAKEVEN");

    const newTrade: Trade = {
      id: `local_trade_${Date.now()}`,
      user_id: userId,
      date: input.date,
      time: input.time,
      symbol: input.symbol,
      instrument_type: input.instrument_type,
      action: input.action,
      quantity: input.quantity,
      entry_price: input.entry_price,
      exit_price: input.exit_price,
      points: pts,
      stop_loss: input.stop_loss,
      take_profit: input.take_profit,
      fees: input.fees || 0,
      net_pnl: netPnl,
      pnl_percent: pnlPct,
      status,
      strategy: input.strategy || "My Strategy",
      notes: input.notes || "",
      created_at: new Date().toISOString()
    };

    const current = getLocalTrades(userId);
    saveLocalTrades(userId, [newTrade, ...current]);
    return newTrade;
  },

  async updateTrade(tradeId: string, input: Partial<TradeInput>): Promise<Trade | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/trades/${tradeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("Backend offline, updating trade locally:", e);
    }

    if (input.user_id) {
      const current = getLocalTrades(input.user_id);
      const idx = current.findIndex(t => t.id === tradeId);
      if (idx !== -1) {
        const merged = { ...current[idx], ...input };
        const action = merged.action.toUpperCase();
        const pts = input.points !== undefined && input.points !== null
          ? Number(input.points)
          : (action === "BUY" ? Number((merged.exit_price - merged.entry_price).toFixed(2)) : Number((merged.entry_price - merged.exit_price).toFixed(2)));
        merged.points = pts;
        merged.net_pnl = Number(((pts * merged.quantity) - (merged.fees || 0)).toFixed(2));
        merged.status = merged.net_pnl > 0.05 ? "WIN" : (merged.net_pnl < -0.05 ? "LOSS" : "BREAKEVEN");
        current[idx] = merged as Trade;
        saveLocalTrades(input.user_id, current);
        return merged as Trade;
      }
    }
    return null;
  },

  async deleteTrade(tradeId: string, userId?: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/trades/${tradeId}`, { method: "DELETE" });
      if (res.ok) {
        if (userId) {
          const current = getLocalTrades(userId).filter(t => t.id !== tradeId);
          saveLocalTrades(userId, current);
        }
        return true;
      }
    } catch (e) {
      console.warn("Backend offline, deleting trade locally:", e);
    }

    if (userId) {
      const current = getLocalTrades(userId).filter(t => t.id !== tradeId);
      saveLocalTrades(userId, current);
      return true;
    }
    return false;
  },

  async clearTrades(userId: string): Promise<boolean> {
    try {
      await fetch(`${API_BASE_URL}/trades/clear?user_id=${userId}`, { method: "POST" });
    } catch (e) {
      console.warn("Backend offline, clearing trades locally:", e);
    }
    saveLocalTrades(userId, []);
    return true;
  },

  // --- ANALYTICS & DASHBOARD (DAILY, WEEKLY, MONTHLY, QUARTERLY, HALF-YEARLY, ANNUALLY) ---

  async getAnalytics(userId: string, timeframe: TimeframeFilter): Promise<PerformanceReport> {
    try {
      const res = await fetch(`${API_BASE_URL}/analytics?user_id=${userId}&timeframe=${timeframe}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("Backend offline, computing analytics locally:", e);
    }

    const trades = await this.getTrades(userId);
    return computeClientAnalytics(trades, timeframe);
  },

  async compareTraders(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/analytics/compare`);
      if (res.ok) return await res.json();
    } catch {}

    const users = await this.getUsers();
    const result = [];
    for (const u of users) {
      const trades = await this.getTrades(u.id);
      const rep = computeClientAnalytics(trades, "monthly");
      result.push({ trader: u, metrics: rep.metrics, total_trades: trades.length });
    }
    return result;
  }
};
