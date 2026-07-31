import { useLive } from '../context/DataContext';
import { useApi } from '../hooks/useApi';
import { SkeletonCard } from '../components/Skeleton';

interface Health {
  status: string;
  version: string;
  uptimeFormatted: string;
  clients: number;
  sessions: number;
  heartbeat: { enabled: boolean };
  memory: { heapUsed: number; heapTotal: number };
}

interface DashboardData {
  user: { name: string } | null;
  skillsActive: number;
  skillsTotal: number;
  channels: { telegram: { connected: boolean }; whatsapp: { connected: boolean } };
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div className="bg-kit-card rounded-xl p-4 border border-kit-border">
      <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
      <div className={`text-2xl font-bold mt-1 ${color}`}>{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const { brain, wsConnected } = useLive();
  const { data: health }            = useApi<Health>('/health', 5000);
  const { data: dashboard }         = useApi<DashboardData>('/api/status', 10000);

  const perf   = brain?.performance;
  const recent = brain?.recentDecisions ?? [];
  const portfolio = dashboard as any;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            {dashboard?.user?.name ? `Welcome back, ${dashboard.user.name}` : 'K.I.T. Trading Overview'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
            wsConnected ? 'bg-kit-green/20 text-kit-green' : 'bg-yellow-500/20 text-yellow-400'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${wsConnected ? 'bg-kit-green' : 'bg-yellow-400'}`} />
            {wsConnected ? 'Live' : 'Polling'}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            health?.status === 'healthy' ? 'bg-kit-green/20 text-kit-green' : 'bg-kit-red/20 text-kit-red'
          }`}>
            {health?.status === 'healthy' ? '● Online' : '● Offline'}
          </span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {!brain ? (
          <>
            <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
          </>
        ) : (
          <>
            <StatCard
              label="Win Rate"
              value={`${((perf?.winRate || 0) * 100).toFixed(1)}%`}
              sub={`${perf?.totalTrades || 0} total trades`}
              color="text-kit-cyan"
            />
            <StatCard
              label="Total Return"
              value={`${(perf?.totalReturnPercent || 0) >= 0 ? '+' : ''}${(perf?.totalReturnPercent || 0).toFixed(2)}%`}
              sub={`$${(perf?.totalReturn || 0).toFixed(2)}`}
              color={(perf?.totalReturnPercent || 0) >= 0 ? 'text-kit-green' : 'text-kit-red'}
            />
            <StatCard
              label="Autonomy"
              value={`Level ${brain?.autonomy?.level || 1}`}
              sub={['', 'Assistant', 'Co-Pilot', 'Autopilot'][brain?.autonomy?.level || 1]}
              color="text-kit-purple"
            />
            <StatCard
              label="Uptime"
              value={health?.uptimeFormatted || '—'}
              sub={`${health?.clients || 0} clients`}
              color="text-kit-gold"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Decisions */}
        <div className="bg-kit-card rounded-xl border border-kit-border p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Recent Decisions</h2>
            <span className="text-xs text-gray-600">{recent.length}</span>
          </div>
          {recent.length === 0 ? (
            <p className="text-sm text-gray-600 py-4 text-center">No decisions yet</p>
          ) : (
            <div className="space-y-2">
              {recent.slice(0, 8).map((d) => (
                <div key={d.id} className="flex items-center justify-between text-sm py-1.5 border-b border-kit-border/50 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      d.status === 'executed' ? 'bg-kit-green' :
                      d.status === 'failed' ? 'bg-kit-red' :
                      d.status === 'approved' ? 'bg-kit-cyan' :
                      d.status === 'pending' ? 'bg-yellow-400' : 'bg-gray-500'
                    }`} />
                    <span className="font-mono text-xs">{d.action.asset.symbol}</span>
                    <span className={`text-xs ${d.action.side === 'buy' ? 'text-kit-green' : 'text-kit-red'}`}>
                      {d.action.side.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-600">${d.action.amount}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    d.status === 'executed' ? 'bg-kit-green/10 text-kit-green' :
                    d.status === 'failed' ? 'bg-kit-red/10 text-kit-red' :
                    d.status === 'approved' ? 'bg-kit-cyan/10 text-kit-cyan' :
                    d.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
                    'bg-gray-500/10 text-gray-500'
                  }`}>
                    {d.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System Info */}
        <div className="bg-kit-card rounded-xl border border-kit-border p-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">System</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Memory</span>
              <span>{health?.memory?.heapUsed || 0}MB / {health?.memory?.heapTotal || 0}MB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Heartbeat</span>
              <span className={health?.heartbeat?.enabled ? 'text-kit-green' : 'text-gray-500'}>
                {health?.heartbeat?.enabled ? 'Active' : 'Disabled'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Sessions</span>
              <span>{health?.sessions || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Telegram</span>
              <span className={(dashboard as any)?.channels?.telegram?.connected ? 'text-kit-green' : 'text-gray-600'}>
                {(dashboard as any)?.channels?.telegram?.connected ? 'Connected' : 'Not connected'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Skills</span>
              <span>{dashboard?.skillsActive || 0} / {dashboard?.skillsTotal || 0} active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
