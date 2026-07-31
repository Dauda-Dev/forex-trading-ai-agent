import { getDb } from './connection';

const createSchema = `
CREATE TABLE IF NOT EXISTS trades (
  id SERIAL PRIMARY KEY,
  ticket INTEGER UNIQUE NOT NULL,
  symbol TEXT NOT NULL,
  type TEXT NOT NULL,
  volume REAL NOT NULL DEFAULT 0,
  price_open REAL,
  price_close REAL,
  sl REAL,
  tp REAL,
  profit REAL DEFAULT 0,
  commission REAL DEFAULT 0,
  swap REAL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'open',
  strategy TEXT,
  decision_id TEXT,
  exchange TEXT NOT NULL DEFAULT 'mt5',
  opened_at TIMESTAMP NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMP,
  notes TEXT
);
CREATE INDEX IF NOT EXISTS idx_trades_status ON trades(status);
CREATE INDEX IF NOT EXISTS idx_trades_symbol ON trades(symbol);
CREATE INDEX IF NOT EXISTS idx_trades_opened ON trades(opened_at);

CREATE TABLE IF NOT EXISTS decisions (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  symbol TEXT,
  confidence REAL,
  status TEXT NOT NULL DEFAULT 'pending',
  risk_check_passed INTEGER DEFAULT 0,
  reason TEXT,
  strategy TEXT,
  constraints TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  executed_at TIMESTAMP,
  result TEXT
);
CREATE INDEX IF NOT EXISTS idx_decisions_status ON decisions(status);
CREATE INDEX IF NOT EXISTS idx_decisions_created ON decisions(created_at);

CREATE TABLE IF NOT EXISTS performance (
  id SERIAL PRIMARY KEY,
  date TEXT NOT NULL,
  total_trades INTEGER DEFAULT 0,
  winning_trades INTEGER DEFAULT 0,
  losing_trades INTEGER DEFAULT 0,
  total_pnl REAL DEFAULT 0,
  win_rate REAL DEFAULT 0,
  sharpe_ratio REAL DEFAULT 0,
  max_drawdown REAL DEFAULT 0,
  max_drawdown_pct REAL DEFAULT 0,
  total_return REAL DEFAULT 0,
  total_return_pct REAL DEFAULT 0,
  daily_pnl REAL DEFAULT 0,
  balance REAL DEFAULT 0,
  equity REAL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_performance_date ON performance(date);

CREATE TABLE IF NOT EXISTS brain_state (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS alerts (
  id SERIAL PRIMARY KEY,
  kind TEXT NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  message TEXT,
  severity TEXT NOT NULL DEFAULT 'info',
  data TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  acknowledged INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_alerts_created ON alerts(created_at);

CREATE TABLE IF NOT EXISTS portfolio_snapshots (
  id SERIAL PRIMARY KEY,
  total_value REAL NOT NULL DEFAULT 0,
  cash REAL DEFAULT 0,
  equity REAL DEFAULT 0,
  margin REAL DEFAULT 0,
  margin_level REAL DEFAULT 0,
  data TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_portfolio_snapshots_created ON portfolio_snapshots(created_at);

CREATE TABLE IF NOT EXISTS strategy_stats (
  id SERIAL PRIMARY KEY,
  strategy TEXT NOT NULL,
  symbol TEXT,
  total_trades INTEGER DEFAULT 0,
  winning_trades INTEGER DEFAULT 0,
  total_pnl REAL DEFAULT 0,
  win_rate REAL DEFAULT 0,
  sharpe_ratio REAL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS market_regimes (
  id SERIAL PRIMARY KEY,
  symbol TEXT NOT NULL,
  regime TEXT NOT NULL,
  confidence REAL DEFAULT 0,
  data TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
`;

let initialized = false;

export async function initDatabase(): Promise<void> {
  if (initialized) return;
  initialized = true;
  try {
    const db = getDb();
    await db.execute(createSchema);
    console.log('[DB] PostgreSQL schema ready');
  } catch (err: any) {
    console.error('[DB] Failed to initialize:', err.message);
  }
}

export async function flush(): Promise<void> {
  // No-op for PG — writes are synchronous from the caller's perspective
}
