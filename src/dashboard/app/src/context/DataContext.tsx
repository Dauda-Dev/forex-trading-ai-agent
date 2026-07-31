import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';

// ── Types ────────────────────────────────────────────────────────────
interface BrainPerformance {
  totalReturn: number; totalReturnPercent: number; dailyPnL: number;
  weeklyPnL: number; totalTrades: number; winningTrades: number;
  winRate: number; maxDrawdown: number; sharpeRatio: number; updatedAt: string;
}

interface BrainStatus {
  active: boolean;
  goals: Array<{ id: string; type: string; riskTolerance: string; targetReturn?: number }>;
  autonomy: { level: number };
  performance: BrainPerformance;
  pendingDecisions: any[];
  recentDecisions: any[];
  lastAnalysis: string;
}

interface Decision {
  id: string; status: string;
  action: { side: string; amount: number; asset: { symbol: string; market: string }; type: string };
  riskCheckPassed: boolean; autonomyLevel: number; requiresApproval: boolean;
  createdAt: string; executedAt?: string;
  executionResult?: { success: boolean; error?: string };
}

interface Portfolio {
  totalValue: number; change24h: number;
  platforms: Record<string, number>;
  goals?: any[];
}

interface LiveState {
  brain: BrainStatus | null;
  decisions: Decision[];
  portfolio: Portfolio | null;
  wsConnected: boolean;
}

// ── Context ──────────────────────────────────────────────────────────
const DataContext = createContext<LiveState & { refresh: () => void }>({
  brain: null,
  decisions: [],
  portfolio: null,
  wsConnected: false,
  refresh: () => {},
});

export function useLive() {
  return useContext(DataContext);
}

// ── Provider ─────────────────────────────────────────────────────────
export default function DataProvider({ children }: { children: ReactNode }) {
  const [brain, setBrain]       = useState<BrainStatus | null>(null);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const retryRef = useRef<number>(0);

  // REST fetch helpers
  const fetchBrain = useCallback(async () => {
    try {
      const r = await fetch('/api/brain/status');
      if (r.ok) setBrain(await r.json());
    } catch {}
  }, []);

  const fetchDecisions = useCallback(async () => {
    try {
      const r = await fetch('/api/brain/decisions?limit=100');
      if (r.ok) { const d = await r.json(); setDecisions(d.decisions ?? []); }
    } catch {}
  }, []);

  const fetchPortfolio = useCallback(async () => {
    try {
      const r = await fetch('/api/portfolio');
      if (r.ok) setPortfolio(await r.json());
    } catch {}
  }, []);

  const refresh = useCallback(() => {
    fetchBrain();
    fetchDecisions();
    fetchPortfolio();
  }, [fetchBrain, fetchDecisions, fetchPortfolio]);

  // Initial + polling fetch (every 10s)
  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 10_000);
    return () => clearInterval(id);
  }, [refresh]);

  // WebSocket connection with auto-reconnect
  useEffect(() => {
    function connect() {
      const proto = location.protocol === 'https:' ? 'wss' : 'ws';
      const ws = new WebSocket(`${proto}://${location.host}/ws`);
      wsRef.current = ws;

      ws.onopen = () => {
        setWsConnected(true);
        retryRef.current = 0;
      };

      ws.onclose = () => {
        setWsConnected(false);
        wsRef.current = null;
        const delay = Math.min(1000 * 2 ** retryRef.current, 30_000);
        retryRef.current++;
        setTimeout(connect, delay);
      };

      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.type === 'heartbeat' || msg.type === 'status') refresh();
        } catch {}
      };
    }
    connect();
    return () => { wsRef.current?.close(); };
  }, [refresh]);

  return (
    <DataContext.Provider value={{ brain, decisions, portfolio, wsConnected, refresh }}>
      {children}
    </DataContext.Provider>
  );
}
