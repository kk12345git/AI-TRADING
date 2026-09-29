"""
Researched Real-World Instrument Specifications & Lot Size Calculations
Exact contract size, point multiplier, and lot sizing across:
- Commodities (XAUUSD Gold: 100 oz contract size -> 0.01 lot * 1 point = $1.00 USD)
- Global Index CFDs (NASDAQ 100, US30 Dow, SPX500, GER40: 1.0 lot * 1 point = 1.0 USD/EUR)
- Indian Exchange Indices (NSE NIFTY50: 25 qty, BANKNIFTY: 15 qty, BSE SENSEX: 10 qty)
- Major Forex & Crypto
"""

from typing import Dict, Any

INSTRUMENT_SPECS: Dict[str, Dict[str, Any]] = {
    "XAUUSD": {
        "symbol": "XAUUSD",
        "name": "Gold / US Dollar Spot",
        "category": "COMMODITY",
        "exchange": "FOREX",
        "currency": "USD",
        "currency_symbol": "$",
        "contract_size": 100.0,  # 100 troy ounces per 1 standard lot
        "point_multiplier": 100.0,  # 0.01 lot * 1 pt * 100 = $1.00 USD
        "min_lot": 0.01,
        "lot_step": 0.01,
        "default_lot": 0.01,
        "tick_size": 0.01,
        "description": "1.00 pt ($1 move) x 0.01 lot = $1.00 USD profit"
    },
    "NASDAQ": {
        "symbol": "NASDAQ",
        "name": "NASDAQ 100 Index",
        "category": "INDEX_CFD",
        "exchange": "US",
        "currency": "USD",
        "currency_symbol": "$",
        "contract_size": 1.0,
        "point_multiplier": 1.0,  # 1.0 lot * 1 pt = $1.00 USD (0.01 lot = $0.01)
        "min_lot": 0.01,
        "lot_step": 0.01,
        "default_lot": 0.10,
        "tick_size": 0.25,
        "description": "1.00 pt x 1.00 lot = $1.00 USD (0.01 lot = $0.01)"
    },
    "US30": {
        "symbol": "US30",
        "name": "Dow Jones 30 Index",
        "category": "INDEX_CFD",
        "exchange": "US",
        "currency": "USD",
        "currency_symbol": "$",
        "contract_size": 1.0,
        "point_multiplier": 1.0,
        "min_lot": 0.01,
        "lot_step": 0.01,
        "default_lot": 0.10,
        "tick_size": 1.0,
        "description": "1.00 pt x 1.00 lot = $1.00 USD"
    },
    "SPX500": {
        "symbol": "SPX500",
        "name": "S&P 500 Index",
        "category": "INDEX_CFD",
        "exchange": "US",
        "currency": "USD",
        "currency_symbol": "$",
        "contract_size": 1.0,
        "point_multiplier": 1.0,
        "min_lot": 0.01,
        "lot_step": 0.01,
        "default_lot": 0.10,
        "tick_size": 0.10,
        "description": "1.00 pt x 1.00 lot = $1.00 USD"
    },
    "GER40": {
        "symbol": "GER40",
        "name": "Germany 40 DAX",
        "category": "INDEX_CFD",
        "exchange": "EU",
        "currency": "EUR",
        "currency_symbol": "€",
        "contract_size": 1.0,
        "point_multiplier": 1.0,
        "min_lot": 0.01,
        "lot_step": 0.01,
        "default_lot": 0.10,
        "tick_size": 0.5,
        "description": "1.00 pt x 1.00 lot = €1.00 EUR"
    },
    "NIFTY50": {
        "symbol": "NIFTY50",
        "name": "NSE NIFTY 50 Index",
        "category": "INDEX_FUTURES",
        "exchange": "NSE",
        "currency": "INR",
        "currency_symbol": "₹",
        "contract_size": 25.0,  # 1 lot = 25 qty
        "point_multiplier": 25.0,  # 1 lot * 1 pt = ₹25.00 INR
        "min_lot": 1.0,
        "lot_step": 1.0,
        "default_lot": 1.0,
        "tick_size": 0.05,
        "description": "1.00 pt x 1 lot (25 qty) = ₹25.00 INR"
    },
    "BANKNIFTY": {
        "symbol": "BANKNIFTY",
        "name": "NSE Bank NIFTY Index",
        "category": "INDEX_FUTURES",
        "exchange": "NSE",
        "currency": "INR",
        "currency_symbol": "₹",
        "contract_size": 15.0,
        "point_multiplier": 15.0,  # 1 lot * 1 pt = ₹15.00 INR
        "min_lot": 1.0,
        "lot_step": 1.0,
        "default_lot": 1.0,
        "tick_size": 0.05,
        "description": "1.00 pt x 1 lot (15 qty) = ₹15.00 INR"
    },
    "SENSEX": {
        "symbol": "SENSEX",
        "name": "BSE SENSEX Index",
        "category": "INDEX_FUTURES",
        "exchange": "BSE",
        "currency": "INR",
        "currency_symbol": "₹",
        "contract_size": 10.0,
        "point_multiplier": 10.0,  # 1 lot * 1 pt = ₹10.00 INR
        "min_lot": 1.0,
        "lot_step": 1.0,
        "default_lot": 1.0,
        "tick_size": 0.05,
        "description": "1.00 pt x 1 lot (10 qty) = ₹10.00 INR"
    },
    "EURUSD": {
        "symbol": "EURUSD",
        "name": "Euro / US Dollar",
        "category": "FOREX",
        "exchange": "FOREX",
        "currency": "USD",
        "currency_symbol": "$",
        "contract_size": 100000.0,
        "point_multiplier": 10.0,
        "min_lot": 0.01,
        "lot_step": 0.01,
        "default_lot": 0.01,
        "tick_size": 0.00001,
        "description": "1 Pip (0.0001) x 0.01 lot = $0.10 USD"
    },
    "BTCUSD": {
        "symbol": "BTCUSD",
        "name": "Bitcoin / US Dollar",
        "category": "CRYPTO",
        "exchange": "CRYPTO",
        "currency": "USD",
        "currency_symbol": "$",
        "contract_size": 1.0,
        "point_multiplier": 1.0,
        "min_lot": 0.01,
        "lot_step": 0.01,
        "default_lot": 0.05,
        "tick_size": 0.5,
        "description": "1.00 pt ($1 move) x 1.00 lot = $1.00 USD"
    }
}

