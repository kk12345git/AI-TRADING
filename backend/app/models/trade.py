from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class UserProfile(BaseModel):
    id: str
    name: str
    email: str
    avatar: str = "⚡"
    base_currency: str = "$"
    trading_style: str = "Day Trader"
    primary_market: str = "Stocks"
    account_capital: float = 10000.0
    risk_per_trade_pct: float = 1.0
    trading_goals: str = "Consistency & Risk Discipline"
    created_at: str

class UserLoginRequest(BaseModel):
    email: str

class UserOnboardRequest(BaseModel):
    email: str
    name: str
    avatar: str = "⚡"
    base_currency: str = "$"
    trading_style: str = "Day Trader"
    primary_market: str = "Stocks"
    account_capital: float = 10000.0
    risk_per_trade_pct: float = 1.0
    trading_goals: str = "Consistency & Risk Discipline"

class UserUpdateRequest(BaseModel):
    name: Optional[str] = None
    avatar: Optional[str] = None
    base_currency: Optional[str] = None
    trading_style: Optional[str] = None
    primary_market: Optional[str] = None
    account_capital: Optional[float] = None
    risk_per_trade_pct: Optional[float] = None
    trading_goals: Optional[str] = None

class TradeBase(BaseModel):
    user_id: str
    date: str
    time: str = "09:30"
    symbol: str
    asset_class: str = "Stocks"
    action: str = "BUY"
    quantity: float
    entry_price: float
    exit_price: float
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None
    fees: float = 0.0
    setup_tag: str = "Breakout"
    mistake_tag: str = "None - Followed Plan"
    emotion_rating: int = 4
    notes: str = ""

class TradeCreate(TradeBase):
    pass

class TradeUpdate(BaseModel):
    date: Optional[str] = None
    time: Optional[str] = None
    symbol: Optional[str] = None
    asset_class: Optional[str] = None
    action: Optional[str] = None
    quantity: Optional[float] = None
    entry_price: Optional[float] = None
    exit_price: Optional[float] = None
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None
    fees: Optional[float] = None
    setup_tag: Optional[str] = None
    mistake_tag: Optional[str] = None
    emotion_rating: Optional[int] = None
    notes: Optional[str] = None

class Trade(TradeBase):
    id: str
    net_pnl: float
    pnl_percent: float
    r_multiple: float = 0.0
    status: str = "WIN"
    created_at: str

class MetricsSummary(BaseModel):
    net_pnl: float
    total_trades: int
    winning_trades: int
    losing_trades: int
    breakeven_trades: int
    win_rate: float
    profit_factor: float
    avg_win: float
    avg_loss: float
    risk_reward_ratio: float
    max_drawdown: float
    max_drawdown_percent: float
    expectancy: float
    best_trade_pnl: float
    worst_trade_pnl: float
    total_fees: float

class TimeframeAggregation(BaseModel):
    timeframe: str
    period_label: str
    net_pnl: float
    trades_count: int
    win_rate: float

class EquityPoint(BaseModel):
    date: str
    pnl: float
    cumulative_pnl: float
    trades_count: int

class MistakeStat(BaseModel):
    mistake: str
    count: int
    total_loss: float
    percentage_of_losses: float

class PerformanceReport(BaseModel):
    user_id: str
    timeframe: str
    metrics: MetricsSummary
    equity_curve: List[EquityPoint]
    timeframe_breakdown: List[TimeframeAggregation]
    mistake_analysis: List[MistakeStat]
    top_assets: List[Dict[str, Any]]
    top_setups: List[Dict[str, Any]]

class DiagnosticRequest(BaseModel):
    user_id: str
    trades: Optional[List[Trade]] = None

class DiagnosticRule(BaseModel):
    title: str
    description: str
    severity: str
    action_item: str

class DiagnosticResponse(BaseModel):
    user_id: str
    health_score: int
    summary: str
    top_mistakes: List[MistakeStat]
    rules: List[DiagnosticRule]
    recommendations: List[str]

class StrategySimRequest(BaseModel):
    user_id: str
    strategy_name: str
    risk_per_trade_percent: float = 1.0
    stop_loss_atr_multiplier: float = 1.5
    take_profit_rr: float = 2.0

class StrategySimResult(BaseModel):
    strategy_name: str
    simulated_net_pnl: float
    simulated_win_rate: float
    simulated_profit_factor: float
    simulated_drawdown: float
    comparison_vs_actual_pnl: float
    trade_insights: List[str]

class AIChatMessage(BaseModel):
    role: str
    content: str

class AIChatRequest(BaseModel):
    user_id: str
    messages: List[AIChatMessage]
    context_trades: Optional[List[Trade]] = None

class AIChatResponse(BaseModel):
    reply: str
    suggested_followups: Optional[List[str]] = None
