import json
import os
import uuid
from datetime import datetime, timedelta
from typing import List, Optional
from app.models.trade import (
    Trade, TradeCreate, TradeUpdate, UserProfile, UserLoginRequest, UserUpdateRequest
)

DATA_FILE = os.path.join(os.path.dirname(__file__), "trades_db.json")
USERS_FILE = os.path.join(os.path.dirname(__file__), "users_db.json")

# Default 2 Traders
DEFAULT_USERS = [
    UserProfile(
        id="trader_1",
        name="Trader 1 (Alpha)",
        username="trader1",
        pin="1234",
        avatar="⚡",
        base_currency="₹",
        trading_style="Index Options & Momentum",
        primary_market="NIFTY / BANKNIFTY",
        account_capital=100000.0,
        created_at="2026-01-01 09:15:00"
    ),
    UserProfile(
        id="trader_2",
        name="Trader 2 (Pro)",
        username="trader2",
        pin="5678",
        avatar="🎯",
        base_currency="₹",
        trading_style="Price Action & Swing",
        primary_market="Equities & Futures",
        account_capital=150000.0,
        created_at="2026-01-01 09:15:00"
    )
]

def generate_sample_trades(user_id: str, prefix: str = "T1") -> List[Trade]:
    # Generate realistic historical trades across several months, quarters, and weeks
    # so weekly, monthly, quarterly, half-yearly, and annually views look alive immediately
    base_dates = [
        # Quarter 1 (Half 1)
        ("2026-01-12", "09:35", "NIFTY 24000 CE", "BUY", 50, 110.0, 155.0, 45.0, 2200.0, "WIN", "My Breakout Strategy"),
        ("2026-01-19", "11:20", "BANKNIFTY 51200 PE", "BUY", 30, 280.0, 240.0, -40.0, -1250.0, "LOSS", "Support Retest"),
        ("2026-02-04", "10:15", "FINNIFTY 23500 CE", "BUY", 65, 85.0, 135.0, 50.0, 3200.0, "WIN", "VWAP Bounce"),
        ("2026-02-20", "14:10", "NIFTY 24200 CE", "BUY", 50, 95.0, 140.0, 45.0, 2200.0, "WIN", "Closing Momentum"),
        ("2026-03-10", "10:00", "BANKNIFTY 52000 CE", "BUY", 30, 310.0, 420.0, 110.0, 3250.0, "WIN", "Morning Breakout"),
        ("2026-03-24", "13:30", "RELIANCE EQ", "BUY", 40, 2900.0, 2860.0, -40.0, -1650.0, "LOSS", "Trend Pullback"),
        # Quarter 2 (Half 1)
        ("2026-04-08", "09:40", "NIFTY 24500 CE", "BUY", 50, 120.0, 185.0, 65.0, 3200.0, "WIN", "My Breakout Strategy"),
        ("2026-05-14", "11:45", "BANKNIFTY 52500 PE", "BUY", 30, 250.0, 360.0, 110.0, 3250.0, "WIN", "Expiry Scalp"),
        ("2026-06-18", "10:30", "NIFTY 24800 CE", "BUY", 50, 130.0, 95.0, -35.0, -1800.0, "LOSS", "Opening Drive"),
        # Quarter 3 (Half 2)
        ("2026-07-09", "10:05", "BANKNIFTY 53000 CE", "BUY", 30, 340.0, 460.0, 120.0, 3550.0, "WIN", "My Breakout Strategy"),
        ("2026-08-12", "13:15", "FINNIFTY 24000 CE", "BUY", 65, 75.0, 125.0, 50.0, 3200.0, "WIN", "Support Retest"),
        ("2026-08-25", "14:20", "NIFTY 25000 PE", "BUY", 50, 140.0, 105.0, -35.0, -1800.0, "LOSS", "Reversal Trap"),
        ("2026-09-08", "09:35", "BANKNIFTY 53500 CE", "BUY", 30, 290.0, 410.0, 120.0, 3550.0, "WIN", "Morning Breakout"),
        ("2026-09-15", "11:10", "NIFTY 25200 CE", "BUY", 50, 115.0, 175.0, 60.0, 2950.0, "WIN", "VWAP Bounce"),
        ("2026-09-22", "10:45", "BANKNIFTY 53800 PE", "BUY", 30, 320.0, 260.0, -60.0, -1850.0, "LOSS", "Support Retest"),
        ("2026-09-28", "09:30", "NIFTY 25300 CE", "BUY", 50, 135.0, 195.0, 60.0, 2950.0, "WIN", "My Breakout Strategy"),
        ("2026-09-29", "09:45", "BANKNIFTY 54000 CE", "BUY", 30, 305.0, 440.0, 135.0, 4000.0, "WIN", "My Breakout Strategy"),
        ("2026-09-29", "13:20", "NIFTY 25400 PE", "BUY", 50, 90.0, 65.0, -25.0, -1300.0, "LOSS", "Scalp Quick")
    ]

    sample_trades = []
    for idx, (dt, tm, sym, act, qty, entry, exit_p, pts, pnl, stat, strat) in enumerate(base_dates):
        # Adjust slightly for trader 2 to give unique realistic performance
        if user_id == "trader_2":
            qty = qty * 1.5
            pnl = round(pnl * 1.4, 2)
            pts = round(pts * 1.1, 1)

        t = Trade(
            id=f"trade-{user_id}-{idx+1:03d}",
            user_id=user_id,
            date=dt,
            time=tm,
            symbol=sym,
            instrument_type="OPTIONS" if "CE" in sym or "PE" in sym else "EQUITY",
            action=act,
            quantity=qty,
            entry_price=entry,
            exit_price=exit_p,
            points=pts,
            net_pnl=pnl,
            pnl_percent=round((pts / entry) * 100, 2) if entry > 0 else 0.0,
            fees=50.0,
            status=stat,
            strategy=strat,
            notes="Trade executed according to rulebook strategy.",
            created_at=f"{dt} {tm}:00"
        )
        sample_trades.append(t)
    return sample_trades

