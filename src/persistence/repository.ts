import { getDb } from '../db/connection';
import * as schema from '../db/schema';
import { eq, and, desc, sql, like } from 'drizzle-orm';

// ── Trades ──────────────────────────────────────────────

export interface TradeRecord {
  id?: number;
  ticket: number;
  symbol: string;
  type: string;
  volume: number;
  price_open?: number;
  price_close?: number;
  sl?: number;
  tp?: number;
  profit?: number;
  commission?: number;
  swap?: number;
  status: string;
  strategy?: string;
  decision_id?: string;
  exchange?: string;
  opened_at: string;
  closed_at?: string;
  notes?: string;
}

export interface DecisionRecord {
  id: string;
  action: string;
  symbol?: string;
  confidence?: number;
  status: string;
  risk_check_passed?: number;
  reason?: string;
  strategy?: string;
  constraints?: string;
  created_at: string;
  executed_at?: string;
  result?: string;
}

export interface PerformanceRecord {
  id?: number;
  date: string;
  total_trades?: number;
  winning_trades?: number;
  losing_trades?: number;
  total_pnl?: number;
  win_rate?: number;
  sharpe_ratio?: number;
  max_drawdown?: number;
  max_drawdown_pct?: number;
  total_return?: number;
  total_return_pct?: number;
  daily_pnl?: number;
  balance?: number;
  equity?: number;
}

export interface AlertRecord {
  id?: number;
  kind: string;
  title: string;
  message?: string;
  severity: string;
  data?: string;
  created_at: string;
  acknowledged?: number;
}

export interface PortfolioSnapshot {
  id?: number;
  total_value: number;
  cash?: number;
  equity?: number;
  margin?: number;
  margin_level?: number;
  data?: string;
  created_at: string;
}

function db() {
  return getDb();
}

// ── Trades ──────────────────────────────────────────────

export async function insertTrade(t: TradeRecord): Promise<void> {
  await db().insert(schema.trades).values({
    ticket: t.ticket,
    symbol: t.symbol,
    type: t.type,
    volume: t.volume,
    priceOpen: t.price_open ?? null,
    priceClose: t.price_close ?? null,
    sl: t.sl ?? null,
    tp: t.tp ?? null,
    profit: t.profit ?? 0,
    commission: t.commission ?? 0,
    swap: t.swap ?? 0,
    status: t.status,
    strategy: t.strategy ?? null,
    decisionId: t.decision_id ?? null,
    exchange: t.exchange ?? 'mt5',
    openedAt: new Date(t.opened_at),
    closedAt: t.closed_at ? new Date(t.closed_at) : null,
    notes: t.notes ?? null,
  }).onConflictDoNothing();
}

export async function updateTradeClose(ticket: number, price_close: number, profit: number, closed_at: string, status?: string): Promise<void> {
  await db().update(schema.trades).set({
    priceClose: price_close,
    profit,
    closedAt: new Date(closed_at),
    status: status ?? 'closed',
  }).where(eq(schema.trades.ticket, ticket));
}

export async function getOpenTrades(): Promise<TradeRecord[]> {
  const rows = await db().select().from(schema.trades).where(eq(schema.trades.status, 'open')).orderBy(desc(schema.trades.openedAt));
  return rows.map(mapTrade);
}

export async function getAllTrades(limit = 100, offset = 0): Promise<TradeRecord[]> {
  const rows = await db().select().from(schema.trades).orderBy(desc(schema.trades.openedAt)).limit(limit).offset(offset);
  return rows.map(mapTrade);
}

export async function getTradesBySymbol(symbol: string, limit = 50): Promise<TradeRecord[]> {
  const rows = await db().select().from(schema.trades).where(eq(schema.trades.symbol, symbol)).orderBy(desc(schema.trades.openedAt)).limit(limit);
  return rows.map(mapTrade);
}

export async function getTradeStats(): Promise<{ total: number; open: number; closed: number; totalProfit: number; winRate: number }> {
  const [r] = await db().select({
    total: sql<number>`COUNT(*)`,
    open: sql<number>`SUM(CASE WHEN status='open' THEN 1 ELSE 0 END)`,
    closed: sql<number>`SUM(CASE WHEN status='closed' THEN 1 ELSE 0 END)`,
    totalProfit: sql<number>`COALESCE(SUM(profit), 0)`,
    winRate: sql<number>`CASE WHEN SUM(CASE WHEN status='closed' THEN 1 ELSE 0 END) > 0 THEN CAST(SUM(CASE WHEN profit > 0 THEN 1 ELSE 0 END) AS REAL) / SUM(CASE WHEN status='closed' THEN 1 ELSE 0 END) * 100 ELSE 0 END`,
  }).from(schema.trades);
  return { total: Number(r.total ?? 0), open: Number(r.open ?? 0), closed: Number(r.closed ?? 0), totalProfit: Number(r.totalProfit ?? 0), winRate: Number(r.winRate ?? 0) };
}

