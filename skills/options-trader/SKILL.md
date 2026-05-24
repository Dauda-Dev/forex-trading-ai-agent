---
name: options-trader
description: Derivatives trading - options, futures, and perpetuals. Advanced strategies for hedging and leverage.
metadata:
  {
    "kit":
      {
        "emoji": "📊",
        "category": "derivatives",
        "tier": "premium",
        "requires": { 
          "skills": ["exchange-connector", "risk-ai"],
          "env": ["DERIBIT_API_KEY"]
        }
      }
  }
---

# Options Trader 📊

**Master the derivatives.** Trade options, futures, and perpetuals with sophisticated strategies used by professional traders.

## Supported Derivatives

### Exchanges
- **Deribit** - BTC & ETH Options (primary)
- **Binance** - Options & Futures
- **OKX** - Options & Futures
- **Bybit** - Perpetuals & Futures

### Instruments
- ✅ Call Options
- ✅ Put Options
- ✅ Futures (Dated)
- ✅ Perpetual Swaps
- ✅ Spreads & Combos

## Options Basics

```bash
kit options chain BTC

# Output:
📊 BTC Options Chain
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Spot Price: $50,000 | IV: 52%

Expiry: Mar 28, 2026 (47 days)

CALLS                          PUTS
───────────────────────────────────────────────
Strike   Price   IV    Delta │ Price   IV    Delta
$45,000  $6,200  48%   0.82  │ $850    49%   -0.18
$47,500  $4,100  50%   0.71  │ $1,350  51%   -0.29
$50,000  $2,450  52%   0.55  │ $2,200  53%   -0.45 ← ATM
$52,500  $1,350  54%   0.39  │ $3,600  55%   -0.61
$55,000  $680    56%   0.25  │ $5,400  57%   -0.75
$60,000  $180    60%   0.10  │ $9,900  61%   -0.90

Most Active: $50,000 Call (2,500 contracts)
Put/Call Ratio: 0.65 (bullish)
Max Pain: $48,500
```

## Options Strategies

### 1. Covered Call (Income)
Own the asset, sell calls for income.

```bash
kit options covered-call BTC

# Output:
📊 Covered Call Strategy: BTC
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You own: 1 BTC @ $50,000

Recommended Covered Call:
├─ Sell: 1x $55,000 Call (Mar 28)
├─ Premium Received: $680 (1.36%)
├─ Breakeven: $49,320
├─ Max Profit: $5,680 (+11.4%)
└─ Max Loss: Unlimited below $49,320

Scenarios:
• BTC at $55,000: +$5,680 (capped)
• BTC at $52,500: +$3,180 (profit)
• BTC at $50,000: +$680 (premium only)
• BTC at $47,500: -$1,820 (but better than no call)

Probability of Profit: 72%
Annual Yield (if repeated): ~36%

[EXECUTE STRATEGY]
```

### 2. Protective Put (Insurance)
Buy puts to protect your holdings.

```bash
kit options protective-put BTC

# Output:
📊 Protective Put Strategy: BTC
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You own: 1 BTC @ $50,000

Recommended Protection:
├─ Buy: 1x $47,500 Put (Mar 28)
├─ Cost: $1,350 (2.7%)
├─ Protected below: $47,500
├─ Max Loss: $3,850 (-7.7%)
└─ Upside: Unlimited

This is like buying insurance:
• Premium: $1,350 (insurance cost)
• Deductible: $2,500 (strike gap)
• Coverage: Everything below $47,500

Without Protection: Could lose $50,000
With Protection: Max loss is $3,850

Cost of Peace of Mind: 2.7%

[EXECUTE STRATEGY]
```

### 3. Bull Call Spread (Directional)
Limited risk bullish bet.

```bash
kit options bull-spread BTC --target 55000

# Output:
📊 Bull Call Spread: BTC
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Outlook: Bullish to $55,000

Strategy:
├─ Buy: 1x $50,000 Call @ $2,450
├─ Sell: 1x $55,000 Call @ $680
├─ Net Cost: $1,770 (max loss)
├─ Max Profit: $3,230 (if BTC > $55K)
└─ Breakeven: $51,770

Payoff at Expiry:
• BTC > $55,000: +$3,230 (+183%)
• BTC = $53,000: +$1,230 (+69%)
• BTC = $51,770: $0 (breakeven)
• BTC = $50,000: -$1,770 (max loss)
• BTC < $50,000: -$1,770 (max loss)

Risk/Reward: 1:1.83
Probability of Profit: 48%

[EXECUTE STRATEGY]
```

### 4. Iron Condor (Range Trading)
Profit if price stays in a range.

