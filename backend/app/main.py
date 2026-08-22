import uvicorn
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional

from app.models.trade import (
    Trade, TradeCreate, TradeUpdate, PerformanceReport,
    UserProfile, UserLoginRequest,
    DiagnosticRequest, DiagnosticResponse,
    StrategySimRequest, StrategySimResult,
    AIChatRequest, AIChatResponse
)
from app.storage import db
from app.engine.analytics import generate_performance_report
from app.engine.ai_copilot import run_trade_diagnostics, simulate_strategy_engine, answer_ai_question

app = FastAPI(
    title="AI Trading Portfolio & Journal Manager API",
    version="2.1.0",
    description="Multi-User Trader Portfolio Manager API with Isolated Data & AI Co-pilot"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "app": "AI Trading Portfolio Manager",
        "traders_count": len(db.get_users()),
        "trades_count": len(db.get_trades())
    }

# --- USER PROFILE & AUTH ENDPOINTS ---

@app.get("/api/users", response_model=List[UserProfile])
def get_traders():
    return db.get_users()

@app.post("/api/users/login", response_model=UserProfile)
def login_or_register_trader(req: UserLoginRequest):
    name = req.name if req.name else req.email.split("@")[0].capitalize()
    return db.login_or_create_user(name=name, email=req.email)

# --- TRADES CRUD ENDPOINTS (USER SCOPED) ---

@app.get("/api/trades", response_model=List[Trade])
def get_trades(user_id: Optional[str] = Query(None, description="Trader User ID")):
    return db.get_trades(user_id=user_id)

@app.post("/api/trades", response_model=Trade)
def create_trade(trade_in: TradeCreate):
    return db.create_trade(trade_in)

@app.put("/api/trades/{trade_id}", response_model=Trade)
def update_trade(trade_id: str, trade_update: TradeUpdate):
    updated = db.update_trade(trade_id, trade_update)
    if not updated:
        raise HTTPException(status_code=404, detail="Trade not found")
    return updated

@app.delete("/api/trades/{trade_id}")
def delete_trade(trade_id: str):
    success = db.delete_trade(trade_id)
    if not success:
        raise HTTPException(status_code=404, detail="Trade not found")
    return {"success": True, "message": "Trade deleted successfully"}

@app.post("/api/trades/clear", response_model=List[Trade])
def clear_user_trades(user_id: str = Query("trader_1")):
    return db.clear_user_trades(user_id=user_id)

# --- ANALYTICS & PERFORMANCE REPORT (USER SCOPED) ---

@app.get("/api/analytics", response_model=PerformanceReport)
def get_analytics(
    user_id: str = Query("trader_1", description="Trader User ID"),
    timeframe: str = Query("monthly", description="Timeframe grouping: daily, weekly, monthly, yearly, all")
):
    user_trades = db.get_trades(user_id=user_id)
    report = generate_performance_report(user_trades, timeframe)
    report.user_id = user_id
    return report

# --- AI CO-PILOT ENDPOINTS ---

@app.post("/api/ai/diagnose", response_model=DiagnosticResponse)
def diagnose_trades_endpoint(req: Optional[DiagnosticRequest] = None):
    target_user_id = req.user_id if req else "trader_1"
    user_trades = req.trades if req and req.trades else db.get_trades(user_id=target_user_id)
    res = run_trade_diagnostics(user_trades)
    res.user_id = target_user_id
    return res

@app.post("/api/ai/strategy-sim", response_model=StrategySimResult)
def simulate_strategy_endpoint(req: StrategySimRequest):
    user_trades = db.get_trades(user_id=req.user_id)
    return simulate_strategy_engine(user_trades, req)

@app.post("/api/ai/chat", response_model=AIChatResponse)
def chat_ai_endpoint(req: AIChatRequest):
    if not req.context_trades:
        req.context_trades = db.get_trades(user_id=req.user_id)
    return answer_ai_question(req)

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
