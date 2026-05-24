---
name: tax-calculator
description: Calculate tax implications of trades and generate tax reports
version: "1.0.0"
author: K.I.T. Team
tags: [tax, accounting, compliance, reporting]
markets: [crypto, forex, stocks, options]
---

# Tax Calculator

Calculates tax implications for your trades and generates reports for tax filing.

## Features

### Tax Lot Methods
- **FIFO** (First In, First Out) - Default for most jurisdictions
- **LIFO** (Last In, First Out) - May reduce taxes in rising markets
- **HIFO** (Highest In, First Out) - Minimizes gains
- **Specific Identification** - Choose which lots to sell

### Supported Jurisdictions
- 🇺🇸 United States (IRS Form 8949, Schedule D)
- 🇩🇪 Germany (§ 23 EStG crypto, 1-year holding rule)
- 🇬🇧 United Kingdom (HMRC CGT)
- 🇪🇺 EU (VAT-exempt for crypto)
- 🇨🇭 Switzerland (wealth tax)
- 🇸🇬 Singapore (generally tax-free)

### Report Types
- **Capital Gains Summary** - Short-term vs long-term gains
- **Income Report** - Staking, mining, airdrops, interest
- **Cost Basis Report** - Full acquisition history
- **Form 8949** - IRS-ready transaction list
- **Tax Loss Harvesting** - Identify loss opportunities

### DeFi Support
- Swap transactions
- Liquidity provision (impermanent loss tracking)
- Yield farming rewards
- Airdrop classification
- NFT trades

## Usage

### Quick Summary
```
Show my 2025 tax summary
```

### Specific Jurisdiction
```
Calculate German taxes for 2025
```

### Tax Loss Harvesting
```
Find tax loss harvesting opportunities
```

### Generate Report
```
Generate Form 8949 for 2025
```

### Compare Methods
```
Compare FIFO vs HIFO for my trades
```

## Configuration

```json
{
  "tax": {
    "jurisdiction": "US",
    "method": "fifo",
    "fiscalYear": "calendar",
    "currency": "USD",
    "includeUnrealizedGains": false,
    "autoClassify": {
      "stakingAsIncome": true,
      "airdropAsIncome": true,
      "miningAsIncome": true
    }
  }
}
```

## Output Examples

### Capital Gains Summary
```
📊 2025 Tax Summary (US - FIFO)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Short-Term Gains (< 1 year)
├── Realized Gains:   $12,450.00
├── Realized Losses:  -$3,200.00
└── Net Short-Term:   $9,250.00

Long-Term Gains (≥ 1 year)
├── Realized Gains:   $45,000.00
├── Realized Losses:  -$8,500.00
└── Net Long-Term:    $36,500.00

Income (Staking/Mining/Airdrops)
└── Total Income:     $2,340.00

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Estimated Tax (24% bracket):
• Short-term: $2,220.00
• Long-term:  $5,475.00 (15%)
• Income:     $561.60
• TOTAL:      $8,256.60
```

### Tax Loss Harvesting
```
💡 Tax Loss Harvesting Opportunities
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Asset       Unrealized Loss    Est. Tax Savings
────────────────────────────────────────────────
SOL         -$2,450.00         $588.00
AVAX        -$1,890.00         $453.60
LINK        -$1,200.00         $288.00

Total potential savings: $1,329.60

⚠️ Note: Wash sale rules may apply.
   Wait 30 days before rebuying same asset.
```

## German Tax Rules (§ 23 EStG)

For German users, K.I.T. automatically tracks:
- ✅ 1-year holding period (tax-free after 1 year)
- ✅ €600 exemption threshold (Freigrenze)
- ✅ FIFO method (required in Germany)

```
🇩🇪 German Tax Summary 2025
━━━━━━━━━━━━━━━━━━━━━━━━━━

Tax-Free (held > 1 year):
└── €18,500.00 gains (no tax!)

Taxable (held < 1 year):
├── Gains:  €3,200.00
├── Losses: -€800.00
└── Net:    €2,400.00

Note: Above €600 Freigrenze
Estimated tax at 42%: €1,008.00
```

## Requirements

- Trade history from connected exchanges
- For DeFi: wallet addresses for on-chain analysis
- Manual entries for OTC or P2P trades

## Disclaimer

⚠️ This skill provides estimates for educational purposes.
Consult a qualified tax professional for actual tax filing.
Tax laws vary by jurisdiction and change frequently.
