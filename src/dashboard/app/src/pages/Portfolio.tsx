import { useEffect, useRef } from 'react';
import { useApi } from '../hooks/useApi';
import { createChart, IChartApi, ISeriesApi, LineData, Time } from 'lightweight-charts';
import { SkeletonCard } from '../components/Skeleton';

interface PortfolioDetail {
  totalValue: number;
  change24h: number;
  platforms: Record<string, number>;
  byClass: Array<{ name: string; valueUsd: number; percentage: number }>;
  topHoldings: Array<{ symbol: string; valueUsd: number; platform: string; type?: string }>;
  pnl: { daily: number; total: number; dailyPercent: number };
  goals: Array<{ type: string; riskTolerance: string; targetReturn?: number }>;
  lastUpdate: string;
}

interface PnLEntry {
  date: string;
  value: number;
  pnl: number;
  trade: string;
}

export default function Portfolio() {
  const { data: detail, loading } = useApi<PortfolioDetail>('/api/portfolio', 10000);
  const { data: history } = useApi<PnLEntry[]>('/api/portfolio/history', 30000);
  const pnlChartRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const lineRef = useRef<ISeriesApi<'Line'> | null>(null);

  // P&L chart
  useEffect(() => {
    if (!pnlChartRef.current) return;
    const chart = createChart(pnlChartRef.current, {
      layout: { background: { color: '#12121a' }, textColor: '#888' },
      grid: { vertLines: { color: '#1e1e2e' }, horzLines: { color: '#1e1e2e' } },
      width: pnlChartRef.current.clientWidth,
      height: 200,
      rightPriceScale: { borderColor: '#1e1e2e' },
      timeScale: { borderColor: '#1e1e2e', visible: false },
    });
    const series = chart.addLineSeries({ color: '#00ff88', lineWidth: 2, crosshairMarkerVisible: false });
    chartRef.current = chart;
    lineRef.current = series;

    const h = () => { if (pnlChartRef.current) chart.applyOptions({ width: pnlChartRef.current.clientWidth }); };
    window.addEventListener('resize', h);
    return () => { window.removeEventListener('resize', h); chart.remove(); };
  }, []);

  // Update chart data
  useEffect(() => {
    if (!history || history.length === 0 || !lineRef.current) return;
    const data: LineData[] = (history as PnLEntry[]).map((h, i) => ({ time: i as Time, value: h.pnl }));
    lineRef.current.setData(data);
    chartRef.current?.timeScale().fitContent();
  }, [history]);

  const p = detail || { totalValue: 0, change24h: 0, platforms: {}, byClass: [], topHoldings: [], pnl: { daily: 0, total: 0, dailyPercent: 0 }, goals: [], lastUpdate: '' };
  const platformEntries = Object.entries(p.platforms || {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Portfolio</h1>
        <span className="text-xs text-gray-500">Updated {p.lastUpdate ? new Date(p.lastUpdate).toLocaleTimeString() : '—'}</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
        ) : (
          <>
            <div className="bg-kit-card rounded-xl border border-kit-border p-4">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Value</div>
              <div className="text-2xl font-bold text-white">${(p.totalValue || 0).toLocaleString()}</div>
              <div className={`text-xs mt-1 ${p.change24h >= 0 ? 'text-kit-green' : 'text-kit-red'}`}>
                {p.change24h >= 0 ? '+' : ''}{p.change24h.toFixed(2)}% today
              </div>
            </div>
            <div className="bg-kit-card rounded-xl border border-kit-border p-4">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Daily P&L</div>
              <div className={`text-2xl font-bold ${p.pnl.daily >= 0 ? 'text-kit-green' : 'text-kit-red'}`}>
                {p.pnl.daily >= 0 ? '+' : ''}${(p.pnl.daily || 0).toFixed(2)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {p.pnl.dailyPercent >= 0 ? '+' : ''}{p.pnl.dailyPercent.toFixed(2)}%
              </div>
            </div>
            <div className="bg-kit-card rounded-xl border border-kit-border p-4">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total P&L</div>
              <div className={`text-2xl font-bold ${p.pnl.total >= 0 ? 'text-kit-green' : 'text-kit-red'}`}>
                {p.pnl.total >= 0 ? '+' : ''}${(p.pnl.total || 0).toFixed(2)}
              </div>
            </div>
            <div className="bg-kit-card rounded-xl border border-kit-border p-4">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Platforms</div>
              <div className="text-2xl font-bold text-kit-purple">{platformEntries.length}</div>
              <div className="text-xs text-gray-500 mt-1">{p.topHoldings.length} holdings</div>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-kit-card rounded-xl border border-kit-border p-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Allocation</h2>
          {platformEntries.length === 0 ? (
            <p className="text-sm text-gray-600 text-center py-4">No platforms connected</p>
          ) : (
            <div className="space-y-3">
              {platformEntries.map(([name, value]) => {
                const pct = p.totalValue > 0 ? (value as number / p.totalValue) * 100 : 0;
                return (
                  <div key={name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">{name}</span>
                      <span className="text-gray-500">${(value as number).toLocaleString()} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-kit-cyan to-kit-purple transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-kit-card rounded-xl border border-kit-border p-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">P&L History</h2>
          {!history || history.length === 0 ? (
            <div className="flex items-center justify-center h-[200px] text-gray-600 text-sm">No trade history yet</div>
          ) : (
            <div ref={pnlChartRef} />
          )}
        </div>

        <div className="bg-kit-card rounded-xl border border-kit-border p-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Top Holdings</h2>
          {p.topHoldings.length === 0 ? (
            <p className="text-sm text-gray-600 text-center py-4">No holdings yet</p>
          ) : (
            <div className="space-y-2">
              {p.topHoldings.map((h, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-kit-border/50 last:border-0">
                  <div>
                    <span className="text-sm font-mono text-gray-200">{h.symbol}</span>
                    <span className="text-xs text-gray-600 ml-2">{h.platform}</span>
                  </div>
                  <span className="text-sm text-gray-400">${(h.valueUsd || 0).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {p.goals && p.goals.length > 0 && (
        <div className="bg-kit-card rounded-xl border border-kit-border p-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Goals</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {p.goals.map((g, i) => (
              <div key={i} className="bg-white/5 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">{g.type}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${g.riskTolerance === 'low' ? 'bg-kit-green/10 text-kit-green' : g.riskTolerance === 'medium' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-kit-red/10 text-kit-red'}`}>{g.riskTolerance}</span>
                </div>
                {g.targetReturn && <div className="text-xs text-gray-500 mt-1">Target: {g.targetReturn}% return</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