export async function getTradeHistoryByDay(days = 30): Promise<{ date: string; pnl: number; trades: number }[]> {
  const rows = await db().select({
    date: sql<string>`DATE(opened_at)`,
    pnl: sql<number>`SUM(profit)`,
    trades: sql<number>`COUNT(*)`,
  }).from(schema.trades)
    .where(sql`opened_at >= NOW() - INTERVAL '${sql.raw(String(days))} days'`)
    .groupBy(sql`DATE(opened_at)`)
    .orderBy(sql`DATE(opened_at)`);
  return rows.map(r => ({ date: String(r.date), pnl: Number(r.pnl), trades: Number(r.trades) }));
}

function mapTrade(row: typeof schema.trades.$inferSelect): TradeRecord {
  return {
    id: row.id,
    ticket: row.ticket,
    symbol: row.symbol,
    type: row.type,
    volume: row.volume,
    price_open: row.priceOpen ?? undefined,
    price_close: row.priceClose ?? undefined,
    sl: row.sl ?? undefined,
    tp: row.tp ?? undefined,
    profit: row.profit ?? undefined,
    commission: row.commission ?? undefined,
    swap: row.swap ?? undefined,
    status: row.status,
    strategy: row.strategy ?? undefined,
    decision_id: row.decisionId ?? undefined,
    exchange: row.exchange,
    opened_at: row.openedAt.toISOString(),
    closed_at: row.closedAt?.toISOString(),
    notes: row.notes ?? undefined,
  };
}

// ── Decisions ───────────────────────────────────────────

export async function insertDecision(d: DecisionRecord): Promise<void> {
  await db().insert(schema.decisions).values({
    id: d.id,
    action: d.action,
    symbol: d.symbol ?? null,
    confidence: d.confidence ?? null,
    status: d.status,
    riskCheckPassed: d.risk_check_passed ?? 0,
    reason: d.reason ?? null,
    strategy: d.strategy ?? null,
    constraints: d.constraints ?? null,
    createdAt: new Date(d.created_at),
    executedAt: d.executed_at ? new Date(d.executed_at) : null,
    result: d.result ?? null,
  }).onConflictDoUpdate({ target: schema.decisions.id, set: { status: d.status, executedAt: d.executed_at ? new Date(d.executed_at) : undefined, result: d.result ?? undefined } });
}

export async function updateDecisionStatus(id: string, status: string, executed_at?: string, result?: string): Promise<void> {
  await db().update(schema.decisions).set({
    status,
    executedAt: executed_at ? new Date(executed_at) : undefined,
    result: result ?? undefined,
  }).where(eq(schema.decisions.id, id));
}

export async function getRecentDecisions(limit = 100): Promise<DecisionRecord[]> {
  const rows = await db().select().from(schema.decisions).orderBy(desc(schema.decisions.createdAt)).limit(limit);
  return rows.map(mapDecision);
}

export async function getPendingDecisions(): Promise<DecisionRecord[]> {
  const rows = await db().select().from(schema.decisions).where(eq(schema.decisions.status, 'pending')).orderBy(desc(schema.decisions.createdAt));
  return rows.map(mapDecision);
}

export async function getDecisionById(id: string): Promise<DecisionRecord | undefined> {
  const [row] = await db().select().from(schema.decisions).where(eq(schema.decisions.id, id)).limit(1);
  return row ? mapDecision(row) : undefined;
}

function mapDecision(row: typeof schema.decisions.$inferSelect): DecisionRecord {
  return {
    id: row.id,
    action: row.action,
    symbol: row.symbol ?? undefined,
    confidence: row.confidence ?? undefined,
    status: row.status,
    risk_check_passed: row.riskCheckPassed ?? undefined,
    reason: row.reason ?? undefined,
    strategy: row.strategy ?? undefined,
    constraints: row.constraints ?? undefined,
    created_at: row.createdAt.toISOString(),
    executed_at: row.executedAt?.toISOString(),
    result: row.result ?? undefined,
  };
}

// ── Brain State (key-value) ─────────────────────────────

export async function setBrainState(key: string, value: unknown): Promise<void> {
  const json = JSON.stringify(value);
  await db().insert(schema.brainState).values({ key, value: json, updatedAt: new Date() })
    .onConflictDoUpdate({ target: schema.brainState.key, set: { value: json, updatedAt: new Date() } });
}

export async function getBrainState<T = unknown>(key: string): Promise<T | undefined> {
  const [row] = await db().select().from(schema.brainState).where(eq(schema.brainState.key, key)).limit(1);
  if (!row) return undefined;
  try { return JSON.parse(row.value) as T; } catch { return undefined; }
}

