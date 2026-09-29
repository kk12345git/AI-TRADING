export interface InstrumentSpec {
  symbol: string;
  name: string;
  category: "COMMODITY" | "INDEX_CFD" | "INDEX_FUTURES" | "FOREX" | "CRYPTO";
  exchange: string;
  currency: string;
  currencySymbol: string;
  contractSize: number; // e.g. 100 oz for Gold, 1 for NASDAQ CFD, 25 for Nifty
  pointMultiplier: number; // Formula: Profit = Points * Lots * pointMultiplier
  minLot: number;
  lotStep: number;
  defaultLot: number;
  tickSize: number;
  pointName: "points" | "pips" | "dollars";
  quickLots: number[];
  formulaDescription: string;
  exampleText: string;
}

export const INSTRUMENT_SPECS: Record<string, InstrumentSpec> = {
  XAUUSD: {
    symbol: "XAUUSD",
    name: "Gold / US Dollar Spot",
    category: "COMMODITY",
    exchange: "FOREX / COMMODITY",
    currency: "USD",
    currencySymbol: "$",
    contractSize: 100, // 100 troy ounces per 1 standard lot
    pointMultiplier: 100, // 0.01 lot * 1 pt * 100 = $1.00 USD
    minLot: 0.01,
    lotStep: 0.01,
    defaultLot: 0.01,
    tickSize: 0.01,
    pointName: "dollars",
    quickLots: [0.01, 0.02, 0.05, 0.10, 0.25, 0.50, 1.00, 2.00],
    formulaDescription: "1.00 Point ($1 move in Gold price) × 0.01 Lot = $1.00 USD",
    exampleText: "0.01 Lot = 1 troy oz. If gold moves $2,650 → $2,651 (+1 pt), profit is exactly $1.00."
  },
  NASDAQ: {
    symbol: "NASDAQ",
    name: "NASDAQ 100 Index (NAS100 / US100)",
    category: "INDEX_CFD",
    exchange: "US INDICES",
    currency: "USD",
    currencySymbol: "$",
    contractSize: 1, // 1 index contract per standard CFD lot
    pointMultiplier: 1.0, // 1.00 lot * 1 pt = $1.00 USD; 0.01 lot * 1 pt = $0.01
    minLot: 0.01,
    lotStep: 0.01,
    defaultLot: 0.10,
    tickSize: 0.25,
    pointName: "points",
    quickLots: [0.01, 0.05, 0.10, 0.25, 0.50, 1.00, 2.00, 5.00],
    formulaDescription: "1.00 Point move × 1.00 Lot = $1.00 USD (0.01 Lot = $0.01 / pt)",
    exampleText: "1.00 Lot = 1 index unit. If NAS100 rises 50 points, 1.00 lot makes $50.00; 0.10 lot makes $5.00."
  },
  US30: {
    symbol: "US30",
    name: "Dow Jones Industrial Average (DJ30 / Wall Street)",
    category: "INDEX_CFD",
    exchange: "US INDICES",
    currency: "USD",
    currencySymbol: "$",
    contractSize: 1,
    pointMultiplier: 1.0,
    minLot: 0.01,
    lotStep: 0.01,
    defaultLot: 0.10,
    tickSize: 1.0,
    pointName: "points",
    quickLots: [0.01, 0.05, 0.10, 0.25, 0.50, 1.00, 2.00, 5.00],
    formulaDescription: "1.00 Point move × 1.00 Lot = $1.00 USD (0.01 Lot = $0.01 / pt)",
    exampleText: "1.00 Lot = 1 index unit. If US30 rallies 100 points, 1.00 lot earns $100.00; 0.10 lot earns $10.00."
  },
  SPX500: {
    symbol: "SPX500",
    name: "S&P 500 Index (US500)",
    category: "INDEX_CFD",
    exchange: "US INDICES",
    currency: "USD",
    currencySymbol: "$",
    contractSize: 1,
    pointMultiplier: 1.0,
    minLot: 0.01,
    lotStep: 0.01,
    defaultLot: 0.10,
    tickSize: 0.10,
    pointName: "points",
    quickLots: [0.01, 0.05, 0.10, 0.25, 0.50, 1.00, 2.00, 5.00],
    formulaDescription: "1.00 Point move × 1.00 Lot = $1.00 USD",
    exampleText: "1.00 Lot = 1 index unit. If SPX moves from 5,750 to 5,760 (+10 pts), profit is $10.00."
  },
  GER40: {
    symbol: "GER40",
    name: "Germany 40 Index (DAX 40)",
    category: "INDEX_CFD",
    exchange: "EU INDICES",
    currency: "EUR",
    currencySymbol: "€",
    contractSize: 1,
    pointMultiplier: 1.0,
    minLot: 0.01,
    lotStep: 0.01,
    defaultLot: 0.10,
    tickSize: 0.5,
    pointName: "points",
    quickLots: [0.01, 0.05, 0.10, 0.25, 0.50, 1.00, 2.00, 5.00],
    formulaDescription: "1.00 Point move × 1.00 Lot = €1.00 EUR",
    exampleText: "1.00 Lot = 1 index unit. If DAX moves 25 points, profit is €25.00."
  },
  NIFTY50: {
    symbol: "NIFTY50",
    name: "NSE NIFTY 50 Index (Futures & Options)",
    category: "INDEX_FUTURES",
    exchange: "NSE INDIA",
    currency: "INR",
    currencySymbol: "₹",
    contractSize: 25, // NSE standard lot size is 25 quantity
    pointMultiplier: 25.0, // 1 lot * 1 pt = ₹25.00 INR
    minLot: 1,
    lotStep: 1,
    defaultLot: 1,
    tickSize: 0.05,
    pointName: "points",
    quickLots: [1, 2, 3, 4, 5, 8, 10], // 1 lot = 25 qty, 2 lots = 50 qty, 4 lots = 100 qty
    formulaDescription: "1.00 Point move × 1 Lot (25 qty) = ₹25.00 INR",
    exampleText: "1 Lot = 25 shares. If NIFTY gains 20 points, 1 lot makes 20 × 25 = ₹500.00; 2 lots make ₹1,000.00."
  },
  BANKNIFTY: {
    symbol: "BANKNIFTY",
    name: "NSE Bank NIFTY Index (Futures & Options)",
    category: "INDEX_FUTURES",
    exchange: "NSE INDIA",
    currency: "INR",
    currencySymbol: "₹",
    contractSize: 15, // NSE standard lot size is 15 quantity
    pointMultiplier: 15.0, // 1 lot * 1 pt = ₹15.00 INR
    minLot: 1,
    lotStep: 1,
    defaultLot: 1,
    tickSize: 0.05,
    pointName: "points",
    quickLots: [1, 2, 3, 4, 6, 8, 10],
    formulaDescription: "1.00 Point move × 1 Lot (15 qty) = ₹15.00 INR",
    exampleText: "1 Lot = 15 shares. If BankNifty moves 100 points, 1 lot makes 100 × 15 = ₹1,500.00."
  },
  SENSEX: {
    symbol: "SENSEX",
    name: "BSE SENSEX Index (Futures & Options)",
    category: "INDEX_FUTURES",
    exchange: "BSE INDIA",
    currency: "INR",
    currencySymbol: "₹",
    contractSize: 10, // BSE standard lot size is 10 quantity
    pointMultiplier: 10.0, // 1 lot * 1 pt = ₹10.00 INR
    minLot: 1,
    lotStep: 1,
    defaultLot: 1,
    tickSize: 0.05,
    pointName: "points",
    quickLots: [1, 2, 4, 5, 10, 15, 20],
    formulaDescription: "1.00 Point move × 1 Lot (10 qty) = ₹10.00 INR",
    exampleText: "1 Lot = 10 shares. If SENSEX gains 50 points, 1 lot makes 50 × 10 = ₹500.00."
  },
  EURUSD: {
    symbol: "EURUSD",
    name: "Euro / US Dollar",
    category: "FOREX",
    exchange: "FOREX",
    currency: "USD",
    currencySymbol: "$",
    contractSize: 100000,
    pointMultiplier: 10.0, // Per pip for 1 standard lot
    minLot: 0.01,
    lotStep: 0.01,
    defaultLot: 0.01,
    tickSize: 0.00001,
    pointName: "pips",
    quickLots: [0.01, 0.02, 0.05, 0.10, 0.25, 0.50, 1.00],
    formulaDescription: "1 Pip (0.0001) × 0.01 Lot = $0.10 USD (1.00 Lot = $10.00)",
    exampleText: "0.01 Lot = 1,000 units. A 10-pip move earns $1.00."
  },
  BTCUSD: {
    symbol: "BTCUSD",
    name: "Bitcoin / US Dollar",
    category: "CRYPTO",
    exchange: "CRYPTO",
    currency: "USD",
    currencySymbol: "$",
    contractSize: 1,
    pointMultiplier: 1.0,
    minLot: 0.01,
    lotStep: 0.01,
    defaultLot: 0.05,
    tickSize: 0.5,
    pointName: "dollars",
    quickLots: [0.01, 0.05, 0.10, 0.25, 0.50, 1.00],
    formulaDescription: "1.00 Point ($1 move) × 1.00 Lot = $1.00 USD (0.01 Lot = $0.01 / $1 move)",
    exampleText: "0.01 Lot: A $100 Bitcoin surge earns $1.00. 1.00 Lot earns $100.00."
  }
};