```bash
kit options iron-condor BTC --range 45000-55000

# Output:
📊 Iron Condor: BTC
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Outlook: BTC stays between $45K-$55K

Strategy:
├─ Sell: 1x $45,000 Put @ $850
├─ Buy: 1x $42,500 Put @ $420
├─ Sell: 1x $55,000 Call @ $680
├─ Buy: 1x $57,500 Call @ $350
├─ Net Credit: $760 (max profit)
└─ Max Loss: $1,740

Profit Zone: $45,000 - $55,000

Payoff:
• BTC in range: +$760 (+43.7%)
• BTC = $44,000: -$240
• BTC = $42,500 or below: -$1,740
• BTC = $56,000: -$240
• BTC = $57,500 or above: -$1,740

Probability of Profit: 68%
Risk/Reward: 1:0.44

[EXECUTE STRATEGY]
```

### 5. Straddle (Volatility Play)
Profit from big moves in either direction.

```bash
kit options straddle BTC

# Output:
📊 Long Straddle: BTC
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Outlook: Expecting a BIG move (direction unknown)

Strategy:
├─ Buy: 1x $50,000 Call @ $2,450
├─ Buy: 1x $50,000 Put @ $2,200
├─ Total Cost: $4,650 (max loss)
└─ Breakevens: $45,350 and $54,650

Profit if BTC moves > 9.3% either way!

Payoff:
• BTC = $60,000: +$5,350 (+115%)
• BTC = $55,000: +$350 (+7.5%)
• BTC = $50,000: -$4,650 (max loss)
• BTC = $45,000: +$350 (+7.5%)
• BTC = $40,000: +$5,350 (+115%)

Best For:
• Before earnings/events
• High IV environments
• Expected breakouts

[EXECUTE STRATEGY]
```

## Futures & Perpetuals

```bash
kit options futures

# Output:
📊 BTC Futures Overview
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Spot: $50,000

Futures:
┌────────────┬───────────┬─────────┬──────────────┐
│ Expiry     │ Price     │ Premium │ Annualized   │
├────────────┼───────────┼─────────┼──────────────┤
│ Perpetual  │ $50,050   │ +0.10%  │ Funding: 8%  │
│ Mar 2026   │ $51,200   │ +2.4%   │ +18.7% APY   │
│ Jun 2026   │ $52,800   │ +5.6%   │ +16.8% APY   │
│ Sep 2026   │ $54,500   │ +9.0%   │ +15.4% APY   │
└────────────┴───────────┴─────────┴──────────────┘

Funding Rate (Perp): +0.01% / 8h
→ Longs pay shorts
→ Indicates bullish sentiment

Basis Trade Opportunity:
• Buy Spot, Short Mar Futures
• Lock in 2.4% (47 days) = 18.7% APY
• Risk-free if held to expiry
```

## Greeks Dashboard

```bash
kit options greeks

# Output:
📊 Portfolio Greeks
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Position: Long 5x $50K Calls, Short 3x $55K Calls

Delta: +0.87 BTC
→ Portfolio gains $870 per $1,000 BTC move up

Gamma: +0.012
→ Delta increases as price rises (good for longs)

Theta: -$45/day
→ Time decay costs $45 daily

Vega: +$125
→ Gains $125 per 1% IV increase

Summary:
• Directionally bullish
• Losing to time decay
• Benefits from volatility increase

Recommendation:
If IV is low, good position.
If IV is high, consider closing some.
```

## API

```typescript
import { OptionsTrader } from '@binaryfaster/kit';

const options = new OptionsTrader();

// Get options chain
const chain = await options.getChain('BTC', '2026-03-28');

// Execute strategy
await options.executeStrategy('covered_call', {
  underlying: 'BTC',
  strike: 55000,
  expiry: '2026-03-28'
});

// Calculate greeks
const greeks = await options.calculateGreeks(positions);

// Futures basis trade
await options.basisTrade({
  asset: 'BTC',
  expiry: '2026-03-28',
  size: 0.5
});
```

## Configuration

```yaml
# TOOLS.md
options_trader:
  enabled: true
  
  exchanges:
    deribit:
      api_key: ${DERIBIT_API_KEY}
      secret: ${DERIBIT_SECRET}
      
  # Risk limits
  max_options_allocation: 10%
  max_delta: 2.0  # BTC equivalent
  max_leverage: 3x
  
  # Auto-management
  roll_before_expiry: 7  # days
  auto_exercise: false
  
  # Greeks limits
  max_negative_theta: 100  # $/day
  max_vega_exposure: 500
```
