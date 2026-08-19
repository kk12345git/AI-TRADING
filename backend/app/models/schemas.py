from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field

class MarketStatus(BaseModel):
    exchange: str  # NSE or BSE
    status: str    # OPEN, PRE-OPEN, CLOSED
    session_info: str
    server_time: str
    data_health: str = "LIVE"  # LIVE, DELAYED, STALE, DISCONNECTED

class Instrument(BaseModel):
    symbol: str
    trading_symbol: str
    name: str
    exchange: str  # NSE or BSE
    instrument_type: str  # EQUITY, INDEX, FUTURES, OPTION
    lot_size: int = 1
    tick_size: float = 0.05
    strike: Optional[float] = None
    option_type: Optional[str] = None  # CE or PE
    expiry: Optional[str] = None
    token: str

class TickData(BaseModel):
    symbol: str
    exchange: str
    ltp: float
    open: float
    high: float
    low: float
    close: float
    volume: int
    change: float
    p_change: float
    oi: Optional[int] = 0
    change_oi: Optional[int] = 0
    bid: Optional[float] = 0.0
    ask: Optional[float] = 0.0
    last_quantity: Optional[int] = 0
    timestamp: str

class Candle(BaseModel):
    time: int  # Unix timestamp in seconds
    open: float
    high: float
    low: float
    close: float
    volume: int
    oi: Optional[int] = 0

class OptionStrike(BaseModel):
    strike: float
    ce_ltp: float
    ce_change: float
    ce_oi: int
    ce_change_oi: int
    ce_volume: int
    ce_iv: float
    pe_ltp: float
    pe_change: float
    pe_oi: int
    pe_change_oi: int
    pe_volume: int
    pe_iv: float
    is_atm: bool = False
    moneyness: str = "OTM"  # ITM, ATM, OTM

class OptionChainData(BaseModel):
    underlying_symbol: str
    exchange: str
    spot_price: float
    atm_strike: float
    expiries: List[str]
    selected_expiry: str
    strikes: List[OptionStrike]
    pcr: float
    call_oi_total: int
    put_oi_total: int
    max_call_oi_strike: float
    max_put_oi_strike: float
    sentiment: str  # BULLISH, BEARISH, NEUTRAL

class VolumeProfile(BaseModel):
    poc: float  # Point of Control
    vah: float  # Value Area High
    val: float  # Value Area Low
    volume_area_pct: float = 70.0

class FairValueGap(BaseModel):
    type: str  # BULLISH or BEARISH
    top: float
    bottom: float
    mitigated: bool = False
    timeframe: str = "5m"

class MACDDivergence(BaseModel):
    type: str  # BULLISH_REGULAR, BEARISH_REGULAR, BULLISH_HIDDEN, BEARISH_HIDDEN, NONE
    description: str
    strength: str = "WEAK"  # STRONG, MODERATE, WEAK

class FibonacciLevels(BaseModel):
    high: float
    low: float
    fib_236: float
    fib_382: float
    fib_500: float
    fib_618: float
    fib_786: float

class RuleCondition(BaseModel):
    id: str
    name: str
    category: str  # TREND, VWAP, STRUCTURE, BREAKOUT, VOLUME, ENTRY_TRIGGER, OPTION, FVG, DIVERGENCE
    timeframe: str  # 15m, 5m, 1m
    rule_text: str
    is_satisfied: bool = False
    current_value: Optional[str] = None
    target_value: Optional[str] = None
    weight: int = 15
    mandatory: bool = True

class StrategyRuleConfig(BaseModel):
    strategy_id: str = "custom_default"
    strategy_name: str = "My Custom NSE/BSE Strategy"
    timeframes: Dict[str, str] = {
        "higher": "15m",
        "setup": "5m",
        "entry": "1m"
    }
    rules: List[RuleCondition]

class TradePlan(BaseModel):
    entry_zone: Optional[str] = None
    stop_loss: Optional[float] = None
    target_1: Optional[float] = None
    target_2: Optional[float] = None
    target_3: Optional[float] = None
    risk_reward: Optional[str] = None

class AIExplanationResponse(BaseModel):
    signal: str  # BUY, SELL, WAIT, INVALID
    strategy_score: int
    setup_state: str  # WATCHING, FORMING, CONFIRMED, ACTIVE, INVALIDATED
    trend: str
    structure: str
    vwap_state: str
    volume_state: str
    option_confirmation: str
    support: float
    resistance: float
    missing_conditions: List[str]
    trigger_required: str
    invalidation: str
    risk_level: str
    ai_comment: str
    trade_plan: Optional[TradePlan] = None
    timestamp: str

class FullSignalPayload(BaseModel):
    exchange: str
    symbol: str
    timeframe: str
    data_health: str
    market_status: str
    price: float
    signal: str  # BUY, SELL, WAIT, INVALID
    strategy_score: int
    setup_lifecycle: str  # WATCHING, FORMING, CONFIRMED, ACTIVE, TARGET_HIT, STOP_HIT, INVALIDATED
    trend_15m: str
    setup_5m: str
    entry_1m: str
    conditions: List[RuleCondition]
    support_levels: List[Dict[str, Any]]
    resistance_levels: List[Dict[str, Any]]
    volume_profile: Optional[VolumeProfile] = None
    fair_value_gaps: Optional[List[FairValueGap]] = []
    macd_divergence: Optional[MACDDivergence] = None
    fibonacci_levels: Optional[FibonacciLevels] = None
    ai_explanation: AIExplanationResponse
    last_update: str

class ReplayState(BaseModel):
    symbol: str
    timeframe: str
    current_index: int
    total_candles: int
    current_candle: Candle
    signal: FullSignalPayload

class BacktestRequest(BaseModel):
    symbol: str
    exchange: str
    timeframe: str
    start_date: str
    end_date: str
    initial_capital: float = 100000.0
    slippage_pct: float = 0.05
    brokerage_per_trade: float = 20.0

class BacktestResult(BaseModel):
    symbol: str
    timeframe: str
    total_trades: int
    winning_trades: int
    losing_trades: int
    win_rate: float
    profit_factor: float
    total_return_pct: float
    max_drawdown_pct: float
    avg_r: float
    best_trade_pnl: float
    worst_trade_pnl: float
    trades: List[Dict[str, Any]]

class JournalEntry(BaseModel):
    id: Optional[str] = None
    timestamp: str
    exchange: str
    symbol: str
    instrument: str
    direction: str  # BUY or SELL
    setup: str
    entry: float
    sl: float
    target: float
    exit_price: Optional[float] = None
    pnl: Optional[float] = None
    strategy_score: int
    conditions_met: List[str]
    ai_explanation: str
    notes: Optional[str] = ""
