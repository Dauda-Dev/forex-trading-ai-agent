import * as path from 'path';
import * as fs from 'fs';

const KIT_HOME = process.env.KIT_HOME || path.join(process.env.HOME || process.env.USERPROFILE || '.', '.kit');

export interface StrategyDef {
  id: string;
  name: string;
  description: string;
  warmupPeriod: number;
  params: Record<string, { type: string; default: number; min?: number; max?: number; step?: number }>;
}

const STRATEGIES: StrategyDef[] = [
  {
    id: 'rsi',
    name: 'RSI Mean Reversion',
    description: 'Buy when RSI is oversold (below 30), sell when overbought (above 70)',
    warmupPeriod: 14,
    params: { period: { type: 'number', default: 14, min: 7, max: 28 }, oversold: { type: 'number', default: 30, min: 20, max: 40 }, overbought: { type: 'number', default: 70, min: 60, max: 80 } },
  },
  {
    id: 'emaCrossover',
    name: 'EMA Crossover',
    description: 'Buy when fast EMA crosses above slow EMA, sell when it crosses below',
    warmupPeriod: 26,
    params: { fastPeriod: { type: 'number', default: 12, min: 5, max: 50 }, slowPeriod: { type: 'number', default: 26, min: 10, max: 100 } },
  },
  {
    id: 'bollingerBands',
    name: 'Bollinger Bands',
    description: 'Buy at lower band, sell at upper band with deviation-based entries',
    warmupPeriod: 20,
    params: { period: { type: 'number', default: 20, min: 10, max: 50 }, stdDev: { type: 'number', default: 2, min: 1, max: 4, step: 0.5 } },
  },
  {
    id: 'macd',
    name: 'MACD',
    description: 'Buy on MACD line crossing above signal, sell on cross below',
    warmupPeriod: 35,
    params: { fastPeriod: { type: 'number', default: 12, min: 5, max: 30 }, slowPeriod: { type: 'number', default: 26, min: 10, max: 50 }, signalPeriod: { type: 'number', default: 9, min: 5, max: 20 } },
  },
  {
    id: 'smaTrend',
    name: 'SMA Trend Following',
    description: 'Long when price above SMA, exit when below',
    warmupPeriod: 50,
    params: { period: { type: 'number', default: 50, min: 20, max: 200 } },
  },
  {
    id: 'rsiEma',
    name: 'RSI + EMA Combo',
    description: 'Combines RSI oversold signal with price above EMA for trend confirmation',
    warmupPeriod: 26,
    params: { rsiPeriod: { type: 'number', default: 14, min: 7, max: 28 }, emaPeriod: { type: 'number', default: 20, min: 10, max: 50 }, oversold: { type: 'number', default: 35, min: 20, max: 45 }, overbought: { type: 'number', default: 65, min: 55, max: 80 } },
  },
];

export interface BacktestRunParams {
  strategy: string;
  symbol: string;
  timeframe: string;
  startDate?: string;
  endDate?: string;
  initialCapital: number;
  positionSizePct?: number;
  commission?: number;
  slippage?: number;
  params?: Record<string, number>;
}

export interface BacktestResult {
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
  avgWinPct: number;
  avgLossPct: number;
  avgHoldingPeriod: number;
  equityCurve: number[];
  drawdownCurve: number[];
  trades: BacktestTrade[];
  runAt: string;
}

export interface BacktestTrade {
  id: number;
  type: 'buy' | 'sell';
  entryPrice: number;
  exitPrice: number;
  amount: number;
  entryTime: string;
  exitTime: string;
  pnl: number;
  pnlPercent: number;
}

