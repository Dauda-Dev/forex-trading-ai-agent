import { useState, useEffect, useRef } from 'react';
import { createChart, IChartApi, ISeriesApi, LineData, Time } from 'lightweight-charts';
import { SkeletonCard } from '../components/Skeleton';

interface StrategyDef {
  id: string;
  name: string;
  description: string;
  warmupPeriod: number;
  params: Record<string, { type: string; default: number; min?: number; max?: number; step?: number }>;
}

interface BacktestResult {
  id: string;
  strategy: string;
  symbol: string;
  timeframe: string;
  startDate: string;
  endDate: string;
  initialCapital: number;
  finalCapital: number;
  totalReturn: number;
  totalReturnPct: number;
  buyHoldReturn: number;
  buyHoldReturnPct: number;
  alpha: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
  maxDrawdownPct: number;
  profitFactor: number;
  volatility: number;
  avgWin: number;
  avgLoss: number;
  avgHoldingPeriod: number;
  equityCurve: number[];
  drawdownCurve: number[];
  runAt: string;
}

const SYMBOLS = ['BTC/USDT', 'ETH/USDT', 'EUR/USDT', 'GBP/USDT', 'SOL/USDT', 'ADA/USDT'];
const TIMEFRAMES = ['1m', '5m', '15m', '1h', '4h', '1d'];

function MetricBox({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-white/5 rounded-lg p-2.5">
      <div className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</div>
      <div className={`text-sm font-semibold mt-0.5 ${color || 'text-white'}`}>{value}</div>
    </div>
  );
}

