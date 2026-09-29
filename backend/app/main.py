import uvicorn
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional, Dict, Any

from app.models.trade import (
    Trade, TradeCreate, TradeUpdate, PerformanceReport,
    UserProfile, UserLoginRequest, UserUpdateRequest
)
from app.storage import db
from app.engine.analytics import generate_performance_report

app = FastAPI(
    title="Trading Register & Performance Dashboard API",
    version="3.0.0",
    description="Dual-Trader Authenticated Trade Register & Periodic Analytics (Daily, Weekly, Monthly, Quarterly, Half-Yearly, Annually)"
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
        "app": "Trade Register & Analytics Dashboard",
        "traders_count": len(db.get_users()),
        "trades_count": len(db.get_trades())
    }

# --- USER AUTHENTICATION & TRADERS (2 PERSONS) ---

@app.get("/api/users", response_model=List[UserProfile])
def get_traders():
    """Retrieve the available trader accounts for authentication"""
    return db.get_users()

@app.post("/api/users/login", response_model=UserProfile)
def login_trader(req: UserLoginRequest):
    """Authenticate trader using username and PIN/password"""
    user = db.authenticate_user(req)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Authentication failed. Invalid username or security PIN."
        )
    return user

@app.put("/api/users/{user_id}", response_model=UserProfile)
def update_trader(user_id: str, req: UserUpdateRequest):
    updated = db.update_user(user_id, req)
    if not updated:
        raise HTTPException(status_code=404, detail="Trader profile not found")
    return updated

# --- TRADE REGISTER CRUD (USER ISOLATED) ---

@app.get("/api/trades", response_model=List[Trade])
def get_trades(user_id: Optional[str] = Query(None, description="Trader User ID")):
    """Get trade register for authenticated trader"""
    return db.get_trades(user_id=user_id)

@app.post("/api/trades", response_model=Trade)
def create_trade(trade_in: TradeCreate):
    """Register a new trade with points, entry, exit, quantity, and P&L"""
    return db.create_trade(trade_in)

@app.put("/api/trades/{trade_id}", response_model=Trade)
def update_trade(trade_id: str, trade_update: TradeUpdate):
    """Update trade details in the register"""
    updated = db.update_trade(trade_id, trade_update)
    if not updated:
        raise HTTPException(status_code=404, detail="Trade not found")
    return updated

@app.delete("/api/trades/{trade_id}")
def delete_trade(trade_id: str):
    """Remove a trade entry from the register"""
    success = db.delete_trade(trade_id)
    if not success:
        raise HTTPException(status_code=404, detail="Trade not found")
    return {"success": True, "message": "Trade deleted successfully"}

@app.post("/api/trades/clear", response_model=List[Trade])
def clear_user_trades(user_id: str = Query(...)):
    """Clear all trades for a trader"""
    return db.clear_user_trades(user_id=user_id)

# --- DASHBOARD & PERIODIC PERFORMANCE REPORTS ---

@app.get("/api/analytics", response_model=PerformanceReport)
def get_analytics(
    user_id: str = Query(..., description="Trader User ID"),
    timeframe: str = Query("monthly", description="Timeframe: daily, weekly, monthly, quarterly, half_yearly, annually")
):
    """
    Generate comprehensive performance dashboard:
    Daily points & P&L, Weekly, Monthly, Quarterly, Half-Yearly, and Annually breakdown
    """
    user_trades = db.get_trades(user_id=user_id)
    report = generate_performance_report(user_trades, timeframe)
    report.user_id = user_id
    return report

@app.get("/api/analytics/compare")
def compare_traders():
    """Side-by-side comparison of the 2 traders"""
    traders = db.get_users()
    comparison = []
    for u in traders:
        u_trades = db.get_trades(user_id=u.id)
        rep = generate_performance_report(u_trades, "monthly")
        comparison.append({
            "trader": u,
            "metrics": rep.metrics,
            "total_trades": len(u_trades)
        })
    return comparison

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
