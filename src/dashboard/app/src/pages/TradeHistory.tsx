import { useLive } from '../context/DataContext';
import { useApi } from '../hooks/useApi';
import { SkeletonTable } from '../components/Skeleton';

interface PaperTrade {
  timestamp: string;
  action: { type: string; platform: string; symbol: string; amount?: number };
}

interface TradeEntry {
  kind: 'paper' | 'brain';
  time: string;
  symbol: string;
  side: string;
  amount: number;
  platform: string;
  status: string;
}

export default function TradeHistory() {
  const { decisions } = useLive();
  const { data: paperTrades } = useApi<PaperTrade[]>('/api/trades?type=paper', 15000);

  const trades: TradeEntry[] = [
    ...(paperTrades || []).map((t) => ({
      kind: 'paper' as const,
      time: t.timestamp,
      symbol: t.action.symbol,
      side: t.action.type,
      amount: t.action.amount || 0,
      platform: t.action.platform,
      status: 'executed',
    })),
    ...decisions
      .filter((d) => d.status === 'executed' || d.status === 'failed')
      .map((d) => ({
        kind: 'brain' as const,
        time: d.executedAt || d.createdAt,
        symbol: d.action.asset.symbol,
        side: d.action.side,
        amount: d.action.amount,
        platform: d.action.type,
        status: d.status,
      })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Trade History</h1>
        <span className="text-sm text-gray-500">{trades.length} trades</span>
      </div>

      {trades.length === 0 ? (
        <SkeletonTable rows={4} />
      ) : (
        <div className="bg-kit-card rounded-xl border border-kit-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-kit-border text-xs text-gray-500 uppercase tracking-wider">
                  <th className="text-left px-4 py-3">Time</th>
                  <th className="text-left px-4 py-3">Symbol</th>
                  <th className="text-left px-4 py-3">Side</th>
                  <th className="text-left px-4 py-3">Amount</th>
                  <th className="text-left px-4 py-3">Platform</th>
                  <th className="text-left px-4 py-3">Source</th>
                  <th className="text-left px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((t, i) => (
                  <tr key={i} className="border-b border-kit-border/50 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-2.5 text-sm text-gray-400 whitespace-nowrap">
                      {new Date(t.time).toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-sm">{t.symbol}</td>
                    <td className="px-4 py-2.5">
                      <span className={`text-xs font-medium ${t.side === 'buy' ? 'text-kit-green' : 'text-kit-red'}`}>
                        {t.side.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-sm">${t.amount.toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-500 uppercase">{t.platform}</td>
                    <td className="px-4 py-2.5">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        t.kind === 'brain' ? 'bg-kit-purple/10 text-kit-purple' : 'bg-kit-cyan/10 text-kit-cyan'
                      }`}>
                        {t.kind === 'brain' ? 'Brain' : 'Paper'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        t.status === 'executed' ? 'bg-kit-green/10 text-kit-green' :
                        t.status === 'failed' ? 'bg-kit-red/10 text-kit-red' :
                        'bg-gray-500/10 text-gray-500'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
