import {
  Instrument, TickData, Candle, OptionChainData, FullSignalPayload,
  ReplayState, BacktestResult, JournalEntry
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

export const api = {
  async searchInstruments(query: string = '', exchange: string = 'ALL'): Promise<Instrument[]> {
    const res = await fetch(`${API_BASE_URL}/market/instruments?query=${encodeURIComponent(query)}&exchange=${exchange}`);
    return res.json();
  },

  async getQuote(symbol: string, exchange: string = 'NSE'): Promise<TickData> {
    const res = await fetch(`${API_BASE_URL}/market/quote?symbol=${encodeURIComponent(symbol)}&exchange=${exchange}`);
    return res.json();
  },

  async getCandles(symbol: string, exchange: string = 'NSE', timeframe: string = '5m', count: number = 200): Promise<Candle[]> {
    const res = await fetch(`${API_BASE_URL}/market/candles?symbol=${encodeURIComponent(symbol)}&exchange=${exchange}&timeframe=${timeframe}&count=${count}`);
    return res.json();
  },

  async getOptionChain(symbol: string, exchange: string = 'NSE', expiry?: string): Promise<OptionChainData> {
    const url = expiry
      ? `${API_BASE_URL}/market/option-chain?symbol=${encodeURIComponent(symbol)}&exchange=${exchange}&expiry=${encodeURIComponent(expiry)}`
      : `${API_BASE_URL}/market/option-chain?symbol=${encodeURIComponent(symbol)}&exchange=${exchange}`;
    const res = await fetch(url);
    return res.json();
  },

  async getSignal(symbol: string, exchange: string = 'NSE', timeframe: string = '5m'): Promise<FullSignalPayload> {
    const res = await fetch(`${API_BASE_URL}/indicator/signal?symbol=${encodeURIComponent(symbol)}&exchange=${exchange}&timeframe=${timeframe}`);
    return res.json();
  },

  async stepReplay(symbol: string, timeframe: string = '5m', step: number = 40): Promise<ReplayState> {
    const res = await fetch(`${API_BASE_URL}/replay/step?symbol=${encodeURIComponent(symbol)}&timeframe=${timeframe}&step=${step}`);
    return res.json();
  },

  async runBacktest(symbol: string, exchange: string = 'NSE', timeframe: string = '5m'): Promise<BacktestResult> {
    const res = await fetch(`${API_BASE_URL}/backtest/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        symbol,
        exchange,
        timeframe,
        start_date: '2026-01-01',
        end_date: '2026-08-19',
        initial_capital: 100000.0,
        slippage_pct: 0.05,
        brokerage_per_trade: 20.0
      })
    });
    return res.json();
  },

  async getJournal(): Promise<JournalEntry[]> {
    const res = await fetch(`${API_BASE_URL}/journal`);
    return res.json();
  },

  async addJournalEntry(entry: Partial<JournalEntry>): Promise<JournalEntry> {
    const res = await fetch(`${API_BASE_URL}/journal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    });
    return res.json();
  },

  async getBrokerStatus(): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/broker/status`);
    return res.json();
  },

  async switchBroker(brokerKey: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/broker/switch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ broker_key: brokerKey })
    });
    return res.json();
  }
};

