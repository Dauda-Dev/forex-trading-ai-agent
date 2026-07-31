/**
 * K.I.T. Brain Core
 * 
 * The main orchestrator that brings together:
 * - Goal Parser: Understanding user intentions
 * - Decision Engine: Making trading decisions
 * - Autonomy Manager: Controlling independence levels
 * 
 * This is the "supernatural financial agent" from VISION.md
 * 
 * @see https://github.com/kayzaa/k.i.t.-bot/issues/17
 */

import { EventEmitter } from 'events';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { initDatabase, insertDecision, updateDecisionStatus, getRecentDecisions, getPendingDecisions, getLatestPerformance, upsertPerformance, setBrainState, getBrainState } from '../persistence';
import { GoalParser, ParsedGoal, UserGoal as GoalParserUserGoal } from './goal-parser';
import { DecisionEngine } from './decision-engine';
import { AutonomyManager } from './autonomy-manager';
import { MarketAnalyzer, createMarketAnalyzer } from '../tools/market-analysis';
import type { AutonomousAgent } from '../core/autonomous-agent';
import type { TradeAction as AgentTradeAction } from '../core/autonomous-agent';
import {
  UserGoal,
  BrainState,
  BrainEvent,
  AutonomyConfig,
  AutonomyLevel,
  MarketOpportunity,
  Decision,
  Signal,
  Asset,
  PerformanceMetrics,
  TradeResult
} from './types';

export interface BrainConfig {
  /** Initial autonomy level */
  autonomyLevel?: AutonomyLevel;
  
  /** Autonomy configuration */
  autonomy?: Partial<AutonomyConfig>;
  
  /** Paper trading mode */
  paperTrade?: boolean;
  
  /** Verbose logging */
  verbose?: boolean;
  
  /** Analysis interval in milliseconds */
  analysisInterval?: number;
}

const DEFAULT_CONFIG: BrainConfig = {
  autonomyLevel: 1,
  paperTrade: true,
  verbose: true,
  analysisInterval: 60000 // 1 minute
};

const KIT_HOME = path.join(os.homedir(), '.kit');

/**
 * K.I.T. Brain Core - The Autonomous Financial Agent
 */
export class BrainCore extends EventEmitter {
  private config: BrainConfig;
  private goalParser: GoalParser;
  private decisionEngine: DecisionEngine;
  private autonomyManager: AutonomyManager;
  private marketAnalyzer: MarketAnalyzer;
  
  private state: BrainState;
  private analysisTimer?: ReturnType<typeof setInterval>;
  private portfolioValue: number = 0;
  private executionAgent: AutonomousAgent | null = null;
  
