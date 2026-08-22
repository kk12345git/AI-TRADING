import json
import os
import uuid
from datetime import datetime, timedelta
from typing import List, Optional
from app.models.trade import Trade, TradeCreate, TradeUpdate

DATA_FILE = os.path.join(os.path.dirname(__file__), "trades_db.json")

def generate_sample_trades() -> List[dict]:
    """Generates 30 realistic demo trades spanning the past 6 months to showcase daily, weekly, monthly, yearly analytics."""
    sample_trades = []
    base_date = datetime.now() - timedelta(days=120)
    
    symbols_market = [
        ("NIFTY50", "Stocks", 22000.0, 50.0),
        ("BANKNIFTY", "Options", 47500.0, 25.0),
        ("AAPL", "Stocks", 185.0, 100.0),
        ("BTC/USD", "Crypto", 62000.0, 0.5),
        ("EUR/USD", "Forex", 1.0850, 10000.0),
        ("TSLA", "Stocks", 210.0, 50.0),
        ("NVDA", "Stocks", 120.0, 30.0),
    ]

    setups = ["Breakout", "SMC Order Block", "Trend Following", "Scalp", "VWAP Reversion", "Supply/Demand"]
    mistakes = ["None - Followed Plan", "FOMO", "Over-leveraged", "Moved Stop Loss", "Chased Entry", "Greed", "Revenge Trade", "Early Exit"]
    
    # Pre-crafted scenarios to give realistic win rate (~60%) and clear mistake patterns
    scenarios = [
        {"action": "BUY", "mult": 1.03, "setup": "SMC Order Block", "mistake": "None - Followed Plan", "notes": "Clean order block tap on 15m timeframe with liquidity sweep."},
        {"action": "BUY", "mult": 1.045, "setup": "Breakout", "mistake": "None - Followed Plan", "notes": "Daily resistance breakout with high volume confirmation."},
        {"action": "SELL", "mult": 0.96, "setup": "VWAP Reversion", "mistake": "None - Followed Plan", "notes": "Overextended price returning to daily VWAP."},
        {"action": "BUY", "mult": 0.982, "setup": "Scalp", "mistake": "FOMO", "notes": "Entered late after green candle spike. Chased entry."},
        {"action": "BUY", "mult": 0.975, "setup": "Breakout", "mistake": "Moved Stop Loss", "notes": "Price reversed, widened stop loss instead of taking small loss."},
        {"action": "BUY", "mult": 1.025, "setup": "Supply/Demand", "mistake": "None - Followed Plan", "notes": "Bounced off 4H demand zone cleanly."},
        {"action": "SELL", "mult": 0.98, "setup": "Trend Following", "mistake": "Early Exit", "notes": "Panic exited at breakeven before target hit."},
        {"action": "BUY", "mult": 0.965, "setup": "Scalp", "mistake": "Revenge Trade", "notes": "Traded right after a losing trade trying to make money back."},
        {"action": "BUY", "mult": 1.05, "setup": "SMC Order Block", "mistake": "None - Followed Plan", "notes": "Fair value gap fill + bullish breaker block."},
        {"action": "SELL", "mult": 0.97, "setup": "Breakout", "mistake": "Over-leveraged", "notes": "Position size was 3x risk limit. Drawdown hit hard."},
    ]

    for i in range(35):
        curr_date = base_date + timedelta(days=i * 3 + (i % 2))
        symbol, asset, base_price, qty = symbols_market[i % len(symbols_market)]
        scen = scenarios[i % len(scenarios)]
        
        action = scen["action"]
        entry = round(base_price * (1 + (i % 5 - 2) * 0.005), 2)
        
        if action == "BUY":
            exit_price = round(entry * scen["mult"], 2)
            sl = round(entry * 0.985, 2)
            tp = round(entry * 1.035, 2)
            gross_pnl = (exit_price - entry) * qty
        else:
            exit_price = round(entry * (2 - scen["mult"]), 2)
            sl = round(entry * 1.015, 2)
            tp = round(entry * 0.965, 2)
            gross_pnl = (entry - exit_price) * qty
            
        fees = round(abs(gross_pnl) * 0.002 + 2.0, 2)
        net_pnl = round(gross_pnl - fees, 2)
        pnl_pct = round((net_pnl / (entry * qty)) * 100, 2)
        
        risk = abs(entry - sl) * qty if sl else (entry * qty * 0.01)
        r_mult = round(net_pnl / risk, 2) if risk > 0 else 0.0

        if net_pnl > 1.0:
            status = "WIN"
        elif net_pnl < -1.0:
            status = "LOSS"
        else:
            status = "BREAKEVEN"

        trade_dict = {
            "id": f"trade-{uuid.uuid4().hex[:8]}",
            "date": curr_date.strftime("%Y-%m-%d"),
            "time": f"{9 + (i % 6):02d}:{(i * 15) % 60:02d}",
            "symbol": symbol,
            "asset_class": asset,
            "action": action,
            "quantity": qty,
            "entry_price": entry,
            "exit_price": exit_price,
            "stop_loss": sl,
            "take_profit": tp,
            "fees": fees,
            "net_pnl": net_pnl,
            "pnl_percent": pnl_pct,
            "r_multiple": r_mult,
            "status": status,
            "setup_tag": scen["setup"],
            "mistake_tag": scen["mistake"],
            "emotion_rating": 5 if status == "WIN" else (2 if scen["mistake"] != "None - Followed Plan" else 3),
            "notes": scen["notes"],
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
        if not os.path.exists(self.data_file):
            sample_data = generate_sample_trades()
            self._save_raw(sample_data)
            
        try:
            with open(self.data_file, "r", encoding="utf-8") as f:
                raw = json.load(f)
                self.trades = [Trade(**item) for item in raw]
        except Exception as e:
            print(f"Error loading trades json: {e}")
            sample_data = generate_sample_trades()
            self.trades = [Trade(**item) for item in sample_data]
            self._save_raw(sample_data)

    def _save_raw(self, raw_list: list):
        with open(self.data_file, "w", encoding="utf-8") as f:
            json.dump(raw_list, f, indent=2)

    def save(self):
        raw_list = [t.model_dump() for t in self.trades]
        self._save_raw(raw_list)

    def get_all_trades(self) -> List[Trade]:
        # Return sorted by date/time descending
        return sorted(self.trades, key=lambda t: f"{t.date} {t.time}", reverse=True)

    def get_trade_by_id(self, trade_id: str) -> Optional[Trade]:
        for t in self.trades:
            if t.id == trade_id:
                return t
        return None

    def create_trade(self, trade_in: TradeCreate) -> Trade:
        # Calculate P&L, r_multiple, status
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

        # Recalculate P&L fields
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

    def reset_demo_data(self) -> List[Trade]:
        sample_data = generate_sample_trades()
        self.trades = [Trade(**item) for item in sample_data]
        self._save_raw(sample_data)
        return self.get_all_trades()

db = StorageManager()
