export interface Instrument {
  symbol: string;
  trading_symbol: string;
  name: string;
  exchange: 'NSE' | 'BSE';
  instrument_type: 'EQUITY' | 'INDEX' | 'FUTURES' | 'OPTION';
  lot_size: number;
  tick_size: number;
  strike?: number;
  option_type?: 'CE' | 'PE';
  expiry?: string;
  token: string;
}

export interface TickData {
  symbol: string;
  exchange: string;
  ltp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  change: number;
  p_change: number;
  oi?: number;
  change_oi?: number;
  bid?: number;
  ask?: number;
  last_quantity?: number;
  timestamp: string;
}

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  oi?: number;
}

export interface OptionStrike {
  strike: number;
  ce_ltp: number;
  ce_change: number;
  ce_oi: number;
  ce_change_oi: number;
  ce_volume: number;
  ce_iv: number;
  pe_ltp: number;
  pe_change: number;
  pe_oi: number;
  pe_change_oi: number;
  pe_volume: number;
  pe_iv: number;
  is_atm: boolean;
  moneyness: 'ITM' | 'ATM' | 'OTM';
}

export interface OptionChainData {
  underlying_symbol: string;
  exchange: string;
  spot_price: number;
  atm_strike: number;
  expiries: string[];
  selected_expiry: string;
  strikes: OptionStrike[];
  pcr: number;
  call_oi_total: number;
  put_oi_total: number;
  max_call_oi_strike: number;
  max_put_oi_strike: number;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
}

export interface RuleCondition {
  id: string;
  name: string;
  category: string;
  timeframe: string;
  rule_text: string;
  is_satisfied: boolean;
  current_value?: string;
  target_value?: string;
  weight: number;
  mandatory: boolean;
}

export interface TradePlan {
  entry_zone?: string;
  stop_loss?: number;
  target_1?: number;
  target_2?: number;
  target_3?: number;
  risk_reward?: string;
}

export interface AIExplanationResponse {
  signal: 'BUY' | 'SELL' | 'WAIT' | 'INVALID';
  strategy_score: number;
  setup_state: string;
  trend: string;
  structure: string;
  vwap_state: string;
  volume_state: string;
  option_confirmation: string;
  support: number;
  resistance: number;
  missing_conditions: string[];
  trigger_required: string;
  invalidation: string;
  risk_level: string;
  ai_comment: string;
  trade_plan?: TradePlan;
  timestamp: string;
}

export interface VolumeProfile {
  poc: number;
  vah: number;
  val: number;
  volume_area_pct: number;
}

export interface FairValueGap {
  type: 'BULLISH' | 'BEARISH';
  top: number;
  bottom: number;
  mitigated: boolean;
  timeframe: string;
}

export interface MACDDivergence {
  type: 'BULLISH_REGULAR' | 'BEARISH_REGULAR' | 'BULLISH_HIDDEN' | 'BEARISH_HIDDEN' | 'NONE';
  description: string;
  strength: 'STRONG' | 'MODERATE' | 'WEAK';
}

export interface FibonacciLevels {
  high: number;
  low: number;
  fib_236: number;
  fib_382: number;
  fib_500: number;
  fib_618: number;
  fib_786: number;
}

export interface BrokerInfo {
  key: string;
  name: string;
  status: 'ACTIVE' | 'READY';
}

export interface BrokerStatusResponse {
  active_broker: string;
  available_brokers: BrokerInfo[];
}

export interface FullSignalPayload {
  exchange: 'NSE' | 'BSE';
  symbol: string;
  timeframe: string;
  data_health: 'LIVE' | 'DELAYED' | 'STALE' | 'DISCONNECTED';
  market_status: string;
  price: number;
  signal: 'BUY' | 'SELL' | 'WAIT' | 'INVALID';
  strategy_score: number;
  setup_lifecycle: 'WATCHING' | 'FORMING' | 'CONFIRMED' | 'ACTIVE' | 'TARGET_HIT' | 'STOP_HIT' | 'INVALIDATED';
  trend_15m: string;
  setup_5m: string;
  entry_1m: string;
  conditions: RuleCondition[];
  support_levels: Array<{ price: number; type: string; strength: string; reactions: number; distance_pct: number }>;
  resistance_levels: Array<{ price: number; type: string; strength: string; reactions: number; distance_pct: number }>;
  volume_profile?: VolumeProfile;
  fair_value_gaps?: FairValueGap[];
  macd_divergence?: MACDDivergence;
  fibonacci_levels?: FibonacciLevels;
  ai_explanation: AIExplanationResponse;
  last_update: string;
}

export interface ReplayState {
  symbol: string;
  timeframe: string;
  current_index: number;
  total_candles: number;
  current_candle: Candle;
  signal: FullSignalPayload;
}

export interface BacktestResult {
  symbol: string;
  timeframe: string;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate: number;
  profit_factor: number;
  total_return_pct: number;
  max_drawdown_pct: number;
  avg_r: number;
  best_trade_pnl: number;
  worst_trade_pnl: number;
  trades: Array<{
    trade_no: number;
    direction: string;
    entry_time: number;
    exit_time: number;
    entry_price: number;
    exit_price: number;
    stop_loss: number;
    target: number;
    pnl: number;
    result: string;
  }>;
}

export interface JournalEntry {
  id?: string;
  timestamp: string;
  exchange: string;
  symbol: string;
  instrument: string;
  direction: 'BUY' | 'SELL';
  setup: string;
  entry: number;
  sl: number;
  target: number;
  exit_price?: number;
  pnl?: number;
  strategy_score: number;
  conditions_met: string[];
  ai_explanation: string;
  notes?: string;
}
