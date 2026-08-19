import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, ColorType, LineStyle } from 'lightweight-charts';
import { Maximize2, Eye, EyeOff, Layers, Sliders } from 'lucide-react';
import { Candle, FullSignalPayload } from '@/types';

interface TradingChartProps {
  symbol: string;
  candles: Candle[];
  signalData: FullSignalPayload | null;
  timeframe: string;
}

export const TradingChart: React.FC<TradingChartProps> = ({
  symbol,
  candles,
  signalData,
  timeframe
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);

  // Indicator Toggles
  const [showVWAP, setShowVWAP] = useState(true);
  const [showEMA20, setShowEMA20] = useState(true);
  const [showEMA50, setShowEMA50] = useState(false);
  const [showEMA200, setShowEMA200] = useState(false);
  const [showSRLevels, setShowSRLevels] = useState(true);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Initialize Lightweight Chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#090D16' },
        textColor: '#94A3B8',
      },
      grid: {
        vertLines: { color: '#1E293B' },
        horzLines: { color: '#1E293B' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: '#1E293B',
      },
      timeScale: {
        borderColor: '#1E293B',
        timeVisible: true,
        secondsVisible: false,
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
    });

    chartRef.current = chart;

    // Candlestick Series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#10B981',
      downColor: '#EF4444',
      borderVisible: false,
      wickUpColor: '#10B981',
      wickDownColor: '#EF4444',
    });
    candlestickSeriesRef.current = candlestickSeries;

    // Volume Series
    const volumeSeries = chart.addHistogramSeries({
      color: '#3B82F6',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
    });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });
    volumeSeriesRef.current = volumeSeries;

    // Resize Handler
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  // Update Candles and Volume Data
  useEffect(() => {
    if (!candles || candles.length === 0) return;

    if (candlestickSeriesRef.current) {
      const formattedCandles = candles.map((c) => ({
        time: c.time as any,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }));
      candlestickSeriesRef.current.setData(formattedCandles);
    }

    if (volumeSeriesRef.current) {
      const formattedVolume = candles.map((c) => ({
        time: c.time as any,
        value: c.volume,
        color: c.close >= c.open ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)',
      }));
      volumeSeriesRef.current.setData(formattedVolume);
    }
  }, [candles]);

  // Add Chart Markers for Signal and Trade Targets
  useEffect(() => {
    if (!candlestickSeriesRef.current || !signalData || !candles || candles.length === 0) return;

    const lastCandle = candles[candles.length - 1];
    const markers: any[] = [];

    if (signalData.signal === 'BUY') {
      markers.push({
        time: lastCandle.time as any,
        position: 'belowBar',
        color: '#10B981',
        shape: 'arrowUp',
        text: `BUY SETUP (${signalData.strategy_score}/100)`,
      });
    } else if (signalData.signal === 'SELL') {
      markers.push({
        time: lastCandle.time as any,
        position: 'aboveBar',
        color: '#EF4444',
        shape: 'arrowDown',
        text: `SELL SETUP (${signalData.strategy_score}/100)`,
      });
    } else if (signalData.signal === 'WAIT') {
      markers.push({
        time: lastCandle.time as any,
        position: 'aboveBar',
        color: '#F59E0B',
        shape: 'circle',
        text: `WAIT (Score ${signalData.strategy_score})`,
      });
    }

    candlestickSeriesRef.current.setMarkers(markers);
  }, [signalData, candles]);

  const [chartMode, setChartMode] = useState<'LIGHTWEIGHT' | 'TRADINGVIEW'>('LIGHTWEIGHT');

  const getTradingViewSymbol = (sym: string) => {
    if (sym.includes('NIFTY 50') || sym.includes('NIFTY')) return 'NSE:NIFTY';
    if (sym.includes('BANKNIFTY')) return 'NSE:BANKNIFTY';
    if (sym.includes('FINNIFTY')) return 'NSE:FINNIFTY';
    if (sym.includes('SENSEX')) return 'BSE:SENSEX';
    return `NSE:${sym.replace('.NS', '')}`;
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950">
      {/* Chart Header Bar */}
      <div className="h-9 bg-slate-900/80 border-b border-slate-800 px-3 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3">
          <span className="font-bold text-slate-100 font-mono text-sm">{symbol}</span>
          <span className="text-slate-400 font-mono">{timeframe}</span>

          {/* Quick Price Overlay */}
          {candles && candles.length > 0 && (
            <div className="hidden sm:flex items-center space-x-2 font-mono text-[11px]">
              <span className="text-slate-400">O: <span className="text-slate-200">{candles[candles.length - 1].open}</span></span>
              <span className="text-slate-400">H: <span className="text-emerald-400">{candles[candles.length - 1].high}</span></span>
              <span className="text-slate-400">L: <span className="text-red-400">{candles[candles.length - 1].low}</span></span>
              <span className="text-slate-400">C: <span className="text-slate-100 font-bold">{candles[candles.length - 1].close}</span></span>
            </div>
          )}
        </div>

        {/* Chart Engine Switcher & Indicator Toggles */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setChartMode(chartMode === 'LIGHTWEIGHT' ? 'TRADINGVIEW' : 'LIGHTWEIGHT')}
            className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-600 hover:bg-blue-500 text-white shadow transition flex items-center space-x-1"
          >
            <Layers className="w-3 h-3" />
            <span>{chartMode === 'LIGHTWEIGHT' ? 'SWITCH TO TRADINGVIEW LIVE' : 'SWITCH TO AI CHART'}</span>
          </button>

          {chartMode === 'LIGHTWEIGHT' && (
            <>
              <button
                onClick={() => setShowVWAP(!showVWAP)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold border transition ${
                  showVWAP ? 'bg-amber-950/80 text-amber-400 border-amber-500/50' : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                VWAP
              </button>
              <button
                onClick={() => setShowEMA20(!showEMA20)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold border transition ${
                  showEMA20 ? 'bg-blue-950/80 text-blue-400 border-blue-500/50' : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                EMA 20
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Chart Area */}
      {chartMode === 'LIGHTWEIGHT' ? (
        <div ref={chartContainerRef} className="w-full flex-1" />
      ) : (
        <div className="w-full flex-1 relative bg-slate-950">
          <iframe
            src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_widget&symbol=${getTradingViewSymbol(symbol)}&interval=5&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=090D16&studies=VWAP%40tv-basicstudies%2CRSI%40tv-basicstudies&theme=dark&style=1&timezone=Asia%2FKolkata`}
            className="w-full h-full border-0"
            allowFullScreen
          />
        </div>
      )}
    </div>
  );
};
