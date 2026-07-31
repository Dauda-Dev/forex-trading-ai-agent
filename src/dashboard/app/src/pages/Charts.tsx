import { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, HistogramData, Time } from 'lightweight-charts';

const SYMBOLS = ['BTC/USDT', 'ETH/USDT', 'EUR/USDT', 'GBP/USDT'];
const TIMEFRAMES = ['1m', '5m', '15m', '1h', '4h', '1d'];

interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export default function Charts() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);

  const [symbol, setSymbol] = useState('BTC/USDT');
  const [timeframe, setTimeframe] = useState('1h');
  const [loading, setLoading] = useState(false);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: '#12121a' },
        textColor: '#888',
      },
      grid: {
        vertLines: { color: '#1e1e2e' },
        horzLines: { color: '#1e1e2e' },
      },
      crosshair: { mode: 0 },
      timeScale: { borderColor: '#1e1e2e', timeVisible: true },
      width: chartContainerRef.current.clientWidth,
      height: 500,
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#00ff88',
      downColor: '#ff4757',
      borderDownColor: '#ff4757',
      borderUpColor: '#00ff88',
      wickDownColor: '#ff4757',
      wickUpColor: '#00ff88',
    });

    const volumeSeries = chart.addHistogramSeries({
      color: '#00d4ff',
      priceFormat: { type: 'volume' },
      priceScaleId: '',
    });
    volumeSeries.priceScale().applyOptions({ scaleMargins: { top: 0.85, bottom: 0 } });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  // Fetch data on symbol/timeframe change
  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/chart/${encodeURIComponent(symbol)}?timeframe=${timeframe}&limit=500`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data: Candle[] = await res.json();
        if (!active) return;

        const candles: CandlestickData[] = data.map((c) => ({
          time: (c.timestamp / 1000) as Time,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }));

        const volume: HistogramData[] = data.map((c) => ({
          time: (c.timestamp / 1000) as Time,
          value: c.volume,
          color: c.close >= c.open ? 'rgba(0,255,136,0.3)' : 'rgba(255,71,87,0.3)',
        }));

        candleSeriesRef.current?.setData(candles);
        volumeSeriesRef.current?.setData(volume);
        chartRef.current?.timeScale().fitContent();
      } catch (e) {
        console.error('Chart fetch error:', e);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchData();
    return () => { active = false; };
  }, [symbol, timeframe]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Charts</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex gap-1 bg-kit-card rounded-lg p-1 border border-kit-border">
          {SYMBOLS.map((s) => (
            <button
              key={s}
              onClick={() => setSymbol(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                symbol === s ? 'bg-kit-cyan/20 text-kit-cyan' : 'text-gray-400 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-kit-card rounded-lg p-1 border border-kit-border">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                timeframe === tf ? 'bg-kit-purple/20 text-kit-purple' : 'text-gray-400 hover:text-white'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
        {loading && <span className="text-xs text-gray-500">Loading...</span>}
      </div>

      <div className="bg-kit-card rounded-xl border border-kit-border overflow-hidden">
        <div ref={chartContainerRef} />
      </div>
    </div>
  );
}
