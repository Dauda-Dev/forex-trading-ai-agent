---
summary: "Supported Exchanges and Brokers"
read_when:
  - Connect an exchange
  - See supported platforms
title: "Exchanges"
---

# Exchanges

K.I.T. connects to multiple exchanges and brokers for trading across different markets.

## Supported Platforms

### Cryptocurrency Exchanges

| Exchange | Spot | Futures | Margin | Status |
|----------|------|---------|--------|--------|
| [Binance](/exchanges/binance) | ✅ | ✅ | ✅ | ✅ Stable |
| [Kraken](/exchanges/kraken) | ✅ | ✅ | ❌ | ✅ Stable |
| [Coinbase](/exchanges/coinbase) | ✅ | ❌ | ❌ | ✅ Stable |
| Bybit | ✅ | ✅ | ✅ | 🚧 Beta |
| OKX | ✅ | ✅ | ✅ | 🚧 Beta |
| KuCoin | ✅ | ✅ | ✅ | 🚧 Beta |

### Forex/CFD Brokers

| Broker | Via | Status |
|--------|-----|--------|
| [MetaTrader 4/5](/exchanges/metatrader) | MT4/MT5 | ✅ Stable |
| RoboForex | MT5 | ✅ Stable |
| IC Markets | MT5 | ✅ Stable |
| Pepperstone | MT5 | ✅ Stable |
| OANDA | MT5 | ✅ Stable |
| XM | MT5 | 🚧 Beta |

### Traditional Markets

| Platform | Status |
|----------|--------|
| Interactive Brokers | 📋 Planned |
| Alpaca | 📋 Planned |

## Quick Connect

```bash
# Connect any exchange
kit connect <exchange>

# Examples
kit connect binance
kit connect kraken
kit connect metatrader
```

## Features by Exchange

| Feature | Binance | Kraken | Coinbase | MT5 |
|---------|---------|--------|----------|-----|
| Spot Trading | ✅ | ✅ | ✅ | ❌ |
| Futures | ✅ | ✅ | ❌ | ✅ |
| Forex | ❌ | ❌ | ❌ | ✅ |
| WebSocket Streams | ✅ | ✅ | ✅ | ❌ |
| Sandbox/Demo | ✅ | ❌ | ✅ | ✅ |

## Setup Guides

<Columns>
  <Card title="Binance" href="/exchanges/binance" icon="trending-up">
    World's largest crypto exchange
  </Card>
  <Card title="Kraken" href="/exchanges/kraken" icon="anchor">
    Secure crypto exchange with futures
  </Card>
  <Card title="Coinbase" href="/exchanges/coinbase" icon="dollar-sign">
    US-regulated exchange
  </Card>
  <Card title="MetaTrader" href="/exchanges/metatrader" icon="bar-chart-2">
    Forex and CFD trading
  </Card>
</Columns>

## Multi-Exchange Trading

K.I.T. can connect to multiple exchanges simultaneously:

```json
{
  "exchanges": {
    "binance": { "apiKey": "...", "secret": "..." },
    "kraken": { "apiKey": "...", "secret": "..." },
    "metatrader": { "server": "...", "login": "..." }
  }
}
```

### Benefits
- **Arbitrage** - Find price differences
- **Diversification** - Spread risk
- **Best Execution** - Route to best price
- **Unified Portfolio** - See everything in one place

## Related

- [Exchange Connector Skill](/skills/exchange-connector)
- [Portfolio Tracker](/skills/portfolio-tracker)
- [API Keys Security](/security/api-keys)
