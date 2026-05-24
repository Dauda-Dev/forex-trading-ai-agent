# Build Your Own Trading Bot

> 🤖 Build your own trading bot with K.I.T. in under 30 minutes!

## Why K.I.T.?

K.I.T. is not just a trading bot - it's a **framework** like OpenClaw. You can:

- ✅ Develop your own trading bots
- ✅ Implement custom strategies
- ✅ Build apps for all supported platforms
- ✅ Create Telegram/Discord bots
- ✅ Build web dashboards
- ✅ Offer signal services

---

## 🚀 5 Steps to Your Own Bot

### Step 1: Create Project

```bash
mkdir my-trading-bot
cd my-trading-bot
npm init -y
npm install kit-trading typescript ts-node
```

### Step 2: Configure TypeScript

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "outDir": "dist"
  }
}
```

### Step 3: Write Bot Code

```typescript
// src/bot.ts
import { createBot, RSIStrategy } from 'kit-trading';

const bot = createBot({
  name: 'MyRSIBot',
  
  // Exchange
  exchange: 'binance',
  credentials: {
    apiKey: process.env.BINANCE_API_KEY!,
    secret: process.env.BINANCE_SECRET!,
  },
  
  // Trading Pair
  pair: 'BTC/USDT',
  timeframe: '1h',
  
  // Strategy
  strategy: new RSIStrategy({
    period: 14,
    oversold: 30,
    overbought: 70,
  }),
  
  // Risk Management
  risk: {
    maxPositionSize: 0.1,  // 10% per trade
    stopLoss: 0.02,        // 2% stop loss
    takeProfit: 0.04,      // 4% take profit
    maxDailyLoss: 0.05,    // 5% max daily loss
  },
  
  // Notifications
  notifications: {
    telegram: {
      token: process.env.TELEGRAM_BOT_TOKEN!,
      chatId: process.env.TELEGRAM_CHAT_ID!,
    },
  },
});

// Events
bot.on('signal', (signal) => {
  console.log(`📊 Signal: ${signal.action} ${signal.pair}`);
});

bot.on('trade', (trade) => {
  console.log(`⚡ Trade: ${trade.side} ${trade.amount} ${trade.pair}`);
});

bot.on('error', (error) => {
  console.error(`❌ Error: ${error.message}`);
});

// Start
bot.start();
console.log('🚗 Bot started!');
```

### Step 4: Environment Variables

```bash
# .env
BINANCE_API_KEY=your_api_key
BINANCE_SECRET=your_secret
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

### Step 5: Start Bot

```bash
npx ts-node src/bot.ts
```

**That's it!** 🎉 Your bot is now trading automatically.

---

## 📊 Develop Your Own Strategy

```typescript
// src/strategies/my-strategy.ts
import { Strategy, Candle, Signal, Indicators } from 'kit-trading';

export class MyStrategy extends Strategy {
  name = 'My Super Strategy';
  
  private indicators = new Indicators();
  
  async analyze(candles: Candle[]): Promise<Signal | null> {
    // Your logic here
    const closes = candles.map(c => c.close);
    
    // Example: MA Crossover
    const ma20 = this.indicators.sma(closes, 20);
    const ma50 = this.indicators.sma(closes, 50);
    
    const currentMA20 = ma20[ma20.length - 1];
    const currentMA50 = ma50[ma50.length - 1];
    const prevMA20 = ma20[ma20.length - 2];
    const prevMA50 = ma50[ma50.length - 2];
    
    // Golden Cross
    if (prevMA20 <= prevMA50 && currentMA20 > currentMA50) {
      return { action: 'buy', confidence: 0.8 };
    }
    
    // Death Cross
    if (prevMA20 >= prevMA50 && currentMA20 < currentMA50) {
      return { action: 'sell', confidence: 0.8 };
    }
    
    return null;
  }
}
```

---

## 🌐 Supported Platforms

You can build bots for all these platforms:

### Crypto
- Binance, Binance Futures
- Kraken, Kraken Futures
- Coinbase Pro
- OKX
- Bybit
- KuCoin

### Forex
- **RoboForex** (MT4/MT5)
- IC Markets
- Pepperstone
- OANDA
- XM

### Binary Options
- BinaryFaster
- IQ Option
- Pocket Option

### DeFi
- Uniswap (v2, v3)
- PancakeSwap
- Aave
- Compound

---

## 💡 Project Ideas

| Project | Difficulty | Description |
|---------|------------|-------------|
| DCA Bot | ⭐ Easy | Dollar Cost Averaging |
| Grid Bot | ⭐⭐ Medium | Grid Trading |
| Arbitrage Bot | ⭐⭐⭐ Hard | Cross-Exchange Arbitrage |
| Signal Bot | ⭐⭐ Medium | Telegram Signal Service |
| Copy Trading | ⭐⭐⭐ Hard | Master-Follower System |
| Portfolio App | ⭐⭐ Medium | Multi-Exchange Dashboard |
| News Trader | ⭐⭐⭐ Hard | Event-based Trading |

---

## 🆘 Help & Community

- **Docs**: [K.I.T. Documentation](https://github.com/kayzaa/k.i.t.-bot)
- **Examples**: [Code Examples](https://github.com/kayzaa/k.i.t.-bot/tree/main/examples)
- **Discord**: K.I.T. Developer Community
- **Issues**: [GitHub Issues](https://github.com/kayzaa/k.i.t.-bot/issues)

---

*"Build the future of trading."* 🚗
