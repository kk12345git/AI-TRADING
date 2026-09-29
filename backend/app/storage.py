import json
import os
import uuid
from datetime import datetime
from typing import List, Optional
from app.models.trade import (
    Trade, TradeCreate, TradeUpdate, UserProfile, UserLoginRequest, UserUpdateRequest
)
from app.engine.instruments import calculate_trade_pnl, get_instrument_spec

DATA_FILE = os.path.join(os.path.dirname(__file__), "trades_db.json")
USERS_FILE = os.path.join(os.path.dirname(__file__), "users_db.json")

# Dedicated 2 Live Traders: Rakesh (Code: 2580) & Karthi (Code: 3790) with 0 initial capital
DEFAULT_USERS = [
    UserProfile(
        id="rakesh",
        name="Rakesh",
        username="rakesh",
        pin="2580",
        avatar="⚡",
        base_currency="₹",
        trading_style="Price Action & Momentum",
        primary_market="XAUUSD, NASDAQ, NIFTY50, SENSEX",
        account_capital=0.0,
        created_at="2026-01-01 09:15:00"
    ),
    UserProfile(
        id="karthi",
        name="Karthi",
        username="karthi",
        pin="3790",
        avatar="🎯",
        base_currency="₹",
        trading_style="Strategy & Breakout",
        primary_market="XAUUSD, NASDAQ, NIFTY50, SENSEX",
        account_capital=0.0,
        created_at="2026-01-01 09:15:00"
    )
]

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
                        usernames = [u.get("username", "") for u in raw]
                        if "rakesh" in usernames or "karthi" in usernames:
                            self.users = [UserProfile(**item) for item in raw]
                        else:
                            self.users = list(DEFAULT_USERS)
                            self._save_users()
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
                    if isinstance(raw, list):
                        self.trades = [Trade(**item) for item in raw]
                    else:
                        self.trades = []
                        self._save_trades()
            except Exception as e:
                print(f"Error loading trades json: {e}")
                self.trades = []
                self._save_trades()
        else:
            self.trades = []
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
        # Secret code verification
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
        symbol = trade_in.symbol if trade_in.symbol is not None else (existing_trade.symbol if existing_trade else "XAUUSD")
        action = (trade_in.action if trade_in.action is not None else (existing_trade.action if existing_trade else "BUY")).upper()
        entry = trade_in.entry_price if trade_in.entry_price is not None else (existing_trade.entry_price if existing_trade else 0.0)
        exit_p = trade_in.exit_price if trade_in.exit_price is not None else (existing_trade.exit_price if existing_trade else 0.0)
        # Use lots if supplied, else quantity
        lots = trade_in.lots if getattr(trade_in, 'lots', None) is not None else (
            trade_in.quantity if trade_in.quantity is not None else (
                existing_trade.lots if existing_trade and existing_trade.lots is not None else (
                    existing_trade.quantity if existing_trade else 1.0
                )
            )
        )
        fees = trade_in.fees if trade_in.fees is not None else (existing_trade.fees if existing_trade else 0.0)

        # Points calculation
        if trade_in.points is not None:
            pts = round(float(trade_in.points), 2)
        else:
            if action == "BUY":
                pts = round(exit_p - entry, 2)
            else:
                pts = round(entry - exit_p, 2)

        # Exact real-world contract & lot sizing calculation
        gross_pnl, net_pnl, multiplier, contract_units = calculate_trade_pnl(symbol, lots, pts, fees)
        pnl_pct = round((pts / entry) * 100, 2) if entry > 0 else 0.0

        if net_pnl > 0.05:
            status = "WIN"
        elif net_pnl < -0.05:
            status = "LOSS"
        else:
            status = "BREAKEVEN"

        return pts, net_pnl, pnl_pct, status, multiplier, contract_units, lots

    def create_trade(self, trade_in: TradeCreate) -> Trade:
        pts, net_pnl, pnl_pct, status, multiplier, contract_units, lots = self.calculate_trade_fields(trade_in)
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        trade_dict = trade_in.model_dump()
        trade_dict["quantity"] = lots
        trade_dict["lots"] = lots
        trade_dict["point_multiplier"] = multiplier
        trade_dict["contract_units"] = contract_units
        trade_dict["points"] = pts
        trade_dict["net_pnl"] = net_pnl
        trade_dict["pnl_percent"] = pnl_pct
        trade_dict["status"] = status

        trade = Trade(
            id=f"trade-{uuid.uuid4().hex[:8]}",
            **trade_dict,
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

        pts, net_pnl, pnl_pct, status, multiplier, contract_units, lots = self.calculate_trade_fields(trade_update, existing_trade=trade)
        trade.points = pts
        trade.net_pnl = net_pnl
        trade.pnl_percent = pnl_pct
        trade.status = status
        trade.lots = lots
        trade.quantity = lots
        trade.point_multiplier = multiplier
        trade.contract_units = contract_units

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
