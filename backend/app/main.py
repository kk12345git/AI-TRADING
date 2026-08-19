import asyncio
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.api.endpoints import router as api_router, provider
from app.engine.signal import SignalEngine

# Connection manager for WebSockets
class WebSocketManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message))
            except Exception:
                pass

ws_manager = WebSocketManager()
bg_broadcast_task = None

async def market_ticks_loop():
    """Background task streaming real-time live market ticks and indicator updates."""
    symbols = ["NIFTY 50", "BANKNIFTY", "RELIANCE", "TCS", "INFY", "HDFCBANK"]
    while True:
        try:
            for sym in symbols:
                quote = await provider.get_quote(sym, "NSE")
                candles_5m = await provider.get_historical_candles(sym, "NSE", "5m", 100)
                candles_15m = await provider.get_historical_candles(sym, "NSE", "15m", 80)
                candles_1m = await provider.get_historical_candles(sym, "NSE", "1m", 40)
                option_data = await provider.get_option_chain(sym, "NSE")
                
                signal_data = SignalEngine.process_full_signal(
                    symbol=sym,
                    exchange="NSE",
                    timeframe="5m",
                    candles_15m=candles_15m,
                    candles_5m=candles_5m,
                    candles_1m=candles_1m,
                    option_data=option_data,
                    market_status="LIVE"
                )
                
                payload = {
                    "type": "TICK_UPDATE",
                    "symbol": sym,
                    "quote": quote.dict(),
                    "signal": signal_data.dict(),
                    "timestamp": quote.timestamp
                }
                await ws_manager.broadcast(payload)
                await asyncio.sleep(0.5)
        except Exception as e:
            await asyncio.sleep(1.0)

@asynccontextmanager
async def lifespan(app: FastAPI):
    global bg_broadcast_task
    bg_broadcast_task = asyncio.create_task(market_ticks_loop())
    yield
    if bg_broadcast_task:
        bg_broadcast_task.cancel()

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "app": settings.PROJECT_NAME,
        "status": "ONLINE",
        "market": "NSE / BSE LIVE",
        "docs": "/docs"
    }

@app.websocket("/ws/live")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Respond to ping or request
            req = json.loads(data)
            if req.get("action") == "PING":
                await websocket.send_text(json.dumps({"type": "PONG", "server_time": "OK"}))
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception:
        ws_manager.disconnect(websocket)
