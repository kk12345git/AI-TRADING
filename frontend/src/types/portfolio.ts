export type InstrumentType = "OPTIONS" | "FUTURES" | "EQUITY" | "CRYPTO" | "FOREX";
export type ActionType = "BUY" | "SELL";
export type TradeStatus = "WIN" | "LOSS" | "BREAKEVEN";
export type TimeframeFilter = "daily" | "weekly" | "monthly" | "quarterly" | "half_yearly" | "annually";
export type CurrencySymbol = "₹" | "$" | "€" | "£";

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  pin: string;
  avatar: string;
  base_currency: CurrencySymbol;
  trading_style: string;
  primary_market: string;
  account_capital: number;
  created_at: string;
}

export interface UserLoginInput {
  username: string;
  pin: string;
}

export interface UserUpdateInput {
  name?: string;
  username?: string;
  pin?: string;
  avatar?: string;
  base_currency?: CurrencySymbol;
  trading_style?: string;
  primary_market?: string;
  account_capital?: number;
}

export interface Trade {
  id: string;
  user_id: string;
  date: string;
  time: string;
  symbol: string;
  instrument_type: InstrumentType;
  action: ActionType;
  quantity: number;
  entry_price: number;
  exit_price: number;
  points: number;
  stop_loss?: number;
  take_profit?: number;
  fees: number;
  net_pnl: number;
  pnl_percent: number;
  status: TradeStatus;
  strategy: string;
  notes: string;
  created_at: string;
}

export interface TradeInput {
  user_id?: string;
  date: string;
  time: string;
  symbol: string;
  instrument_type: InstrumentType;
  action: ActionType;
  quantity: number;
  entry_price: number;
  exit_price: number;
  points?: number;
  stop_loss?: number;
  take_profit?: number;
  fees: number;
  strategy: string;
  notes: string;
}

export interface MetricsSummary {
  net_pnl: number;
  total_points: number;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  breakeven_trades: number;
  win_rate: number;
  profit_factor: number;
  avg_win: number;
  avg_loss: number;
  avg_points_per_trade: number;
  risk_reward_ratio: number;
  max_drawdown: number;
  best_trade_pnl: number;
  worst_trade_pnl: number;
  best_day_pnl: number;
  worst_day_pnl: number;
  total_fees: number;
}

export interface TimeframeAggregation {
  timeframe: string;
  period_label: string;
  net_pnl: number;
  total_points: number;
  trades_count: number;
  wins: number;
  losses: number;
  win_rate: number;
}

export interface DailyTradeGroup {
  date: string;
  total_pnl: number;
  total_points: number;
  trades_count: number;
  wins: number;
  losses: number;
  win_rate: number;
  trades: Trade[];
}

export interface EquityPoint {
  date: string;
  pnl: number;
  points: number;
  cumulative_pnl: number;
  cumulative_points: number;
  trades_count: number;
}

export interface StrategyStat {
  name: string;
  trades_count: number;
  net_pnl: number;
  total_points: number;
  win_rate: number;
}

export interface PerformanceReport {
  user_id: string;
  timeframe: TimeframeFilter;
  metrics: MetricsSummary;
  equity_curve: EquityPoint[];
  timeframe_breakdown: TimeframeAggregation[];
  daily_groups: DailyTradeGroup[];
  strategy_breakdown: StrategyStat[];
}
