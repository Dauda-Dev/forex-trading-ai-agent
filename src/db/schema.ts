import { pgTable, serial, text, integer, real, timestamp, index, uniqueIndex } from 'drizzle-orm/pg-core';

export const trades = pgTable('trades', {
  id: serial('id').primaryKey(),
  ticket: integer('ticket').unique().notNull(),
  symbol: text('symbol').notNull(),
  type: text('type').notNull(),
  volume: real('volume').notNull().default(0),
  priceOpen: real('price_open'),
  priceClose: real('price_close'),
  sl: real('sl'),
  tp: real('tp'),
  profit: real('profit').default(0),
  commission: real('commission').default(0),
  swap: real('swap').default(0),
  status: text('status').notNull().default('open'),
  strategy: text('strategy'),
  decisionId: text('decision_id'),
  exchange: text('exchange').notNull().default('mt5'),
  openedAt: timestamp('opened_at').notNull(),
  closedAt: timestamp('closed_at'),
  notes: text('notes'),
}, (table) => ({
  statusIdx: index('idx_trades_status').on(table.status),
  symbolIdx: index('idx_trades_symbol').on(table.symbol),
  openedIdx: index('idx_trades_opened').on(table.openedAt),
}));

export const decisions = pgTable('decisions', {
  id: text('id').primaryKey(),
  action: text('action').notNull(),
  symbol: text('symbol'),
  confidence: real('confidence'),
  status: text('status').notNull().default('pending'),
  riskCheckPassed: integer('risk_check_passed').default(0),
  reason: text('reason'),
  strategy: text('strategy'),
  constraints: text('constraints'),
  createdAt: timestamp('created_at').notNull(),
  executedAt: timestamp('executed_at'),
  result: text('result'),
}, (table) => ({
  statusIdx: index('idx_decisions_status').on(table.status),
  createdIdx: index('idx_decisions_created').on(table.createdAt),
}));

export const performance = pgTable('performance', {
  id: serial('id').primaryKey(),
  date: text('date').notNull(),
  totalTrades: integer('total_trades').default(0),
  winningTrades: integer('winning_trades').default(0),
  losingTrades: integer('losing_trades').default(0),
  totalPnl: real('total_pnl').default(0),
  winRate: real('win_rate').default(0),
  sharpeRatio: real('sharpe_ratio').default(0),
  maxDrawdown: real('max_drawdown').default(0),
  maxDrawdownPct: real('max_drawdown_pct').default(0),
  totalReturn: real('total_return').default(0),
  totalReturnPct: real('total_return_pct').default(0),
  dailyPnl: real('daily_pnl').default(0),
  balance: real('balance').default(0),
  equity: real('equity').default(0),
}, (table) => ({
  dateIdx: index('idx_performance_date').on(table.date),
}));

export const brainState = pgTable('brain_state', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
});

export const alerts = pgTable('alerts', {
  id: serial('id').primaryKey(),
  kind: text('kind').notNull().default('info'),
  title: text('title').notNull(),
  message: text('message'),
  severity: text('severity').notNull().default('info'),
  data: text('data'),
  createdAt: timestamp('created_at').notNull(),
  acknowledged: integer('acknowledged').default(0),
}, (table) => ({
  createdIdx: index('idx_alerts_created').on(table.createdAt),
}));

export const portfolioSnapshots = pgTable('portfolio_snapshots', {
  id: serial('id').primaryKey(),
  totalValue: real('total_value').notNull().default(0),
  cash: real('cash').default(0),
  equity: real('equity').default(0),
  margin: real('margin').default(0),
  marginLevel: real('margin_level').default(0),
  data: text('data'),
  createdAt: timestamp('created_at').notNull(),
}, (table) => ({
  createdIdx: index('idx_portfolio_snapshots_created').on(table.createdAt),
}));

export const strategyStats = pgTable('strategy_stats', {
  id: serial('id').primaryKey(),
  strategy: text('strategy').notNull(),
  symbol: text('symbol'),
  totalTrades: integer('total_trades').default(0),
  winningTrades: integer('winning_trades').default(0),
  totalPnl: real('total_pnl').default(0),
  winRate: real('win_rate').default(0),
  sharpeRatio: real('sharpe_ratio').default(0),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
}, (table) => ({
  strategyIdx: index('idx_strategy_stats_strategy').on(table.strategy),
}));

export const marketRegimes = pgTable('market_regimes', {
  id: serial('id').primaryKey(),
  symbol: text('symbol').notNull(),
  regime: text('regime').notNull(),
  confidence: real('confidence').default(0),
  data: text('data'),
  createdAt: timestamp('created_at').notNull(),
}, (table) => ({
  symbolIdx: index('idx_market_regimes_symbol').on(table.symbol),
}));
