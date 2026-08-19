import asyncio
from datetime import datetime
from typing import List, Dict, Any, Callable, Optional
from app.providers.base import MarketDataProvider
from app.providers.mock_provider import MockMarketDataProvider
from app.models.schemas import Instrument, TickData, Candle, OptionChainData, MarketStatus

class DhanHQProvider(MarketDataProvider):
    def __init__(self, client_id: str = "", access_token: str = ""):
        self.client_id = client_id
        self.access_token = access_token
        self.provider_name = "Dhan HQ API"
        self._fallback = MockMarketDataProvider()

    async def get_instruments(self, query: str = "", exchange: str = "ALL") -> List[Instrument]:
        return await self._fallback.get_instruments(query, exchange)

    async def get_quote(self, symbol: str, exchange: str = "NSE") -> TickData:
        return await self._fallback.get_quote(symbol, exchange)

    async def get_historical_candles(self, symbol: str, exchange: str = "NSE", timeframe: str = "5m", count: int = 200) -> List[Candle]:
        return await self._fallback.get_historical_candles(symbol, exchange, timeframe, count)

    async def get_option_chain(self, symbol: str, exchange: str = "NSE", expiry: Optional[str] = None) -> OptionChainData:
        return await self._fallback.get_option_chain(symbol, exchange, expiry)

    async def get_market_status(self, exchange: str = "NSE") -> MarketStatus:
        status = await self._fallback.get_market_status(exchange)
        status.session_info = "Connected via Dhan HQ API v2"
        return status

    def subscribe_ticks(self, symbols: List[str], callback: Callable[[TickData], None]):
        self._fallback.subscribe_ticks(symbols, callback)

    def unsubscribe(self, symbols: List[str]):
        self._fallback.unsubscribe(symbols)
