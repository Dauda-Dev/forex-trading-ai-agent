---
name: twitter-posting
description: "Post trading signals, market analysis, and performance updates to Twitter/X automatically"
metadata:
  {
    "openclaw":
      {
        "emoji": "🐦",
        "requires": { "bins": ["python3"], "pip": ["tweepy", "pillow", "matplotlib"] }
      }
  }
---

# Twitter Posting Skill

Automatically share trading signals, market analysis, and portfolio performance on Twitter/X.

## Overview

- **Auto-Post Signals** - Share buy/sell signals with your followers
- **Market Analysis** - Post technical analysis with charts
- **Performance Reports** - Daily/weekly P&L summaries
- **Alert Notifications** - Important market events
- **Engagement Automation** - Schedule posts for optimal times

## Features

### 1. Signal Broadcasting
Automatically tweet when K.I.T. generates signals:

```
🟢 BTC/USDT LONG Signal

📈 Entry: $43,500
🎯 Target: $45,000 (+3.4%)
🛑 Stop: $42,500 (-2.3%)

RSI: 32 (Oversold)
MACD: Bullish Cross

⚡ Powered by K.I.T.
#Bitcoin #Crypto #Trading

🤖 @KITTradingBot
```

### 2. Analysis Tweets
Share detailed market analysis:

```
📊 BTC/USDT 4H Analysis

The chart shows a classic bull flag forming:
✅ Higher lows maintained
✅ Volume declining (consolidation)
✅ Above 50 EMA

Key Levels:
• Resistance: $45,000
• Support: $42,000

Bias: BULLISH 🟢

#Bitcoin #TechnicalAnalysis

[Chart Image Attached]
```

### 3. Performance Reports
Daily/weekly trading summaries:

```
📈 K.I.T. Weekly Performance

Week of Jan 8-14, 2024

📊 Trades: 23
✅ Win Rate: 74%
💰 Total P&L: +$2,847 (+5.7%)

Top Performers:
🥇 ETH/USDT +$892
🥈 BTC/USDT +$567
🥉 SOL/USDT +$445

#TradingResults #Performance
```

### 4. Alert Tweets
Important market notifications:

```
⚠️ MARKET ALERT

BTC just broke above $45,000 resistance!

This is a significant level that hasn't been breached in 30 days.

Volume: 2.3x average
RSI: 62 (Healthy momentum)

Watch for continuation or rejection.

#Bitcoin #BreakingNews
```

## Configuration

```yaml
# workspace/twitter-posting.yaml
credentials:
  api_key: "${TWITTER_API_KEY}"
  api_secret: "${TWITTER_API_SECRET}"
  access_token: "${TWITTER_ACCESS_TOKEN}"
  access_secret: "${TWITTER_ACCESS_SECRET}"
  bearer_token: "${TWITTER_BEARER_TOKEN}"

settings:
  # What to post automatically
  auto_post:
    signals: true           # Post when signals generated
    analysis: true          # Post daily analysis
    performance: true       # Post performance reports
    alerts: true           # Post important alerts
    
  # Posting frequency limits
  rate_limits:
    max_per_hour: 4
    max_per_day: 20
    min_interval_minutes: 15
    
  # Scheduling
  schedule:
    analysis: "08:00"       # Daily analysis post
    performance: "sunday:20:00"  # Weekly performance
    
  # Content preferences
  content:
    include_hashtags: true
    max_hashtags: 5
    include_chart: true
    include_disclaimer: true
    mention_bot: true
    
  # Filters
  filters:
    min_signal_confidence: 0.7
    min_trade_size_usd: 100
    post_winning_trades_only: false
    
templates:
  signal: |
    {emoji} {symbol} {action} Signal
    
    📈 Entry: ${entry_price}
    🎯 Target: ${target} ({target_pct})
    🛑 Stop: ${stop_loss} ({sl_pct})
    
    {indicators}
    
    ⚡ Powered by K.I.T.
    {hashtags}
    
  analysis: |
    📊 {symbol} {timeframe} Analysis
    
    {analysis_text}
    
    Key Levels:
    • Resistance: ${resistance}
    • Support: ${support}
    
    Bias: {bias} {bias_emoji}
    
    {hashtags}
```

## Commands

### Post Management

```bash
# Post a signal manually
kit twitter post-signal BTC/USDT LONG 45000 --tp 47000 --sl 44000

# Post analysis
kit twitter post-analysis BTC/USDT --timeframe 4h

# Post performance
kit twitter post-performance --period weekly

# Post custom tweet
kit twitter post "Your custom message here" --image chart.png
```

### Configuration

```bash
# Enable/disable auto-posting
kit twitter auto on
kit twitter auto off

# Set posting schedule
kit twitter schedule analysis 08:00
kit twitter schedule performance "sunday:20:00"

# Test credentials
kit twitter test
```

### Monitoring

