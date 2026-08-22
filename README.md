# ⚡ TradeMatrix AI - Portfolio Manager & Journal Co-pilot

TradeMatrix AI is a state-of-the-art **AI Trading Portfolio & Journal Manager** designed to simplify daily trade tracking, multi-timeframe analytics (Daily, Weekly, Monthly, Yearly), trade mistake elimination, quantitative strategy backtesting, and AI-powered trading assistance.

---

## 🌟 Key Features

1. **Daily Trade Logger & Journal**:
   - Log trades across **Stocks, Options, Crypto, Forex, and Futures**.
   - Auto-calculates Net P&L, Return %, Risk-to-Reward (R:R) achieved, and Win/Loss status.
   - Tag strategy setups (*SMC Order Block, Breakout, VWAP Reversion, Scalp*) and mistake/emotion tags (*FOMO, Over-leveraged, Moved Stop Loss, Revenge Trade*).
   - Filter, sort, search, and export trade log to CSV.

2. **Multi-Timeframe Performance Analytics**:
   - Aggregate performance by **Daily, Weekly, Monthly, Yearly, and All-Time**.
   - Recharts visual Equity Curve, P&L period distribution, and Mistake Cost Impact breakdown.
   - Key KPI Cards: Net P&L, Win Rate %, Profit Factor, Max Drawdown, Expectancy.

3. **AI Trade Mistake Diagnostics**:
   - Assigns an overall **Execution Health Score (0-100)** to your trading performance.
   - Identifies primary loss drivers and prescribes actionable rules to eliminate bad trading habits.

4. **AI Quantitative Strategy Engine**:
   - Library of institutional strategies (*SMC Order Block & Liquidity Sweep, VWAP Reversion, ORB Breakout*).
   - Interactive simulator to backtest strategies and custom R:R parameters against your logged trades.

5. **AI Trading Assistant Chatbot**:
   - Answers advanced trading questions regarding **Smart Money Concepts (SMC)**, **Order Blocks**, **Option Greeks (Delta, Theta, Vega, IV)**, **Valuation**, and **Position Sizing (Kelly Criterion, 1% Risk Rule)**.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, TailwindCSS, Recharts, Lucide Icons.
- **Backend**: FastAPI, Pydantic V2, NumPy, Pandas, Uvicorn, Python.
- **Persistence**: JSON / SQLite local database storage with pre-loaded demo trades.

---

## 🚀 Local Setup

### 1. Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

### 2. Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