export default function Backtest() {
  const [strategies, setStrategies] = useState<StrategyDef[]>([]);
  const [savedResults, setSavedResults] = useState<BacktestResult[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState('rsi');
  const [symbol, setSymbol] = useState('BTC/USDT');
  const [timeframe, setTimeframe] = useState('1d');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 90); return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [capital, setCapital] = useState('10000');
  const [customParams, setCustomParams] = useState<Record<string, number>>({});
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [error, setError] = useState('');

  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<IChartApi | null>(null);
  const equitySeries = useRef<ISeriesApi<'Line'> | null>(null);
  const buyHoldSeries = useRef<ISeriesApi<'Line'> | null>(null);

  // Load strategies and saved results on mount
  useEffect(() => {
    fetch('/api/backtest/strategies')
      .then((r) => r.json())
      .then((d) => { setStrategies(d.strategies || []); })
      .catch(() => {});
    fetch('/api/backtest/results?limit=10')
      .then((r) => r.json())
      .then((d) => { setSavedResults(d.results || []); })
      .catch(() => {});
  }, []);

  // Init equity curve chart
  useEffect(() => {
    if (!chartRef.current) return;
    const chart = createChart(chartRef.current, {
      layout: { background: { color: '#12121a' }, textColor: '#888' },
      grid: { vertLines: { color: '#1e1e2e' }, horzLines: { color: '#1e1e2e' } },
      width: chartRef.current.clientWidth,
      height: 300,
      rightPriceScale: { borderColor: '#1e1e2e' },
      timeScale: { borderColor: '#1e1e2e' },
    });

    equitySeries.current = chart.addLineSeries({ color: '#00ff88', lineWidth: 2 });
    buyHoldSeries.current = chart.addLineSeries({ color: '#888', lineWidth: 1, lineStyle: 2 });
    chartInstance.current = chart;

    const h = () => {
      if (chartRef.current) chart.applyOptions({ width: chartRef.current.clientWidth });
    };
    window.addEventListener('resize', h);
    return () => { window.removeEventListener('resize', h); chart.remove(); };
  }, []);

  // Update chart when result changes
  useEffect(() => {
    if (!result || !equitySeries.current) return;

    if (result.equityCurve && result.equityCurve.length > 0) {
      const data: LineData[] = result.equityCurve.map((v, i) => ({
        time: i as Time,
        value: v,
      }));
      equitySeries.current.setData(data);
    }

    // Simple buy & hold reference line
    if (result.buyHoldReturn > 0) {
      const bhEnd = result.initialCapital + result.buyHoldReturn;
      const bhData: LineData[] = [
        { time: 0 as Time, value: result.initialCapital },
        { time: (result.equityCurve?.length || 100) as Time, value: bhEnd },
      ];
      buyHoldSeries.current?.setData(bhData);
    }

    chartInstance.current?.timeScale().fitContent();
  }, [result]);

  const currentStrategy = strategies.find((s) => s.id === selectedStrategy);

  const runBacktest = async () => {
    setRunning(true);
    setError('');
    setResult(null);
    try {
      const params: Record<string, number> = {};
      if (currentStrategy) {
        Object.entries(currentStrategy.params).forEach(([key, def]) => {
          params[key] = customParams[key] ?? def.default;
        });
      }

      const res = await fetch('/api/backtest/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategy: selectedStrategy,
          symbol,
          timeframe,
          startDate,
          endDate,
          initialCapital: parseFloat(capital) || 10000,
          params,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Backtest failed');
      setResult(data);
      // Refresh saved results
      const r2 = await fetch('/api/backtest/results?limit=10');
      const d2 = await r2.json();
      setSavedResults(d2.results || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Backtest</h1>

      {/* Config form */}
      <div className="bg-kit-card rounded-xl border border-kit-border p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Strategy */}
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Strategy</label>
            <select
              value={selectedStrategy}
              onChange={(e) => { setSelectedStrategy(e.target.value); setCustomParams({}); }}
              className="w-full bg-white/5 border border-kit-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-kit-cyan"
            >
              {strategies.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            {currentStrategy && (
              <p className="text-[10px] text-gray-600 mt-1">{currentStrategy.description}</p>
            )}
          </div>

          {/* Symbol */}
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Symbol</label>
            <select
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="w-full bg-white/5 border border-kit-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-kit-cyan"
            >
              {SYMBOLS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Timeframe */}
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Timeframe</label>
            <div className="flex gap-1 bg-white/5 rounded-lg p-1">
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    timeframe === tf ? 'bg-kit-cyan/20 text-kit-cyan' : 'text-gray-500 hover:text-white'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Capital */}
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Initial Capital</label>
            <input
              type="number"
              value={capital}
              onChange={(e) => setCapital(e.target.value)}
              className="w-full bg-white/5 border border-kit-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-kit-cyan"
            />
          </div>
        </div>

        {/* Date range */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-white/5 border border-kit-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-kit-cyan"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-white/5 border border-kit-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-kit-cyan"
            />
          </div>
        </div>

        {/* Strategy params */}
        {currentStrategy && Object.keys(currentStrategy.params).length > 0 && (
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">Parameters</label>
            <div className="flex flex-wrap gap-4">
              {Object.entries(currentStrategy.params).map(([key, def]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{key}</span>
                  <input
                    type="number"
                    value={customParams[key] ?? def.default}
                    onChange={(e) => setCustomParams({ ...customParams, [key]: parseFloat(e.target.value) || def.default })}
                    min={def.min}
                    max={def.max}
                    step={def.step || 1}
                    className="w-20 bg-white/5 border border-kit-border rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-kit-cyan"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Run button */}
        <button
          onClick={runBacktest}
          disabled={running}
          className="px-6 py-2.5 bg-gradient-to-r from-kit-cyan to-kit-purple text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          {running ? 'Running...' : '▶ Run Backtest'}
        </button>
        {error && <p className="text-sm text-kit-red">{error}</p>}
      </div>

      {/* Result */}
      {result && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Results — {result.strategy} on {result.symbol} ({result.timeframe})</h2>

          {/* Equity curve */}
          <div className="bg-kit-card rounded-xl border border-kit-border p-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Equity Curve</h3>
            <div ref={chartRef} />
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-kit-green inline-block" /> Strategy</span>
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 border border-dashed border-gray-500 inline-block" /> Buy & Hold</span>
            </div>
          </div>

          {/* Metrics grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <MetricBox label="Total Return" value={`${result.totalReturnPct >= 0 ? '+' : ''}${result.totalReturnPct.toFixed(2)}%`} color={result.totalReturnPct >= 0 ? 'text-kit-green' : 'text-kit-red'} />
            <MetricBox label="Buy & Hold" value={`${result.buyHoldReturnPct >= 0 ? '+' : ''}${result.buyHoldReturnPct.toFixed(2)}%`} />
            <MetricBox label="Alpha" value={`${result.alpha >= 0 ? '+' : ''}${result.alpha.toFixed(2)}%`} color={result.alpha >= 0 ? 'text-kit-green' : 'text-kit-red'} />
            <MetricBox label="Sharpe" value={result.sharpeRatio.toFixed(2)} color={result.sharpeRatio > 1 ? 'text-kit-green' : result.sharpeRatio > 0 ? 'text-yellow-400' : 'text-kit-red'} />
            <MetricBox label="Sortino" value={result.sortinoRatio.toFixed(2)} />
            <MetricBox label="Max DD" value={`${result.maxDrawdownPct.toFixed(1)}%`} color="text-kit-red" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            <MetricBox label="Win Rate" value={`${result.winRate.toFixed(1)}%`} color={result.winRate > 50 ? 'text-kit-green' : 'text-kit-red'} />
            <MetricBox label="Trades" value={String(result.totalTrades)} />
            <MetricBox label="Profit Factor" value={result.profitFactor.toFixed(2)} color={result.profitFactor > 1.5 ? 'text-kit-green' : 'text-yellow-400'} />
            <MetricBox label="Volatility" value={`${result.volatility.toFixed(1)}%`} />
            <MetricBox label="Avg Win" value={`$${result.avgWin.toFixed(0)}`} color="text-kit-green" />
            <MetricBox label="Avg Loss" value={`$${result.avgLoss.toFixed(0)}`} color="text-kit-red" />
            <MetricBox label="Avg Hold" value={`${result.avgHoldingPeriod.toFixed(1)}h`} />
          </div>

          {/* Final capital */}
          <div className="bg-kit-card rounded-xl border border-kit-border p-4 text-center">
            <span className="text-sm text-gray-500">${result.initialCapital.toLocaleString()} → </span>
            <span className={`text-xl font-bold ${result.finalCapital >= result.initialCapital ? 'text-kit-green' : 'text-kit-red'}`}>
              ${result.finalCapital.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* Saved results */}
      {savedResults.length > 0 && (
        <div className="bg-kit-card rounded-xl border border-kit-border p-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Recent Runs</h2>
          <div className="space-y-1">
            {savedResults.map((r) => (
              <button
                key={r.id}
                onClick={() => setResult(r)}
                className="w-full flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/5 transition-colors text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs text-gray-600">{new Date(r.runAt).toLocaleDateString()}</span>
                  <span className="text-sm font-mono">{r.symbol}</span>
                  <span className="text-xs text-gray-500">{r.strategy}</span>
                  <span className="text-xs text-gray-600">{r.timeframe}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-gray-500">{r.totalTrades} trades</span>
                  <span className={`text-xs font-medium ${r.totalReturnPct >= 0 ? 'text-kit-green' : 'text-kit-red'}`}>
                    {r.totalReturnPct >= 0 ? '+' : ''}{r.totalReturnPct.toFixed(1)}%
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {!result && savedResults.length === 0 && !running && (
        <div className="text-center py-12 text-gray-600">
          <div className="text-4xl mb-3">📊</div>
          <p>Configure a strategy and run a backtest to see results.</p>
        </div>
      )}
    </div>
  );
}
