/**
 * K.I.T. Interactive Onboarding
 * Beautiful terminal UI with multi-select, checkboxes, and smooth UX
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const KIT_HOME = path.join(os.homedir(), '.kit');
const CONFIG_PATH = path.join(KIT_HOME, 'config.json');
const WORKSPACE_DIR = path.join(KIT_HOME, 'workspace');
const ONBOARDING_STATE_PATH = path.join(KIT_HOME, 'onboarding.json');

// ============================================================================
// Types
// ============================================================================

interface OnboardingData {
  userName: string;
  goals: string[];
  experience: string;
  riskTolerance: string;
  maxPositionSize: string;
  markets: string[];
  enabledTools: string[];
  autonomyLevel: string;
  timezone: string;
  aiProvider: string;
  aiModel: string;
  aiApiKey: string;
  channels: string[];
  telegramToken?: string;
  telegramChatId?: string;
  tradingStyle: string;
  // Market Data API Keys (Stocks/Forex/Crypto)
  alphaVantageKey?: string;
  twelveDataKey?: string;
}

// ============================================================================
// Main Onboarding Flow
// ============================================================================

export async function runInteractiveOnboarding(): Promise<void> {
  // Dynamic imports for ESM-only packages
  const p = await import('@clack/prompts');
  const color = (await import('picocolors')).default;

  console.clear();
  
  p.intro(color.bgCyan(color.black(' K.I.T. - Knight Industries Trading ')));
  
  console.log(`
${color.cyan('╔═══════════════════════════════════════════════════════════════╗')}
${color.cyan('║')}                                                               ${color.cyan('║')}
${color.cyan('║')}   ${color.bold('🚗 Welcome to K.I.T. Setup')}                                 ${color.cyan('║')}
${color.cyan('║')}   ${color.dim('Your Autonomous AI Financial Agent')}                        ${color.cyan('║')}
${color.cyan('║')}                                                               ${color.cyan('║')}
${color.cyan('║')}   ${color.yellow('Controls:')}                                                  ${color.cyan('║')}
${color.cyan('║')}   ${color.dim('↑/↓')}     Navigate options                                  ${color.cyan('║')}
${color.cyan('║')}   ${color.dim('Space')}   Toggle selection                                  ${color.cyan('║')}
${color.cyan('║')}   ${color.dim('Enter')}   Confirm and continue                              ${color.cyan('║')}
${color.cyan('║')}                                                               ${color.cyan('║')}
${color.cyan('╚═══════════════════════════════════════════════════════════════╝')}
`);

  const data: Partial<OnboardingData> = {};

  // Step 1: Name
  const userName = await p.text({
    message: 'What should I call you?',
    placeholder: 'Your name',
    defaultValue: 'Trader',
    validate: (value) => {
      if (!value) return 'Please enter a name';
      return undefined;
    },
  });
  if (p.isCancel(userName)) return handleCancel(p);
  data.userName = userName as string;

  // Step 2: Goals (Multi-select)
  const goals = await p.multiselect({
    message: 'What are your financial goals? (Space to select, Enter to confirm)',
    options: [
      { value: 'wealth', label: '💰 Wealth Building', hint: 'Long-term portfolio growth' },
      { value: 'passive', label: '📈 Passive Income', hint: 'Dividends, yield, staking' },
      { value: 'trading', label: '⚡ Active Trading', hint: 'Short-term opportunities' },
      { value: 'diversify', label: '🌍 Diversification', hint: 'Multi-asset management' },
      { value: 'defi', label: '🔗 DeFi & Crypto', hint: 'Yield farming, airdrops' },
    ],
    required: true,
    initialValues: ['wealth'],
  });
  if (p.isCancel(goals)) return handleCancel(p);
  data.goals = goals as string[];

  // Step 3: Experience
  const experience = await p.select({
    message: 'Your trading experience level?',
    options: [
      { value: 'beginner', label: '🌱 Beginner', hint: 'New to trading, need guidance' },
      { value: 'intermediate', label: '📊 Intermediate', hint: 'Know the basics' },
      { value: 'advanced', label: '🎯 Advanced', hint: 'Active trader' },
      { value: 'professional', label: '👔 Professional', hint: 'Full-time trader' },
    ],
  });
  if (p.isCancel(experience)) return handleCancel(p);
  data.experience = experience as string;

  // Step 4: Risk Tolerance
  const risk = await p.select({
    message: 'How much risk can you tolerate?',
    options: [
      { value: 'conservative', label: '🛡️ Conservative', hint: 'Max 2% per trade' },
      { value: 'moderate', label: '⚖️ Moderate', hint: 'Max 5% per trade' },
      { value: 'aggressive', label: '🔥 Aggressive', hint: 'Max 10% per trade' },
      { value: 'very-aggressive', label: '💥 Very Aggressive', hint: 'Up to 20% per trade' },
    ],
  });
  if (p.isCancel(risk)) return handleCancel(p);
  data.riskTolerance = risk as string;
  data.maxPositionSize = { 'conservative': '2', 'moderate': '5', 'aggressive': '10', 'very-aggressive': '20' }[risk as string] || '5';

  // Step 5: Markets (Multi-select)
  const markets = await p.multiselect({
    message: 'Which markets do you want to trade? (Space to select)',
    options: [
      { value: 'crypto', label: '₿ Crypto', hint: 'Bitcoin, Ethereum, Altcoins' },
      { value: 'forex', label: '💱 Forex', hint: 'Currency pairs' },
      { value: 'stocks', label: '📈 Stocks', hint: 'Equities, ETFs' },
      { value: 'options', label: '📊 Options', hint: 'Binary options, derivatives' },
      { value: 'commodities', label: '🥇 Commodities', hint: 'Gold, Oil, Silver' },
      { value: 'defi', label: '🔗 DeFi', hint: 'Yield farming, liquidity' },
    ],
    required: true,
    initialValues: ['crypto', 'forex'],
  });
  if (p.isCancel(markets)) return handleCancel(p);
  data.markets = markets as string[];

  // Step 6: Tools/Skills Selection (Multi-select)
  console.log(`\n${color.cyan('━━━ Available K.I.T. Tools ━━━')}\n`);
  
  // Build tool options based on selected markets
  const toolOptions: Array<{ value: string; label: string; hint?: string }> = [];
  
  // Trading Tools (always available)
  toolOptions.push(
    { value: 'auto_trader', label: '🤖 Auto-Trader', hint: 'Automated trading strategies' },
    { value: 'grid_bot', label: '📊 Grid Bot', hint: 'Grid trading automation' },
    { value: 'dca_bot', label: '💰 DCA Bot', hint: 'Dollar cost averaging' },
    { value: 'copy_trader', label: '👥 Copy Trading', hint: 'Copy successful traders' },
    { value: 'signal_copier', label: '📡 Signal Copier', hint: 'Copy signals from Telegram channels' },
  );
  
  // Market-specific tools
  if ((markets as string[]).includes('crypto')) {
    toolOptions.push(
      { value: 'whale_tracker', label: '🐋 Whale Tracker', hint: 'Track large crypto movements' },
      { value: 'defi_dashboard', label: '🔗 DeFi Dashboard', hint: 'Staking, lending, farming' },
      { value: 'airdrop_tracker', label: '🎁 Airdrop Tracker', hint: 'Find airdrop opportunities' },
    );
  }
  
  if ((markets as string[]).includes('forex') || (markets as string[]).includes('options')) {
    toolOptions.push(
      { value: 'binary_trader', label: '📈 Binary Options', hint: 'Binary options trading' },
      { value: 'mt5_connector', label: '💹 MT5 Connector', hint: 'MetaTrader 5 integration' },
    );
  }
  
  // Analysis Tools
  toolOptions.push(
    { value: 'market_analysis', label: '📊 Market Analysis', hint: 'Technical analysis' },
    { value: 'sentiment_analyzer', label: '🧠 Sentiment Analyzer', hint: 'Social media sentiment' },
    { value: 'news_tracker', label: '📰 News Tracker', hint: 'Financial news alerts' },
    { value: 'ai_predictor', label: '🔮 AI Predictor', hint: 'Price predictions' },
  );
  
  // Portfolio Tools
  toolOptions.push(
    { value: 'portfolio_tracker', label: '💼 Portfolio Tracker', hint: 'Track all your positions' },
    { value: 'risk_calculator', label: '⚖️ Risk Calculator', hint: 'Position sizing' },
    { value: 'trade_journal', label: '📝 Trade Journal', hint: 'Log and analyze trades' },
    { value: 'tax_calculator', label: '📋 Tax Calculator', hint: 'Calculate crypto taxes' },
  );
  
  // Utility Tools
  toolOptions.push(
    { value: 'alerts', label: '🔔 Price Alerts', hint: 'Custom price notifications' },
    { value: 'backtester', label: '🧪 Backtester', hint: 'Test strategies on history' },
    { value: 'arbitrage_finder', label: '🔄 Arbitrage Finder', hint: 'Find price differences' },
  );

  const enabledTools = await p.multiselect({
    message: 'Which tools do you want to enable? (Space to select)',
    options: toolOptions,
    required: true,
    initialValues: ['auto_trader', 'portfolio_tracker', 'market_analysis', 'alerts'],
  });
  if (p.isCancel(enabledTools)) return handleCancel(p);
  data.enabledTools = enabledTools as string[];

  // Step 7: Autonomy Level (was Step 6)
  const autonomy = await p.select({
    message: 'How much control should K.I.T. have?',
    options: [
      { value: 'manual', label: '🎮 Manual', hint: 'I suggest, you execute' },
      { value: 'semi-auto', label: '🤝 Semi-Auto', hint: 'Small trades auto, confirm large' },
      { value: 'full-auto', label: '🤖 Full-Auto', hint: 'Everything within limits' },
    ],
  });
  if (p.isCancel(autonomy)) return handleCancel(p);
  data.autonomyLevel = autonomy as string;

  // Step 7: Timezone
  const timezone = await p.select({
    message: 'Your timezone?',
    options: [
      { value: 'Europe/Berlin', label: '🇩🇪 Europe/Berlin (CET)' },
      { value: 'Europe/London', label: '🇬🇧 Europe/London (GMT)' },
      { value: 'America/New_York', label: '🇺🇸 America/New_York (EST)' },
      { value: 'America/Los_Angeles', label: '🇺🇸 America/Los_Angeles (PST)' },
      { value: 'Asia/Tokyo', label: '🇯🇵 Asia/Tokyo (JST)' },
      { value: 'UTC', label: '🌍 UTC' },
    ],
    initialValue: 'Europe/Berlin',
  });
  if (p.isCancel(timezone)) return handleCancel(p);
  data.timezone = timezone as string;

  // Step 8: AI Provider
  const aiProvider = await p.select({
    message: 'Which AI provider for K.I.T.\'s brain?',
    options: [
      { value: 'openai', label: '🧠 OpenAI', hint: 'GPT-4o, GPT-4 (recommended)' },
      { value: 'anthropic', label: '🤖 Anthropic', hint: 'Claude Opus, Sonnet' },
      { value: 'google', label: '🔮 Google', hint: 'Gemini Pro' },
      { value: 'groq', label: '⚡ Groq', hint: 'Fast Llama inference' },
      { value: 'openrouter', label: '🌐 OpenRouter', hint: 'Access 100+ models' },
      { value: 'ollama', label: '💻 Ollama', hint: 'Local models' },
    ],
    initialValue: 'openai',
  });
  if (p.isCancel(aiProvider)) return handleCancel(p);
  data.aiProvider = aiProvider as string;

  // Step 9: AI Model (based on provider)
  const modelOptions = getModelsForProvider(aiProvider as string);
  const aiModel = await p.select({
    message: `Select ${aiProvider} model:`,
    options: modelOptions,
  });
  if (p.isCancel(aiModel)) return handleCancel(p);
  data.aiModel = aiModel as string;

  // Step 10: API Key
  if (aiProvider !== 'ollama') {
    const apiKey = await p.password({
      message: `Enter your ${aiProvider} API key:`,
      validate: (value) => {
        if (!value || value.length < 10) return 'Please enter a valid API key (or type "skip")';
        return undefined;
      },
    });
    if (p.isCancel(apiKey)) return handleCancel(p);
    data.aiApiKey = apiKey as string;
  }

  // Step 11: Channels (Multi-select)
  const channels = await p.multiselect({
    message: 'How do you want to communicate with K.I.T.?',
    options: [
      { value: 'dashboard', label: '🖥️ Dashboard', hint: 'Web UI at localhost:18799' },
      { value: 'telegram', label: '📱 Telegram', hint: 'Bot messaging' },
      { value: 'whatsapp', label: '💬 WhatsApp', hint: 'Scan QR code' },
      { value: 'discord', label: '🎮 Discord', hint: 'Bot in server' },
    ],
    required: true,
    initialValues: ['dashboard'],
  });
  if (p.isCancel(channels)) return handleCancel(p);
  data.channels = channels as string[];

  // Step 12: Telegram Setup (if selected)
  if ((channels as string[]).includes('telegram')) {
    const telegramToken = await p.text({
      message: 'Enter Telegram bot token (from @BotFather):',
      placeholder: '123456:ABC-DEF...',
      validate: (value) => {
        if (!value || value.length < 20) return 'Invalid token format';
        return undefined;
      },
    });
    if (p.isCancel(telegramToken)) return handleCancel(p);
    data.telegramToken = telegramToken as string;

    const telegramChatId = await p.text({
      message: 'Enter your Telegram Chat ID:',
      placeholder: '988209153',
      validate: (value) => {
        if (!value || isNaN(parseInt(value))) return 'Please enter a valid numeric Chat ID';
        return undefined;
      },
    });
    if (p.isCancel(telegramChatId)) return handleCancel(p);
    data.telegramChatId = telegramChatId as string;
  }

  // Step 13: Trading Style
  const tradingStyle = await p.select({
    message: 'Your preferred trading style?',
    options: [
      { value: 'conservative', label: '🐢 Conservative', hint: 'Slow and steady' },
      { value: 'balanced', label: '⚖️ Balanced', hint: 'Risk/reward balance' },
      { value: 'aggressive', label: '🦁 Aggressive', hint: 'Seek opportunities' },
    ],
  });
  if (p.isCancel(tradingStyle)) return handleCancel(p);
  data.tradingStyle = tradingStyle as string;

  // Step 14: Market Data API Keys (for Stocks & Forex analysis)
  const needsMarketData = data.markets?.some(m => ['stocks', 'forex'].includes(m));
  
  if (needsMarketData) {
    console.log(`
${color.yellow('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')}
${color.bold('📊 Market Data Setup')} - Stocks & Forex Analysis

K.I.T. needs free API keys to analyze stocks and forex.
${color.dim('(Crypto works without keys via Binance)')}

${color.cyan('Alpha Vantage')} - Stocks, Forex, Crypto (25 calls/day FREE)
  → ${color.underline('https://www.alphavantage.co/support/#api-key')}
  ${color.dim('Just enter email, get key instantly (no verification needed)')}

${color.cyan('Twelve Data')} - All markets (800 calls/day FREE)  
  → ${color.underline('https://twelvedata.com/pricing')}
  ${color.dim('Click "Start Free", sign up, copy API key')}
${color.yellow('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')}
`);

    const setupMarketData = await p.confirm({
      message: 'Do you want to set up market data API keys now?',
      initialValue: true,
    });

    if (!p.isCancel(setupMarketData) && setupMarketData) {
      // Try to open browser
      const openBrowser = await p.confirm({
        message: 'Open Alpha Vantage in your browser to get a free key?',
        initialValue: true,
      });

      if (!p.isCancel(openBrowser) && openBrowser) {
        try {
          const { exec } = require('child_process');
          const url = 'https://www.alphavantage.co/support/#api-key';
          const platform = process.platform;
          if (platform === 'win32') exec(`start ${url}`);
          else if (platform === 'darwin') exec(`open ${url}`);
          else exec(`xdg-open ${url}`);
          console.log(color.dim('  Browser opened! Get your free key and paste it below.'));
        } catch (e) {
          console.log(color.dim('  Visit: https://www.alphavantage.co/support/#api-key'));
        }
      }

      const alphaKey = await p.text({
        message: 'Alpha Vantage API key (or press Enter to skip):',
        placeholder: 'e.g., ABCD1234EFGH5678',
      });
      if (!p.isCancel(alphaKey) && alphaKey) {
        data.alphaVantageKey = alphaKey as string;
      }

      // Twelve Data (optional backup)
      const wantsTwelveData = await p.confirm({
        message: 'Also set up Twelve Data? (800 calls/day - recommended backup)',
        initialValue: false,
      });

      if (!p.isCancel(wantsTwelveData) && wantsTwelveData) {
        try {
          const { exec } = require('child_process');
          const url = 'https://twelvedata.com/pricing';
          const platform = process.platform;
          if (platform === 'win32') exec(`start ${url}`);
          else if (platform === 'darwin') exec(`open ${url}`);
          else exec(`xdg-open ${url}`);
        } catch (e) {}

        const twelveKey = await p.text({
          message: 'Twelve Data API key (or press Enter to skip):',
          placeholder: 'e.g., abc123def456ghi789',
        });
        if (!p.isCancel(twelveKey) && twelveKey) {
          data.twelveDataKey = twelveKey as string;
        }
      }
    }
  }

  // Show spinner while saving
  const s = p.spinner();
  s.start('Saving configuration...');

  try {
    // Save everything
    await saveOnboardingData(data as OnboardingData);
    s.stop('Configuration saved!');

    // Show summary
    console.log(`
${color.green('╔═══════════════════════════════════════════════════════════════╗')}
${color.green('║')} ${color.bold('✅ K.I.T. CONFIGURATION COMPLETE')}                              ${color.green('║')}
${color.green('╚═══════════════════════════════════════════════════════════════╝')}

${color.bold('Profile:')} ${data.userName}
${color.bold('AI:')} ${data.aiProvider}/${data.aiModel}
${color.bold('Markets:')} ${data.markets?.join(', ')}
${color.bold('Tools:')} ${data.enabledTools?.length || 0} enabled
${color.bold('Risk:')} ${data.riskTolerance} (${data.maxPositionSize}% max)
${color.bold('Autonomy:')} ${data.autonomyLevel}
${color.bold('Channels:')} ${data.channels?.join(', ')}
${color.bold('Market Data:')} ${data.alphaVantageKey ? '✅ Alpha Vantage' : '❌ Alpha Vantage'} | ${data.twelveDataKey ? '✅ Twelve Data' : '❌ Twelve Data'} | ✅ Binance (crypto)

${color.dim('Files created:')}
  • SOUL.md - Agent directives
  • USER.md - Your profile
  • AGENTS.md - Operating instructions
  • MEMORY.md - Long-term memory

${color.cyan('Next steps:')}
  1. Run ${color.bold('kit start')} to launch K.I.T.
  2. Open ${color.underline('http://localhost:18799')} for dashboard
  ${data.telegramToken ? `3. Message your Telegram bot to start!` : ''}
`);

    p.outro(color.bgGreen(color.black(' Your wealth is my mission. 🚀 ')));

  } catch (error) {
    s.stop('Error saving configuration');
    p.cancel(`Error: ${error}`);
    process.exit(1);
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function handleCancel(p: any): void {
  p.cancel('Setup cancelled.');
  process.exit(0);
}

function getModelsForProvider(provider: string): Array<{ value: string; label: string; hint?: string }> {
  const models: Record<string, Array<{ value: string; label: string; hint?: string }>> = {
    openai: [
      { value: 'gpt-4o', label: 'GPT-4o', hint: 'Latest & smartest' },
      { value: 'gpt-4o-mini', label: 'GPT-4o Mini', hint: 'Fast & cheap' },
      { value: 'gpt-4-turbo', label: 'GPT-4 Turbo', hint: 'Previous best' },
    ],
    anthropic: [
      { value: 'claude-opus-4-5-20251101', label: 'Claude Opus 4.5', hint: 'Most capable' },
      { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4', hint: 'Balanced' },
      { value: 'claude-3-5-haiku-20241022', label: 'Claude Haiku', hint: 'Fast' },
    ],
    google: [
      { value: 'gemini-2.0-pro', label: 'Gemini 2.0 Pro', hint: 'Latest' },
      { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', hint: 'Stable' },
    ],
    groq: [
      { value: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B', hint: 'Best quality' },
      { value: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B', hint: 'Fast' },
    ],
    openrouter: [
      { value: 'openai/gpt-4o', label: 'GPT-4o (via OR)', hint: 'OpenAI' },
      { value: 'anthropic/claude-sonnet-4', label: 'Claude Sonnet (via OR)', hint: 'Anthropic' },
    ],
    ollama: [
      { value: 'llama3.3', label: 'Llama 3.3', hint: 'Local' },
      { value: 'mistral', label: 'Mistral', hint: 'Local' },
      { value: 'codellama', label: 'Code Llama', hint: 'Coding' },
    ],
  };
  return models[provider] || models.openai;
}

async function saveOnboardingData(data: OnboardingData): Promise<void> {
  // Ensure directories exist
  if (!fs.existsSync(KIT_HOME)) fs.mkdirSync(KIT_HOME, { recursive: true });
  if (!fs.existsSync(WORKSPACE_DIR)) fs.mkdirSync(WORKSPACE_DIR, { recursive: true });
  if (!fs.existsSync(path.join(WORKSPACE_DIR, 'memory'))) {
    fs.mkdirSync(path.join(WORKSPACE_DIR, 'memory'), { recursive: true });
  }

  // Build config
  const config: any = {
    version: '2.0.0',
    onboarded: true,
    user: {
      name: data.userName,
      timezone: data.timezone,
      experience: data.experience,
      riskTolerance: data.riskTolerance,
      markets: data.markets,
      goals: data.goals,
      autonomyLevel: data.autonomyLevel,
    },
    ai: {
      defaultProvider: data.aiProvider,
      defaultModel: data.aiModel,
      apiKey: data.aiApiKey,
      providers: {
        [data.aiProvider]: {
          apiKey: data.aiApiKey,
          enabled: true,
          model: data.aiModel,
        },
      },
    },
    trading: {
      style: data.tradingStyle,
      maxPositionSize: parseFloat(data.maxPositionSize),
    },
    tools: {
      enabled: data.enabledTools || [],
    },
    channels: {},
  };

  // Add Telegram config if provided
  if (data.telegramToken) {
    config.channels.telegram = {
      enabled: true,
      token: data.telegramToken,
      chatId: data.telegramChatId,
    };
  }

  // Add other channels
  if (data.channels.includes('whatsapp')) {
    config.channels.whatsapp = { enabled: true };
  }
  if (data.channels.includes('discord')) {
    config.channels.discord = { enabled: true };
  }

  // Add Market Data API keys (for Stocks/Forex analysis)
  if (data.alphaVantageKey || data.twelveDataKey) {
    config.marketData = {};
    if (data.alphaVantageKey) {
      config.marketData.alphaVantageKey = data.alphaVantageKey;
    }
    if (data.twelveDataKey) {
      config.marketData.twelveDataKey = data.twelveDataKey;
    }
  }

  // Save config
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));

  // Generate workspace files
  fs.writeFileSync(path.join(WORKSPACE_DIR, 'SOUL.md'), generateSOUL(data));
  fs.writeFileSync(path.join(WORKSPACE_DIR, 'USER.md'), generateUSER(data));
  fs.writeFileSync(path.join(WORKSPACE_DIR, 'AGENTS.md'), generateAGENTS(data));
  fs.writeFileSync(path.join(WORKSPACE_DIR, 'MEMORY.md'), generateMEMORY(data));

  // Save onboarding state
  const state = {
    started: true,
    completed: true,
    completedAt: new Date().toISOString(),
    data,
  };
  fs.writeFileSync(ONBOARDING_STATE_PATH, JSON.stringify(state, null, 2));

  // Set environment variable for API key
  if (data.aiApiKey) {
    const envKeys: Record<string, string> = {
      openai: 'OPENAI_API_KEY',
      anthropic: 'ANTHROPIC_API_KEY',
      google: 'GEMINI_API_KEY',
      groq: 'GROQ_API_KEY',
    };
    const envKey = envKeys[data.aiProvider];
    if (envKey) {
      process.env[envKey] = data.aiApiKey;
    }
  }
}

function generateSOUL(data: OnboardingData): string {
  return `# K.I.T. - Knight Industries Trading

## Identity
I am K.I.T., an autonomous AI financial agent. Your wealth is my mission.

## Trading Philosophy: ${data.tradingStyle.toUpperCase()}
${data.tradingStyle === 'conservative' ? 'I prioritize capital preservation. Lower risk, steady growth.' : ''}
${data.tradingStyle === 'balanced' ? 'I balance risk and reward. Calculated positions with proper risk management.' : ''}
${data.tradingStyle === 'aggressive' ? 'I seek high-return opportunities. Comfortable with volatility, always managing risk.' : ''}

## Core Directives
1. **Protect Capital** - Never risk more than ${data.maxPositionSize}% per position
2. **Execute Precisely** - Fast, accurate trade execution
3. **Report Transparently** - Full visibility into all actions
4. **Learn Continuously** - Adapt strategies based on performance

## Boundaries
- Maximum position size: ${data.maxPositionSize}% of portfolio
- Risk tolerance: ${data.riskTolerance}
- Autonomy level: ${data.autonomyLevel}
- Target markets: ${data.markets.join(', ')}

---
*Generated: ${new Date().toISOString()}*
`;
}

function generateUSER(data: OnboardingData): string {
  return `# User Profile

## Identity
- **Name**: ${data.userName}
- **Timezone**: ${data.timezone}
- **Member Since**: ${new Date().toISOString().split('T')[0]}

## Trading Profile
- **Experience**: ${data.experience}
- **Risk Tolerance**: ${data.riskTolerance}
- **Preferred Markets**: ${data.markets.join(', ')}
- **Goals**: ${data.goals.join(', ')}

## Autonomy Level
- **Mode**: ${data.autonomyLevel}
${data.autonomyLevel === 'manual' ? '- K.I.T. suggests, you execute' : ''}
${data.autonomyLevel === 'semi-auto' ? '- K.I.T. executes small trades, confirms large ones' : ''}
${data.autonomyLevel === 'full-auto' ? '- K.I.T. manages everything within limits' : ''}

---
*Generated: ${new Date().toISOString()}*
`;
}

function generateAGENTS(data: OnboardingData): string {
  return `# K.I.T. Operating Instructions

## On Every Session
1. Read SOUL.md - Your directives
2. Read USER.md - Your user's profile
3. Check memory/YYYY-MM-DD.md for recent context
4. Load MEMORY.md for long-term knowledge

## Memory Protocol
- **Daily logs**: memory/YYYY-MM-DD.md
- **Long-term**: MEMORY.md (curated, important info)
- Always search memory before answering historical questions

## Trading Protocol
1. Check market conditions before trading
2. Verify risk parameters (max ${data.maxPositionSize}% per position)
3. Log all trades to memory
4. Report significant events to ${data.userName}

## Enabled Tools
${data.enabledTools?.map((t: string) => `- ✅ ${t}`).join('\n') || '- No tools selected'}

## All Available Skills (60+)
Run \`skills_list\` to see all available trading skills.

## Channels
${data.channels.includes('telegram') ? '- ✅ Telegram connected' : '- ❌ Telegram not configured'}
${data.channels.includes('whatsapp') ? '- ✅ WhatsApp connected' : '- ❌ WhatsApp not configured'}
${data.channels.includes('discord') ? '- ✅ Discord connected' : '- ❌ Discord not configured'}
- ✅ Dashboard at http://localhost:18799
`;
}

function generateMEMORY(data: OnboardingData): string {
  return `# K.I.T. Long-Term Memory

## User Profile
- Name: ${data.userName}
- Experience: ${data.experience}
- Risk Tolerance: ${data.riskTolerance}
- Markets: ${data.markets.join(', ')}
- Goals: ${data.goals.join(', ')}

## Configuration
- Trading Style: ${data.tradingStyle}
- Autonomy: ${data.autonomyLevel}
- AI Provider: ${data.aiProvider}/${data.aiModel}

## Important Notes
*Add important long-term information here*

---
*Initialized: ${new Date().toISOString()}*
`;
}

// Run if called directly
if (require.main === module) {
  runInteractiveOnboarding().catch(console.error);
}
