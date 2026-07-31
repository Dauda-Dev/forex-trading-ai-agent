import { useLive } from '../context/DataContext';
import { SkeletonCard, SkeletonTable } from '../components/Skeleton';

function MetricRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-kit-border/50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm font-medium ${color || 'text-white'}`}>{value}</span>
    </div>
  );
}

function DecisionRow({ d }: { d: any }) {
  const statusColor: Record<string, string> = {
    executed: 'bg-kit-green/10 text-kit-green',
    failed:   'bg-kit-red/10 text-kit-red',
    approved: 'bg-kit-cyan/10 text-kit-cyan',
    pending:  'bg-yellow-500/10 text-yellow-400',
    rejected: 'bg-kit-red/10 text-kit-red',
    executing:'bg-kit-purple/10 text-kit-purple',
  };
  const dotColor: Record<string, string> = {
    executed: 'bg-kit-green', failed: 'bg-kit-red', approved: 'bg-kit-cyan',
    pending: 'bg-yellow-400', rejected: 'bg-kit-red', executing: 'bg-kit-purple',
  };

  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/5 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor[d.status] || 'bg-gray-500'}`} />
        <div className="min-w-0">
          <span className="font-mono text-sm">{d.action.asset.symbol}</span>
          <span className={`ml-2 text-xs font-medium ${d.action.side === 'buy' ? 'text-kit-green' : 'text-kit-red'}`}>
            {d.action.side.toUpperCase()}
          </span>
          <span className="ml-2 text-xs text-gray-500">${d.action.amount}</span>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-xs text-gray-600">
          {new Date(d.createdAt).toLocaleTimeString()}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded ${statusColor[d.status] || 'bg-gray-500/10 text-gray-500'}`}>
          {d.status}
        </span>
      </div>
    </div>
  );
}

export default function Brain() {
  const { brain, decisions } = useLive();
  const perf = brain?.performance;
  const pending = decisions.filter((d) => d.status === 'pending');

  if (!brain) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Brain</h1>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
        <SkeletonTable rows={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Brain</h1>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          brain.active ? 'bg-kit-green/20 text-kit-green' : 'bg-gray-500/20 text-gray-500'
        }`}>
          {brain.active ? '● Active' : '● Inactive'}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-kit-card rounded-xl border border-kit-border p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Autonomy Level</div>
          <div className="text-2xl font-bold text-kit-purple">
            {brain.autonomy?.level || 1}
            <span className="text-sm text-gray-500 ml-1">
              {['', 'Assistant', 'Co-Pilot', 'Autopilot'][brain.autonomy?.level || 1]}
            </span>
          </div>
        </div>
        <div className="bg-kit-card rounded-xl border border-kit-border p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Win Rate</div>
          <div className="text-2xl font-bold text-kit-cyan">
            {((perf?.winRate || 0) * 100).toFixed(1)}%
          </div>
        </div>
        <div className="bg-kit-card rounded-xl border border-kit-border p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Trades</div>
          <div className="text-2xl font-bold text-white">{perf?.totalTrades || 0}</div>
        </div>
        <div className="bg-kit-card rounded-xl border border-kit-border p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Pending</div>
          <div className="text-2xl font-bold text-yellow-400">{pending.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance */}
        <div className="bg-kit-card rounded-xl border border-kit-border p-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Performance</h2>
          <div>
            <MetricRow label="Total Return" value={`${(perf?.totalReturnPercent || 0) >= 0 ? '+' : ''}${(perf?.totalReturnPercent || 0).toFixed(2)}%`} color={(perf?.totalReturnPercent || 0) >= 0 ? 'text-kit-green' : 'text-kit-red'} />
            <MetricRow label="Daily P&L" value={`${(perf?.dailyPnL || 0) >= 0 ? '+' : ''}$${(perf?.dailyPnL || 0).toFixed(2)}`} />
            <MetricRow label="Weekly P&L" value={`${(perf?.weeklyPnL || 0) >= 0 ? '+' : ''}$${(perf?.weeklyPnL || 0).toFixed(2)}`} />
            <MetricRow label="Winning Trades" value={`${perf?.winningTrades || 0}`} />
            <MetricRow label="Max Drawdown" value={`${(perf?.maxDrawdown || 0).toFixed(2)}%`} color="text-kit-red" />
            <MetricRow label="Sharpe Ratio" value={`${(perf?.sharpeRatio || 0).toFixed(2)}`} />
          </div>
        </div>

        {/* Goals */}
        <div className="bg-kit-card rounded-xl border border-kit-border p-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Goals</h2>
          {(!brain.goals || brain.goals.length === 0) ? (
            <p className="text-sm text-gray-600">No goals set. Use chat to set one.</p>
          ) : (
            <div className="space-y-3">
              {brain.goals.map((g) => (
                <div key={g.id} className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">{g.type}</span>
                    <span className="text-xs text-gray-500 capitalize">{g.riskTolerance} risk</span>
                  </div>
                  {g.targetReturn && (
                    <div className="text-xs text-gray-500 mt-1">Target: {g.targetReturn}%</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick stats */}
        <div className="bg-kit-card rounded-xl border border-kit-border p-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Analysis</h2>
          <div>
            <MetricRow label="Last Analysis" value={brain.lastAnalysis ? new Date(brain.lastAnalysis).toLocaleTimeString() : '—'} />
            <MetricRow label="Active" value={brain.active ? 'Yes' : 'No'} />
            <MetricRow label="Decisions Made" value={`${decisions.length}`} />
            <MetricRow label="Executed" value={`${decisions.filter(d => d.status === 'executed').length}`} color="text-kit-green" />
          </div>
        </div>
      </div>

      {/* All Decisions */}
      <div className="bg-kit-card rounded-xl border border-kit-border p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">All Decisions</h2>
          <span className="text-xs text-gray-600">{decisions.length}</span>
        </div>
        {decisions.length === 0 ? (
          <p className="text-sm text-gray-600 text-center py-4">No decisions yet</p>
        ) : (
          <div className="space-y-1 max-h-[400px] overflow-y-auto">
            {decisions.map((d) => <DecisionRow key={d.id} d={d} />)}
          </div>
        )}
      </div>
    </div>
  );
}