```bash
# Show recent tweets
kit twitter history --limit 10

# Show engagement stats
kit twitter stats

# Show scheduled posts
kit twitter queue
```

## Tweet Templates

### Signal Tweet (Long)

```
🟢 {SYMBOL} LONG Signal

📈 Entry: ${ENTRY}
🎯 TP1: ${TP1} (+{TP1_PCT}%)
🎯 TP2: ${TP2} (+{TP2_PCT}%)
🛑 SL: ${SL} (-{SL_PCT}%)

📊 RSI: {RSI}
📈 MACD: {MACD_STATUS}
📉 BB: {BB_POSITION}

Confidence: {CONFIDENCE_EMOJI} {CONFIDENCE}%

#Crypto #Trading #{SYMBOL_TAG}
```

### Signal Tweet (Short)

```
🔴 {SYMBOL} SHORT Signal

📉 Entry: ${ENTRY}
🎯 Target: ${TARGET} ({TARGET_PCT}%)
🛑 Stop: ${SL} ({SL_PCT}%)

{INDICATORS}

⚠️ This is not financial advice
#Crypto #Trading
```

### Analysis Tweet

```
📊 {SYMBOL} Technical Analysis

{TREND_EMOJI} Trend: {TREND}
📈 Support: ${SUPPORT}
📉 Resistance: ${RESISTANCE}

Indicators:
• RSI(14): {RSI} - {RSI_SIGNAL}
• MACD: {MACD_SIGNAL}
• Volume: {VOLUME_SIGNAL}

Summary: {BIAS}

#TechnicalAnalysis #Crypto
```

### Performance Tweet

```
📈 K.I.T. {PERIOD} Performance

📊 Trades: {TOTAL_TRADES}
✅ Wins: {WINS} ({WIN_RATE}%)
❌ Losses: {LOSSES}

💰 Total P&L: {TOTAL_PNL}
📈 Best Trade: {BEST_TRADE}
📉 Worst Trade: {WORST_TRADE}

{TOP_PERFORMERS}

#TradingResults #Performance
```

## Chart Generation

K.I.T. can generate charts to attach to tweets:

### Candlestick Chart

```python
# Auto-generated chart includes:
# - Candlesticks (OHLC)
# - Moving averages (if in analysis)
# - Support/Resistance lines
# - Entry/TP/SL levels for signals
# - RSI subplot
# - Volume bars
```

### Performance Chart

```python
# Auto-generated performance chart:
# - Equity curve
# - Drawdown visualization
# - Win/loss distribution
# - P&L by symbol
```

## Safety Features

### 1. Rate Limiting
- Max tweets per hour/day
- Minimum interval between tweets
- Automatic queue management

### 2. Content Filtering
- No posting during high volatility (optional)
- Minimum confidence threshold for signals
- Review mode for new templates

### 3. Compliance
- Automatic disclaimer inclusion
- No financial advice language
- Clear bot identification

### 4. Error Handling
- Retry on API failures
- Notification on errors
- Fallback to queue

## Integration Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    K.I.T. EVENTS                            │
│  Signal Generated │ Analysis Complete │ Trade Closed       │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                   TWITTER SKILL                             │
│  • Format message from template                             │
│  • Generate chart (if needed)                               │
│  • Check rate limits                                        │
│  • Add to queue or post immediately                         │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                   TWITTER API                               │
│  • Post tweet                                               │
│  • Upload media                                             │
│  • Handle responses                                         │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                   LOGGING & METRICS                         │
│  • Store tweet ID                                           │
│  • Track engagement                                         │
│  • Update statistics                                        │
└─────────────────────────────────────────────────────────────┘
```

## Example Usage

### Auto-Post Signal

```
[K.I.T. generates BTC signal]

K.I.T.: 📤 Posting signal to Twitter...

Tweet posted successfully! 🐦
https://twitter.com/KITBot/status/123456789

Engagement (after 1h):
• Likes: 45
• Retweets: 12
• Replies: 8
```

### Manual Analysis Post

```
User: Post analysis for ETH to Twitter

K.I.T.: 📊 Generating ETH/USDT 4H analysis...

📤 Posting to Twitter...

✅ Tweet posted!
https://twitter.com/KITBot/status/987654321

Content:
📊 ETH/USDT 4H Analysis

Strong uptrend with healthy consolidation.
Price holding above 20 EMA with RSI at 58.

Key Levels:
• Resistance: $2,500
• Support: $2,300

Bias: BULLISH 🟢

#Ethereum #Crypto #TechnicalAnalysis

[Chart attached]
```

## Files

- `twitter_poster.py` - Main Twitter posting engine
- `templates/` - Tweet templates
  - `signal.txt` - Signal template
  - `analysis.txt` - Analysis template
  - `performance.txt` - Performance template
- `charts/` - Chart generation
  - `chart_generator.py` - Generate charts for tweets
- `config/` - Configuration
  - `twitter-posting.example.yaml` - Example config
