/**
 * Market Regime Detector Hook
 *
 * Detects market regime (trending/ranging/volatile) and provides
 * strategy recommendations for adaptive trading.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Types
type MarketRegime = 'trending_up' | 'trending_down' | 'ranging' | 'volatile' | 'unknown';

interface RegimeState {
  symbol: string;
  regime: MarketRegime;
  confidence: number; // 0-100
  indicators: {
    adx: number;
    atrPercent: number;
    bbWidth: number;
    priceVsSma: number; // % above/below 20 SMA
  };
  recommendation: string[];
  timestamp: string;
}

interface RegimeHistory {
  states: Record<string, RegimeState>;
  lastUpdate: string;
  changes: Array<{
    symbol: string;
    from: MarketRegime;
    to: MarketRegime;
    timestamp: string;
  }>;
}

interface HookEvent {
  type: string;
  action?: string;
  messages: string[];
  context: {
    workspaceDir?: string;
    cfg?: Record<string, unknown>;
  };
}

// Constants
const KIT_HOME = path.join(os.homedir(), '.kit');
const DATA_DIR = path.join(KIT_HOME, 'data');
const REPORTS_DIR = path.join(KIT_HOME, 'reports');
const STATE_FILE = path.join(DATA_DIR, 'market-regimes.json');
const CHANGES_LOG = path.join(REPORTS_DIR, 'regime-changes.log');

// Default config
const DEFAULT_SYMBOLS = ['BTC/USDT', 'ETH/USDT'];
const DEFAULT_TIMEFRAME = '1h';
const ADX_TREND_THRESHOLD = 25;
const ADX_WEAK_THRESHOLD = 20;
const ATR_VOLATILE_THRESHOLD = 0.03; // 3% of price
const BB_NARROW_THRESHOLD = 0.02; // 2% bandwidth

// Ensure directories exist
function ensureDirs(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }
}

// Load current state
function loadState(): RegimeHistory {
  ensureDirs();
  if (fs.existsSync(STATE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
    } catch {
      return { states: {}, lastUpdate: '', changes: [] };
    }
  }
  return { states: {}, lastUpdate: '', changes: [] };
}

// Save state
function saveState(state: RegimeHistory): void {
  ensureDirs();
  // Keep only last 100 regime changes
  state.changes = state.changes.slice(-100);
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// Log regime change
function logRegimeChange(
  symbol: string,
  from: MarketRegime,
  to: MarketRegime
): void {
  ensureDirs();
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] ${symbol}: ${from} → ${to}\n`;
  fs.appendFileSync(CHANGES_LOG, logLine);
}

// Simulate indicator calculation (in production, use real market data)
function calculateIndicators(symbol: string): RegimeState['indicators'] {
  // Simulated values - in production these would come from market data
  // Using symbol hash for deterministic but varied values
  const hash = symbol.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const hour = new Date().getHours();
  const minute = new Date().getMinutes();

  // Add some time-based variation
  const timeFactor = Math.sin((hour * 60 + minute) / 100);

  return {
    adx: 15 + ((hash % 30) + timeFactor * 10),
    atrPercent: 0.01 + ((hash % 5) / 100) + Math.abs(timeFactor) * 0.02,
    bbWidth: 0.015 + ((hash % 4) / 100) + Math.abs(timeFactor) * 0.015,
    priceVsSma: -5 + ((hash % 10) + timeFactor * 5),
  };
}

// Detect regime from indicators
function detectRegime(indicators: RegimeState['indicators']): {
  regime: MarketRegime;
  confidence: number;
} {
  const { adx, atrPercent, bbWidth, priceVsSma } = indicators;

  // High volatility takes precedence
  if (atrPercent > ATR_VOLATILE_THRESHOLD && bbWidth > 0.04) {
    return { regime: 'volatile', confidence: Math.min(95, 60 + atrPercent * 1000) };
  }

  // Strong trend
  if (adx > ADX_TREND_THRESHOLD) {
    const regime = priceVsSma > 0 ? 'trending_up' : 'trending_down';
    const confidence = Math.min(95, 50 + (adx - ADX_TREND_THRESHOLD) * 3);
    return { regime, confidence };
  }

  // Weak trend / ranging
  if (adx < ADX_WEAK_THRESHOLD && bbWidth < BB_NARROW_THRESHOLD) {
    return { regime: 'ranging', confidence: Math.min(90, 50 + (ADX_WEAK_THRESHOLD - adx) * 3) };
  }

  // Mixed signals
  if (adx >= ADX_WEAK_THRESHOLD && adx <= ADX_TREND_THRESHOLD) {
    // Transitional state - could go either way
    return { regime: 'unknown', confidence: 30 };
  }

  return { regime: 'unknown', confidence: 20 };
}

// Get strategy recommendations for regime
function getRecommendations(regime: MarketRegime): string[] {
  switch (regime) {
    case 'trending_up':
      return [
        '✅ Enable trend-following strategies (breakout, momentum)',
        '✅ Trail stops to lock in profits',
        '⚠️ Avoid shorting or mean reversion',
        '💡 Consider pyramiding on pullbacks',
      ];
    case 'trending_down':
      return [
        '✅ Enable short strategies or inverse ETFs',
        '✅ Tighten stop losses',
        '⚠️ Avoid buying dips',
        '💡 Look for bearish continuation patterns',
      ];
    case 'ranging':
      return [
        '✅ Enable mean reversion and grid strategies',
        '✅ Trade support/resistance bounces',
        '⚠️ Disable breakout strategies (many false signals)',
        '💡 Reduce position sizes until breakout',
      ];
    case 'volatile':
      return [
        '⚠️ Reduce position sizes by 50%',
        '⚠️ Widen stop losses to avoid whipsaws',
        '✅ Consider volatility strategies (straddles, strangles)',
        '💡 Wait for clearer regime before aggressive entries',
      ];
    default:
      return [
        '⏸️ Market regime unclear',
        '💡 Consider reducing exposure until regime clarifies',
        '👀 Monitor for regime confirmation',
      ];
  }
}

// Format regime for display
function formatRegime(regime: MarketRegime): string {
  const emojis: Record<MarketRegime, string> = {
    trending_up: '📈',
    trending_down: '📉',
    ranging: '↔️',
    volatile: '⚡',
    unknown: '❓',
  };
  return `${emojis[regime]} ${regime.replace('_', ' ').toUpperCase()}`;
}

// Main handler
const handler = async (event: HookEvent): Promise<void> => {
  // Only trigger on heartbeat or signal events
  if (event.type === 'gateway' && event.action !== 'heartbeat') {
    return;
  }

  const now = new Date();
  const state = loadState();
  const previousStates = { ...state.states };

  // Get symbols from config or use defaults
  const symbolsEnv = process.env.MRD_SYMBOLS;
  const symbols = symbolsEnv ? symbolsEnv.split(',').map((s) => s.trim()) : DEFAULT_SYMBOLS;

  const alertOnChange = process.env.MRD_ALERT_ON_CHANGE !== 'false';

  // Analyze each symbol
  for (const symbol of symbols) {
    const indicators = calculateIndicators(symbol);
    const { regime, confidence } = detectRegime(indicators);
    const recommendations = getRecommendations(regime);

    const newState: RegimeState = {
      symbol,
      regime,
      confidence,
      indicators,
      recommendation: recommendations,
      timestamp: now.toISOString(),
    };

    // Check for regime change
    const previousRegime = previousStates[symbol]?.regime;
    if (previousRegime && previousRegime !== regime && previousRegime !== 'unknown') {
      // Log the change
      logRegimeChange(symbol, previousRegime, regime);

      // Track in state
      state.changes.push({
        symbol,
        from: previousRegime,
        to: regime,
        timestamp: now.toISOString(),
      });

      // Alert user if enabled
      if (alertOnChange) {
        event.messages.push(
          `🎯 **Regime Change: ${symbol}**\n` +
            `${formatRegime(previousRegime)} → ${formatRegime(regime)}\n` +
            `Confidence: ${confidence.toFixed(0)}%\n\n` +
            `**Recommendations:**\n${recommendations.slice(0, 2).join('\n')}`
        );
      }
    }

    state.states[symbol] = newState;
  }

  state.lastUpdate = now.toISOString();
  saveState(state);
};

export default handler;
