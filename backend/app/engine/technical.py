import numpy as np
import pandas as pd
from typing import List, Dict, Any
from app.models.schemas import Candle

class TechnicalEngine:
    @staticmethod
    def calculate_all(candles: List[Candle]) -> Dict[str, Any]:
        if not candles or len(candles) < 10:
            return {}
        
        df = pd.DataFrame([c.dict() for c in candles])
        
        # Ensure numeric types
        for col in ['open', 'high', 'low', 'close', 'volume']:
            df[col] = df[col].astype(float)
            
        close = df['close']
        high = df['high']
        low = df['low']
        volume = df['volume']
        
        # 1. VWAP
        tp = (high + low + close) / 3.0
        vwap = (tp * volume).cumsum() / volume.cumsum()
        
        # 2. EMAs
        ema_9 = close.ewm(span=9, adjust=False).mean()
        ema_20 = close.ewm(span=20, adjust=False).mean()
        ema_50 = close.ewm(span=50, adjust=False).mean()
        ema_100 = close.ewm(span=100, adjust=False).mean()
        ema_200 = close.ewm(span=200, adjust=False).mean()
        
        # 3. SMA
        sma_20 = close.rolling(window=20).mean()
        
        # 4. RSI (14)
        delta = close.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / (loss.replace(0, 0.00001))
        rsi = 100 - (100 / (1 + rs))
        
        # 5. MACD (12, 26, 9)
        ema_12 = close.ewm(span=12, adjust=False).mean()
        ema_26 = close.ewm(span=26, adjust=False).mean()
        macd_line = ema_12 - ema_26
        macd_signal = macd_line.ewm(span=9, adjust=False).mean()
        macd_hist = macd_line - macd_signal
        
        # 6. ATR (14)
        tr1 = high - low
        tr2 = (high - close.shift(1)).abs()
        tr3 = (low - close.shift(1)).abs()
        tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
        atr = tr.rolling(window=14).mean()
        
        # 7. Bollinger Bands (20, 2)
        std_20 = close.rolling(window=20).std()
        bb_upper = sma_20 + (std_20 * 2)
        bb_lower = sma_20 - (std_20 * 2)
        
        # 8. Supertrend (10, 3)
        hl2 = (high + low) / 2.0
        atr_10 = tr.rolling(window=10).mean()
        basic_upper = hl2 + (3 * atr_10)
        basic_lower = hl2 - (3 * atr_10)
        
        supertrend = np.zeros(len(df))
        st_dir = np.zeros(len(df))
        
        final_upper = basic_upper.copy()
        final_lower = basic_lower.copy()
        
        for i in range(1, len(df)):
            if basic_upper.iloc[i] < final_upper.iloc[i-1] or close.iloc[i-1] > final_upper.iloc[i-1]:
                final_upper.iloc[i] = basic_upper.iloc[i]
            else:
                final_upper.iloc[i] = final_upper.iloc[i-1]
                
            if basic_lower.iloc[i] > final_lower.iloc[i-1] or close.iloc[i-1] < final_lower.iloc[i-1]:
                final_lower.iloc[i] = basic_lower.iloc[i]
            else:
                final_lower.iloc[i] = final_lower.iloc[i-1]
                
            if supertrend[i-1] == final_upper.iloc[i-1]:
                if close.iloc[i] <= final_upper.iloc[i]:
                    supertrend[i] = final_upper.iloc[i]
                    st_dir[i] = -1
                else:
                    supertrend[i] = final_lower.iloc[i]
                    st_dir[i] = 1
            else:
                if close.iloc[i] >= final_lower.iloc[i]:
                    supertrend[i] = final_lower.iloc[i]
                    st_dir[i] = 1
                else:
                    supertrend[i] = final_upper.iloc[i]
                    st_dir[i] = -1
                    
        # 9. Volume MA (20)
        volume_ma = volume.rolling(window=20).mean()

        # 10. Volume Profile (POC, VAH, VAL)
        vp_data = TechnicalEngine.calculate_volume_profile(df)

        # 11. MACD Divergence
        macd_div = TechnicalEngine.calculate_macd_divergence(close, macd_hist)

        # 12. Fibonacci Retracements
        fib_data = TechnicalEngine.calculate_fibonacci(high, low)
        
        last_idx = len(df) - 1
        
        return {
            "vwap": float(round(vwap.iloc[last_idx], 2)),
            "ema_9": float(round(ema_9.iloc[last_idx], 2)),
            "ema_20": float(round(ema_20.iloc[last_idx], 2)),
            "ema_50": float(round(ema_50.iloc[last_idx], 2)),
            "ema_100": float(round(ema_100.iloc[last_idx], 2)),
            "ema_200": float(round(ema_200.iloc[last_idx], 2)),
            "sma_20": float(round(sma_20.iloc[last_idx], 2)),
            "rsi": float(round(rsi.iloc[last_idx], 2)),
            "macd": {
                "macd": float(round(macd_line.iloc[last_idx], 2)),
                "signal": float(round(macd_signal.iloc[last_idx], 2)),
                "histogram": float(round(macd_hist.iloc[last_idx], 2))
            },
            "atr": float(round(atr.iloc[last_idx], 2)),
            "bollinger": {
                "upper": float(round(bb_upper.iloc[last_idx], 2)),
                "middle": float(round(sma_20.iloc[last_idx], 2)),
                "lower": float(round(bb_lower.iloc[last_idx], 2))
            },
            "supertrend": {
                "value": float(round(supertrend[last_idx], 2)),
                "direction": "BULLISH" if st_dir[last_idx] == 1 else "BEARISH"
            },
            "volume_ma": float(round(volume_ma.iloc[last_idx], 2)),
            "current_volume": int(volume.iloc[last_idx]),
            "volume_ratio": float(round(volume.iloc[last_idx] / max(1.0, volume_ma.iloc[last_idx]), 2)),
            "volume_profile": vp_data,
            "macd_divergence": macd_div,
            "fibonacci": fib_data
        }

    @staticmethod
    def calculate_volume_profile(df: pd.DataFrame, num_bins: int = 25) -> Dict[str, Any]:
        """Calculates Point of Control (POC), Value Area High (VAH), and Value Area Low (VAL)."""
        if df.empty or len(df) < 5:
            return {"poc": 0.0, "vah": 0.0, "val": 0.0, "volume_area_pct": 70.0}
        
        min_p = float(df['low'].min())
        max_p = float(df['high'].max())
        if max_p == min_p:
            return {"poc": min_p, "vah": max_p, "val": min_p, "volume_area_pct": 70.0}

        bin_size = (max_p - min_p) / num_bins
        bins = [min_p + i * bin_size for i in range(num_bins + 1)]
        bin_volumes = np.zeros(num_bins)

        for _, row in df.iterrows():
            candle_low = row['low']
            candle_high = row['high']
            vol = row['volume']
            if candle_high == candle_low:
                continue
            for b_idx in range(num_bins):
                b_low = bins[b_idx]
                b_high = bins[b_idx + 1]
                overlap = max(0.0, min(candle_high, b_high) - max(candle_low, b_low))
                if overlap > 0:
                    bin_volumes[b_idx] += vol * (overlap / (candle_high - candle_low))

        max_bin_idx = int(np.argmax(bin_volumes))
        poc = (bins[max_bin_idx] + bins[max_bin_idx + 1]) / 2.0
        
        total_vol = np.sum(bin_volumes)
        target_vol = total_vol * 0.70
        accum_vol = bin_volumes[max_bin_idx]
        low_idx = max_bin_idx
        high_idx = max_bin_idx

        while accum_vol < target_vol and (low_idx > 0 or high_idx < num_bins - 1):
            next_low_vol = bin_volumes[low_idx - 1] if low_idx > 0 else 0
            next_high_vol = bin_volumes[high_idx + 1] if high_idx < num_bins - 1 else 0

            if next_low_vol >= next_high_vol and low_idx > 0:
                low_idx -= 1
                accum_vol += next_low_vol
            elif high_idx < num_bins - 1:
                high_idx += 1
                accum_vol += next_high_vol
            elif low_idx > 0:
                low_idx -= 1
                accum_vol += next_low_vol

        val = bins[low_idx]
        vah = bins[high_idx + 1]

        return {
            "poc": float(round(poc, 2)),
            "vah": float(round(vah, 2)),
            "val": float(round(val, 2)),
            "volume_area_pct": 70.0
        }

    @staticmethod
    def calculate_macd_divergence(close: pd.Series, macd_hist: pd.Series, window: int = 30) -> Dict[str, Any]:
        """Detects Regular and Hidden Bullish/Bearish MACD Divergences."""
        if len(close) < window:
            return {"type": "NONE", "description": "Insufficient data for divergence detection", "strength": "WEAK"}

        sub_close = close.tail(window).values
        sub_hist = macd_hist.tail(window).values

        # Find local min/max points
        p1_idx, p2_idx = len(sub_close) - 15, len(sub_close) - 1
        price_low_1, price_low_2 = np.min(sub_close[:15]), np.min(sub_close[15:])
        hist_low_1, hist_low_2 = np.min(sub_hist[:15]), np.min(sub_hist[15:])

        price_high_1, price_high_2 = np.max(sub_close[:15]), np.max(sub_close[15:])
        hist_high_1, hist_high_2 = np.max(sub_hist[:15]), np.max(sub_hist[15:])

        # Bullish Regular: Price makes Lower Low, MACD Hist makes Higher Low
        if price_low_2 < price_low_1 and hist_low_2 > hist_low_1:
            return {
                "type": "BULLISH_REGULAR",
                "description": "Bullish Regular Divergence: Price Lower Low vs MACD Higher Low",
                "strength": "STRONG"
            }

        # Bearish Regular: Price makes Higher High, MACD Hist makes Lower High
        if price_high_2 > price_high_1 and hist_high_2 < hist_high_1:
            return {
                "type": "BEARISH_REGULAR",
                "description": "Bearish Regular Divergence: Price Higher High vs MACD Lower High",
                "strength": "STRONG"
            }

        # Bullish Hidden: Price Higher Low, MACD Lower Low
        if price_low_2 > price_low_1 and hist_low_2 < hist_low_1:
            return {
                "type": "BULLISH_HIDDEN",
                "description": "Bullish Hidden Divergence: Continuation trend signal",
                "strength": "MODERATE"
            }

        # Bearish Hidden: Price Lower High, MACD Higher High
        if price_high_2 < price_high_1 and hist_high_2 > hist_high_1:
            return {
                "type": "BEARISH_HIDDEN",
                "description": "Bearish Hidden Divergence: Continuation down signal",
                "strength": "MODERATE"
            }

        return {"type": "NONE", "description": "No active divergence detected", "strength": "WEAK"}

    @staticmethod
    def calculate_fibonacci(high: pd.Series, low: pd.Series, window: int = 50) -> Dict[str, Any]:
        """Calculates Auto-Fibonacci Retracement levels from key swing range."""
        if len(high) < window:
            window = len(high)

        max_p = float(high.tail(window).max())
        min_p = float(low.tail(window).min())
        diff = max_p - min_p

        return {
            "high": float(round(max_p, 2)),
            "low": float(round(min_p, 2)),
            "fib_236": float(round(max_p - 0.236 * diff, 2)),
            "fib_382": float(round(max_p - 0.382 * diff, 2)),
            "fib_500": float(round(max_p - 0.500 * diff, 2)),
            "fib_618": float(round(max_p - 0.618 * diff, 2)),
            "fib_786": float(round(max_p - 0.786 * diff, 2))
        }