export async function getAllBrainStates(): Promise<Record<string, unknown>> {
  const rows = await db().select().from(schema.brainState);
  const result: Record<string, unknown> = {};
  for (const r of rows) {
    try { result[r.key] = JSON.parse(r.value); } catch { result[r.key] = r.value; }
  }
  return result;
}

// ── Performance ─────────────────────────────────────────

export async function upsertPerformance(p: PerformanceRecord): Promise<void> {
  if (p.id) {
    await db().update(schema.performance).set({
      date: p.date,
      totalTrades: p.total_trades ?? 0,
      winningTrades: p.winning_trades ?? 0,
      losingTrades: p.losing_trades ?? 0,
      totalPnl: p.total_pnl ?? 0,
      winRate: p.win_rate ?? 0,
      sharpeRatio: p.sharpe_ratio ?? 0,
      maxDrawdown: p.max_drawdown ?? 0,
      maxDrawdownPct: p.max_drawdown_pct ?? 0,
      totalReturn: p.total_return ?? 0,
      totalReturnPct: p.total_return_pct ?? 0,
      dailyPnl: p.daily_pnl ?? 0,
      balance: p.balance ?? 0,
      equity: p.equity ?? 0,
    }).where(eq(schema.performance.id, p.id));
  } else {
    await db().insert(schema.performance).values({
      date: p.date,
      totalTrades: p.total_trades ?? 0,
      winningTrades: p.winning_trades ?? 0,
      losingTrades: p.losing_trades ?? 0,
      totalPnl: p.total_pnl ?? 0,
      winRate: p.win_rate ?? 0,
      sharpeRatio: p.sharpe_ratio ?? 0,
      maxDrawdown: p.max_drawdown ?? 0,
      maxDrawdownPct: p.max_drawdown_pct ?? 0,
      totalReturn: p.total_return ?? 0,
      totalReturnPct: p.total_return_pct ?? 0,
      dailyPnl: p.daily_pnl ?? 0,
      balance: p.balance ?? 0,
      equity: p.equity ?? 0,
    });
  }
}

export async function getLatestPerformance(): Promise<PerformanceRecord | undefined> {
  const [row] = await db().select().from(schema.performance).orderBy(desc(schema.performance.id)).limit(1);
  return row ? {
    id: row.id,
    date: row.date,
    total_trades: row.totalTrades ?? undefined,
    winning_trades: row.winningTrades ?? undefined,
    losing_trades: row.losingTrades ?? undefined,
    total_pnl: row.totalPnl ?? undefined,
    win_rate: row.winRate ?? undefined,
    sharpe_ratio: row.sharpeRatio ?? undefined,
    max_drawdown: row.maxDrawdown ?? undefined,
    max_drawdown_pct: row.maxDrawdownPct ?? undefined,
    total_return: row.totalReturn ?? undefined,
    total_return_pct: row.totalReturnPct ?? undefined,
    daily_pnl: row.dailyPnl ?? undefined,
    balance: row.balance ?? undefined,
    equity: row.equity ?? undefined,
  } : undefined;
}

export async function getPerformanceHistory(days = 30): Promise<PerformanceRecord[]> {
  const rows = await db().select().from(schema.performance)
    .where(sql`date >= NOW()::date - INTERVAL '${sql.raw(String(days))} days'`)
    .orderBy(sql`date`);
  return rows.map(r => ({
    id: r.id,
    date: r.date,
    total_trades: r.totalTrades ?? undefined,
    winning_trades: r.winningTrades ?? undefined,
    losing_trades: r.losingTrades ?? undefined,
    total_pnl: r.totalPnl ?? undefined,
    win_rate: r.winRate ?? undefined,
    sharpe_ratio: r.sharpeRatio ?? undefined,
    max_drawdown: r.maxDrawdown ?? undefined,
    max_drawdown_pct: r.maxDrawdownPct ?? undefined,
    total_return: r.totalReturn ?? undefined,
    total_return_pct: r.totalReturnPct ?? undefined,
    daily_pnl: r.dailyPnl ?? undefined,
    balance: r.balance ?? undefined,
    equity: r.equity ?? undefined,
  }));
}

// ── Alerts ──────────────────────────────────────────────

export async function insertAlert(a: AlertRecord): Promise<void> {
  await db().insert(schema.alerts).values({
    kind: a.kind,
    title: a.title,
    message: a.message ?? null,
    severity: a.severity,
    data: a.data ?? null,
    createdAt: new Date(a.created_at),
  });
  // Keep only last 200 alerts
  await db().delete(schema.alerts).where(sql`id NOT IN (SELECT id FROM alerts ORDER BY id DESC LIMIT 200)`);
}

