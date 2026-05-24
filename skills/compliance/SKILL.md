---
name: compliance
description: Regulatory compliance across jurisdictions. KYC status, tax reporting, trading restrictions, and legal guidelines.
metadata:
  {
    "kit":
      {
        "emoji": "⚖️",
        "category": "legal",
        "tier": "core",
        "requires": {}
      }
  }
---

# Regulatory Compliance ⚖️

**Trade legally everywhere.** Automatic compliance with regulations across jurisdictions, tax reporting, and trading restrictions.

## Jurisdiction Support

### Fully Supported
- 🇺🇸 United States
- 🇪🇺 European Union (MiCA)
- 🇬🇧 United Kingdom
- 🇩🇪 Germany
- 🇨🇭 Switzerland
- 🇸🇬 Singapore
- 🇯🇵 Japan
- 🇦🇺 Australia

### Partial Support
- 🇨🇦 Canada
- 🇧🇷 Brazil
- 🇮🇳 India

### Restricted
- 🇨🇳 China (limited)
- 🇷🇺 Russia (limited)

## Compliance Dashboard

```bash
kit compliance status

# Output:
⚖️ Compliance Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Your Jurisdiction: Germany 🇩🇪
Tax Residency: Germany
Investor Type: Retail

Overall Status: ✅ COMPLIANT

Checks:
├─ KYC Verified: ✅ All exchanges
├─ Tax Reporting: ✅ Up to date
├─ Trading Limits: ✅ Within limits
├─ Restricted Assets: ✅ None held
└─ Reporting Requirements: ✅ Met

Exchange KYC Status:
┌─────────────┬────────────┬─────────────┐
│ Exchange    │ KYC Level  │ Status      │
├─────────────┼────────────┼─────────────┤
│ Binance     │ Level 2    │ ✅ Verified │
│ Kraken      │ Pro        │ ✅ Verified │
│ Coinbase    │ Full       │ ✅ Verified │
└─────────────┴────────────┴─────────────┘

Upcoming Deadlines:
• Tax Report Due: Mar 31, 2026 (51 days)
• Quarterly Disclosure: Mar 15, 2026 (35 days)
```

## Tax Reporting

```bash
kit compliance tax 2025

# Output:
⚖️ Tax Report 2025 (Germany)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tax Year: Jan 1 - Dec 31, 2025
Method: FIFO (First In, First Out)
Currency: EUR

Summary:
├─ Total Trades: 347
├─ Short-term Gains: €4,521
├─ Short-term Losses: €1,234
├─ Net Short-term: €3,287
├─ Long-term Gains: €12,450 (tax-free*)
└─ Total Taxable: €3,287

*Germany: Crypto held >1 year is tax-free

Tax Owed (estimated):
├─ Income Tax (42%): €1,380
├─ Solidarity Surcharge: €76
└─ Total: €1,456

Breakdown by Asset:
┌─────────┬───────────┬───────────┬───────────┐
│ Asset   │ Proceeds  │ Cost      │ Gain/Loss │
├─────────┼───────────┼───────────┼───────────┤
│ BTC     │ €25,000   │ €20,500   │ +€4,500   │
│ ETH     │ €15,000   │ €12,800   │ +€2,200   │
│ SOL     │ €8,000    │ €9,200    │ -€1,200   │
│ Others  │ €5,000    │ €4,750    │ +€250     │
└─────────┴───────────┴───────────┴───────────┘

[DOWNLOAD FULL REPORT] [EXPORT TO TAX SOFTWARE]
```

## Tax-Loss Harvesting