def get_instrument_spec(raw_symbol: str) -> Dict[str, Any]:
    if not raw_symbol:
        return INSTRUMENT_SPECS["XAUUSD"]
    clean = raw_symbol.upper().replace(" ", "").replace("-", "").replace("/", "").replace("^", "")

    if clean in INSTRUMENT_SPECS:
        return INSTRUMENT_SPECS[clean]

    if "GOLD" in clean or "XAU" in clean:
        return INSTRUMENT_SPECS["XAUUSD"]
    if "NAS" in clean or "NDX" in clean or "USTEC" in clean or "US100" in clean:
        return INSTRUMENT_SPECS["NASDAQ"]
    if "US30" in clean or "DOW" in clean or "DJI" in clean:
        return INSTRUMENT_SPECS["US30"]
    if "SPX" in clean or "US500" in clean or "SP500" in clean:
        return INSTRUMENT_SPECS["SPX500"]
    if "DAX" in clean or "GER40" in clean or "GERMANY" in clean:
        return INSTRUMENT_SPECS["GER40"]
    if "BANKNIFTY" in clean:
        return INSTRUMENT_SPECS["BANKNIFTY"]
    if "NIFTY" in clean:
        return INSTRUMENT_SPECS["NIFTY50"]
    if "SENSEX" in clean or "BSESN" in clean:
        return INSTRUMENT_SPECS["SENSEX"]
    if "EUR" in clean:
        return INSTRUMENT_SPECS["EURUSD"]
    if "BTC" in clean:
        return INSTRUMENT_SPECS["BTCUSD"]

    return {
        "symbol": clean,
        "name": f"{clean} Instrument",
        "category": "INDEX_CFD",
        "exchange": "GLOBAL",
        "currency": "USD",
        "currency_symbol": "$",
        "contract_size": 1.0,
        "point_multiplier": 1.0,
        "min_lot": 0.01,
        "lot_step": 0.01,
        "default_lot": 1.0,
        "tick_size": 0.01,
        "description": "1.00 pt x 1.00 lot = 1.0 unit"
    }

def calculate_trade_pnl(symbol: str, lots: float, points: float, fees: float = 0.0):
    spec = get_instrument_spec(symbol)
    multiplier = spec["point_multiplier"]
    contract_size = spec["contract_size"]
    contract_units = round(lots * contract_size, 4)
    gross_pnl = round(points * lots * multiplier, 2)
    net_pnl = round(gross_pnl - fees, 2)
    return gross_pnl, net_pnl, multiplier, contract_units