export async function getRecentAlerts(limit = 50): Promise<AlertRecord[]> {
  const rows = await db().select().from(schema.alerts).orderBy(desc(schema.alerts.createdAt)).limit(limit);
  return rows.map(mapAlert);
}

export async function acknowledgeAlert(id: number): Promise<void> {
  await db().update(schema.alerts).set({ acknowledged: 1 }).where(eq(schema.alerts.id, id));
}

function mapAlert(row: typeof schema.alerts.$inferSelect): AlertRecord {
  return {
    id: row.id,
    kind: row.kind,
    title: row.title,
    message: row.message ?? undefined,
    severity: row.severity,
    data: row.data ?? undefined,
    created_at: row.createdAt.toISOString(),
    acknowledged: row.acknowledged ?? undefined,
  };
}

// ── Portfolio ───────────────────────────────────────────

export async function insertPortfolioSnapshot(s: PortfolioSnapshot): Promise<void> {
  await db().insert(schema.portfolioSnapshots).values({
    totalValue: s.total_value,
    cash: s.cash ?? null,
    equity: s.equity ?? null,
    margin: s.margin ?? null,
    marginLevel: s.margin_level ?? null,
    data: s.data ?? null,
    createdAt: new Date(s.created_at),
  });
}

export async function getPortfolioHistory(limit = 100): Promise<PortfolioSnapshot[]> {
  const rows = await db().select().from(schema.portfolioSnapshots).orderBy(desc(schema.portfolioSnapshots.createdAt)).limit(limit);
  return rows.map(mapPortfolio);
}

export async function getLatestPortfolio(): Promise<PortfolioSnapshot | undefined> {
  const [row] = await db().select().from(schema.portfolioSnapshots).orderBy(desc(schema.portfolioSnapshots.createdAt)).limit(1);
  return row ? mapPortfolio(row) : undefined;
}

function mapPortfolio(row: typeof schema.portfolioSnapshots.$inferSelect): PortfolioSnapshot {
  return {
    id: row.id,
    total_value: row.totalValue,
    cash: row.cash ?? undefined,
    equity: row.equity ?? undefined,
    margin: row.margin ?? undefined,
    margin_level: row.marginLevel ?? undefined,
    data: row.data ?? undefined,
    created_at: row.createdAt.toISOString(),
  };
}

// ── Strategy Stats ──────────────────────────────────────

export async function upsertStrategyStats(s: { strategy: string; symbol?: string; total_trades?: number; winning_trades?: number; total_pnl?: number; win_rate?: number; sharpe_ratio?: number }): Promise<void> {
  const [existing] = await db().select({ id: schema.strategyStats.id }).from(schema.strategyStats)
    .where(and(eq(schema.strategyStats.strategy, s.strategy), s.symbol ? eq(schema.strategyStats.symbol, s.symbol) : sql`symbol IS NULL`))
    .limit(1);
  if (existing) {
    await db().update(schema.strategyStats).set({
      totalTrades: s.total_trades ?? 0,
      winningTrades: s.winning_trades ?? 0,
      totalPnl: s.total_pnl ?? 0,
      winRate: s.win_rate ?? 0,
      sharpeRatio: s.sharpe_ratio ?? 0,
      updatedAt: new Date(),
    }).where(eq(schema.strategyStats.id, existing.id));
  } else {
    await db().insert(schema.strategyStats).values({
      strategy: s.strategy,
      symbol: s.symbol ?? null,
      totalTrades: s.total_trades ?? 0,
      winningTrades: s.winning_trades ?? 0,
      totalPnl: s.total_pnl ?? 0,
      winRate: s.win_rate ?? 0,
      sharpeRatio: s.sharpe_ratio ?? 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}

// ── Market Regimes ──────────────────────────────────────

export async function insertMarketRegime(symbol: string, regime: string, confidence?: number, data?: string): Promise<void> {
  await db().insert(schema.marketRegimes).values({
    symbol,
    regime,
    confidence: confidence ?? null,
    data: data ?? null,
    createdAt: new Date(),
  });
}

export async function getLatestRegimes(): Promise<{ symbol: string; regime: string; confidence: number; created_at: string }[]> {
  const rows = await db().select({
    symbol: schema.marketRegimes.symbol,
    regime: schema.marketRegimes.regime,
    confidence: schema.marketRegimes.confidence,
    created_at: schema.marketRegimes.createdAt,
  }).from(schema.marketRegimes)
    .where(sql`id IN (SELECT MAX(id) FROM market_regimes GROUP BY symbol)`)
    .orderBy(schema.marketRegimes.symbol);
  return rows.map(r => ({ symbol: r.symbol, regime: r.regime, confidence: Number(r.confidence), created_at: r.created_at.toISOString() }));
}