```bash
kit compliance harvest

# Output:
⚖️ Tax-Loss Harvesting Opportunities
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Current Year Gains: €3,287
Unrealized Losses Available:

┌─────────┬───────────┬───────────┬─────────────────┐
│ Asset   │ Cost      │ Value     │ Loss Available  │
├─────────┼───────────┼───────────┼─────────────────┤
│ AVAX    │ €2,000    │ €1,400    │ -€600          │
│ LINK    │ €1,500    │ €1,100    │ -€400          │
│ DOT     │ €1,200    │ €900      │ -€300          │
└─────────┴───────────┴───────────┴─────────────────┘

Potential Tax Savings:
• Harvest all losses: -€1,300
• New taxable gain: €1,987
• Tax saved: ~€550

Strategy:
1. Sell AVAX, LINK, DOT at loss
2. Wait 30 days (wash sale rule)
3. Rebuy if still bullish
4. Or: Buy similar assets immediately

⚠️ Note: Wash sale rules vary by jurisdiction.
Germany currently has no wash sale rule for crypto.

[AUTO-HARVEST LOSSES]
```

## Trading Restrictions

```bash
kit compliance restrictions

# Output:
⚖️ Trading Restrictions
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Based on your jurisdiction (Germany):

❌ RESTRICTED ASSETS:
┌─────────────────────┬──────────────────────────────┐
│ Asset               │ Reason                       │
├─────────────────────┼──────────────────────────────┤
│ Privacy Coins       │ May be delisted (MiCA)       │
│ Unregistered Tokens │ Not compliant with EU regs   │
│ Leveraged Tokens    │ Restricted for retail        │
└─────────────────────┴──────────────────────────────┘

⚠️ RESTRICTED ACTIVITIES:
• Leverage >2x on Binance (EU)
• Derivatives trading (restricted)
• Certain DeFi protocols

✅ ALLOWED:
• Spot trading (all major assets)
• Staking
• DEX trading
• NFTs

Leverage Limits:
• Binance EU: 2x max
• Kraken: 5x max (for qualified investors)

Auto-Restrictions Applied:
K.I.T. will automatically skip restricted assets
and enforce leverage limits.
```

## Travel Rule Compliance

```bash
kit compliance travel-rule

# Output:
⚖️ Travel Rule Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The Travel Rule requires exchanges to share
sender/receiver info for transfers >€1,000.

Your Transfers (Last 30 Days):
┌─────────┬───────────┬───────────┬───────────┐
│ Date    │ Amount    │ Direction │ Status    │
├─────────┼───────────┼───────────┼───────────┤
│ Feb 5   │ €2,500    │ Binance→  │ ✅ Passed │
│         │           │ Ledger    │           │
│ Jan 28  │ €5,000    │ Kraken→   │ ✅ Passed │
│         │           │ Binance   │           │
│ Jan 15  │ €800      │ External→ │ ✅ Below  │
│         │           │ Coinbase  │   limit   │
└─────────┴───────────┴───────────┴───────────┘

Verified Addresses:
• Ledger Nano: bc1q...xyz (verified)
• MetaMask: 0x7a2...4fd (verified)

Note: K.I.T. automatically uses verified addresses
for large transfers to avoid delays.
```

## Regulatory Alerts

```yaml
# TOOLS.md
compliance:
  jurisdiction: DE  # Germany
  tax_residency: DE
  investor_type: retail
  
  alerts:
    - type: new_regulation
      notify: true
    - type: exchange_restriction
      notify: true
    - type: tax_deadline
      notify: true
      days_before: 30
      
  auto_actions:
    enforce_restrictions: true
    block_restricted_assets: true
    enforce_leverage_limits: true
    
  tax:
    method: FIFO
    auto_harvest_losses: false
    report_currency: EUR
```

## API

```typescript
import { Compliance } from '@binaryfaster/kit';

const compliance = new Compliance('DE');

// Check status
const status = await compliance.getStatus();

// Generate tax report
const taxReport = await compliance.generateTaxReport(2025);

// Check if asset is allowed
const allowed = await compliance.isAssetAllowed('XMR');

// Find tax loss opportunities
const harvesting = await compliance.findTaxLossOpportunities();

// Check travel rule
const travelRule = await compliance.checkTravelRule(transfer);
```

## Disclaimer

⚖️ **K.I.T. provides information, not legal/tax advice.**

- Consult a tax professional for your specific situation
- Regulations change frequently
- K.I.T. makes best-effort compliance checks
- You are responsible for your own tax filings
- Always verify before filing official documents