export const DEFAULT_SYMBOL = "XAUUSD";

export function getInstrumentSpec(rawSymbol: string): InstrumentSpec {
  if (!rawSymbol) return INSTRUMENT_SPECS[DEFAULT_SYMBOL];
  const clean = rawSymbol.toUpperCase().replace(/[\s\-\/\^]/g, "");

  if (INSTRUMENT_SPECS[clean]) {
    return INSTRUMENT_SPECS[clean];
  }

  // Matching partials
  if (clean.includes("GOLD") || clean.includes("XAU")) return INSTRUMENT_SPECS.XAUUSD;
  if (clean.includes("NAS") || clean.includes("NDX") || clean.includes("USTEC") || clean.includes("US100")) return INSTRUMENT_SPECS.NASDAQ;
  if (clean.includes("US30") || clean.includes("DOW") || clean.includes("DJI") || clean.includes("WALLSTREET")) return INSTRUMENT_SPECS.US30;
  if (clean.includes("SPX") || clean.includes("US500") || clean.includes("SP500")) return INSTRUMENT_SPECS.SPX500;
  if (clean.includes("DAX") || clean.includes("GER40") || clean.includes("GERMANY")) return INSTRUMENT_SPECS.GER40;
  if (clean.includes("BANKNIFTY") || clean.includes("NIFTYBANK")) return INSTRUMENT_SPECS.BANKNIFTY;
  if (clean.includes("NIFTY")) return INSTRUMENT_SPECS.NIFTY50;
  if (clean.includes("SENSEX") || clean.includes("BSESN")) return INSTRUMENT_SPECS.SENSEX;
  if (clean.includes("EUR")) return INSTRUMENT_SPECS.EURUSD;
  if (clean.includes("BTC") || clean.includes("BITCOIN")) return INSTRUMENT_SPECS.BTCUSD;

  // Generic Fallback
  return {
    symbol: clean,
    name: `${clean} Instrument`,
    category: "INDEX_CFD",
    exchange: "GLOBAL",
    currency: "USD",
    currencySymbol: "$",
    contractSize: 1,
    pointMultiplier: 1.0,
    minLot: 0.01,
    lotStep: 0.01,
    defaultLot: 1.0,
    tickSize: 0.01,
    pointName: "points",
    quickLots: [0.01, 0.05, 0.10, 0.50, 1.00],
    formulaDescription: "1 Point × 1 Lot = 1 Currency Unit",
    exampleText: "Standard 1-to-1 calculation."
  };
}

/**
 * Real-time Exact PnL Calculation
 * For XAUUSD: Points * Lots * 100
 * For NASDAQ: Points * Lots * 1.0
 * For NIFTY50: Points * Lots * 25.0
 * For BANKNIFTY: Points * Lots * 15.0
 * For SENSEX: Points * Lots * 10.0
 */
export function calculateRealTradePnl(
  symbol: string,
  lots: number,
  points: number,
  fees: number = 0
): { grossPnl: number; netPnl: number; multiplier: number; contractUnits: number } {
  const spec = getInstrumentSpec(symbol);
  const multiplier = spec.pointMultiplier;
  const contractUnits = Number((lots * spec.contractSize).toFixed(4));
  const grossPnl = Number((points * lots * multiplier).toFixed(2));
  const netPnl = Number((grossPnl - (fees || 0)).toFixed(2));

  return { grossPnl, netPnl, multiplier, contractUnits };
}