  constructor(config: BrainConfig = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // Initialize components
    this.goalParser = new GoalParser();
    this.decisionEngine = new DecisionEngine({
      paperTrade: this.config.paperTrade,
      verbose: this.config.verbose
    });
    this.autonomyManager = new AutonomyManager({
      level: this.config.autonomyLevel,
      ...this.config.autonomy
    });
    this.marketAnalyzer = createMarketAnalyzer();
    
    // Initialize state
    this.state = {
      active: false,
      goals: [],
      autonomy: this.autonomyManager.getState().config,
      pendingDecisions: [],
      recentDecisions: [],
      opportunities: [],
      performance: this.createEmptyMetrics(),
      lastAnalysis: new Date()
    };
    
    // Wire up events
    this.setupEventForwarding();
    
    // Initialize database and load persisted state
    initDatabase().catch(err => console.error('[Brain] DB init error:', err));
    this.loadPersistedState().catch(err => console.error('[Brain] Load state error:', err));
    
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🤖 K.I.T. BRAIN INITIALIZED                            ║
║   "Your wealth is my mission."                           ║
║                                                           ║
║   Autonomy Level: ${this.config.autonomyLevel} (${['', 'Assistant', 'Co-Pilot', 'Autopilot'][this.config.autonomyLevel || 1]})
║   Paper Trade: ${this.config.paperTrade ? 'YES (safe mode)' : 'NO (live trading!)'}
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    `);
  }
  
  // ============================================
  // Lifecycle
  // ============================================
  
  /**
   * Activate the brain
   */
  activate(): void {
    this.state.active = true;
    console.log('🧠 Brain ACTIVATED - Monitoring markets...');
    
    // Start analysis loop
    if (this.config.analysisInterval && this.config.analysisInterval > 0) {
      this.analysisTimer = setInterval(() => {
        this.runAnalysisCycle();
      }, this.config.analysisInterval);
    }
    
    this.emit('activated');
  }
  
  /**
   * Deactivate the brain
   */
  deactivate(): void {
    this.state.active = false;
    
    if (this.analysisTimer) {
      clearInterval(this.analysisTimer);
      this.analysisTimer = undefined;
    }
    
    console.log('🧠 Brain DEACTIVATED');
    this.emit('deactivated');
  }
  
  /**
   * Check if brain is active
   */
  isActive(): boolean {
    return this.state.active;
  }
  
  // ============================================
  // Goals
  // ============================================
  
  /**
   * Set a new goal from natural language
   */
  async setGoal(prompt: string): Promise<ParsedGoal> {
    console.log(`\\n📎 Processing goal: "${prompt}"`);
    
    const parsed = await this.goalParser.parse(prompt);
    
    // Convert parsed goal to full UserGoal type
    const now = new Date();
    const fullGoal: UserGoal = {
      id: `goal-${Date.now()}`,
      type: parsed.goal.type,
      targetReturn: parsed.goal.targetReturn,
      riskTolerance: parsed.goal.riskTolerance,
      timeHorizon: parsed.goal.timeHorizon,
      originalPrompt: parsed.goal.raw,
      createdAt: now,
      updatedAt: now
    };
    
    // Replace existing goals (single goal for now)
    this.state.goals = [fullGoal];
    this.decisionEngine.setGoals(this.state.goals);
    
    console.log(`\\n✅ Goal understood (${parsed.confidence}% confidence):`);
    console.log(parsed.reasoning);
    
    this.emit('event', {
      type: 'goal_set',
      goal: fullGoal
    } as BrainEvent);
    
    return parsed;
  }
  
  /**
   * Get current goals
   */
  getGoals(): UserGoal[] {
    return [...this.state.goals];
  }
  
  /**
   * Clear all goals
   */
  clearGoals(): void {
    this.state.goals = [];
    this.decisionEngine.setGoals([]);
    console.log('📎 Goals cleared');
  }
  
  // ============================================
  // Autonomy
  // ============================================
  
  /**
   * Set autonomy level (1, 2, or 3)
   */
  setAutonomyLevel(level: AutonomyLevel): void {
    this.autonomyManager.setLevel(level);
    this.state.autonomy = this.autonomyManager.getState().config;
  }
  
  /**
   * Get current autonomy level
   */
  getAutonomyLevel(): AutonomyLevel {
    return this.autonomyManager.getLevel();
  }
  
  /**
   * Get autonomy status
   */
  getAutonomyStatus(): string {
    return this.autonomyManager.getStatusSummary();
  }
  
  /**
   * Pause trading
   */
  pause(reason?: string): void {
    this.autonomyManager.pause(reason);
  }
  
  /**
   * Resume trading
   */
  resume(): void {
    this.autonomyManager.resume();
  }
  
  // ============================================
  // Market Analysis
  // ============================================
  
  /**
   * Analyze signals for an asset
   */
  analyzeSignals(signals: Signal[], asset: Asset): MarketOpportunity | null {
    return this.decisionEngine.analyzeSignals(signals, asset);
  }
  
  /**
   * Submit a yield opportunity
   */
  submitYieldOpportunity(
    protocol: string,
    asset: Asset,
    apy: number,
    tvl: number,
    riskFactors: string[] = []
  ): MarketOpportunity {
    return this.decisionEngine.createYieldOpportunity(
      protocol, asset, apy, tvl, riskFactors
    );
  }
  
  /**
   * Run a full analysis cycle
   */
  async runAnalysisCycle(): Promise<void> {
    if (!this.state.active || this.autonomyManager.isPaused()) {
      return;
    }
    
    if (!this.autonomyManager.isWithinActiveHours()) {
      return;
    }
    
    this.state.lastAnalysis = new Date();
    
    if (this.config.verbose) {
      console.log(`⏰ Analysis cycle starting at ${this.state.lastAnalysis.toISOString()}`);
    }
    
    try {
      // 1. Get watchlist from goals
      const watchlist = this.getWatchlistFromGoals();
      
      // 2. Analyze each asset on the watchlist
      for (const asset of watchlist) {
        await this.analyzeAsset(asset);
      }
      
      // 3. Process any pending decisions at autonomy level 3
      if (this.autonomyManager.getLevel() === 3) {
        const pending = this.decisionEngine.getPendingDecisions();
        for (const decision of pending) {
          // Auto-approve decisions that pass risk checks at level 3
          if (decision.riskCheckPassed) {
            this.decisionEngine.approveDecision(decision.id);
          }
        }
      }
      
      // 4. Execute approved decisions via AutonomousAgent
      if (this.executionAgent) {
        const { executed, failed } = await this.executeApprovedDecisions();
        if (executed > 0 || failed > 0) {
          console.log(`📊 Execution summary: ${executed} executed, ${failed} failed`);
        }
      }
      
      // 5. Persist decisions and performance to disk
      this.persist();
      
      if (this.config.verbose) {
        console.log(`✅ Analysis cycle completed`);
      }
    } catch (error) {
      console.error('Analysis cycle error:', error);
      this.emit('error', { type: 'analysis', error });
    }
    
    this.emit('analysis_complete');
  }
  
  /**
   * Get watchlist of assets based on current goals
   */
  private getWatchlistFromGoals(): Asset[] {
    const assets: Asset[] = [];
    
    for (const goal of this.state.goals) {
      const allowedMarkets = goal.constraints?.allowedMarkets || ['crypto'];
      
      // Only crypto symbols — Binance is the only connected exchange
      if (allowedMarkets.includes('crypto')) {
        assets.push(
          { symbol: 'BTC/USDT', name: 'Bitcoin', market: 'crypto' },
          { symbol: 'ETH/USDT', name: 'Ethereum', market: 'crypto' },
          { symbol: 'SOL/USDT', name: 'Solana', market: 'crypto' },
          { symbol: 'BNB/USDT', name: 'BNB', market: 'crypto' }
        );
      }
    }
    
    // Remove duplicates based on symbol
    const seen = new Set<string>();
    return assets.filter(a => {
      if (seen.has(a.symbol)) return false;
      seen.add(a.symbol);
      return true;
    });
  }
  
  /**
   * Analyze a single asset and generate opportunities from real market data
   */
  private async analyzeAsset(asset: Asset): Promise<void> {
    try {
      // Fetch real market data and calculate technical indicators
      const ccxtSymbol = this.toCCXTSymbol(asset.symbol);
      const analysis = await this.marketAnalyzer.analyze({
        symbol: ccxtSymbol,
        timeframe: '1h',
        limit: 200,
      });

      // Convert MarketAnalyzer output to Brain Signal format
      const signals: Signal[] = this.analysisToSignals(analysis, asset);
      
      if (signals.length > 0) {
        const opportunity = this.decisionEngine.analyzeSignals(signals, asset);
        
        if (opportunity && this.config.verbose) {
          console.log(`📊 Opportunity: ${asset.symbol} - ${opportunity.action} (${opportunity.confidenceScore}% confidence) | Trend: ${analysis.trend} | Signal: ${analysis.signal}`);
        }
      }
    } catch (error: any) {
      if (this.config.verbose) {
        const msg = error?.message || error;
        if (msg.toString().includes('BadSymbol')) {
          console.log(`⏭ ${asset.symbol} not available on connected exchange`);
        } else {
          console.error(`Error analyzing ${asset.symbol}: ${msg}`);
        }
      }
    }
  }

  /**
   * Convert MarketAnalyzer output into Brain Signal format
   */
  private analysisToSignals(analysis: any, asset: Asset): Signal[] {
    const signals: Signal[] = [];
    const now = new Date();

    // RSI signal
    if (analysis.indicators?.rsi !== undefined) {
      const rsi = analysis.indicators.rsi;
      let direction: 'bullish' | 'bearish' | 'neutral' = 'neutral';
      let strength = 50;
      if (rsi < 30) { direction = 'bullish'; strength = 80; }
      else if (rsi < 40) { direction = 'bullish'; strength = 65; }
      else if (rsi > 70) { direction = 'bearish'; strength = 80; }
      else if (rsi > 60) { direction = 'bearish'; strength = 65; }
      signals.push({
        source: 'RSI(14)',
        type: 'technical',
        direction,
        strength,
        details: `RSI: ${rsi.toFixed(1)}${rsi < 30 ? ' (oversold)' : rsi > 70 ? ' (overbought)' : ''}`,
        timestamp: now,
      });
    }

    // MACD signal
    if (analysis.indicators?.macd) {
      const { histogram } = analysis.indicators.macd;
      let direction: 'bullish' | 'bearish' | 'neutral' = 'neutral';
      let strength = 50;
      if (histogram > 0) { direction = 'bullish'; strength = 60 + Math.min(Math.abs(histogram) * 10, 20); }
      else if (histogram < 0) { direction = 'bearish'; strength = 60 + Math.min(Math.abs(histogram) * 10, 20); }
      signals.push({
        source: 'MACD',
        type: 'technical',
        direction,
        strength,
        details: `MACD histogram: ${histogram.toFixed(4)}`,
        timestamp: now,
      });
    }

    // Trend signal
    if (analysis.trend) {
      let direction: 'bullish' | 'bearish' | 'neutral' = analysis.trend;
      signals.push({
        source: 'Trend Analysis',
        type: 'technical',
        direction,
        strength: analysis.strength || 50,
        details: `Trend: ${analysis.trend} (${analysis.strength}% strength)`,
        timestamp: now,
      });
    }

    // Volume signal
    if (analysis.indicators?.volume && analysis.indicators?.volumeSma) {
      const vol = analysis.indicators.volume;
      const volSma = analysis.indicators.volumeSma;
      if (vol > volSma * 1.5) {
        signals.push({
          source: 'Volume',
          type: 'technical',
          direction: 'neutral',
          strength: 70,
          details: `High volume: ${(vol / volSma).toFixed(1)}x average`,
          timestamp: now,
        });
      }
    }

    // Bollinger Band signal
    if (analysis.indicators?.bollinger && analysis.price) {
      const bb = analysis.indicators.bollinger;
      let direction: 'bullish' | 'bearish' | 'neutral' = 'neutral';
      let strength = 50;
      if (analysis.price <= bb.lower) { direction = 'bullish'; strength = 75; }
      else if (analysis.price >= bb.upper) { direction = 'bearish'; strength = 75; }
      signals.push({
        source: 'Bollinger Bands',
        type: 'technical',
        direction,
        strength,
        details: `Price ${analysis.price <= bb.lower ? 'at lower band' : analysis.price >= bb.upper ? 'at upper band' : 'within bands'}`,
        timestamp: now,
      });
    }

    return signals;
  }

  /**
   * Convert asset symbol to CCXT format (e.g., EURUSD -> EUR/USDT, BTCUSDT -> BTC/USDT)
   */
  private toCCXTSymbol(symbol: string): string {
    if (symbol.includes('/')) return symbol;

    // Crypto pairs
    const quoteAssets = ['USDT', 'BUSD', 'USDC', 'FDUSD', 'BTC', 'ETH'];
    for (const quote of quoteAssets) {
      if (symbol.endsWith(quote) && symbol.length > quote.length) {
        return `${symbol.slice(0, -quote.length)}/${quote}`;
      }
    }

    // Forex pairs without USD in the middle (e.g., EURUSD -> EUR/USD on Binance as EURUSDT)
    if (symbol.length === 6) {
      const base = symbol.slice(0, 3);
      const quote = symbol.slice(3);
      if (quote === 'USD') {
        return `${base}/USDT`; // Most crypto exchanges use USDT
      }
    }

    return symbol;
  }
  
  // ============================================
  // Decisions
  // ============================================
  
  /**
   * Make a decision on an opportunity
   */
  async makeDecision(opportunityId: string): Promise<Decision | null> {
    return this.decisionEngine.makeDecision(
      opportunityId,
      this.autonomyManager.getLevel(),
      this.portfolioValue
    );
  }
  
  /**
   * Approve a pending decision
   */
  approveDecision(decisionId: string): Decision | null {
    return this.decisionEngine.approveDecision(decisionId);
  }
  
  /**
   * Reject a pending decision
   */
  rejectDecision(decisionId: string): Decision | null {
    return this.decisionEngine.rejectDecision(decisionId);
  }
  
  /**
   * Get pending decisions
   */
  getPendingDecisions(): Decision[] {
    return this.decisionEngine.getPendingDecisions();
  }
  
  /**
   * Get decisions ready for execution
   */
  getApprovedDecisions(): Decision[] {
    return this.decisionEngine.getApprovedDecisions();
  }
  
  // ============================================
  // Execution Bridge
  // ============================================
  
  /**
   * Connect an AutonomousAgent to execute Brain decisions
   */
  setExecutionAgent(agent: AutonomousAgent): void {
    this.executionAgent = agent;
    console.log('🔗 Brain connected to AutonomousAgent for execution');
  }
  
  /**
   * Execute all approved decisions via the connected AutonomousAgent
   */
  async executeApprovedDecisions(): Promise<{ executed: number; failed: number }> {
    if (!this.executionAgent) {
      return { executed: 0, failed: 0 };
    }
    
    const approved = this.decisionEngine.getApprovedDecisions()
      .filter(d => d.status === 'approved');
    
    if (approved.length === 0) {
      return { executed: 0, failed: 0 };
    }
    
    let executed = 0;
    let failed = 0;
    
    for (const decision of approved) {
      try {
        decision.status = 'executing';
        
        const agentAction = this.mapToAgentAction(decision);
        const result = await this.executionAgent.executeTrade(agentAction);
        
        decision.status = 'executed';
        decision.executedAt = new Date();
        decision.executionResult = {
          success: !result.startsWith('❌') && !result.startsWith('⛔'),
          filledPrice: 0,
          timestamp: new Date(),
          error: result.startsWith('❌') ? result : undefined,
        };
        
        this.recordTrade(decision.executionResult, decision.action.amount);
        executed++;
        
        if (this.config.verbose) {
          console.log(`✅ Executed: ${decision.action.side.toUpperCase()} ${decision.action.amount} ${decision.action.asset.symbol} → ${result}`);
        }
        
        this.emit('event', {
          type: 'trade_executed',
          decision,
          result: decision.executionResult,
        } as BrainEvent);
        
      } catch (error: any) {
        decision.status = 'failed';
        decision.executionResult = {
          success: false,
          error: error.message,
          timestamp: new Date(),
        };
        failed++;
        
        console.error(`❌ Execution failed for ${decision.action.asset.symbol}:`, error.message);
        
        this.emit('event', {
          type: 'trade_failed',
          decision,
          error: error.message,
        } as BrainEvent);
      }
    }
    
    return { executed, failed };
  }
  
  /**
   * Map a Brain TradeAction to an AutonomousAgent TradeAction
   */
  private mapToAgentAction(decision: Decision): AgentTradeAction {
    const brainAction = decision.action;
    
    // Determine platform from asset market
    let platform = 'mt5';
    if (brainAction.asset.market === 'crypto') {
      platform = 'binance';
    } else if (brainAction.asset.market === 'forex') {
      platform = 'mt5';
    } else if (brainAction.asset.market === 'stocks') {
      platform = 'binance'; // CCXT for stocks via Binance
    }
    
    // Use explicit exchange if set
    if (brainAction.exchange) {
      platform = brainAction.exchange;
    }
    
    // Map side
    const type = brainAction.side === 'buy' ? 'buy' : 'sell';
    
    // Strip slashes from symbol for AutonomousAgent format (EUR/USD → EURUSD)
    const symbol = brainAction.asset.symbol.replace('/', '');
    
    return {
      type,
      platform,
      symbol,
      amount: brainAction.amount,
    };
  }
  
  // ============================================
  // Portfolio
  // ============================================
  
  /**
   * Update portfolio value (for position sizing)
   */
  setPortfolioValue(value: number): void {
    this.portfolioValue = value;
    this.autonomyManager.setPortfolioValue(value);
  }
  
  /**
   * Record a completed trade
   */
  recordTrade(result: TradeResult, tradeSize: number): void {
    const profit = result.success ? (result.filledPrice || 0) - tradeSize : -tradeSize * 0.01;
    this.autonomyManager.recordTrade(tradeSize, profit);
    
    // Update performance metrics
    this.updatePerformanceMetrics(result);
  }
  
  // ============================================
  // State
  // ============================================
  
  /**
   * Get full brain state
   */
  getState(): BrainState {
    return {
      ...this.state,
      autonomy: this.autonomyManager.getState().config,
      pendingDecisions: this.decisionEngine.getPendingDecisions(),
      recentDecisions: this.decisionEngine.getApprovedDecisions().slice(-10)
    };
  }
  
  /**
   * Get status summary
   */
  getStatusSummary(): string {
    const lines = [
      ``,
      `╔═══════════════════════════════════════╗`,
      `║       K.I.T. BRAIN STATUS             ║`,
      `╚═══════════════════════════════════════╝`,
      ``,
      `🔋 Status: ${this.state.active ? '🟢 ACTIVE' : '🔴 INACTIVE'}`,
      `🤖 Autonomy: Level ${this.getAutonomyLevel()}`,
      `📊 Paper Trade: ${this.config.paperTrade ? 'YES' : 'NO'}`,
      ``,
      `📎 GOALS: ${this.state.goals.length}`,
    ];
    
    for (const goal of this.state.goals) {
      lines.push(`   • ${goal.type} (${goal.riskTolerance} risk)`);
    }
    
    lines.push(
      ``,
      `⏳ Pending Decisions: ${this.getPendingDecisions().length}`,
      `✅ Ready to Execute: ${this.getApprovedDecisions().length}`,
      ``,
      `📈 PERFORMANCE`,
      `   Total Return: ${this.state.performance.totalReturnPercent.toFixed(2)}%`,
      `   Win Rate: ${(this.state.performance.winRate * 100).toFixed(1)}%`,
      `   Trades: ${this.state.performance.totalTrades}`,
      ``
    );
    
    return lines.join('\\n');
  }
  
  // ============================================
  // Private Helpers
  // ============================================
  
  private setupEventForwarding(): void {
    // Forward events from components
    this.autonomyManager.on('event', (event: BrainEvent) => {
      this.emit('event', event);
    });
    
    this.decisionEngine.on('event', (event: BrainEvent) => {
      this.emit('event', event);
      
      // Update state based on events
      if (event.type === 'opportunity_detected') {
        this.state.opportunities.push(event.opportunity);
        // Keep only recent
        if (this.state.opportunities.length > 50) {
          this.state.opportunities = this.state.opportunities.slice(-50);
        }
      }
    });
  }
  
  private updatePerformanceMetrics(result: TradeResult): void {
    this.state.performance.totalTrades++;
    
    if (result.success) {
      this.state.performance.winningTrades++;
    }
    
    this.state.performance.winRate = 
      this.state.performance.winningTrades / this.state.performance.totalTrades;
    
    this.state.performance.updatedAt = new Date();
  }
  
  // ============================================
  // Persistence
  // ============================================
  
  /**
   * Save decisions and performance to database
   */
  persist(): void {
    try {
      // Save pending decisions to DB
      const pending = this.decisionEngine.getPendingDecisions();
      for (const d of pending) {
        insertDecision({
          id: d.id,
          action: d.action.side,
          symbol: d.action.asset.symbol,
          status: 'pending',
          risk_check_passed: d.riskCheckPassed ? 1 : 0,
          created_at: d.createdAt?.toISOString() || new Date().toISOString(),
        });
      }

      // Save approved/executed decisions to DB
      const approved = this.decisionEngine.getApprovedDecisions();
      for (const d of approved) {
        insertDecision({
          id: d.id,
          action: d.action.side,
          symbol: d.action.asset.symbol,
          status: d.status,
          risk_check_passed: d.riskCheckPassed ? 1 : 0,
          created_at: d.createdAt?.toISOString() || new Date().toISOString(),
          executed_at: d.executedAt?.toISOString() || undefined,
          result: d.executionResult ? JSON.stringify(d.executionResult) : undefined,
        });
      }

      // Save performance to DB
      const p = this.state.performance;
      upsertPerformance({
        date: new Date().toISOString().slice(0, 10),
        total_trades: p.totalTrades,
        winning_trades: p.winningTrades,
        win_rate: p.winRate,
        total_return: p.totalReturn,
        total_return_pct: p.totalReturnPercent,
        daily_pnl: p.dailyPnL,
        sharpe_ratio: p.sharpeRatio,
        max_drawdown: p.maxDrawdown,
        max_drawdown_pct: p.maxDrawdown,
        balance: this.portfolioValue,
      });

      // Save goals as brain state
      if (this.state.goals.length > 0) {
        setBrainState('goals', this.state.goals);
      }
      setBrainState('performance', p);
      setBrainState('last_analysis', this.state.lastAnalysis.toISOString());
      
    } catch (error) {
      console.error('Failed to persist brain state:', error);
    }
  }
  
  /**
   * Load persisted state from database
   */
  async loadPersistedState(): Promise<void> {
    try {
      const perf = await getLatestPerformance();
      if (perf) {
        this.state.performance.totalTrades = perf.total_trades || 0;
        this.state.performance.winningTrades = perf.winning_trades || 0;
        this.state.performance.winRate = perf.win_rate || 0;
        this.state.performance.totalReturn = perf.total_return || 0;
        this.state.performance.totalReturnPercent = perf.total_return_pct || 0;
        this.state.performance.dailyPnL = perf.daily_pnl || 0;
        this.state.performance.sharpeRatio = perf.sharpe_ratio || 0;
        this.state.performance.maxDrawdown = perf.max_drawdown || 0;
        console.log(`📂 Loaded DB performance: ${perf.total_trades} trades, ${(perf.win_rate || 0).toFixed(1)}% win rate`);
      }

      const goals = await getBrainState<any[]>('goals');
      if (goals && goals.length > 0) {
        this.state.goals = goals.map((g: any) => ({
          ...g,
          createdAt: new Date(g.createdAt),
          updatedAt: new Date(g.updatedAt),
        }));
        this.decisionEngine.setGoals(this.state.goals);
        console.log(`📂 Loaded ${goals.length} goal(s) from DB`);
      }

      const lastAnalysis = await getBrainState<string>('last_analysis');
      if (lastAnalysis) {
        this.state.lastAnalysis = new Date(lastAnalysis);
      }
    } catch (error) {
      // Ignore — start fresh
    }
  }
  
  private createEmptyMetrics(): PerformanceMetrics {
    return {
      totalReturn: 0,
      totalReturnPercent: 0,
      dailyPnL: 0,
      dailyPnLPercent: 0,
      weeklyPnL: 0,
      weeklyPnLPercent: 0,
      totalTrades: 0,
      winningTrades: 0,
      winRate: 0,
      maxDrawdown: 0,
      sharpeRatio: 0,
      updatedAt: new Date()
    };
  }
}

/**
 * Factory function
 */
export function createBrainCore(config?: BrainConfig): BrainCore {
  return new BrainCore(config);
}

// Re-export types for convenience
export type { BrainState } from './types';
