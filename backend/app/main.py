import uvicorn
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional

from app.models.trade import (
    Trade, TradeCreate, TradeUpdate, PerformanceReport,
    DiagnosticRequest, DiagnosticResponse,
    StrategySimRequest, StrategySimResult,
    AIChatRequest, AIChatResponse
)
from app.storage import db
from app.engine.analytics import generate_performance_report
from app.engine.ai_copilot import run_trade_diagnostics, simulate_strategy_engine, answer_ai_question

app = FastAPI(
    title="AI Trading Portfolio & Journal Manager API",
    version="2.0.0",
    description="Backend API for Trade Logging, Multi-timeframe Analytics, Mistake Diagnostics, Strategy Simulation & AI Co-pilot"
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
    return {"status": "ok", "app": "AI Trading Portfolio Manager", "trades_count": len(db.get_all_trades())}

# --- TRADE CRUD ENDPOINTS ---

@app.get("/api/trades", response_model=List[Trade])
def get_trades():
    return db.get_all_trades()

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

@app.post("/api/trades/reset-demo", response_model=List[Trade])
def reset_demo_trades():
    return db.reset_demo_data()

# --- ANALYTICS & PERFORMANCE REPORT ---

@app.get("/api/analytics", response_model=PerformanceReport)
def get_analytics(timeframe: str = Query("monthly", description="Timeframe grouping: daily, weekly, monthly, yearly, all")):
    trades = db.get_all_trades()
    return generate_performance_report(trades, timeframe)

# --- AI CO-PILOT ENDPOINTS ---

@app.post("/api/ai/diagnose", response_model=DiagnosticResponse)
def diagnose_trades_endpoint(req: Optional[DiagnosticRequest] = None):
    trades = req.trades if req and req.trades else db.get_all_trades()
    return run_trade_diagnostics(trades)

@app.post("/api/ai/strategy-sim", response_model=StrategySimResult)
def simulate_strategy_endpoint(req: StrategySimRequest):
    trades = db.get_all_trades()
    return simulate_strategy_engine(trades, req)

@app.post("/api/ai/chat", response_model=AIChatResponse)
def chat_ai_endpoint(req: AIChatRequest):
    if not req.context_trades:
        req.context_trades = db.get_all_trades()
    return answer_ai_question(req)

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
