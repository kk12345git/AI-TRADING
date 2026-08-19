from typing import List, Dict, Any, Tuple
from app.models.schemas import Candle, FairValueGap
from app.engine.price_action import PriceActionEngine

class StructureEngine:
    @staticmethod
    def identify_support_resistance(candles: List[Candle], vwap: float) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        if not candles or len(candles) < 20:
            return [], []
            
        current_price = candles[-1].close
        swing_highs, swing_lows = PriceActionEngine.find_swings(candles, left_right_bars=2)
        
        raw_resistances = []
        raw_supports = []
        
        # 1. Day & Intraday extremes
        intraday_high = max(c.high for c in candles[-50:])
        intraday_low = min(c.low for c in candles[-50:])
        day_open = candles[0].open
        
        raw_resistances.append({"price": intraday_high, "type": "Intraday High", "weight": 4})
        raw_supports.append({"price": intraday_low, "type": "Intraday Low", "weight": 4})
        
        if day_open > current_price:
            raw_resistances.append({"price": day_open, "type": "Day Open", "weight": 3})
        else:
            raw_supports.append({"price": day_open, "type": "Day Open", "weight": 3})
            
        if vwap > current_price:
            raw_resistances.append({"price": vwap, "type": "VWAP Level", "weight": 5})
        else:
            raw_supports.append({"price": vwap, "type": "VWAP Level", "weight": 5})
            
        # 2. Swing Highs and Lows
        for sh in swing_highs:
            if sh["price"] > current_price:
                raw_resistances.append({"price": sh["price"], "type": "Swing High", "weight": 3})
        for sl in swing_lows:
            if sl["price"] < current_price:
                raw_supports.append({"price": sl["price"], "type": "Swing Low", "weight": 3})
                
        # Cluster nearby levels within 0.15% threshold
        def cluster_levels(level_list: List[Dict[str, Any]], is_resistance: bool) -> List[Dict[str, Any]]:
            if not level_list:
                return []
            level_list = sorted(level_list, key=lambda x: x["price"])
            clusters = []
            
            for item in level_list:
                p = item["price"]
                added = False
                for cl in clusters:
                    avg_p = cl["price"]
                    if abs(p - avg_p) / avg_p < 0.002:  # 0.2% proximity cluster
                        cl["reactions"] += 1
                        cl["weight"] += item["weight"]
                        cl["types"].add(item["type"])
                        added = True
                        break
                if not added:
                    clusters.append({
                        "price": round(p, 2),
                        "reactions": 1,
                        "weight": item["weight"],
                        "types": {item["type"]}
                    })
                    
            output = []
            for cl in clusters:
                dist_pct = round(((cl["price"] - current_price) / current_price) * 100, 2)
                strength = "STRONG" if cl["weight"] >= 7 else ("MODERATE" if cl["weight"] >= 4 else "WEAK")
                output.append({
                    "price": cl["price"],
                    "type": " / ".join(list(cl["types"])),
                    "strength": strength,
                    "reactions": cl["reactions"],
                    "distance_pct": dist_pct
                })
                
            if is_resistance:
                return sorted(output, key=lambda x: x["price"])[:4]  # Nearest 4 resistance levels
            else:
                return sorted(output, key=lambda x: x["price"], reverse=True)[:4]  # Nearest 4 support levels

        return cluster_levels(raw_supports, is_resistance=False), cluster_levels(raw_resistances, is_resistance=True)

    @staticmethod
    def identify_fair_value_gaps(candles: List[Candle], timeframe: str = "5m") -> List[FairValueGap]:
        """Identifies Bullish and Bearish Fair Value Gaps (FVGs) across 3-candle windows."""
        if not candles or len(candles) < 3:
            return []

        fvgs: List[FairValueGap] = []
        curr_price = candles[-1].close

        for i in range(2, len(candles)):
            c1 = candles[i - 2]
            c2 = candles[i - 1]
            c3 = candles[i]

            # Bullish FVG: Candle 3 Low > Candle 1 High
            if c3.low > c1.high:
                top = round(c3.low, 2)
                bottom = round(c1.high, 2)
                # Check if mitigated by any subsequent candle
                mitigated = False
                for j in range(i + 1, len(candles)):
                    if candles[j].low <= bottom:
                        mitigated = True
                        break

                fvgs.append(FairValueGap(
                    type="BULLISH",
                    top=top,
                    bottom=bottom,
                    mitigated=mitigated,
                    timeframe=timeframe
                ))

            # Bearish FVG: Candle 3 High < Candle 1 Low
            elif c3.high < c1.low:
                top = round(c1.low, 2)
                bottom = round(c3.high, 2)
                mitigated = False
                for j in range(i + 1, len(candles)):
                    if candles[j].high >= top:
                        mitigated = True
                        break

                fvgs.append(FairValueGap(
                    type="BEARISH",
                    top=top,
                    bottom=bottom,
                    mitigated=mitigated,
                    timeframe=timeframe
                ))

        # Return unmitigated FVGs first, up to recent 6
        unmitigated = [f for f in fvgs if not f.mitigated]
        mitigated = [f for f in fvgs if f.mitigated]
        return (unmitigated + mitigated)[-6:]

