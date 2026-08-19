from typing import List, Dict, Any, Tuple
from app.models.schemas import Candle

class PriceActionEngine:
    @staticmethod
    def find_swings(candles: List[Candle], left_right_bars: int = 3) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        if len(candles) < (left_right_bars * 2 + 1):
            return [], []
            
        swing_highs = []
        swing_lows = []
        
        for i in range(left_right_bars, len(candles) - left_right_bars):
            curr = candles[i]
            # Check pivot high
            is_high = all(curr.high >= candles[j].high for j in range(i - left_right_bars, i + left_right_bars + 1) if j != i)
            if is_high:
                swing_highs.append({"index": i, "price": curr.high, "time": curr.time})
                
            # Check pivot low
            is_low = all(curr.low <= candles[j].low for j in range(i - left_right_bars, i + left_right_bars + 1) if j != i)
            if is_low:
                swing_lows.append({"index": i, "price": curr.low, "time": curr.time})
                
        return swing_highs, swing_lows

    @staticmethod
    def analyze_structure_sequence(candles: List[Candle]) -> Dict[str, Any]:
        swing_highs, swing_lows = PriceActionEngine.find_swings(candles)
        
        if len(swing_highs) < 2 or len(swing_lows) < 2:
            return {
                "trend": "SIDEWAYS",
                "structure_seq": "CONSOLIDATION",
                "current_state": "Ranging market",
                "swing_highs": [sh["price"] for sh in swing_highs[-3:]],
                "swing_lows": [sl["price"] for sl in swing_lows[-3:]]
            }
            
        sh1, sh2 = swing_highs[-2]["price"], swing_highs[-1]["price"]
        sl1, sl2 = swing_lows[-2]["price"], swing_lows[-1]["price"]
        
        is_hh = sh2 > sh1
        is_hl = sl2 > sl1
        is_lh = sh2 < sh1
        is_ll = sl2 < sl1
        
        if is_hh and is_hl:
            trend = "BULLISH"
            seq = "HH → HL → HH → HL"
            state = "Bullish Continuation"
        elif is_ll and is_lh:
            trend = "BEARISH"
            seq = "LL → LH → LL → LH"
            state = "Bearish Continuation"
        elif is_hh and is_ll:
            trend = "VOLATILE"
            seq = "HH → LL (Expanding Range)"
            state = "Market Expansion / High Volatility"
        else:
            trend = "SIDEWAYS"
            seq = "LH → HL (Contracting Range)"
            state = "Consolidation / Triangle Formation"
            
        # Check breakout & momentum
        curr_price = candles[-1].close
        last_high = swing_highs[-1]["price"]
        last_low = swing_lows[-1]["price"]
        
        breakout = curr_price > last_high
        breakdown = curr_price < last_low
        
        return {
            "trend": trend,
            "structure_seq": seq,
            "current_state": state,
            "is_higher_high": is_hh,
            "is_higher_low": is_hl,
            "is_lower_high": is_lh,
            "is_lower_low": is_ll,
            "breakout": breakout,
            "breakdown": breakdown,
            "recent_swing_high": last_high,
            "recent_swing_low": last_low
        }
