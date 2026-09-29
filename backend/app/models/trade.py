from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class UserProfile(BaseModel):
    id: str
    name: str
    username: str
    pin: str = "1234"
    avatar: str = "⚡"
    base_currency: str = "₹"
    trading_style: str = "Price Action / Strategy"
    primary_market: str = "Options & Equity"
    account_capital: float = 100000.0
    created_at: str

class UserLoginRequest(BaseModel):
    username: str
    pin: str

class UserUpdateRequest(BaseModel):
    name: Optional[str] = None
    username: Optional[str] = None
    pin: Optional[str] = None
    avatar: Optional[str] = None
    base_currency: Optional[str] = None
    trading_style: Optional[str] = None
    primary_market: Optional[str] = None
    account_capital: Optional[float] = None

class TradeBase(BaseModel):
    user_id: str
    date: str  # YYYY-MM-DD
    time: str = "09:30"
    symbol: str  # XAUUSD, NASDAQ, NIFTY50, SENSEX
    instrument_type: str = "OPTIONS"  # OPTIONS, FUTURES, EQUITY, FOREX, CRYPTO
    action: str = "BUY"  # BUY, SELL
    quantity: float  # Lots or total shares
    entry_price: float
    exit_price: float
    points: Optional[float] = None  # Explicit points captured / lost
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None
    fees: float = 0.0
    strategy: str = "My Custom Strategy"  # Personal strategy name
    notes: str = ""

class TradeCreate(TradeBase):
    pass

class TradeUpdate(BaseModel):
    date: Optional[str] = None
    time: Optional[str] = None
    symbol: Optional[str] = None
    instrument_type: Optional[str] = None
    action: Optional[str] = None
    quantity: Optional[float] = None
    entry_price: Optional[float] = None
    exit_price: Optional[float] = None
    points: Optional[float] = None
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None
    fees: Optional[float] = None
    strategy: Optional[str] = None
    notes: Optional[str] = None

class Trade(TradeBase):
    id: str
    points: float
    net_pnl: float
    pnl_percent: float
    status: str = "WIN"  # WIN, LOSS, BREAKEVEN
    created_at: str

class MetricsSummary(BaseModel):
    net_pnl: float
    total_points: float
    total_trades: int
    winning_trades: int
    losing_trades: int
    breakeven_trades: int
    win_rate: float
    profit_factor: float
    avg_win: float
    avg_loss: float
    avg_points_per_trade: float
    risk_reward_ratio: float
    max_drawdown: float
    best_trade_pnl: float
    worst_trade_pnl: float
    best_day_pnl: float
    worst_day_pnl: float
    total_fees: float

class TimeframeAggregation(BaseModel):
    timeframe: str  # daily, weekly, monthly, quarterly, half_yearly, annually
    period_label: str  # e.g. "2026-09-29", "2026-W39", "Sep 2026", "2026-Q3", "2026-H2", "2026"
    net_pnl: float
    total_points: float
    trades_count: int
    wins: int
    losses: int
    win_rate: float

class DailyTradeGroup(BaseModel):
    date: str
    total_pnl: float
    total_points: float
    trades_count: int
    wins: int
    losses: int
    win_rate: float
    trades: List[Trade]

class EquityPoint(BaseModel):
    date: str
    pnl: float
    points: float
    cumulative_pnl: float
    cumulative_points: float
    trades_count: int

class StrategyStat(BaseModel):
    name: str
    trades_count: int
    net_pnl: float
    total_points: float
    win_rate: float

class PerformanceReport(BaseModel):
    user_id: str
    timeframe: str
    metrics: MetricsSummary
    equity_curve: List[EquityPoint]
    timeframe_breakdown: List[TimeframeAggregation]
    daily_groups: List[DailyTradeGroup]
    strategy_breakdown: List[StrategyStat]
