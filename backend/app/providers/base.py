from abc import ABC, abstractmethod
from typing import List, Dict, Any, Callable, Optional
from app.models.schemas import Instrument, TickData, Candle, OptionChainData, MarketStatus

class MarketDataProvider(ABC):
    
    @abstractmethod
    async def get_instruments(self, query: str = "", exchange: str = "ALL") -> List[Instrument]:
        pass

    @abstractmethod
    async def get_quote(self, symbol: str, exchange: str = "NSE") -> TickData:
        pass

    @abstractmethod
    async def get_historical_candles(self, symbol: str, exchange: str = "NSE", timeframe: str = "5m", count: int = 200) -> List[Candle]:
        pass

    @abstractmethod
    async def get_option_chain(self, symbol: str, exchange: str = "NSE", expiry: Optional[str] = None) -> OptionChainData:
        pass

    @abstractmethod
    async def get_market_status(self, exchange: str = "NSE") -> MarketStatus:
        pass

    @abstractmethod
    def subscribe_ticks(self, symbols: List[str], callback: Callable[[TickData], None]):
        pass

    @abstractmethod
    def unsubscribe(self, symbols: List[str]):
        pass
