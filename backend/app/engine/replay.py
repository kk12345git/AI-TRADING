from typing import List, Dict, Any, Optional
from app.models.schemas import Candle, ReplayState, OptionChainData
from app.engine.signal import SignalEngine

class ReplayEngine:
    def __init__(self, symbol: str, timeframe: str, candles: List[Candle], option_data: Optional[OptionChainData] = None):
        self.symbol = symbol
        self.timeframe = timeframe
        self.candles = candles
        self.option_data = option_data
        self.current_index = min(30, len(candles) - 1)
        
    def step_forward(self) -> ReplayState:
        if self.current_index < len(self.candles) - 1:
            self.current_index += 1
            
        sub_candles_5m = self.candles[:self.current_index + 1]
        sub_candles_15m = self.candles[:self.current_index + 1]
        sub_candles_1m = self.candles[:self.current_index + 1]
        
        signal_payload = SignalEngine.process_full_signal(
            symbol=self.symbol,
            exchange="NSE",
            timeframe=self.timeframe,
            candles_15m=sub_candles_15m,
            candles_5m=sub_candles_5m,
            candles_1m=sub_candles_1m,
            option_data=self.option_data,
            market_status="REPLAY MODE"
        )
        
        return ReplayState(
            symbol=self.symbol,
            timeframe=self.timeframe,
            current_index=self.current_index,
            total_candles=len(self.candles),
            current_candle=self.candles[self.current_index],
            signal=signal_payload
        )

    def jump_to_index(self, index: int) -> ReplayState:
        self.current_index = max(10, min(index, len(self.candles) - 1))
        return self.step_forward()
