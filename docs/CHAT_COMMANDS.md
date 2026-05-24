# K.I.T. Chat Commands - Complete Reference

**K.I.T. understands German AND English - responds in English**

---

## 🔹 WATCHLIST

| Command | Example | Description |
|---------|---------|-------------|
| `watch <asset>` | `watch BTC` | Add asset to watchlist |
| `monitor <asset>` | `monitor EURUSD` | Add asset to watchlist |
| `unwatch <asset>` | `unwatch ETH` | Remove from watchlist |
| `stop watching <asset>` | `stop watching SOL` | Remove from watchlist |
| `watchlist` | `watchlist` | Show all watched assets |
| `show watchlist` | `show watchlist` | Show all watched assets |

**German:** `überwache BTC`, `zeig watchlist`

---

## 🔔 ALERTS

| Command | Example | Description |
|---------|---------|-------------|
| `alert if <asset> above <price>` | `alert if BTC above 100000` | Alert when price exceeds |
| `alert if <asset> below <price>` | `alert if ETH below 2500` | Alert when price drops |
| `alert if <asset> by <percent>%` | `alert if SOL by 5%` | Alert on percentage move |
| `show alerts` | `show alerts` | List active alerts |
| `clear alerts` | `clear alerts` | Remove all alerts |
| `delete alert` | `delete alert` | Remove all alerts |

**German:** `alarm wenn BTC über 100000`, `zeig alle alerts`

---

## 📈 TRADING (Requires connected exchange/MT5)

| Command | Example | Description |
|---------|---------|-------------|
| `buy <asset>` | `buy BTC` | Market buy |
| `buy <asset> for <amount>` | `buy ETH for 500€` | Buy specific amount |
| `sell <asset>` | `sell BTC` | Market sell |
| `sell <asset> for <amount>` | `sell SOL for 200$` | Sell specific amount |
| `close <position>` | `close BTC` | Close position |
| `close all positions` | `close all positions` | Close everything |
| `long <asset>` | `long EURUSD` | Open long position |
| `short <asset>` | `short GBPUSD` | Open short position |

**German:** `kauf BTC`, `verkauf ETH`, `schließe alle positionen`

---

## 🤖 AUTONOMOUS MODE

| Command | Example | Description |
|---------|---------|-------------|
| `trade autonomous` | `trade autonomous` | Enable auto-trading |
| `enable autonomous trading` | `enable auto trading` | Enable auto-trading |
| `go auto` | `go auto` | Enable auto-trading |
| `stop autonomous trading` | `stop auto trading` | Disable auto-trading |
| `pause trading` | `pause trading` | Temporarily pause |
| `resume trading` | `resume trading` | Resume after pause |

**German:** `handel automatisch`, `stoppe autonomes trading`, `pausiere trading`

---

## 📊 REPORTS & STATUS

| Command | Example | Description |
|---------|---------|-------------|
| `report` | `report` | Instant portfolio report |
| `status` | `status` | Show agent status |
| `summary` | `summary` | Portfolio summary |
| `morning briefing at 8` | `morning briefing at 8` | Set daily report time |
| `evening report at 20` | `evening report at 20` | Set evening report |
| `weekly report` | `weekly report` | Get weekly summary |
| `what's happening` | `what's happening` | Instant status |

**German:** `bericht`, `morgenbriefing um 8`, `wochenbericht`

---

## 💰 PORTFOLIO & BALANCE

| Command | Example | Description |
|---------|---------|-------------|
| `portfolio` | `portfolio` | Show full portfolio |
| `balance` | `balance` | Show account balance |
| `how much do I have` | `how much do I have` | Balance overview |
| `rebalance` | `rebalance` | Trigger portfolio rebalance |

**German:** `vermögen`, `guthaben`, `wie viel habe ich`

---

## 💎 PASSIVE INCOME

