/**
 * K.I.T. Proactive Agent Tools
 * Makes K.I.T. a TRUE autonomous financial agent
 * 
 * Features:
 * - Market Monitoring (price alerts, opportunities)
 * - Autonomous Trading Decisions
 * - Telegram Notifications
 * - Passive Income Tracking
 * - Portfolio Rebalancing
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { ToolDefinition as ChatToolDef } from '../gateway/chat-manager';

const KIT_HOME = path.join(os.homedir(), '.kit');
const AGENT_STATE_PATH = path.join(KIT_HOME, 'agent_state.json');

// ============================================================================
// Types
// ============================================================================

interface PriceAlert {
  id: string;
  symbol: string;
  condition: 'above' | 'below' | 'cross';
  price: number;
  triggered: boolean;
  createdAt: string;
  triggeredAt?: string;
  notifyTelegram: boolean;
}

interface PassiveIncome {
  id: string;
  type: 'staking' | 'yield_farming' | 'lending' | 'airdrop' | 'dividend';
  platform: string;
  asset: string;
  amount: number;
  apy?: number;
  startDate: string;
  nextPayout?: string;
  totalEarned: number;
  notes?: string;
}

interface MarketOpportunity {
  id: string;
  symbol: string;
  type: 'oversold' | 'overbought' | 'breakout' | 'support' | 'resistance' | 'divergence';
  confidence: number;
  suggestedAction: 'buy' | 'sell' | 'watch';
  reason: string;
  detectedAt: string;
  price: number;
}

interface AgentState {
  alerts: PriceAlert[];
  passiveIncome: PassiveIncome[];
  opportunities: MarketOpportunity[];
  watchlist: string[];
  lastMarketCheck: string;
  dailyReport: {
    date: string;
    sent: boolean;
  };
  settings: {
    autoTrade: boolean;
    maxDailyTrades: number;
    maxRiskPercent: number;
    notifyOnOpportunity: boolean;
    morningReportTime: string;  // "09:00"
    eveningReportTime: string;  // "21:00"
  };
}

// ============================================================================
// State Management
// ============================================================================

function loadState(): AgentState {
  try {
    if (fs.existsSync(AGENT_STATE_PATH)) {
      return JSON.parse(fs.readFileSync(AGENT_STATE_PATH, 'utf8'));
    }
  } catch {}
  
  return {
    alerts: [],
    passiveIncome: [],
    opportunities: [],
    watchlist: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT'],
    lastMarketCheck: '',
    dailyReport: { date: '', sent: false },
    settings: {
      autoTrade: false,
      maxDailyTrades: 10,
      maxRiskPercent: 2,
      notifyOnOpportunity: true,
      morningReportTime: '09:00',
      eveningReportTime: '21:00',
    }
  };
}

function saveState(state: AgentState): void {
  if (!fs.existsSync(KIT_HOME)) {
    fs.mkdirSync(KIT_HOME, { recursive: true });
  }
  fs.writeFileSync(AGENT_STATE_PATH, JSON.stringify(state, null, 2));
}

// ============================================================================
// Tool Definitions
// ============================================================================

export const PROACTIVE_AGENT_TOOLS: ChatToolDef[] = [
  // ========== PRICE ALERTS ==========
  {
    name: 'alert_create',
    description: 'Create a price alert. K.I.T. will notify you via Telegram when triggered.',
    parameters: {
      type: 'object',
      properties: {
        symbol: { type: 'string', description: 'Asset symbol (BTCUSDT, XAUUSD, etc.)' },
        condition: { type: 'string', enum: ['above', 'below', 'cross'], description: 'Alert condition' },
        price: { type: 'number', description: 'Target price' },
        notifyTelegram: { type: 'boolean', description: 'Send Telegram notification', default: true },
      },
      required: ['symbol', 'condition', 'price'],
    },
  },
  {
    name: 'alert_list',
    description: 'List all active price alerts',
    parameters: { type: 'object', properties: {} },
  },
  {
    name: 'alert_delete',
    description: 'Delete a price alert',
    parameters: {
      type: 'object',
      properties: { id: { type: 'string', description: 'Alert ID' } },
      required: ['id'],
    },
  },

  // ========== PASSIVE INCOME TRACKING ==========
  {
    name: 'passive_add',
    description: 'Track a passive income source (staking, yield farming, airdrops, dividends)',
    parameters: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['staking', 'yield_farming', 'lending', 'airdrop', 'dividend'] },
        platform: { type: 'string', description: 'Platform name (Binance, Lido, Aave, etc.)' },
        asset: { type: 'string', description: 'Asset being staked/farmed' },
        amount: { type: 'number', description: 'Amount invested/staked' },
        apy: { type: 'number', description: 'Annual percentage yield (optional)' },
        nextPayout: { type: 'string', description: 'Next expected payout date (ISO)' },
        notes: { type: 'string', description: 'Additional notes' },
      },
      required: ['type', 'platform', 'asset', 'amount'],
    },
  },
  {
    name: 'passive_list',
    description: 'List all passive income sources and their earnings',
    parameters: { type: 'object', properties: {} },
  },
  {
    name: 'passive_update',
    description: 'Update passive income earnings (record a payout)',
    parameters: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Passive income ID' },
        earned: { type: 'number', description: 'Amount earned in this payout' },
        nextPayout: { type: 'string', description: 'Next payout date' },
      },
      required: ['id', 'earned'],
    },
  },
  {
    name: 'passive_remove',
    description: 'Remove a passive income tracker',
    parameters: {
      type: 'object',
      properties: { id: { type: 'string', description: 'Passive income ID' } },
      required: ['id'],
    },
  },

  // ========== MARKET MONITORING ==========
  {
    name: 'market_scan',
    description: 'Scan markets for opportunities (RSI oversold/overbought, breakouts, etc.)',
    parameters: {
      type: 'object',
      properties: {
        symbols: { type: 'array', items: { type: 'string' }, description: 'Symbols to scan (default: watchlist)' },
        scanType: { type: 'string', enum: ['all', 'oversold', 'overbought', 'breakout'], description: 'Type of scan' },
      },
    },
  },
  {
    name: 'watchlist_add',
    description: 'Add symbol to market watchlist for monitoring',
    parameters: {
      type: 'object',
      properties: { symbol: { type: 'string', description: 'Symbol to watch' } },
      required: ['symbol'],
    },
  },
  {
    name: 'watchlist_remove',
    description: 'Remove symbol from watchlist',
    parameters: {
      type: 'object',
      properties: { symbol: { type: 'string', description: 'Symbol to remove' } },
      required: ['symbol'],
    },
  },
  {
    name: 'watchlist_list',
    description: 'Show current watchlist',
    parameters: { type: 'object', properties: {} },
  },

  // ========== AUTONOMOUS SETTINGS ==========
  {
    name: 'agent_settings',
    description: 'View or update autonomous agent settings',
    parameters: {
      type: 'object',
      properties: {
        autoTrade: { type: 'boolean', description: 'Enable autonomous trading' },
        maxDailyTrades: { type: 'number', description: 'Max trades per day' },
        maxRiskPercent: { type: 'number', description: 'Max risk per trade (%)' },
        notifyOnOpportunity: { type: 'boolean', description: 'Notify when opportunity found' },
        morningReportTime: { type: 'string', description: 'Morning report time (HH:MM)' },
        eveningReportTime: { type: 'string', description: 'Evening report time (HH:MM)' },
      },
    },
  },

  // ========== REPORTS ==========
  {
    name: 'daily_report',
    description: 'Generate daily financial report (portfolio, P&L, opportunities)',
    parameters: { type: 'object', properties: {} },
  },
  {
    name: 'portfolio_summary',
    description: 'Get complete portfolio summary across all platforms',
    parameters: { type: 'object', properties: {} },
  },
];

// ============================================================================
// Tool Handlers
// ============================================================================

export async function handleProactiveAgentTool(
  toolName: string,
  args: Record<string, any>
): Promise<string> {
  const state = loadState();

  switch (toolName) {
    // ========== ALERTS ==========
    case 'alert_create': {
      const alert: PriceAlert = {
        id: `alert_${Date.now()}`,
        symbol: args.symbol.toUpperCase(),
        condition: args.condition,
        price: args.price,
        triggered: false,
        createdAt: new Date().toISOString(),
        notifyTelegram: args.notifyTelegram !== false,
      };
      state.alerts.push(alert);
      saveState(state);
      return `✅ Alert created!\n\n📊 ${alert.symbol}\n⚡ Notify when price goes ${alert.condition} ${alert.price}\n🔔 Telegram: ${alert.notifyTelegram ? 'Yes' : 'No'}\n\nID: ${alert.id}`;
    }

    case 'alert_list': {
      if (state.alerts.length === 0) {
        return '📭 No active alerts.\n\nUse `alert_create` to set up price alerts!';
      }
      const lines = state.alerts.map(a => 
        `${a.triggered ? '✅' : '⏳'} ${a.symbol} ${a.condition} ${a.price} ${a.triggered ? `(triggered ${a.triggeredAt})` : ''}`
      );
      return `🔔 **Price Alerts**\n\n${lines.join('\n')}`;
    }

    case 'alert_delete': {
      const idx = state.alerts.findIndex(a => a.id === args.id);
      if (idx === -1) return '❌ Alert not found';
      state.alerts.splice(idx, 1);
      saveState(state);
      return '✅ Alert deleted';
    }

    // ========== PASSIVE INCOME ==========
    case 'passive_add': {
      const income: PassiveIncome = {
        id: `passive_${Date.now()}`,
        type: args.type,
        platform: args.platform,
        asset: args.asset,
        amount: args.amount,
        apy: args.apy,
        startDate: new Date().toISOString(),
        nextPayout: args.nextPayout,
        totalEarned: 0,
        notes: args.notes,
      };
      state.passiveIncome.push(income);
      saveState(state);
      return `✅ Passive income tracker added!\n\n💰 ${income.type.toUpperCase()}\n📍 ${income.platform}\n🪙 ${income.amount} ${income.asset}\n📈 APY: ${income.apy ? income.apy + '%' : 'N/A'}\n\nID: ${income.id}`;
    }

    case 'passive_list': {
      if (state.passiveIncome.length === 0) {
        return '📭 No passive income tracked yet.\n\nUse `passive_add` to track staking, yield farming, airdrops!';
      }
      
      let totalValue = 0;
      let totalEarned = 0;
      
      const lines = state.passiveIncome.map(p => {
        totalValue += p.amount;
        totalEarned += p.totalEarned;
        return `${getPassiveIcon(p.type)} **${p.platform}**\n   ${p.amount} ${p.asset} | APY: ${p.apy || '?'}% | Earned: $${p.totalEarned.toFixed(2)}`;
      });
      
      return `💰 **Passive Income Tracking**\n\n${lines.join('\n\n')}\n\n---\n📊 Total Invested: $${totalValue.toLocaleString()}\n💵 Total Earned: $${totalEarned.toFixed(2)}`;
    }

    case 'passive_update': {
      const income = state.passiveIncome.find(p => p.id === args.id);
      if (!income) return '❌ Passive income not found';
      income.totalEarned += args.earned;
      if (args.nextPayout) income.nextPayout = args.nextPayout;
      saveState(state);
      return `✅ Recorded $${args.earned} payout!\n\nTotal earned from ${income.platform}: $${income.totalEarned.toFixed(2)}`;
    }

    case 'passive_remove': {
      const idx = state.passiveIncome.findIndex(p => p.id === args.id);
      if (idx === -1) return '❌ Not found';
      state.passiveIncome.splice(idx, 1);
      saveState(state);
      return '✅ Passive income tracker removed';
    }

    // ========== WATCHLIST ==========
    case 'watchlist_add': {
      const symbol = args.symbol.toUpperCase();
      if (state.watchlist.includes(symbol)) {
        return `📊 ${symbol} is already in your watchlist`;
      }
      state.watchlist.push(symbol);
      saveState(state);
      return `✅ Added ${symbol} to watchlist\n\n📊 Watchlist: ${state.watchlist.join(', ')}`;
    }

    case 'watchlist_remove': {
      const symbol = args.symbol.toUpperCase();
      const idx = state.watchlist.indexOf(symbol);
      if (idx === -1) return `❌ ${symbol} not in watchlist`;
      state.watchlist.splice(idx, 1);
      saveState(state);
      return `✅ Removed ${symbol} from watchlist`;
    }

    case 'watchlist_list': {
      return `📊 **Market Watchlist**\n\n${state.watchlist.join(', ') || 'Empty'}\n\nK.I.T. monitors these for opportunities during heartbeats.`;
    }

    // ========== MARKET SCAN ==========
    case 'market_scan': {
      // This would connect to real market data in production
      // For now, return a placeholder that shows the structure
      const symbols = args.symbols || state.watchlist;
      state.lastMarketCheck = new Date().toISOString();
      saveState(state);
      
      return `🔍 **Market Scan Complete**\n\nScanned: ${symbols.join(', ')}\n\n⚠️ Market data integration needed. Connect MT5 or exchange API for live scanning.\n\nLast check: ${state.lastMarketCheck}`;
    }

    // ========== SETTINGS ==========
    case 'agent_settings': {
      // Update settings if any provided
      let updated = false;
      if (args.autoTrade !== undefined) { state.settings.autoTrade = args.autoTrade; updated = true; }
      if (args.maxDailyTrades !== undefined) { state.settings.maxDailyTrades = args.maxDailyTrades; updated = true; }
      if (args.maxRiskPercent !== undefined) { state.settings.maxRiskPercent = args.maxRiskPercent; updated = true; }
      if (args.notifyOnOpportunity !== undefined) { state.settings.notifyOnOpportunity = args.notifyOnOpportunity; updated = true; }
      if (args.morningReportTime !== undefined) { state.settings.morningReportTime = args.morningReportTime; updated = true; }
      if (args.eveningReportTime !== undefined) { state.settings.eveningReportTime = args.eveningReportTime; updated = true; }
      
      if (updated) saveState(state);
      
      return `⚙️ **K.I.T. Agent Settings**\n\n${updated ? '✅ Settings updated!\n\n' : ''}🤖 Auto-Trade: ${state.settings.autoTrade ? '✅ ON' : '❌ OFF'}\n📊 Max Daily Trades: ${state.settings.maxDailyTrades}\n⚠️ Max Risk: ${state.settings.maxRiskPercent}%\n🔔 Notify Opportunities: ${state.settings.notifyOnOpportunity ? 'Yes' : 'No'}\n🌅 Morning Report: ${state.settings.morningReportTime}\n🌙 Evening Report: ${state.settings.eveningReportTime}`;
    }

    // ========== REPORTS ==========
    case 'daily_report': {
      // Generate comprehensive daily report
      const report = generateDailyReport(state);
      state.dailyReport = { date: new Date().toISOString().split('T')[0], sent: true };
      saveState(state);
      return report;
    }

    case 'portfolio_summary': {
      return generatePortfolioSummary(state);
    }

    default:
      return `❌ Unknown tool: ${toolName}`;
  }
}

// ============================================================================
// Helpers
// ============================================================================

function getPassiveIcon(type: string): string {
  switch (type) {
    case 'staking': return '🥩';
    case 'yield_farming': return '🌾';
    case 'lending': return '🏦';
    case 'airdrop': return '🪂';
    case 'dividend': return '💹';
    default: return '💰';
  }
}

function generateDailyReport(state: AgentState): string {
  const now = new Date();
  const dateStr = now.toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  
  // Count passive income
  const totalPassiveValue = state.passiveIncome.reduce((sum, p) => sum + p.amount, 0);
  const totalPassiveEarned = state.passiveIncome.reduce((sum, p) => sum + p.totalEarned, 0);
  
  // Active alerts
  const activeAlerts = state.alerts.filter(a => !a.triggered).length;
  const triggeredToday = state.alerts.filter(a => a.triggered && a.triggeredAt?.startsWith(now.toISOString().split('T')[0])).length;
  
  return `📊 **K.I.T. Daily Report**
📅 ${dateStr}

━━━━━━━━━━━━━━━━━━━━

💰 **Passive Income**
• Positions: ${state.passiveIncome.length}
• Total Staked: $${totalPassiveValue.toLocaleString()}
• Total Earned: $${totalPassiveEarned.toFixed(2)}

🔔 **Alerts**
• Active: ${activeAlerts}
• Triggered Today: ${triggeredToday}

📊 **Watchlist**
${state.watchlist.join(', ') || 'Empty'}

⚙️ **Agent Status**
• Auto-Trade: ${state.settings.autoTrade ? '✅ ON' : '❌ OFF'}
• Last Scan: ${state.lastMarketCheck || 'Never'}

━━━━━━━━━━━━━━━━━━━━

_K.I.T. - Your Autonomous Financial Agent_ 🤖`;
}

function generatePortfolioSummary(state: AgentState): string {
  // This would aggregate from all connected platforms
  const passiveTotal = state.passiveIncome.reduce((sum, p) => sum + p.amount, 0);
  
  return `💼 **Portfolio Summary**

📍 **Connected Platforms**
• BinaryFaster (Binary Options): _Connect to see balance_
• MT5 (Forex): _Connect to see balance_
• Binance (Crypto): _Connect to see balance_
• Bybit (Crypto): _Connect to see balance_
• Kraken (Crypto): _Connect to see balance_

💰 **Passive Income Deployed**
$${passiveTotal.toLocaleString()}

📊 **Tracked Positions**
${state.passiveIncome.length} passive income sources

━━━━━━━━━━━━━━━━━━━━

_Use platform connections to see full portfolio value_`;
}

// ============================================================================
// Heartbeat Handler (called periodically)
// ============================================================================

export async function runProactiveHeartbeat(): Promise<string[]> {
  const state = loadState();
  const notifications: string[] = [];
  
  // 1. Check if daily report should be sent
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const currentTime = now.toTimeString().slice(0, 5);
  
  if (state.dailyReport.date !== todayStr) {
    // Check morning report
    if (currentTime >= state.settings.morningReportTime && currentTime < '12:00') {
      notifications.push(generateDailyReport(state));
      state.dailyReport = { date: todayStr, sent: true };
    }
  }
  
  // 2. Check price alerts (would need real price data)
  // TODO: Integrate with exchange APIs
  
  // 3. Scan for opportunities (would need market data)
  // TODO: Integrate technical analysis
  
  state.lastMarketCheck = now.toISOString();
  saveState(state);
  
  return notifications;
}
