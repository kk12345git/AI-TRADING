import json
import os
import uuid
from datetime import datetime
from typing import List, Optional
from app.models.trade import Trade, TradeCreate, TradeUpdate, UserProfile, UserOnboardRequest, UserUpdateRequest

DATA_FILE = os.path.join(os.path.dirname(__file__), "trades_db.json")
USERS_FILE = os.path.join(os.path.dirname(__file__), "users_db.json")

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
                    self.users = [UserProfile(**item) for item in raw]
            except Exception as e:
                print(f"Error loading users db: {e}")
                self.users = []
                self._save_users()
        else:
            self.users = []
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
                    self.trades = [Trade(**item) for item in raw]
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

    # --- USER PROFILE & ONBOARDING METHODS ---

    def get_users(self) -> List[UserProfile]:
        return self.users

    def get_user_by_id(self, user_id: str) -> Optional[UserProfile]:
        for u in self.users:
            if u.id == user_id:
                return u
        return None

    def get_user_by_email(self, email: str) -> Optional[UserProfile]:
        email_clean = email.strip().lower()
        for u in self.users:
            if u.email.lower() == email_clean:
                return u
        return None

    def onboard_user(self, req: UserOnboardRequest) -> UserProfile:
        existing = self.get_user_by_email(req.email)
        if existing:
            # Update existing profile
            existing.name = req.name
            existing.avatar = req.avatar
            existing.base_currency = req.base_currency
            existing.trading_style = req.trading_style
            existing.primary_market = req.primary_market
            existing.account_capital = req.account_capital
            existing.risk_per_trade_pct = req.risk_per_trade_pct
            existing.trading_goals = req.trading_goals
            self._save_users()
            return existing

        # Create new trader profile
        new_id = f"trader_{uuid.uuid4().hex[:6]}"
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        user = UserProfile(
            id=new_id,
            name=req.name.strip(),
            email=req.email.strip().lower(),
            avatar=req.avatar,
            base_currency=req.base_currency,
            trading_style=req.trading_style,
            primary_market=req.primary_market,
            account_capital=req.account_capital,
            risk_per_trade_pct=req.risk_per_trade_pct,
            trading_goals=req.trading_goals,
            created_at=now_str
        )
        self.users.append(user)
        self._save_users()
        return user

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

    def clear_all_data(self):
        self.users = []
        self.trades = []
        self._save_users()
        self._save_trades()

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
        self._save_trades()
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
