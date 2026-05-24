---
name: arbitrage-finder
description: Real-time cross-exchange arbitrage detection. Find risk-free profit opportunities across CEX and DEX.
metadata:
  {
    "kit":
      {
        "emoji": "⚡",
        "category": "trading",
        "tier": "premium",
        "requires": { 
          "skills": ["exchange-connector"],
          "config": ["multiple_exchanges"]
        }
      }
  }
---

# Arbitrage Finder ⚡

**Free money detector.** Scans all connected exchanges in real-time to find price discrepancies and execute risk-free arbitrage.

## Arbitrage Types

### 1. Simple Arbitrage
Buy low on Exchange A, sell high on Exchange B.

```
BTC on Binance: $50,000
BTC on Kraken:  $50,150

Profit: $150 per BTC (0.3%)
After fees: ~$100 (0.2%)
```

### 2. Triangular Arbitrage
Exploit price differences within a single exchange.

```
Path: USDT → BTC → ETH → USDT

1. Buy BTC with USDT: 50,000 USDT → 1 BTC
2. Buy ETH with BTC:  1 BTC → 16.5 ETH
3. Sell ETH for USDT: 16.5 ETH → 50,200 USDT

Profit: $200 (0.4%)
```

### 3. Statistical Arbitrage
Profit from temporary price deviations from historical norms.

```
BTC/ETH ratio normally: 16.0
Current ratio: 16.8 (ETH undervalued)

Strategy: Long ETH, Short BTC
Exit when ratio returns to mean
```

### 4. DEX-CEX Arbitrage
Exploit differences between centralized and decentralized exchanges.

```
ETH on Uniswap: $3,000
ETH on Binance: $3,030

Strategy: 
1. Buy on Uniswap
2. Transfer to Binance
3. Sell on Binance
4. Transfer USDT back

Profit: $30 per ETH (1%)
Time: ~15 minutes
```

### 5. Futures-Spot Arbitrage (Cash & Carry)
Profit from futures premium.

```
BTC Spot: $50,000
BTC Futures (Mar): $51,000 (2% premium)

Strategy:
1. Buy 1 BTC spot
2. Short 1 BTC futures
3. Hold until expiry
4. Profit: $1,000 risk-free

Annualized: ~24% APY
```

## Real-Time Scanner

```bash
kit arb scan

# Output:
⚡ Arbitrage Scanner - Live
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Scanning 5 exchanges, 150 pairs...
Last update: 2 seconds ago

🔥 ACTIVE OPPORTUNITIES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. BTC/USDT Simple Arbitrage
   Buy:  Kraken @ $50,012
   Sell: Binance @ $50,089
   Spread: 0.15% ($77/BTC)
   Net Profit: 0.09% ($45/BTC after fees)
   Size Available: 2.5 BTC
   Total Profit: ~$112
   Risk: LOW ✅
   [EXECUTE]

2. ETH Triangular (Binance)
   Path: USDT → ETH → BNB → USDT
   Expected Return: 0.12%
   Size: $10,000 → $10,012
   Profit: $12
   Risk: LOW ✅
   [EXECUTE]

3. SOL DEX-CEX
   Buy:  Raydium @ $98.50
   Sell: Binance @ $99.20
   Spread: 0.71%
   Net (after gas): 0.45%
   Transfer time: ~2 min
   Risk: MEDIUM ⚠️
   [EXECUTE]

📊 Statistics (24h):
• Opportunities detected: 847
• Executed: 23
• Total profit: $1,234.56
• Success rate: 100%
• Average profit: $53.67
```

## Auto-Execute Mode

```yaml
# TOOLS.md
arbitrage:
  auto_execute: true
  
  # Minimum requirements
  min_profit_percent: 0.1
  min_profit_usd: 10
  max_execution_time: 60s
  
  # Risk limits
  max_single_trade: 5000  # USD
  max_daily_volume: 50000
  
  # Exchange preferences
  preferred_exchanges:
    - binance
    - kraken
    - coinbase
  
  # Strategy settings
  strategies:
    simple:
      enabled: true
      min_spread: 0.08%
    triangular:
      enabled: true
      min_return: 0.05%
    dex_cex:
      enabled: false  # Requires manual gas management
    futures_spot:
      enabled: true
      min_premium: 1%
```