export class BacktesterBackend {
  async run(params: BacktestRunParams): Promise<BacktestResult> {
    try {
      const { createBacktester } = require('../tools/backtester');
      const backtester = createBacktester();
      const config = {
        symbol: params.symbol,
        timeframe: params.timeframe,
        startDate: params.startDate ? new Date(params.startDate) : undefined,
        endDate: params.endDate ? new Date(params.endDate) : undefined,
        initialCapital: params.initialCapital || 10000,
        positionSizePct: params.positionSizePct || 20,
        commission: params.commission ?? 0.001,
        slippage: params.slippage ?? 0.0005,
      };
      const result = await backtester.runBacktest(params.strategy, config, undefined, params.params || {});

      const id = `bt_${Date.now()}`;
      const btResult: BacktestResult = {
        id,
        strategy: result.strategy,
        symbol: config.symbol,
        timeframe: config.timeframe,
        startDate: (result.startDate || config.startDate || new Date()).toISOString().slice(0, 10),
        endDate: (result.endDate || config.endDate || new Date()).toISOString().slice(0, 10),
        initialCapital: result.initialCapital || config.initialCapital,
        finalCapital: result.finalCapital || 0,
        totalReturn: result.totalReturn || 0,
        totalReturnPct: result.totalReturnPct || 0,
        buyHoldReturn: result.buyHoldReturn || 0,
        buyHoldReturnPct: result.buyHoldReturnPct || 0,
        alpha: result.alpha || 0,
        totalTrades: result.totalTrades || 0,
        winningTrades: result.winningTrades || 0,
        losingTrades: result.losingTrades || 0,
        winRate: result.winRate || 0,
        sharpeRatio: result.sharpeRatio || 0,
        sortinoRatio: result.sortinoRatio || 0,
        maxDrawdown: result.maxDrawdown || 0,
        maxDrawdownPct: result.maxDrawdownPct || 0,
        profitFactor: result.profitFactor || 0,
        volatility: result.volatility || 0,
        avgWin: result.avgWin || 0,
        avgLoss: result.avgLoss || 0,
        avgWinPct: result.avgWinPct || 0,
        avgLossPct: result.avgLossPct || 0,
        avgHoldingPeriod: result.avgHoldingPeriod || 0,
        equityCurve: result.equityCurve || [],
        drawdownCurve: result.drawdownCurve || [],
        trades: (result.trades || []).map((t: any) => ({
          id: t.id,
          type: t.type,
          entryPrice: t.entryPrice,
          exitPrice: t.exitPrice || 0,
          amount: t.amount,
          entryTime: t.entryTime?.toISOString?.() || String(t.entryTime),
          exitTime: t.exitTime?.toISOString?.() || '',
          pnl: t.pnl || 0,
          pnlPercent: t.pnlPercent || 0,
        })),
        runAt: new Date().toISOString(),
      };

      // Save to disk
      this.saveResult(btResult);
      return btResult;
    } catch (e: any) {
      throw new Error(`Backtest failed: ${e.message}`);
    }
  }

  getStrategies(): StrategyDef[] {
    return STRATEGIES;
  }

  getResults(limit: number): BacktestResult[] {
    const dir = path.join(KIT_HOME, 'backtests');
    if (!fs.existsSync(dir)) return [];
    const files = fs.readdirSync(dir)
      .filter((f) => f.endsWith('.json'))
      .sort()
      .reverse()
      .slice(0, limit);
    return files.map((f) => {
      try {
        return JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
      } catch { return null; }
    }).filter(Boolean) as BacktestResult[];
  }

  getResult(id: string): BacktestResult | null {
    const file = path.join(KIT_HOME, 'backtests', `${id}.json`);
    if (!fs.existsSync(file)) return null;
    try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return null; }
  }

  private saveResult(result: BacktestResult): void {
    const dir = path.join(KIT_HOME, 'backtests');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `${result.id}.json`);
    fs.writeFileSync(file, JSON.stringify(result, null, 2));
  }
}

let instance: BacktesterBackend | null = null;
export function createBacktesterBackend(): BacktesterBackend {
  if (!instance) instance = new BacktesterBackend();
  return instance;
}
