# ⚡ AI Trading Platform (NSE & BSE)

An advanced institutional-grade AI Trading Platform for Indian markets (NSE & BSE) featuring real-time signal processing, Volume Profile, Fair Value Gaps (FVG), MACD Divergence, Auto-Fibonacci Retracements, Option Chain PCR Heatmaps, Backtesting, Bar Replay, and multi-broker support (Zerodha Kite, Dhan, Fyers, AngelOne).

---

## 🛠️ Project Architecture

- **Frontend**: Next.js 14, React, Tailwind CSS, Lucide Icons, HTML5 Canvas.
- **Backend**: FastAPI, Pydantic, NumPy, Pandas, Uvicorn, Python.
- **AI Engine**: Google Gemini API integration with fallback to deterministic strategy rules.
- **Brokers Supported**: Zerodha Kite, Dhan HQ, Fyers v3, AngelOne SmartAPI, Mock Live Feed.

---

## 🚀 Local Development Setup

### 1. Backend (FastAPI)
```bash
cd backend
python -m venv venv
venv\Scripts\activate # On Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deploy to Vercel

1. Push code to your GitHub Repository: `https://github.com/kk12345git/AI-TRADING.git`
2. Go to [Vercel Dashboard](https://vercel.com/new).
3. Import `AI-TRADING` repository.
4. Set Root Directory or keep default (the `vercel.json` automatically handles Next.js frontend & FastAPI serverless functions).
5. Add optional Environment Variables:
   - `GEMINI_API_KEY`: Your Google Gemini API Key
   - `OPENAI_API_KEY`: Optional OpenAI API Key
6. Click **Deploy**.
