# AI Stock Screener Skill

AI-powered stock screening system inspired by TrendSpider, Trade Ideas (Holly AI), and Zen Ratings.

## Overview

The AI Screener combines multiple analysis methods to identify high-potential trading opportunities:
- **Multi-Factor Scoring**: 100+ factors across Fundamentals, Technicals, Momentum, Sentiment
- **Pattern Recognition**: Automated chart pattern detection
- **AI Neural Model**: Trained on historical data to predict price movements
- **Natural Language Queries**: Ask in plain English (e.g., "show me oversold tech stocks with strong earnings")
- **Real-time Scanning**: Continuous market monitoring with alerts

## Key Features

### 1. Multi-Factor Rating System (Inspired by Zen Ratings)

**7 Component Grades:**
| Grade | Factors | Weight |
|-------|---------|--------|
| **Fundamentals** | P/E, P/B, ROE, Debt/Equity, Margins | 15% |
| **Growth** | Revenue growth, EPS growth, Guidance | 15% |
| **Momentum** | RSI, MACD, Price vs MAs, Volume | 20% |
| **Safety** | Beta, Drawdown history, Volatility | 10% |
| **Sentiment** | Analyst ratings, News sentiment, Social | 15% |
| **Value** | DCF vs Price, PEG, Dividend yield | 15% |
| **AI Score** | Neural network prediction | 10% |

**Overall Rating:** A (top 5%), B (top 20%), C (middle), D (bottom 20%), F (bottom 5%)

### 2. Automated Technical Analysis (Inspired by TrendSpider)

**Auto-Detected Patterns:**
- Head & Shoulders / Inverse
- Double Top / Double Bottom
- Triangles (Ascending, Descending, Symmetrical)
- Wedges (Rising, Falling)
- Flags and Pennants
- Cup and Handle
- Channels (Ascending, Descending)

**Auto-Drawn Lines:**
- Support and Resistance zones
- Trendlines
- Fibonacci retracements
- Moving Average crossovers

### 3. Holly AI (Inspired by Trade Ideas)

**Entry Signal Detection:**
- Scans all stocks every minute
- Identifies high-probability setups
- Provides entry, target, and stop-loss levels
- Confidence score (1-100)
- One-click trade execution

**Holly's Daily Picks:**
- Morning gap plays
- Momentum trades
- Mean reversion setups
- Breakout candidates

### 4. Natural Language Screening

**Example Queries:**
```
"Show me tech stocks under $50 with RSI below 30 and positive earnings growth"
"Find dividend stocks yielding over 4% with low debt"
"Which crypto has the highest momentum this week?"
"Stocks breaking out of consolidation today"
```

## Usage

### Quick Scan
```typescript
import { AIScreener } from './ai-screener';

const screener = new AIScreener();

// Get top rated stocks
const topPicks = await screener.getTopRated({ 
  market: 'US_STOCKS',
  minRating: 'A',
  limit: 20 
});

// Natural language query
const results = await screener.query("oversold large cap tech stocks");

// Pattern scan
const patterns = await screener.scanPatterns({
  symbols: ['AAPL', 'GOOGL', 'MSFT', 'NVDA'],
  patterns: ['double_bottom', 'breakout']
});
```

### Real-time Alerts
```typescript
// Start real-time scanning
screener.startScanner({
  markets: ['US_STOCKS', 'CRYPTO'],
  conditions: [
    { type: 'breakout', threshold: 2 }, // 2% breakout
    { type: 'rsi', direction: 'oversold', threshold: 30 },
    { type: 'volume_spike', multiple: 3 } // 3x average volume
  ],
  onAlert: (alert) => {
    kit.notify(`🚨 ${alert.symbol}: ${alert.message}`);
  }
});
```

### Factor Analysis
```typescript
// Deep dive on a single stock
const analysis = await screener.analyze('NVDA');
console.log(analysis);
/*
{
  symbol: 'NVDA',
  overallRating: 'A',
  confidence: 87,
  grades: {
    fundamentals: 'B',
    growth: 'A+',
    momentum: 'A',
    safety: 'B',
    sentiment: 'A',
    value: 'C',
    ai: 'A'
  },
  signals: [
    { type: 'MACD_CROSS', direction: 'bullish', strength: 'strong' },
    { type: 'ABOVE_50MA', days: 45 },
    { type: 'ANALYST_UPGRADE', source: 'Goldman Sachs', rating: 'Buy' }
  ],
  patterns: [
    { type: 'ascending_triangle', confidence: 78, breakout_target: 950 }
  ],
  aiPrediction: {
    direction: 'up',
    probability: 0.72,
    priceTarget: { '7d': 920, '30d': 980, '90d': 1050 }
  }
}
*/
```

## Data Sources

- **Price Data**: TradingView, Alpha Vantage, Yahoo Finance
- **Fundamentals**: Financial Modeling Prep, Polygon.io
- **Sentiment**: Twitter/X, Reddit, StockTwits, News APIs
- **Analyst Data**: Benzinga, TipRanks, Zacks

## AI Model Architecture

```
Input Layer (Features)
├── Technical Indicators (50+)
├── Fundamental Ratios (30+)
├── Sentiment Scores (10+)
├── Macro Indicators (10+)
└── Price Action (OHLCV patterns)
    ↓
Hidden Layers
├── LSTM for time series
├── Attention mechanism for feature importance
└── Ensemble with gradient boosting
    ↓
Output Layer
├── Direction (up/down/neutral)
├── Magnitude prediction
├── Confidence score
└── Time horizon (1d, 7d, 30d, 90d)
```

## K.I.T. Advantages

| Feature | TrendSpider | Trade Ideas | Zen Ratings | K.I.T. |
|---------|-------------|-------------|-------------|--------|
| Monthly Cost | $54-$297 | $89-$167 | $19-$39 | FREE |
| Self-Hosted | ❌ | ❌ | ❌ | ✅ |
| Custom Models | ❌ | ❌ | ❌ | ✅ |
| Multi-Asset | Stocks only | Stocks only | Stocks only | ✅ All |
| Automation | Basic | Bots | ❌ | Full |
| Open Source | ❌ | ❌ | ❌ | ✅ |

## Configuration

```yaml
ai_screener:
  enabled: true
  markets:
    - US_STOCKS
    - CRYPTO
    - FOREX
  scan_interval: 60  # seconds
  ai_model: ensemble  # or 'lstm', 'gradient_boost'
  min_confidence: 70
  alerts:
    telegram: true
    discord: true
    email: false
  data_sources:
    prices: tradingview
    fundamentals: fmp
    sentiment: aggregated
```

## Files

- `ai-screener.ts` - Main screener implementation
- `factors.ts` - Factor definitions and calculations
- `patterns.ts` - Chart pattern recognition
- `nlp-query.ts` - Natural language query parser
- `models/` - Pre-trained AI models