class StorageManager:
    def __init__(self, data_file: str = DATA_FILE, users_file: str = USERS_FILE):
        self.data_file = data_file
        self.users_file = users_file
        self.trades: List[Trade] = []
        self.users: List[UserProfile] = []
        self._load_users()
        self._load_trades()

    def _load_users(self):
        if os.path.exists(self.users_file):
            try:
                with open(self.users_file, "r", encoding="utf-8") as f:
                    raw = json.load(f)
                    if isinstance(raw, list) and len(raw) > 0:
                        self.users = [UserProfile(**item) for item in raw]
                    else:
                        self.users = list(DEFAULT_USERS)
                        self._save_users()
            except Exception as e:
                print(f"Error loading users db, initializing defaults: {e}")
                self.users = list(DEFAULT_USERS)
                self._save_users()
        else:
            self.users = list(DEFAULT_USERS)
            self._save_users()

    def _save_users(self):
        raw_list = [u.model_dump() for u in self.users]
        with open(self.users_file, "w", encoding="utf-8") as f:
            json.dump(raw_list, f, indent=2)

    def _load_trades(self):
        if os.path.exists(self.data_file):
            try:
                with open(self.data_file, "r", encoding="utf-8") as f:
                    raw = json.load(f)
                    if isinstance(raw, list) and len(raw) > 0:
                        self.trades = [Trade(**item) for item in raw]
                    else:
                        self.trades = generate_sample_trades("trader_1") + generate_sample_trades("trader_2")
                        self._save_trades()
            except Exception as e:
                print(f"Error loading trades json, initializing starter trades: {e}")
                self.trades = generate_sample_trades("trader_1") + generate_sample_trades("trader_2")
                self._save_trades()
        else:
            self.trades = generate_sample_trades("trader_1") + generate_sample_trades("trader_2")
            self._save_trades()

    def _save_trades(self):
        raw_list = [t.model_dump() for t in self.trades]
        with open(self.data_file, "w", encoding="utf-8") as f:
            json.dump(raw_list, f, indent=2)

    # --- USER AUTH & PROFILE METHODS ---

    def get_users(self) -> List[UserProfile]:
        return self.users

    def get_user_by_id(self, user_id: str) -> Optional[UserProfile]:
        for u in self.users:
            if u.id == user_id:
                return u
        return None

    def get_user_by_username(self, username: str) -> Optional[UserProfile]:
        clean = username.strip().lower()
        for u in self.users:
            if u.username.lower() == clean or u.id.lower() == clean:
                return u
        return None

    def authenticate_user(self, req: UserLoginRequest) -> Optional[UserProfile]:
        user = self.get_user_by_username(req.username)
        if not user:
            return None
        # PIN / Password comparison
        if str(user.pin).strip() == str(req.pin).strip():
            return user
        return None

    def update_user(self, user_id: str, req: UserUpdateRequest) -> Optional[UserProfile]:
        user = self.get_user_by_id(user_id)
        if not user:
            return None

        update_data = req.model_dump(exclude_unset=True)
        for key, val in update_data.items():
            if val is not None:
                setattr(user, key, val)

        self._save_users()
        return user

    # --- TRADES CRUD METHODS ---

    def get_trades(self, user_id: Optional[str] = None) -> List[Trade]:
        if user_id:
            filtered = [t for t in self.trades if t.user_id == user_id]
        else:
            filtered = self.trades
        return sorted(filtered, key=lambda t: f"{t.date} {t.time}", reverse=True)

    def get_trade_by_id(self, trade_id: str) -> Optional[Trade]:
        for t in self.trades:
            if t.id == trade_id:
                return t
        return None

    def calculate_trade_fields(self, trade_in: TradeCreate | TradeUpdate, existing_trade: Optional[Trade] = None):
        action = (trade_in.action if trade_in.action is not None else (existing_trade.action if existing_trade else "BUY")).upper()
        entry = trade_in.entry_price if trade_in.entry_price is not None else (existing_trade.entry_price if existing_trade else 0.0)
        exit_p = trade_in.exit_price if trade_in.exit_price is not None else (existing_trade.exit_price if existing_trade else 0.0)
        qty = trade_in.quantity if trade_in.quantity is not None else (existing_trade.quantity if existing_trade else 1.0)
        fees = trade_in.fees if trade_in.fees is not None else (existing_trade.fees if existing_trade else 0.0)

        # Points calculation
        if trade_in.points is not None:
            pts = round(float(trade_in.points), 2)
        else:
            if action == "BUY":
                pts = round(exit_p - entry, 2)
            else:
                pts = round(entry - exit_p, 2)

        gross_pnl = pts * qty
        net_pnl = round(gross_pnl - fees, 2)
        pnl_pct = round((pts / entry) * 100, 2) if entry > 0 else 0.0

        if net_pnl > 0.05:
            status = "WIN"
        elif net_pnl < -0.05:
            status = "LOSS"
        else:
            status = "BREAKEVEN"

        return pts, net_pnl, pnl_pct, status

    def create_trade(self, trade_in: TradeCreate) -> Trade:
        pts, net_pnl, pnl_pct, status = self.calculate_trade_fields(trade_in)
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        trade = Trade(
            id=f"trade-{uuid.uuid4().hex[:8]}",
            **trade_in.model_dump(),
            points=pts,
            net_pnl=net_pnl,
            pnl_percent=pnl_pct,
            status=status,
            created_at=now_str
        )
        self.trades.append(trade)
        self._save_trades()
        return trade

    def update_trade(self, trade_id: str, trade_update: TradeUpdate) -> Optional[Trade]:
        trade = self.get_trade_by_id(trade_id)
        if not trade:
            return None

        update_data = trade_update.model_dump(exclude_unset=True)
        for key, val in update_data.items():
            setattr(trade, key, val)

        pts, net_pnl, pnl_pct, status = self.calculate_trade_fields(trade_update, existing_trade=trade)
        trade.points = pts
        trade.net_pnl = net_pnl
        trade.pnl_percent = pnl_pct
        trade.status = status

        self._save_trades()
        return trade

    def delete_trade(self, trade_id: str) -> bool:
        initial_count = len(self.trades)
        self.trades = [t for t in self.trades if t.id != trade_id]
        if len(self.trades) < initial_count:
            self._save_trades()
            return True
        return False

    def clear_user_trades(self, user_id: str) -> List[Trade]:
        self.trades = [t for t in self.trades if t.user_id != user_id]
        self._save_trades()
        return []

db = StorageManager()
