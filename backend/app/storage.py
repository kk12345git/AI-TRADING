import json
import os
import uuid
from datetime import datetime, timedelta
from typing import List, Optional
from app.models.trade import Trade, TradeCreate, TradeUpdate

DATA_FILE = os.path.join(os.path.dirname(__file__), "trades_db.json")

def generate_sample_trades() -> List[dict]:
    """Generates sample trades for demo reset if requested by user."""
    sample_trades = []
    base_date = datetime.now() - timedelta(days=60)
    
    symbols_market = [
        ("NIFTY50", "Stocks", 22000.0, 50.0),
        ("BANKNIFTY", "Options", 47500.0, 25.0),
        ("AAPL", "Stocks", 185.0, 100.0),
        ("BTC/USD", "Crypto", 62000.0, 0.5),
        ("EUR/USD", "Forex", 1.0850, 10000.0)
    ]

    setups = ["Breakout", "SMC Order Block", "Trend Following", "Scalp", "VWAP Reversion"]
    mistakes = ["None - Followed Plan", "FOMO", "Over-leveraged", "Moved Stop Loss", "Early Exit"]
    
    for i in range(10):
        curr_date = base_date + timedelta(days=i * 5)
        symbol, asset, base_price, qty = symbols_market[i % len(symbols_market)]
        
        action = "BUY" if i % 2 == 0 else "SELL"
        entry = round(base_price, 2)
        mult = 1.03 if i % 3 != 0 else 0.97
        
        exit_price = round(entry * mult, 2) if action == "BUY" else round(entry * (2 - mult), 2)
        fees = 15.0
        gross_pnl = (exit_price - entry) * qty if action == "BUY" else (entry - exit_price) * qty
        net_pnl = round(gross_pnl - fees, 2)
        pnl_pct = round((net_pnl / (entry * qty)) * 100, 2) if (entry * qty) > 0 else 0.0

        status = "WIN" if net_pnl > 0 else "LOSS"

        trade_dict = {
            "id": f"trade-{uuid.uuid4().hex[:8]}",
            "date": curr_date.strftime("%Y-%m-%d"),
            "time": "09:30",
            "symbol": symbol,
            "asset_class": asset,
            "action": action,
            "quantity": qty,
            "entry_price": entry,
            "exit_price": exit_price,
            "stop_loss": round(entry * 0.98, 2),
            "take_profit": round(entry * 1.04, 2),
            "fees": fees,
            "net_pnl": net_pnl,
            "pnl_percent": pnl_pct,
            "r_multiple": 2.0 if status == "WIN" else -1.0,
            "status": status,
            "setup_tag": setups[i % len(setups)],
            "mistake_tag": mistakes[i % len(mistakes)],
            "emotion_rating": 4,
            "notes": "Sample trade entry.",
            "created_at": curr_date.strftime("%Y-%m-%d %H:%M:%S")
        }
        sample_trades.append(trade_dict)
        
    return sample_trades

class StorageManager:
    def __init__(self, data_file: str = DATA_FILE):
        self.data_file = data_file
        self.trades: List[Trade] = []
        self._load()

    def _load(self):
        if os.path.exists(self.data_file):
            try:
                with open(self.data_file, "r", encoding="utf-8") as f:
                    raw = json.load(f)
                    self.trades = [Trade(**item) for item in raw]
            except Exception as e:
                print(f"Error loading trades json: {e}")
                self.trades = []
                self.save()
        else:
            # Clean slate: empty list
            self.trades = []
            self.save()

    def _save_raw(self, raw_list: list):
        with open(self.data_file, "w", encoding="utf-8") as f:
            json.dump(raw_list, f, indent=2)

    def save(self):
        raw_list = [t.model_dump() for t in self.trades]
        self._save_raw(raw_list)

    def get_all_trades(self) -> List[Trade]:
        return sorted(self.trades, key=lambda t: f"{t.date} {t.time}", reverse=True)

    def get_trade_by_id(self, trade_id: str) -> Optional[Trade]:
        for t in self.trades:
            if t.id == trade_id:
                return t
        return None

    def create_trade(self, trade_in: TradeCreate) -> Trade:
        qty = trade_in.quantity
        entry = trade_in.entry_price
        exit_p = trade_in.exit_price
        action = trade_in.action.upper()
        fees = trade_in.fees

        if action == "BUY":
            gross_pnl = (exit_p - entry) * qty
        else:
            gross_pnl = (entry - exit_p) * qty

        net_pnl = round(gross_pnl - fees, 2)
        pnl_pct = round((net_pnl / (entry * qty)) * 100, 2) if (entry * qty) > 0 else 0.0

        risk = abs(entry - trade_in.stop_loss) * qty if trade_in.stop_loss else (entry * qty * 0.01)
        r_mult = round(net_pnl / risk, 2) if risk > 0 else 0.0

        if net_pnl > 0.5:
            status = "WIN"
        elif net_pnl < -0.5:
            status = "LOSS"
        else:
            status = "BREAKEVEN"

        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        trade = Trade(
            id=f"trade-{uuid.uuid4().hex[:8]}",
            **trade_in.model_dump(),
            net_pnl=net_pnl,
            pnl_percent=pnl_pct,
            r_multiple=r_mult,
            status=status,
            created_at=now_str
        )
        self.trades.append(trade)
        self.save()
        return trade

    def update_trade(self, trade_id: str, trade_update: TradeUpdate) -> Optional[Trade]:
        trade = self.get_trade_by_id(trade_id)
        if not trade:
            return None

        update_data = trade_update.model_dump(exclude_unset=True)
        for key, val in update_data.items():
            setattr(trade, key, val)

        qty = trade.quantity
        entry = trade.entry_price
        exit_p = trade.exit_price
        action = trade.action.upper()
        fees = trade.fees

        if action == "BUY":
            gross_pnl = (exit_p - entry) * qty
        else:
            gross_pnl = (entry - exit_p) * qty

        trade.net_pnl = round(gross_pnl - fees, 2)
        trade.pnl_percent = round((trade.net_pnl / (entry * qty)) * 100, 2) if (entry * qty) > 0 else 0.0

        risk = abs(entry - trade.stop_loss) * qty if trade.stop_loss else (entry * qty * 0.01)
        trade.r_multiple = round(trade.net_pnl / risk, 2) if risk > 0 else 0.0

        if trade.net_pnl > 0.5:
            trade.status = "WIN"
        elif trade.net_pnl < -0.5:
            trade.status = "LOSS"
        else:
            trade.status = "BREAKEVEN"

        self.save()
        return trade

    def delete_trade(self, trade_id: str) -> bool:
        initial_count = len(self.trades)
        self.trades = [t for t in self.trades if t.id != trade_id]
        if len(self.trades) < initial_count:
            self.save()
            return True
        return False

    def clear_all_trades(self) -> List[Trade]:
        self.trades = []
        self.save()
        return []

    def reset_demo_data(self) -> List[Trade]:
        sample_data = generate_sample_trades()
        self.trades = [Trade(**item) for item in sample_data]
        self._save_raw(sample_data)
        return self.get_all_trades()

db = StorageManager()
