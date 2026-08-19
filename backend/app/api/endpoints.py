from datetime import timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt

from app.core.config import settings
from app.core.security import create_access_token, verify_password
from app.models.schemas import (
    Instrument, TickData, Candle, OptionChainData, MarketStatus,
    FullSignalPayload, StrategyRuleConfig, ReplayState, BacktestRequest, BacktestResult, JournalEntry
)
from app.providers.mock_provider import MockMarketDataProvider
from app.providers.zerodha_provider import ZerodhaKiteProvider
from app.providers.dhan_provider import DhanHQProvider
from app.providers.fyers_provider import FyersProvider
from app.providers.angelone_provider import AngelOneProvider
from app.engine.signal import SignalEngine
from app.engine.replay import ReplayEngine
from app.engine.backtest import BacktestingEngine
from app.engine.strategy import StrategyEngine

router = APIRouter()

# Multi-broker Provider Manager
AVAILABLE_BROKERS = {
    "mock": MockMarketDataProvider(),
    "zerodha": ZerodhaKiteProvider(),
    "dhan": DhanHQProvider(),
    "fyers": FyersProvider(),
    "angelone": AngelOneProvider()
}
active_broker_key = "mock"
provider = AVAILABLE_BROKERS["mock"]

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

# Memory store for trade journal & strategy config
journal_db: List[JournalEntry] = []
current_strategy_config = StrategyEngine.get_default_strategy()

def get_current_user(token: str = Depends(oauth2_scheme)) -> str:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None or username not in settings.AUTHORIZED_USERS:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        return username
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

# 1. Auth Endpoint
@router.post("/auth/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user_pass = settings.AUTHORIZED_USERS.get(form_data.username)
    if not user_pass or not verify_password(form_data.password, user_pass):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect username or password")
    
    access_token = create_access_token(subject=form_data.username)
    return {"access_token": access_token, "token_type": "bearer", "user": form_data.username}

# 2. Market Data Endpoints
@router.get("/market/instruments", response_model=List[Instrument])
async def search_instruments(query: str = "", exchange: str = "ALL"):
    return await provider.get_instruments(query=query, exchange=exchange)

@router.get("/market/quote", response_model=TickData)
async def get_quote(symbol: str = "NIFTY 50", exchange: str = "NSE"):
    return await provider.get_quote(symbol=symbol, exchange=exchange)

@router.get("/market/candles", response_model=List[Candle])
async def get_candles(symbol: str = "NIFTY 50", exchange: str = "NSE", timeframe: str = "5m", count: int = 200):
    return await provider.get_historical_candles(symbol=symbol, exchange=exchange, timeframe=timeframe, count=count)

@router.get("/market/option-chain", response_model=OptionChainData)
async def get_option_chain(symbol: str = "NIFTY 50", exchange: str = "NSE", expiry: Optional[str] = None):
    return await provider.get_option_chain(symbol=symbol, exchange=exchange, expiry=expiry)

@router.get("/market/status", response_model=MarketStatus)
async def get_market_status(exchange: str = "NSE"):
    return await provider.get_market_status(exchange=exchange)

# 3. Strategy & Signal Engine Endpoints
@router.get("/indicator/signal", response_model=FullSignalPayload)
async def get_live_signal(symbol: str = "NIFTY 50", exchange: str = "NSE", timeframe: str = "5m"):
    candles_5m = await provider.get_historical_candles(symbol=symbol, exchange=exchange, timeframe=timeframe, count=150)
    candles_15m = await provider.get_historical_candles(symbol=symbol, exchange=exchange, timeframe="15m", count=100)
    candles_1m = await provider.get_historical_candles(symbol=symbol, exchange=exchange, timeframe="1m", count=50)
    
    option_data = None
    if "NIFTY" in symbol or "BANKNIFTY" in symbol or "RELIANCE" in symbol:
        option_data = await provider.get_option_chain(symbol=symbol, exchange=exchange)
        
    status_info = await provider.get_market_status(exchange=exchange)
    
    return SignalEngine.process_full_signal(
        symbol=symbol,
        exchange=exchange,
        timeframe=timeframe,
        candles_15m=candles_15m,
        candles_5m=candles_5m,
        candles_1m=candles_1m,
        option_data=option_data,
        market_status=status_info.status
    )

@router.get("/strategy/rules", response_model=StrategyRuleConfig)
async def get_strategy_rules():
    global current_strategy_config
    return current_strategy_config

@router.post("/strategy/rules", response_model=StrategyRuleConfig)
async def update_strategy_rules(config: StrategyRuleConfig):
    global current_strategy_config
    current_strategy_config = config
    return current_strategy_config

# 4. Replay & Backtest Endpoints
@router.get("/replay/step", response_model=ReplayState)
async def replay_step(symbol: str = "NIFTY 50", timeframe: str = "5m", step: int = 40):
    candles = await provider.get_historical_candles(symbol=symbol, exchange="NSE", timeframe=timeframe, count=200)
    option_data = await provider.get_option_chain(symbol=symbol, exchange="NSE")
    engine = ReplayEngine(symbol=symbol, timeframe=timeframe, candles=candles, option_data=option_data)
    return engine.jump_to_index(step)

@router.post("/backtest/run", response_model=BacktestResult)
async def run_backtest(req: BacktestRequest):
    candles = await provider.get_historical_candles(symbol=req.symbol, exchange=req.exchange, timeframe=req.timeframe, count=300)
    option_data = await provider.get_option_chain(symbol=req.symbol, exchange=req.exchange)
    return BacktestingEngine.run_backtest(req, candles, option_data)

# 5. Trade Journal Endpoints
@router.get("/journal", response_model=List[JournalEntry])
async def list_journal_entries():
    return journal_db

@router.post("/journal", response_model=JournalEntry)
async def add_journal_entry(entry: JournalEntry):
    entry.id = f"J_{len(journal_db) + 1}"
    journal_db.insert(0, entry)
    return entry

# 6. Broker Provider Management Endpoints
@router.get("/broker/status")
async def get_broker_status():
    global active_broker_key, provider
    return {
        "active_broker": active_broker_key,
        "available_brokers": [
            {"key": "mock", "name": "Mock Simulated Feed", "status": "ACTIVE" if active_broker_key == "mock" else "READY"},
            {"key": "zerodha", "name": "Zerodha Kite Connect", "status": "ACTIVE" if active_broker_key == "zerodha" else "READY"},
            {"key": "dhan", "name": "Dhan HQ API", "status": "ACTIVE" if active_broker_key == "dhan" else "READY"},
            {"key": "fyers", "name": "Fyers API v3", "status": "ACTIVE" if active_broker_key == "fyers" else "READY"},
            {"key": "angelone", "name": "AngelOne SmartAPI", "status": "ACTIVE" if active_broker_key == "angelone" else "READY"}
        ]
    }

@router.post("/broker/switch")
async def switch_broker(payload: dict = Body(...)):
    global active_broker_key, provider
    target_key = payload.get("broker_key", "mock").lower()
    if target_key not in AVAILABLE_BROKERS:
        raise HTTPException(status_code=400, detail=f"Invalid broker key: {target_key}")
    
    active_broker_key = target_key
    provider = AVAILABLE_BROKERS[target_key]
    return {
        "status": "SUCCESS",
        "active_broker": active_broker_key,
        "message": f"Market Data Feed switched to {target_key.upper()}"
    }

