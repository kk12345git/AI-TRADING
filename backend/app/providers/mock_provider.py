import asyncio
import time
import math
import random
from datetime import datetime, timedelta
from typing import List, Dict, Any, Callable, Optional
from app.providers.base import MarketDataProvider
from app.models.schemas import Instrument, TickData, Candle, OptionChainData, OptionStrike, MarketStatus

MOCK_INSTRUMENTS: List[Dict[str, Any]] = [
    # NSE Indices
    {"symbol": "NIFTY 50", "trading_symbol": "NIFTY", "name": "NIFTY 50 Index", "exchange": "NSE", "instrument_type": "INDEX", "lot_size": 25, "tick_size": 0.05, "base_price": 24865.0, "token": "256265"},
    {"symbol": "BANKNIFTY", "trading_symbol": "BANKNIFTY", "name": "NIFTY Bank Index", "exchange": "NSE", "instrument_type": "INDEX", "lot_size": 15, "tick_size": 0.05, "base_price": 52410.0, "token": "260105"},
    {"symbol": "FINNIFTY", "trading_symbol": "FINNIFTY", "name": "NIFTY Financial Services", "exchange": "NSE", "instrument_type": "INDEX", "lot_size": 25, "tick_size": 0.05, "base_price": 23680.0, "token": "257801"},
    
    # NSE Equities
    {"symbol": "RELIANCE", "trading_symbol": "RELIANCE", "name": "Reliance Industries Ltd", "exchange": "NSE", "instrument_type": "EQUITY", "lot_size": 250, "tick_size": 0.05, "base_price": 3020.50, "token": "738561"},
    {"symbol": "TCS", "trading_symbol": "TCS", "name": "Tata Consultancy Services Ltd", "exchange": "NSE", "instrument_type": "EQUITY", "lot_size": 175, "tick_size": 0.05, "base_price": 4350.25, "token": "2953217"},
    {"symbol": "INFY", "trading_symbol": "INFY", "name": "Infosys Ltd", "exchange": "NSE", "instrument_type": "EQUITY", "lot_size": 400, "tick_size": 0.05, "base_price": 1890.80, "token": "408065"},
    {"symbol": "HDFCBANK", "trading_symbol": "HDFCBANK", "name": "HDFC Bank Ltd", "exchange": "NSE", "instrument_type": "EQUITY", "lot_size": 550, "tick_size": 0.05, "base_price": 1645.00, "token": "341249"},
    {"symbol": "ICICIBANK", "trading_symbol": "ICICIBANK", "name": "ICICI Bank Ltd", "exchange": "NSE", "instrument_type": "EQUITY", "lot_size": 700, "tick_size": 0.05, "base_price": 1185.30, "token": "1270529"},
    {"symbol": "SBIN", "trading_symbol": "SBIN", "name": "State Bank of India", "exchange": "NSE", "instrument_type": "EQUITY", "lot_size": 750, "tick_size": 0.05, "base_price": 825.40, "token": "779521"},
    {"symbol": "TATAMOTORS", "trading_symbol": "TATAMOTORS", "name": "Tata Motors Ltd", "exchange": "NSE", "instrument_type": "EQUITY", "lot_size": 1400, "tick_size": 0.05, "base_price": 1080.00, "token": "884737"},

    # BSE Equities
    {"symbol": "SENSEX", "trading_symbol": "SENSEX", "name": "BSE SENSEX Index", "exchange": "BSE", "instrument_type": "INDEX", "lot_size": 10, "tick_size": 0.05, "base_price": 81500.0, "token": "1"},
    {"symbol": "BSE:RELIANCE", "trading_symbol": "RELIANCE", "name": "Reliance Industries Ltd (BSE)", "exchange": "BSE", "instrument_type": "EQUITY", "lot_size": 1, "tick_size": 0.05, "base_price": 3021.00, "token": "500325"},
    {"symbol": "BSE:TCS", "trading_symbol": "TCS", "name": "Tata Consultancy Services (BSE)", "exchange": "BSE", "instrument_type": "EQUITY", "lot_size": 1, "tick_size": 0.05, "base_price": 4351.00, "token": "532540"},
]

