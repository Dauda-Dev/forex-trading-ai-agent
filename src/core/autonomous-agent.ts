/**
 * K.I.T. AUTONOMOUS AGENT CORE
 * 
 * The brain that makes K.I.T. truly autonomous.
 * Runs 24/7, monitors markets, executes trades, sends alerts.
 * 
 * Features:
 * - Multi-platform trading (BinaryFaster, Binance, MT5, Bybit)
 * - Real-time market monitoring
 * - Autonomous trade execution
 * - Telegram notifications
 * - Portfolio rebalancing
 * - Passive income tracking
 * - Tax optimization
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';
import { EventEmitter } from 'events';
import { getPythonPath } from '../tools/skill-bridge';
import { ExchangeManager, SupportedExchange } from '../exchanges/exchange-manager';
import { initDatabase, insertTrade } from '../persistence';

const KIT_HOME = path.join(os.homedir(), '.kit');
const AGENT_STATE_PATH = path.join(KIT_HOME, 'autonomous_state.json');

// ============================================================================
// Types
// ============================================================================

export interface PlatformConnection {
  platform: 'binance' | 'mt5' | 'binaryfaster' | 'bybit' | 'kraken' | 'coinbase';
  credentials: Record<string, string>;
  enabled: boolean;
  lastSync: string;
  balance?: number;
  currency?: string;
}

export interface PriceAlert {
  id: string;
  symbol: string;
  condition: 'above' | 'below' | 'cross_up' | 'cross_down' | 'percent_change';
  targetPrice?: number;
  percentChange?: number;
  basePrice?: number;
  triggered: boolean;
  createdAt: string;
  triggeredAt?: string;
  notifyTelegram: boolean;
  executeAction?: TradeAction;
}

export interface TradeAction {
  type: 'buy' | 'sell' | 'close';
  platform: string;
  symbol: string;
  amount?: number;
  percentOfBalance?: number;
}

export interface PassivePosition {
  id: string;
  type: 'staking' | 'yield_farming' | 'lending' | 'liquidity_pool' | 'airdrop' | 'dividend';
  platform: string;
  protocol?: string;
  asset: string;
  amount: number;
  valueUSD: number;
  apy?: number;
  rewards: number;
  startDate: string;
  lockEndDate?: string;
  nextClaimDate?: string;
  autoCompound: boolean;
  notes?: string;
}

export interface PortfolioAllocation {
  asset: string;
  targetPercent: number;
  currentPercent?: number;
  currentValue?: number;
  rebalanceThreshold: number; // Rebalance if deviation > this %
}

export interface TaxLot {
  id: string;
  asset: string;
  amount: number;
  costBasis: number;
  acquiredAt: string;
  platform: string;
  type: 'buy' | 'airdrop' | 'staking_reward' | 'mining';
}

export interface MarketOpportunity {
  id: string;
  symbol: string;
  type: 'oversold' | 'overbought' | 'breakout' | 'divergence' | 'whale_move' | 'news';
  confidence: number; // 0-100
  suggestedAction: 'buy' | 'sell' | 'watch';
  reason: string;
  detectedAt: string;
  currentPrice: number;
  targetPrice?: number;
  stopLoss?: number;
  expiresAt?: string;
}

export interface AutonomousState {
  // Core settings
  enabled: boolean;
  paperTrading: boolean;
  lastHeartbeat: string;
  heartbeatIntervalMs: number;
  
  // Platform connections
  platforms: PlatformConnection[];
  
  // Portfolio
  totalValueUSD: number;
  portfolioLastUpdated: string;
  targetAllocations: PortfolioAllocation[];
  autoRebalance: boolean;
  rebalanceCheckHours: number;
  lastRebalanceCheck: string;
  
  // Alerts & Monitoring
  priceAlerts: PriceAlert[];
  watchlist: string[];
  monitoredSymbols: Map<string, { lastPrice: number; lastCheck: string }>;
  
  // Passive Income
  passivePositions: PassivePosition[];
  totalPassiveValueUSD: number;
  totalRewardsEarned: number;
  
  // Tax Tracking
  taxLots: TaxLot[];
  realizedGains2024: number;
  unrealizedGains: number;
  taxLossHarvestingEnabled: boolean;
  
  // Opportunities
  opportunities: MarketOpportunity[];
  autoTradeOpportunities: boolean;
  maxAutoTradeRiskPercent: number;
  
  // Trading limits
  maxDailyTrades: number;
  tradesToday: number;
  maxDailyLossPercent: number;
  currentDailyPnL: number;
  tradingPaused: boolean;
  pauseReason?: string;
  
  // Notifications
  telegramChatId?: string;
  notifyOnTrade: boolean;
  notifyOnAlert: boolean;
  notifyOnOpportunity: boolean;
  dailyReportTime: string; // "09:00"
  lastDailyReport: string;
  
  // Statistics
  totalTradesExecuted: number;
  totalPnL: number;
  winRate: number;
}

// ============================================================================
// Default State
// ============================================================================

function getDefaultState(): AutonomousState {
  return {
    enabled: false,
    paperTrading: true,
    lastHeartbeat: '',
    heartbeatIntervalMs: 60000, // 1 minute
    
    platforms: [],
    
    totalValueUSD: 0,
    portfolioLastUpdated: '',
    targetAllocations: [
      { asset: 'BTC', targetPercent: 40, rebalanceThreshold: 5 },
      { asset: 'ETH', targetPercent: 30, rebalanceThreshold: 5 },
      { asset: 'USDT', targetPercent: 20, rebalanceThreshold: 5 },
      { asset: 'OTHER', targetPercent: 10, rebalanceThreshold: 10 },
    ],
    autoRebalance: false,
    rebalanceCheckHours: 24,
    lastRebalanceCheck: '',
    
    priceAlerts: [],
    watchlist: ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT'],
    monitoredSymbols: new Map(),
    
    passivePositions: [],
    totalPassiveValueUSD: 0,
    totalRewardsEarned: 0,
    
    taxLots: [],
    realizedGains2024: 0,
    unrealizedGains: 0,
    taxLossHarvestingEnabled: true,
    
    opportunities: [],
    autoTradeOpportunities: false,
    maxAutoTradeRiskPercent: 2,
    
    maxDailyTrades: 20,
    tradesToday: 0,
    maxDailyLossPercent: 5,
    currentDailyPnL: 0,
    tradingPaused: false,
    
    telegramChatId: undefined,
    notifyOnTrade: true,
    notifyOnAlert: true,
    notifyOnOpportunity: true,
    dailyReportTime: '09:00',
    lastDailyReport: '',
    
    totalTradesExecuted: 0,
    totalPnL: 0,
    winRate: 0,
  };
}

// ============================================================================
// State Management
// ============================================================================

function loadState(): AutonomousState {
  try {
    if (fs.existsSync(AGENT_STATE_PATH)) {
      const data = JSON.parse(fs.readFileSync(AGENT_STATE_PATH, 'utf8'));
      // Convert Map from array
      if (data.monitoredSymbols && Array.isArray(data.monitoredSymbols)) {
        data.monitoredSymbols = new Map(data.monitoredSymbols);
      } else {
        data.monitoredSymbols = new Map();
      }
      return { ...getDefaultState(), ...data };
    }
  } catch (e) {
    console.error('Failed to load autonomous state:', e);
  }
  return getDefaultState();
}

function saveState(state: AutonomousState): void {
  try {
    if (!fs.existsSync(KIT_HOME)) {
      fs.mkdirSync(KIT_HOME, { recursive: true });
    }
    // Convert Map to array for JSON
    const toSave = {
      ...state,
      monitoredSymbols: Array.from(state.monitoredSymbols.entries()),
    };
    fs.writeFileSync(AGENT_STATE_PATH, JSON.stringify(toSave, null, 2));
  } catch (e) {
    console.error('Failed to save autonomous state:', e);
  }
}

// ============================================================================
// Market Data Fetchers
// ============================================================================

async function fetchBinancePrice(symbol: string): Promise<number | null> {
  try {
    const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
    const data = await res.json();
    return parseFloat(data.price);
  } catch {
    return null;
  }
}

async function fetchCoinGeckoPrice(coinId: string): Promise<number | null> {
  try {
    const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`);
    const data = await res.json();
    return data[coinId]?.usd || null;
  } catch {
    return null;
  }
}

async function fetchForexPrice(pair: string): Promise<number | null> {
  // Use free forex API
  try {
    const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${pair.slice(0,3)}`);
    const data = await res.json();
    return data.rates[pair.slice(3)] || null;
  } catch {
    return null;
  }
}

async function getPrice(symbol: string): Promise<number | null> {
  // Determine source based on symbol
  if (symbol.endsWith('USDT') || symbol.endsWith('BUSD') || symbol.endsWith('BTC')) {
    return fetchBinancePrice(symbol);
  } else if (symbol === 'XAUUSD' || symbol === 'XAGUSD') {
    // Gold/Silver - use CoinGecko's gold price or a forex API
    return fetchCoinGeckoPrice('gold');
  } else if (symbol.length === 6 && !symbol.includes('USD')) {
    // Forex pair
    return fetchForexPrice(symbol);
  } else {
    // Try Binance first, then CoinGecko
    const binancePrice = await fetchBinancePrice(symbol + 'USDT');
    if (binancePrice) return binancePrice;
    return fetchCoinGeckoPrice(symbol.toLowerCase());
  }
}

// ============================================================================
// Platform Connectors
// ============================================================================

async function getBinanceBalance(apiKey: string, apiSecret: string): Promise<{ total: number; assets: Record<string, number> }> {
  try {
    const timestamp = Date.now();
    const queryString = `timestamp=${timestamp}`;
    const signature = crypto
      .createHmac('sha256', apiSecret)
      .update(queryString)
      .digest('hex');

    const res = await fetch(
      `https://api.binance.com/api/v3/account?${queryString}&signature=${signature}`,
      {
        headers: { 'X-MBX-APIKEY': apiKey },
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('Binance balance fetch failed:', err.msg || res.statusText);
      return { total: 0, assets: {} };
    }

    const data = await res.json();
    const assets: Record<string, number> = {};
    let total = 0;

    for (const bal of data.balances || []) {
      const free = parseFloat(bal.free);
      const locked = parseFloat(bal.locked);
      const amount = free + locked;
      if (amount > 0) {
        assets[bal.asset] = amount;
      }
    }

    // Estimate total USD value using Binance ticker prices
    for (const [asset, amount] of Object.entries(assets)) {
      if (asset === 'USDT' || asset === 'BUSD' || asset === 'USDC' || asset === 'FDUSD') {
        total += amount;
      } else {
        try {
          const priceRes = await fetch(
            `https://api.binance.com/api/v3/ticker/price?symbol=${asset}USDT`
          );
          if (priceRes.ok) {
            const priceData = await priceRes.json();
            total += amount * parseFloat(priceData.price);
          }
        } catch {
          // Skip assets without USDT pair
        }
      }
    }

    return { total, assets };
  } catch (error) {
    console.error('Binance balance error:', error);
    return { total: 0, assets: {} };
  }
}

async function getMT5Balance(): Promise<{ balance: number; equity: number; profit: number }> {
  // Uses local MT5 connection via Python (auto-detects Python path)
  try {
    const { execSync } = require('child_process');
    const pythonPath = getPythonPath();
    const result = execSync(`${pythonPath} -c "import MetaTrader5 as mt5; mt5.initialize(); info = mt5.account_info(); print(info.balance, info.equity, info.profit)"`, { encoding: 'utf8' });
    const [balance, equity, profit] = result.trim().split(' ').map(Number);
    return { balance, equity, profit };
  } catch {
    return { balance: 0, equity: 0, profit: 0 };
  }
}

async function getBinaryFasterBalance(email: string, password: string): Promise<number> {
  try {
    // Login
    const loginRes = await fetch('https://wsauto.binaryfaster.com/automation/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const loginData = await loginRes.json();
    const apiKey = loginData.api_key;
    
    if (!apiKey) return 0;
    
    // Set real mode
    await fetch('https://wsauto.binaryfaster.com/automation/traderoom/setdemo/0', {
      headers: { 'x-api-key': apiKey },
    });
    
    // Get balance
    const balRes = await fetch('https://wsauto.binaryfaster.com/automation/user/balance', {
      headers: { 'x-api-key': apiKey },
    });
    const balData = await balRes.json();
    return balData.real || balData.balance || 0;
  } catch {
    return 0;
  }
}

// ============================================================================
// Autonomous Agent Class
// ============================================================================

export class AutonomousAgent extends EventEmitter {
  private state: AutonomousState;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private telegramBot: any = null;

  constructor() {
    super();
    this.state = loadState();
  }

  // ========== CORE CONTROL ==========
  
  async start(): Promise<string> {
    if (this.state.enabled) {
      return '⚠️ K.I.T. Autonomous Agent is already running';
    }
    
    this.state.enabled = true;
    this.state.lastHeartbeat = new Date().toISOString();
    saveState(this.state);
    
    // Start heartbeat loop
    this.startHeartbeat();
    
    // Initial portfolio sync
    await this.syncAllPlatforms();
    
    return `🤖 **K.I.T. Autonomous Agent ACTIVATED**

✅ Mode: ${this.state.paperTrading ? '📝 PAPER TRADING (no real trades)' : '💰 LIVE TRADING'}
✅ Heartbeat: Every ${this.state.heartbeatIntervalMs / 1000}s
✅ Platforms: ${this.state.platforms.length} connected
✅ Watchlist: ${this.state.watchlist.length} symbols
✅ Alerts: ${this.state.priceAlerts.length} active
✅ Passive Positions: ${this.state.passivePositions.length}

K.I.T. is now monitoring markets 24/7.`;
  }

  async stop(): Promise<string> {
    this.state.enabled = false;
    saveState(this.state);
    
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    
    return '🛑 K.I.T. Autonomous Agent stopped';
  }

  getStatus(): string {
    const s = this.state;
    return `🤖 **K.I.T. Autonomous Agent Status**

**Core**
• Status: ${s.enabled ? '✅ ACTIVE' : '❌ STOPPED'}
• Last Heartbeat: ${s.lastHeartbeat || 'Never'}
• Heartbeat Interval: ${s.heartbeatIntervalMs / 1000}s

**Portfolio**
• Total Value: $${s.totalValueUSD.toLocaleString()}
• Platforms: ${s.platforms.filter(p => p.enabled).length} active
• Auto-Rebalance: ${s.autoRebalance ? 'ON' : 'OFF'}

**Trading**
• Today's Trades: ${s.tradesToday}/${s.maxDailyTrades}
• Today's P&L: $${s.currentDailyPnL.toFixed(2)}
• Auto-Trade: ${s.autoTradeOpportunities ? 'ON' : 'OFF'}
• Paused: ${s.tradingPaused ? `YES (${s.pauseReason})` : 'NO'}

**Monitoring**
• Watchlist: ${s.watchlist.length} symbols
• Price Alerts: ${s.priceAlerts.filter(a => !a.triggered).length} active
• Opportunities: ${s.opportunities.length} detected

**Passive Income**
• Positions: ${s.passivePositions.length}
• Total Value: $${s.totalPassiveValueUSD.toLocaleString()}
• Total Rewards: $${s.totalRewardsEarned.toFixed(2)}

**Statistics**
• Total Trades: ${s.totalTradesExecuted}
• Total P&L: $${s.totalPnL.toFixed(2)}
• Win Rate: ${(s.winRate * 100).toFixed(1)}%`;
  }

  // ========== HEARTBEAT ==========

  private startHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }
    
    this.heartbeatTimer = setInterval(async () => {
      await this.runHeartbeat();
    }, this.state.heartbeatIntervalMs);
    
    // Run immediately
    this.runHeartbeat();
  }

  private async runHeartbeat(): Promise<void> {
    if (!this.state.enabled) return;
    
    const now = new Date();
    this.state.lastHeartbeat = now.toISOString();
    
    // Check active hours (skip during quiet time)
    const hour = now.getHours();
    const quietHoursStart = 23;
    const quietHoursEnd = 7;
    const isQuietHours = hour >= quietHoursStart || hour < quietHoursEnd;
    
    try {
      // Load HEARTBEAT.md checklist (like OpenClaw)
      let heartbeatChecklist: string | null = null;
      try {
        const { getHeartbeatChecklist, appendToMemory } = require('./workspace-loader');
        heartbeatChecklist = getHeartbeatChecklist();
      } catch (e) {
        // Workspace loader not available, continue with defaults
      }
      
      // 1. Check price alerts (always)
      await this.checkPriceAlerts();
      
      // 2. Scan for opportunities (skip during quiet hours unless urgent)
      if (!isQuietHours) {
        await this.scanOpportunities();
      }
      
      // 3. Check if rebalance needed (skip during quiet hours)
      if (!isQuietHours) {
        await this.checkRebalance();
      }
      
      // 4. Check passive income (claims, compounds)
      await this.checkPassiveIncome();
      
      // 5. Check daily report
      await this.checkDailyReport();
      
      // 6. Reset daily counters at midnight
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        this.state.tradesToday = 0;
        this.state.currentDailyPnL = 0;
        
        // Log to daily memory
        try {
          const { appendToMemory } = require('./workspace-loader');
          appendToMemory('Daily counters reset. New trading day started.');
        } catch (e) {}
      }
      
      saveState(this.state);
    } catch (e) {
      console.error('Heartbeat error:', e);
    }
  }

  // ========== PRICE ALERTS ==========

  async addAlert(alert: Omit<PriceAlert, 'id' | 'createdAt' | 'triggered'>): Promise<string> {
    const newAlert: PriceAlert = {
      id: `alert_${Date.now()}`,
      createdAt: new Date().toISOString(),
      triggered: false,
      ...alert,
    };
    
    // Get current price as base
    const price = await getPrice(alert.symbol);
    if (price && alert.condition === 'percent_change') {
      newAlert.basePrice = price;
    }
    
    this.state.priceAlerts.push(newAlert);
    saveState(this.state);
    
    return `✅ Alert created: ${alert.symbol} ${alert.condition} ${alert.targetPrice || alert.percentChange + '%'}`;
  }

  private async checkPriceAlerts(): Promise<void> {
    for (const alert of this.state.priceAlerts) {
      if (alert.triggered) continue;
      
      const price = await getPrice(alert.symbol);
      if (!price) continue;
      
      let triggered = false;
      
      switch (alert.condition) {
        case 'above':
          triggered = price >= (alert.targetPrice || 0);
          break;
        case 'below':
          triggered = price <= (alert.targetPrice || 0);
          break;
        case 'percent_change':
          if (alert.basePrice) {
            const change = ((price - alert.basePrice) / alert.basePrice) * 100;
            triggered = Math.abs(change) >= (alert.percentChange || 0);
          }
          break;
      }
      
      if (triggered) {
        alert.triggered = true;
        alert.triggeredAt = new Date().toISOString();
        
        // Notify
        const msg = `🚨 **ALERT TRIGGERED**\n\n${alert.symbol}: $${price}\nCondition: ${alert.condition} ${alert.targetPrice || alert.percentChange + '%'}`;
        this.emit('notification', msg);
        
        // Execute action if configured
        if (alert.executeAction) {
          await this.executeTrade(alert.executeAction);
        }
      }
    }
  }

  // ========== OPPORTUNITY SCANNING ==========

  private async scanOpportunities(): Promise<void> {
    for (const symbol of this.state.watchlist) {
      const price = await getPrice(symbol);
      if (!price) continue;
      
      const lastData = this.state.monitoredSymbols.get(symbol);
      const now = new Date().toISOString();
      
      if (lastData) {
        // Calculate price change
        const change = ((price - lastData.lastPrice) / lastData.lastPrice) * 100;
        
        // Detect significant moves
        if (Math.abs(change) > 3) {
          const opportunity: MarketOpportunity = {
            id: `opp_${Date.now()}`,
            symbol,
            type: change > 0 ? 'breakout' : 'oversold',
            confidence: Math.min(Math.abs(change) * 10, 80),
            suggestedAction: change < -5 ? 'buy' : change > 5 ? 'sell' : 'watch',
            reason: `${change > 0 ? '+' : ''}${change.toFixed(2)}% move detected`,
            detectedAt: now,
            currentPrice: price,
          };
          
          this.state.opportunities.push(opportunity);
          
          if (this.state.notifyOnOpportunity) {
            this.emit('notification', `📊 **Opportunity Detected**\n\n${symbol}: ${opportunity.reason}\nSuggested: ${opportunity.suggestedAction.toUpperCase()}`);
          }
          
          // Auto-trade if enabled
          if (this.state.autoTradeOpportunities && opportunity.confidence > 70) {
            const action = opportunity.suggestedAction;
            const size = this.calculatePositionSize(opportunity.confidence);
            
            this.emit('trade_signal', {
              symbol,
              action,
              size,
              confidence: opportunity.confidence,
              reason: opportunity.reason,
              timestamp: new Date().toISOString(),
            });
            
            // Log the auto-trade decision
            this.emit('notification', `🤖 **Auto-Trade Triggered**\n\n${action.toUpperCase()} ${symbol}\nSize: ${size}%\nConfidence: ${opportunity.confidence}%`);
          }
        }
      }
      
      this.state.monitoredSymbols.set(symbol, { lastPrice: price, lastCheck: now });
    }
  }

  // ========== REBALANCING ==========

  private async checkRebalance(): Promise<void> {
    if (!this.state.autoRebalance) return;
    
    const hoursSinceLastCheck = this.state.lastRebalanceCheck 
      ? (Date.now() - new Date(this.state.lastRebalanceCheck).getTime()) / 3600000 
      : Infinity;
    
    if (hoursSinceLastCheck < this.state.rebalanceCheckHours) return;
    
    this.state.lastRebalanceCheck = new Date().toISOString();
    
    // Calculate current allocations and compare to targets
    const currentAllocations = this.calculateCurrentAllocations();
    const targetAllocations = this.state.targetAllocations || [];
    
    const rebalanceTrades: Array<{symbol: string; action: 'buy' | 'sell'; percentage: number}> = [];
    
    for (const allocation of targetAllocations) {
      const current = currentAllocations[allocation.asset] || 0;
      const diff = allocation.targetPercent - current;
      
      // Only rebalance if deviation > threshold
      if (Math.abs(diff) > allocation.rebalanceThreshold) {
        rebalanceTrades.push({
          symbol: allocation.asset,
          action: diff > 0 ? 'buy' : 'sell',
          percentage: Math.abs(diff),
        });
      }
    }
    
    if (rebalanceTrades.length > 0) {
      this.emit('notification', `⚖️ **Rebalance Needed**\n\n${rebalanceTrades.map(t => `${t.action.toUpperCase()} ${t.percentage.toFixed(1)}% ${t.symbol}`).join('\n')}`);
      
      // Emit rebalance signals for execution
      for (const trade of rebalanceTrades) {
        this.emit('rebalance_signal', trade);
      }
    }
  }

  private calculateCurrentAllocations(): Record<string, number> {
    // Calculate portfolio allocation percentages
    const allocations: Record<string, number> = {};
    const totalValue = this.state.totalValueUSD || 0;
    
    if (totalValue <= 0) return allocations;
    
    // Aggregate positions by asset
    for (const position of this.state.passivePositions) {
      const asset = position.asset;
      allocations[asset] = (allocations[asset] || 0) + (position.valueUSD / totalValue * 100);
    }
    
    return allocations;
  }

  private calculatePositionSize(confidence: number): number {
    // Calculate position size based on confidence and risk settings
    const baseSize = this.state.maxAutoTradeRiskPercent || 5;
    const confidenceMultiplier = confidence / 100;
    return Math.min(baseSize * confidenceMultiplier, baseSize);
  }

  // ========== PASSIVE INCOME ==========

  async addPassivePosition(position: Omit<PassivePosition, 'id' | 'startDate' | 'rewards'>): Promise<string> {
    const newPosition: PassivePosition = {
      id: `passive_${Date.now()}`,
      startDate: new Date().toISOString(),
      rewards: 0,
      ...position,
    };
    
    this.state.passivePositions.push(newPosition);
    this.state.totalPassiveValueUSD += position.valueUSD;
    saveState(this.state);
    
    return `✅ Passive position added: ${position.amount} ${position.asset} on ${position.platform}`;
  }

  private async checkPassiveIncome(): Promise<void> {
    const now = new Date();
    
    for (const position of this.state.passivePositions) {
      // Check if claim is due
      if (position.nextClaimDate && new Date(position.nextClaimDate) <= now) {
        this.emit('notification', `💰 **Rewards Ready to Claim**\n\n${position.asset} on ${position.platform}\nEstimated: ${((position.apy || 0) / 365 * position.valueUSD).toFixed(2)} USD`);
      }
      
      // Auto-compound if enabled
      if (position.autoCompound && position.rewards > 0) {
        const minCompoundAmount = 10; // USD minimum to compound
        if (position.rewards >= minCompoundAmount) {
          this.emit('compound_signal', {
            positionId: position.id,
            platform: position.platform,
            asset: position.asset,
            amount: position.rewards,
            timestamp: new Date().toISOString(),
          });
          
          this.emit('notification', `🔄 **Auto-Compound**\n\nCompounding ${position.rewards.toFixed(2)} USD of ${position.asset} rewards on ${position.platform}`);
          
          // Add to principal (reset rewards)
          position.valueUSD += position.rewards;
          position.rewards = 0;
        }
      }
    }
  }

  // ========== DAILY REPORT ==========

  private async checkDailyReport(): Promise<void> {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    const todayStr = now.toISOString().split('T')[0];
    
    if (this.state.lastDailyReport === todayStr) return;
    if (currentTime < this.state.dailyReportTime) return;
    
    this.state.lastDailyReport = todayStr;
    
    const report = this.generateDailyReport();
    this.emit('notification', report);
  }

  generateDailyReport(): string {
    const s = this.state;
    return `📊 **K.I.T. Daily Financial Report**
📅 ${new Date().toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

━━━━━━━━━━━━━━━━━━━━

💼 **Portfolio**
Total Value: $${s.totalValueUSD.toLocaleString()}
Daily P&L: ${s.currentDailyPnL >= 0 ? '+' : ''}$${s.currentDailyPnL.toFixed(2)}

📈 **Trading**
Trades Today: ${s.tradesToday}
Win Rate: ${(s.winRate * 100).toFixed(1)}%

💰 **Passive Income**
Staked Value: $${s.totalPassiveValueUSD.toLocaleString()}
Total Rewards: $${s.totalRewardsEarned.toFixed(2)}

🎯 **Opportunities**
Detected: ${s.opportunities.length}

🔔 **Alerts**
Active: ${s.priceAlerts.filter(a => !a.triggered).length}
Triggered: ${s.priceAlerts.filter(a => a.triggered).length}

━━━━━━━━━━━━━━━━━━━━

_K.I.T. - Your Wealth is My Mission_ 🤖`;
  }

  // ========== TRADING ==========

  async executeTrade(action: TradeAction): Promise<string> {
    if (this.state.tradingPaused) {
      return `⛔ Trading paused: ${this.state.pauseReason}`;
    }
    
    if (this.state.tradesToday >= this.state.maxDailyTrades) {
      return '⛔ Daily trade limit reached';
    }

    // Paper trading mode — log instead of executing
    if (this.state.paperTrading) {
      const now = new Date().toISOString();
      const logEntry = {
        timestamp: now,
        action,
        mode: 'paper',
      };
      const logPath = path.join(KIT_HOME, 'paper-trades.json');
      let logs: any[] = [];
      try {
        logs = JSON.parse(fs.readFileSync(logPath, 'utf8'));
      } catch {}
      logs.push(logEntry);
      fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));

      // Log to database
      try {
        initDatabase();
        insertTrade({
          ticket: Date.now(),
          symbol: action.symbol,
          type: action.type,
          volume: action.amount || 0.01,
          status: 'open',
          exchange: action.platform,
          strategy: 'autonomous-agent',
          opened_at: now,
          notes: 'paper trade',
        });
      } catch {}

      this.state.tradesToday++;
      this.state.totalTradesExecuted++;
      saveState(this.state);

      return `📝 [PAPER] ${action.type.toUpperCase()} ${action.amount || 'default'} ${action.symbol} on ${action.platform} (not executed)`;
    }

    // Find the platform connection
    const platform = this.state.platforms.find(
      p => p.platform === action.platform && p.enabled
    );

    if (!platform) {
      return `⛔ Platform "${action.platform}" not connected or not enabled`;
    }

    let result: string;

    try {
      if (action.platform === 'mt5') {
        result = await this.executeMT5Trade(action);
      } else if (['binance', 'bybit', 'kraken', 'coinbase'].includes(action.platform)) {
        result = await this.executeCCXTTrade(action, platform);
      } else if (action.platform === 'binaryfaster') {
        result = await this.executeBinaryFasterTrade(action, platform);
      } else {
        return `⛔ Unsupported platform: ${action.platform}`;
      }
    } catch (error: any) {
      this.emit('trade_error', { action, error: error.message });
      return `❌ Trade failed: ${error.message}`;
    }

    this.state.tradesToday++;
    this.state.totalTradesExecuted++;
    saveState(this.state);

    // Log to database
    try {
      const now = new Date().toISOString();
      insertTrade({
        ticket: Date.now(),
        symbol: action.symbol,
        type: action.type,
        volume: action.amount || 0.01,
        status: 'open',
        exchange: action.platform,
        strategy: 'autonomous-agent',
        opened_at: now,
        notes: result,
      });
    } catch {}

    this.emit('trade_executed', { action, result, timestamp: new Date().toISOString() });
    return result;
  }

  private async executeMT5Trade(action: TradeAction): Promise<string> {
    const { execSync } = require('child_process');
    const pythonPath = getPythonPath();
    const volume = action.amount || 0.01;

    // Build MT5 order command
    const slParam = (action as any).stopLoss || 0;
    const tpParam = (action as any).takeProfit || 0;

    if (action.type === 'close') {
      // Close position by ticket
      const ticket = (action as any).ticket;
      if (!ticket) return '⛔ MT5 close requires a ticket number';
      const cmd = `close ${ticket}`;
      const scriptPath = this.findMT5Script();
      const result = execSync(`${pythonPath} "${scriptPath}" ${cmd}`, {
        encoding: 'utf-8',
        timeout: 30000,
        windowsHide: true,
      });
      const parsed = JSON.parse(result.trim());
      if (parsed.success) {
        return `✅ MT5: Closed position #${ticket}`;
      }
      return `❌ MT5 close failed: ${parsed.error || 'Unknown error'}`;
    }

    // Market order: buy/sell SYMBOL VOLUME SL TP
    const orderType = action.type === 'buy' || action.type === 'sell' ? action.type : 'buy';
    const cmd = `${orderType} ${action.symbol} ${volume} ${slParam} ${tpParam}`;
    const scriptPath = this.findMT5Script();
    const result = execSync(`${pythonPath} "${scriptPath}" ${cmd}`, {
      encoding: 'utf-8',
      timeout: 30000,
      windowsHide: true,
    });
    const parsed = JSON.parse(result.trim());

    if (parsed.success) {
      const orderId = parsed.order?.ticket || parsed.ticket || 'unknown';
      return `✅ MT5: ${orderType.toUpperCase()} ${volume} lots ${action.symbol} | Order #${orderId}`;
    }
    return `❌ MT5 order failed: ${parsed.error || 'Unknown error'}`;
  }

  private async executeCCXTTrade(action: TradeAction, platform: PlatformConnection): Promise<string> {
    const exchangeId = platform.platform as SupportedExchange;
    const manager = new ExchangeManager(true);

    const connected = await manager.addExchange({
      exchange: exchangeId,
      credentials: {
        apiKey: platform.credentials.apiKey || '',
        secret: platform.credentials.apiSecret || '',
        password: platform.credentials.password,
        testnet: platform.credentials.testnet === 'true',
      },
      sandbox: platform.credentials.testnet === 'true',
    });

    if (!connected) {
      return `❌ Failed to connect to ${exchangeId}`;
    }

    // Convert symbol format: EURUSD -> EUR/USDT for crypto, or keep as-is
    const ccxtSymbol = this.toCCXTSymbol(action.symbol, exchangeId);

    if (action.type === 'close') {
      // Close = sell everything we have
      const balances = await manager.getBalance(exchangeId);
      const base = ccxtSymbol.split('/')[0];
      const holding = balances.find(b => b.asset === base);
      if (!holding || holding.free <= 0) {
        return `⛔ No ${base} balance to close on ${exchangeId}`;
      }
      const result = await manager.marketOrder(exchangeId, ccxtSymbol, 'sell', holding.free);
      if (result.success) {
        return `✅ ${exchangeId}: Closed ${holding.free} ${base} | Order #${result.order?.id}`;
      }
      return `❌ ${exchangeId} close failed: ${result.error}`;
    }

    // Market order
    const result = await manager.marketOrder(exchangeId, ccxtSymbol, action.type as 'buy' | 'sell', action.amount || 0);

    if (result.success) {
      return `✅ ${exchangeId}: ${action.type.toUpperCase()} ${action.amount} ${ccxtSymbol} | Order #${result.order?.id} | Filled: ${result.order?.filled}`;
    }
    return `❌ ${exchangeId} trade failed: ${result.error}`;
  }

  private async executeBinaryFasterTrade(action: TradeAction, platform: PlatformConnection): Promise<string> {
    try {
      const loginRes = await fetch('https://wsauto.binaryfaster.com/automation/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: platform.credentials.email,
          password: platform.credentials.password,
        }),
      });
      const loginData = await loginRes.json();
      const apiKey = loginData.api_key;

      if (!apiKey) return '❌ BinaryFaster login failed';

      const tradeRes = await fetch('https://wsauto.binaryfaster.com/automation/traderoom/trade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({
          symbol: action.symbol,
          direction: action.type,
          amount: action.amount || 1,
        }),
      });
      const tradeData = await tradeRes.json();

      if (tradeData.success || tradeData.id) {
        return `✅ BinaryFaster: ${action.type.toUpperCase()} ${action.symbol} | Trade #${tradeData.id || 'placed'}`;
      }
      return `❌ BinaryFaster trade failed: ${tradeData.error || JSON.stringify(tradeData)}`;
    } catch (error: any) {
      return `❌ BinaryFaster error: ${error.message}`;
    }
  }

  private findMT5Script(): string {
    const possiblePaths = [
      path.join(__dirname, '../../../skills/metatrader/scripts/auto_connect.py'),
      path.join(__dirname, '../../skills/metatrader/scripts/auto_connect.py'),
      path.join(process.cwd(), 'skills/metatrader/scripts/auto_connect.py'),
    ];
    return possiblePaths.find(p => fs.existsSync(p)) || possiblePaths[0];
  }

  private toCCXTSymbol(symbol: string, exchange: string): string {
    // If already has slash, return as-is
    if (symbol.includes('/')) return symbol;

    // Common forex pairs (6 chars, no USD inside) - these aren't on most crypto exchanges
    // For crypto symbols like BTCUSDT -> BTC/USDT
    const usdtPairs = ['USDT', 'BUSD', 'USDC', 'FDUSD', 'BTC', 'ETH'];
    for (const quote of usdtPairs) {
      if (symbol.endsWith(quote) && symbol.length > quote.length) {
        return `${symbol.slice(0, -quote.length)}/${quote}`;
      }
    }

    // Fallback: try inserting slash before last 4-6 chars
    return symbol;
  }

  // ========== PLATFORM SYNC ==========

  async syncAllPlatforms(): Promise<string> {
    let totalValue = 0;
    const results: string[] = [];
    
    for (const platform of this.state.platforms) {
      if (!platform.enabled) continue;
      
      try {
        let balance = 0;
        
        switch (platform.platform) {
          case 'binaryfaster':
            balance = await getBinaryFasterBalance(
              platform.credentials.email,
              platform.credentials.password
            );
            break;
          case 'binance':
            const binance = await getBinanceBalance(
              platform.credentials.apiKey,
              platform.credentials.apiSecret
            );
            balance = binance.total;
            break;
          case 'mt5':
            const mt5 = await getMT5Balance();
            balance = mt5.equity;
            break;
        }
        
        platform.balance = balance;
        platform.lastSync = new Date().toISOString();
        totalValue += balance;
        results.push(`✅ ${platform.platform}: $${balance.toLocaleString()}`);
      } catch (e) {
        results.push(`❌ ${platform.platform}: Failed to sync`);
      }
    }
    
    this.state.totalValueUSD = totalValue;
    this.state.portfolioLastUpdated = new Date().toISOString();
    saveState(this.state);
    
    return `💼 **Portfolio Synced**\n\n${results.join('\n')}\n\n**Total: $${totalValue.toLocaleString()}**`;
  }

  async addPlatform(platform: PlatformConnection): Promise<string> {
    // Check if already exists
    const existing = this.state.platforms.find(p => p.platform === platform.platform);
    if (existing) {
      Object.assign(existing, platform);
    } else {
      this.state.platforms.push(platform);
    }
    saveState(this.state);
    return `✅ Platform ${platform.platform} connected`;
  }

  // ========== SETTINGS ==========

  updateSettings(settings: Partial<AutonomousState>): string {
    Object.assign(this.state, settings);
    saveState(this.state);
    return '✅ Settings updated';
  }

  getState(): AutonomousState {
    return { ...this.state };
  }
}

// ============================================================================
// Singleton
// ============================================================================

let agentInstance: AutonomousAgent | null = null;

export function getAutonomousAgent(): AutonomousAgent {
  if (!agentInstance) {
    agentInstance = new AutonomousAgent();
  }
  return agentInstance;
}

export function startAutonomousAgent(): Promise<string> {
  return getAutonomousAgent().start();
}

export function stopAutonomousAgent(): Promise<string> {
  return getAutonomousAgent().stop();
}