## Execution Engine

```bash
kit arb execute <opportunity-id>

# Output:
⚡ Executing Arbitrage #ARB-2847
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Type: Simple Arbitrage
Pair: BTC/USDT
Size: 0.5 BTC

Step 1/3: Buy on Kraken
├─ Order placed: 0.5 BTC @ $50,012
├─ Order filled: ✅
└─ Cost: $25,006.00

Step 2/3: Transfer to Binance
├─ Status: Skipped (already have balance)
└─ Time saved: ~30 min

Step 3/3: Sell on Binance  
├─ Order placed: 0.5 BTC @ $50,089
├─ Order filled: ✅
└─ Received: $25,044.50

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXECUTION COMPLETE ✅

Gross Profit: $38.50
Fees Paid: $12.52
Net Profit: $25.98
ROI: 0.10%
Time: 4.2 seconds

Total Arbitrage Profit Today: $1,260.54
```

## Risk Management

### Execution Risk
- **Slippage Protection**: Cancel if price moves >0.05%
- **Partial Fill Handling**: Auto-hedge unfilled portions
- **Timeout Protection**: Cancel orders after 30s

### Capital Efficiency
```bash
kit arb capital

# Output:
💰 Arbitrage Capital Allocation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total Allocated: $50,000

By Exchange:
• Binance:  $20,000 (40%)
• Kraken:   $15,000 (30%)
• Coinbase: $10,000 (20%)
• OKX:      $5,000 (10%)

By Asset:
• USDT: $30,000 (60%)
• BTC:  $15,000 (30%)
• ETH:  $5,000 (10%)

Utilization (24h): 73%
Idle Capital: $13,500
Suggestion: Move $5,000 from Coinbase to Binance
```

## Performance Analytics

```bash
kit arb stats

# Output:
📊 Arbitrage Performance
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Today:
• Opportunities: 847
• Executed: 23
• Profit: $1,234.56
• Win Rate: 100%
• Avg Profit: $53.67

This Week:
• Opportunities: 5,231
• Executed: 156
• Profit: $8,456.78
• Best Day: Tuesday ($2,100)

This Month:
• Total Profit: $34,567.89
• ROI on Capital: 69%
• Annualized: ~830%

By Strategy:
┌───────────────┬─────────┬─────────┬─────────┐
│ Strategy      │ Trades  │ Profit  │ Avg     │
├───────────────┼─────────┼─────────┼─────────┤
│ Simple        │ 89      │ $5,234  │ $58.81  │
│ Triangular    │ 45      │ $1,890  │ $42.00  │
│ Futures-Spot  │ 12      │ $1,234  │ $102.83 │
│ DEX-CEX       │ 10      │ $98     │ $9.80   │
└───────────────┴─────────┴─────────┴─────────┘
```

## API

```typescript
import { ArbitrageFinder } from '@binaryfaster/kit';

const arb = new ArbitrageFinder();

// Scan for opportunities
const opportunities = await arb.scan();

// Execute opportunity
const result = await arb.execute(opportunities[0].id);

// Get stats
const stats = await arb.getStats('24h');

// Subscribe to opportunities
arb.on('opportunity', async (opp) => {
  if (opp.netProfit > 50 && opp.risk === 'low') {
    await arb.execute(opp.id);
  }
});

// Start auto-mode
arb.startAutoMode({
  minProfit: 10,
  maxRisk: 'medium'
});
```

## Safety Features

1. **Pre-execution Checks**
   - Verify balances on both exchanges
   - Check withdrawal/deposit status
   - Confirm price hasn't moved

2. **Atomic Execution**
   - Both legs execute or neither
   - Automatic rollback on failure

3. **Rate Limiting**
   - Respect exchange API limits
   - Queue executions to avoid blocks

4. **Profit Verification**
   - Post-trade audit
   - Alert on unexpected results