class MockMarketDataProvider(MarketDataProvider):
    def __init__(self):
        self._current_prices: Dict[str, float] = {item["symbol"]: item["base_price"] for item in MOCK_INSTRUMENTS}
        self._daily_open: Dict[str, float] = {item["symbol"]: item["base_price"] * (1 + random.uniform(-0.003, 0.003)) for item in MOCK_INSTRUMENTS}
        self._daily_high: Dict[str, float] = {item["symbol"]: self._current_prices[item["symbol"]] * 1.008 for item in MOCK_INSTRUMENTS}
        self._daily_low: Dict[str, float] = {item["symbol"]: self._current_prices[item["symbol"]] * 0.992 for item in MOCK_INSTRUMENTS}
        self._volumes: Dict[str, int] = {item["symbol"]: random.randint(50000, 2000000) for item in MOCK_INSTRUMENTS}
        self._open_interest: Dict[str, int] = {item["symbol"]: random.randint(100000, 5000000) for item in MOCK_INSTRUMENTS}
        self._subscribers: List[Callable[[TickData], None]] = []
        self._subscribed_symbols: set = set()
        self._is_running = False
        self._background_task: Optional[asyncio.Task] = None

    async def get_instruments(self, query: str = "", exchange: str = "ALL") -> List[Instrument]:
        query = query.upper().strip()
        exchange = exchange.upper().strip()
        
        results = []
        for inst in MOCK_INSTRUMENTS:
            if exchange != "ALL" and inst["exchange"] != exchange:
                continue
            if query and (query not in inst["symbol"] and query not in inst["name"] and query not in inst["trading_symbol"]):
                continue
            results.append(Instrument(**inst))
        
        # Also include generated Option instruments dynamically if user queries options (e.g. NIFTY 24800 CE)
        if "CE" in query or "PE" in query or "OPTION" in query:
            for strike in [24700, 24800, 24900, 25000]:
                for opt in ["CE", "PE"]:
                    sym = f"NIFTY {strike} {opt}"
                    results.append(Instrument(
                        symbol=sym,
                        trading_symbol=f"NIFTY26AUG{strike}{opt}",
                        name=f"NIFTY 50 {strike} {opt}",
                        exchange="NSE",
                        instrument_type="OPTION",
                        lot_size=25,
                        tick_size=0.05,
                        strike=float(strike),
                        option_type=opt,
                        expiry="2026-08-27",
                        token=f"OPT_{strike}_{opt}"
                    ))
        return results

    async def get_quote(self, symbol: str, exchange: str = "NSE") -> TickData:
        price = self._current_prices.get(symbol, 24865.0)
        # Update price slightly
        drift = random.choice([-1, 1]) * random.uniform(0.1, 1.5)
        price = round(price + drift, 2)
        self._current_prices[symbol] = price
        
        op = self._daily_open.get(symbol, price * 0.998)
        hi = max(self._daily_high.get(symbol, price), price)
        lo = min(self._daily_low.get(symbol, price), price)
        self._daily_high[symbol] = hi
        self._daily_low[symbol] = lo
        
        vol = self._volumes.get(symbol, 100000) + random.randint(10, 500)
        self._volumes[symbol] = vol
        
        change = round(price - op, 2)
        p_change = round((change / op) * 100, 2)
        
        return TickData(
            symbol=symbol,
            exchange=exchange,
            ltp=price,
            open=op,
            high=hi,
            low=lo,
            close=round(price - random.uniform(-0.5, 0.5), 2),
            volume=vol,
            change=change,
            p_change=p_change,
            oi=self._open_interest.get(symbol, 1250000),
            change_oi=random.randint(-15000, 25000),
            bid=round(price - 0.10, 2),
            ask=round(price + 0.10, 2),
            last_quantity=random.choice([25, 50, 75, 100, 250]),
            timestamp=datetime.now().strftime("%H:%M:%S")
        )

    async def get_historical_candles(self, symbol: str, exchange: str = "NSE", timeframe: str = "5m", count: int = 200) -> List[Candle]:
        # Generate realistic historical candles
        tf_minutes = {
            "1m": 1, "3m": 3, "5m": 5, "15m": 15, "30m": 30,
            "1H": 60, "4H": 240, "1D": 1440, "1W": 10080
        }.get(timeframe, 5)
        
        current_time = int(time.time())
        step_seconds = tf_minutes * 60
        base_price = self._current_prices.get(symbol, 24865.0)
        
        candles = []
        price = base_price * 0.97  # Start 3% lower historical
        
        # Deterministic random seed per symbol for smooth repeatable chart
        rnd = random.Random(hash(symbol) + tf_minutes)
        
        for i in range(count):
            candle_time = current_time - (count - i) * step_seconds
            
            # Trend component + random noise
            trend = math.sin(i / 15.0) * (base_price * 0.002) + (i / float(count)) * (base_price * 0.03)
            volatility = base_price * (0.0015 if tf_minutes <= 5 else 0.004)
            
            op = price
            cl = round(op + rnd.uniform(-volatility, volatility) + (trend * 0.05), 2)
            hi = round(max(op, cl) + rnd.uniform(0, volatility * 0.8), 2)
            lo = round(min(op, cl) - rnd.uniform(0, volatility * 0.8), 2)
            vol = int(rnd.randint(5000, 80000) * (tf_minutes ** 0.5))
            oi = int(1000000 + rnd.randint(-50000, 50000))
            
            candles.append(Candle(
                time=candle_time,
                open=op,
                high=hi,
                low=lo,
                close=cl,
                volume=vol,
                oi=oi
            ))
            price = cl
            
        # Ensure the last candle matches current live price
        if candles:
            candles[-1].close = self._current_prices.get(symbol, base_price)
            candles[-1].high = max(candles[-1].high, candles[-1].close)
            candles[-1].low = min(candles[-1].low, candles[-1].close)
            
        return candles

    async def get_option_chain(self, symbol: str, exchange: str = "NSE", expiry: Optional[str] = None) -> OptionChainData:
        spot_price = self._current_prices.get(symbol, 24865.0)
        
        # Calculate ATM strike based on instrument
        step = 50.0 if "NIFTY" in symbol and "BANK" not in symbol else (100.0 if "BANKNIFTY" in symbol else 20.0)
        atm_strike = round(spot_price / step) * step
        
        expiries = ["2026-08-27 (Weekly)", "2026-09-03 (Weekly)", "2026-09-24 (Monthly)"]
        selected_expiry = expiry if expiry in expiries else expiries[0]
        
        strikes = []
        total_call_oi = 0
        total_put_oi = 0
        max_call_oi = -1
        max_put_oi = -1
        max_call_strike = atm_strike
        max_put_strike = atm_strike
        
        # Generate 15 strikes centered around ATM (7 ITM, ATM, 7 OTM)
        for offset in range(-7, 8):
            strike = atm_strike + (offset * step)
            is_atm = (strike == atm_strike)
            
            # Intrinsic value
            ce_intrinsic = max(0.0, spot_price - strike)
            pe_intrinsic = max(0.0, strike - spot_price)
            
            # Time value decay approximation
            dist = abs(spot_price - strike)
            time_val = max(10.0, 180.0 - (dist * 0.4))
            
            ce_ltp = round(ce_intrinsic + time_val + random.uniform(-2, 2), 2)
            pe_ltp = round(pe_intrinsic + time_val + random.uniform(-2, 2), 2)
            
            # Simulated OI distribution (Calls peak above ATM, Puts peak below ATM)
            ce_oi = int(120000 * math.exp(-((strike - (atm_strike + step * 2)) / (step * 3)) ** 2) + random.randint(5000, 20000))
            pe_oi = int(135000 * math.exp(-((strike - (atm_strike - step * 2)) / (step * 3)) ** 2) + random.randint(5000, 20000))
            
            ce_change_oi = int(random.randint(-15000, 35000))
            pe_change_oi = int(random.randint(-10000, 45000))
            
            ce_vol = int(ce_oi * random.uniform(0.1, 0.4))
            pe_vol = int(pe_oi * random.uniform(0.1, 0.4))
            
            ce_iv = round(14.5 + (dist / step) * 0.3 + random.uniform(-0.5, 0.5), 2)
            pe_iv = round(15.2 + (dist / step) * 0.3 + random.uniform(-0.5, 0.5), 2)
            
            total_call_oi += ce_oi
            total_put_oi += pe_oi
            
            if ce_oi > max_call_oi:
                max_call_oi = ce_oi
                max_call_strike = strike
                
            if pe_oi > max_put_oi:
                max_put_oi = pe_oi
                max_put_strike = strike
                
            moneyness = "ATM" if is_atm else ("ITM" if strike < spot_price else "OTM")
            
            strikes.append(OptionStrike(
                strike=strike,
                ce_ltp=ce_ltp,
                ce_change=round(random.uniform(-15.0, 25.0), 2),
                ce_oi=ce_oi,
                ce_change_oi=ce_change_oi,
                ce_volume=ce_vol,
                ce_iv=ce_iv,
                pe_ltp=pe_ltp,
                pe_change=round(random.uniform(-15.0, 25.0), 2),
                pe_oi=pe_oi,
                pe_change_oi=pe_change_oi,
                pe_volume=pe_vol,
                pe_iv=pe_iv,
                is_atm=is_atm,
                moneyness=moneyness
            ))
            
        pcr = round(total_put_oi / max(1, total_call_oi), 2)
        sentiment = "BULLISH" if pcr > 1.1 else ("BEARISH" if pcr < 0.85 else "NEUTRAL")
        
        return OptionChainData(
            underlying_symbol=symbol,
            exchange=exchange,
            spot_price=spot_price,
            atm_strike=atm_strike,
            expiries=expiries,
            selected_expiry=selected_expiry,
            strikes=strikes,
            pcr=pcr,
            call_oi_total=total_call_oi,
            put_oi_total=total_put_oi,
            max_call_oi_strike=max_call_strike,
            max_put_oi_strike=max_put_strike,
            sentiment=sentiment
        )

    async def get_market_status(self, exchange: str = "NSE") -> MarketStatus:
        now = datetime.now()
        # Market hours check (9:15 AM to 3:30 PM IST)
        market_open = now.replace(hour=9, minute=15, second=0)
        market_close = now.replace(hour=15, minute=30, second=0)
        pre_open = now.replace(hour=9, minute=0, second=0)
        
        if pre_open <= now < market_open:
            status = "PRE-OPEN"
            session_info = "Pre-market session (9:00 AM - 9:15 AM IST)"
        elif market_open <= now <= market_close:
            status = "OPEN"
            session_info = "Live Trading Session (9:15 AM - 3:30 PM IST)"
        else:
            status = "LIVE"  # Default active live mode for indicator testing
            session_info = "Market Live Data Feed Active"
            
        return MarketStatus(
            exchange=exchange,
            status=status,
            session_info=session_info,
            server_time=now.strftime("%Y-%m-%d %H:%M:%S IST"),
            data_health="LIVE"
        )

    def subscribe_ticks(self, symbols: List[str], callback: Callable[[TickData], None]):
        self._subscribed_symbols.update(symbols)
        if callback not in self._subscribers:
            self._subscribers.append(callback)

    def unsubscribe(self, symbols: List[str]):
        for s in symbols:
            self._subscribed_symbols.discard(s)