| Command | Example | Description |
|---------|---------|-------------|
| `passive income` | `passive income` | Show passive earnings |
| `staking` | `staking` | Staking rewards overview |
| `yield` | `yield` | DeFi yields |
| `airdrops` | `airdrops` | Check new airdrops |

**German:** `passive erträge`, `belohnungen`

---

## 📉 MARKET INFO

| Command | Example | Description |
|---------|---------|-------------|
| `price <asset>` | `price BTC` | Get current price |
| `what's the price of <asset>` | `what's the price of ETH` | Get current price |
| `<asset> price` | `SOL price` | Get current price |
| `market overview` | `market overview` | Market summary |
| `what's happening in the markets` | `what's happening` | Market news |

**German:** `preis von BTC`, `was kostet ETH`, `marktübersicht`

---

## 🔗 PLATFORMS & CONNECTIONS

| Command | Example | Description |
|---------|---------|-------------|
| `platforms` | `platforms` | List connected platforms |
| `accounts` | `accounts` | List connected accounts |
| `connect <platform>` | `connect binance` | Add platform |
| `disconnect <platform>` | `disconnect kraken` | Remove platform |
| `sync` | `sync` | Refresh all data |
| `sync all platforms` | `sync all` | Force full sync |

**German:** `plattformen`, `verbindungen`, `verbinde binance`

---

## 🛠️ SYSTEM & HELP

| Command | Example | Description |
|---------|---------|-------------|
| `help` | `help` | Show available commands |
| `commands` | `commands` | List commands |
| `what can you do` | `what can you do` | Show capabilities |
| `?` | `?` | Quick help |

**German:** `hilfe`, `befehle`, `was kannst du`

---

## 🔧 SKILLS (Chat-enabled skills)

| Command | Example | Description |
|---------|---------|-------------|
| `skills` | `skills` | List available skills |
| `show skills` | `show skills` | List with status |
| `run <skill>` | `run ai-predictor` | Execute a skill |
| `analyze <symbol>` | `analyze BTC` | Market analysis |
| `backtest <strategy>` | `backtest momentum` | Run backtest |

---

## 🎯 ML PREDICTIONS (New!)

| Command | Example | Description |
|---------|---------|-------------|
| `predict <asset>` | `predict BTC` | ML price prediction |
| `analyze <asset>` | `analyze ETH` | Technical + ML analysis |
| `ml status` | `ml status` | Check ML system status |

---

# ❌ WHAT K.I.T. CANNOT DO VIA CHAT

These features require **CLI** or **manual configuration**:

| Feature | How to Do It |
|---------|--------------|
| Initial Setup | `kit onboard` (CLI) |
| Add API Keys | `kit onboard` or edit `~/.kit/config.json` |
| Connect MT5 | `kit onboard` + MT5 Desktop app |
| Install Skills from KitHub | `kit skill install <name>` |
| View Dashboard | `kit dashboard` or `kit start` |
| Check Logs | `kit logs` |
| Run Diagnostics | `kit doctor` |
| Update K.I.T. | `kit update` |
| Configure Channels | `kit whatsapp login`, `kit telegram setup` |
| Export Trade History | `kit history export` |
| Create Backups | `kit backup` |
| Reset Configuration | `kit reset` |

---

# 💡 PRO TIPS

1. **Combine commands naturally:** "Watch BTC and alert me if it goes above 100k"
2. **Use shortcuts:** `?` for help, `status` for quick overview
3. **German or English:** K.I.T. understands both!
4. **ML is automatic:** With ML enabled, analysis includes predictions

---

# 📱 CHANNEL-SPECIFIC

## Telegram
- All chat commands work
- Inline buttons for confirmations
- Photo/document support for charts

## WhatsApp
- All chat commands work
- Voice messages not yet supported

## Discord
- All chat commands work
- Slash commands: `/kit status`, `/kit price BTC`

---

*Last updated: 2026-02-15*
*K.I.T. Version: 2.0.0*
