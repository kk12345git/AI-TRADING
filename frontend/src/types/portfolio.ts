export type AssetClass = "Stocks" | "Options" | "Crypto" | "Forex" | "Futures";
export type TradingStyle = "Day Trader" | "Scalper" | "Swing Trader" | "Position Trader";
export type ActionType = "BUY" | "SELL";
export type TradeStatus = "WIN" | "LOSS" | "BREAKEVEN";
export type TimeframeFilter = "daily" | "weekly" | "monthly" | "yearly" | "all";
export type CurrencySymbol = "$" | "₹" | "€" | "£";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  base_currency: CurrencySymbol;
  trading_style: TradingStyle;
  primary_market: AssetClass;
  account_capital: number;
  risk_per_trade_pct: number;
  trading_goals: string;
  created_at: string;
}

export interface UserOnboardInput {
  email: string;
  name: string;
  avatar: string;
  base_currency: CurrencySymbol;
  trading_style: TradingStyle;
  primary_market: AssetClass;
  account_capital: number;
  risk_per_trade_pct: number;
  trading_goals: string;
}

export interface UserUpdateInput {
  name?: string;
  avatar?: string;
  base_currency?: CurrencySymbol;
  trading_style?: TradingStyle;
  primary_market?: AssetClass;
  account_capital?: number;
  risk_per_trade_pct?: number;
  trading_goals?: string;
}

export interface Trade {
  id: string;
  user_id: string;
  date: string;
  time: string;
  symbol: string;
  asset_class: AssetClass;
  action: ActionType;
  quantity: number;
  entry_price: number;
  exit_price: number;
  stop_loss?: number;
  take_profit?: number;
  fees: number;
  net_pnl: number;
  pnl_percent: number;
  r_multiple: number;
  status: TradeStatus;
  setup_tag: string;
  mistake_tag: string;
  emotion_rating: number;
  notes: string;
  created_at: string;
}

export interface TradeInput {
  user_id?: string;
  date: string;
  time: string;
  symbol: string;
  asset_class: AssetClass;
  action: ActionType;
  quantity: number;
  entry_price: number;
  exit_price: number;
  stop_loss?: number;
  take_profit?: number;
  fees: number;
  setup_tag: string;
  mistake_tag: string;
  emotion_rating: number;
  notes: string;
}

export interface MetricsSummary {
  net_pnl: number;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  breakeven_trades: number;
  win_rate: number;
  profit_factor: number;
  avg_win: number;
  avg_loss: number;
  risk_reward_ratio: number;
  max_drawdown: number;
  max_drawdown_percent: number;
  expectancy: number;
  best_trade_pnl: number;
  worst_trade_pnl: number;
  total_fees: number;
}

export interface TimeframeAggregation {
  timeframe: TimeframeFilter;
  period_label: string;
  net_pnl: number;
  trades_count: number;
  win_rate: number;
}

export interface EquityPoint {
  date: string;
  pnl: number;
  cumulative_pnl: number;
  trades_count: number;
}

export interface MistakeStat {
  mistake: string;
  count: number;
  total_loss: number;
  percentage_of_losses: number;
}

export interface PerformanceReport {
  user_id: string;
  timeframe: TimeframeFilter;
  metrics: MetricsSummary;
  equity_curve: EquityPoint[];
  timeframe_breakdown: TimeframeAggregation[];
  mistake_analysis: MistakeStat[];
  top_assets: { name: string; count: number; net_pnl: number; win_rate: number }[];
  top_setups: { name: string; count: number; net_pnl: number; win_rate: number }[];
}

export interface DiagnosticRule {
  title: string;
  description: string;
  severity: "High" | "Medium" | "Low";
  action_item: string;
}

export interface DiagnosticResponse {
  user_id?: string;
  health_score: number;
  summary: string;
  top_mistakes: MistakeStat[];
  rules: DiagnosticRule[];
  recommendations: string[];
}

export interface StrategySimResult {
  strategy_name: string;
  simulated_net_pnl: number;
  simulated_win_rate: number;
  simulated_profit_factor: number;
  simulated_drawdown: number;
  comparison_vs_actual_pnl: number;
  trade_insights: string[];
}

export interface AIChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AIChatResponse {
  reply: string;
  suggested_followups?: string[];
}
