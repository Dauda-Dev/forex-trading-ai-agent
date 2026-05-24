# Wallet & Payment Connector Skill

> Connect K.I.T. to ALL your wallets and payment methods

## Supported Integrations

### 🔐 Hardware Wallets
| Wallet | Status | Features |
|--------|--------|----------|
| **Ledger** | 🚧 Planned | Ledger Live API, multi-chain |
| **Trezor** | 🚧 Planned | Trezor Suite API |

### 💳 Software Wallets
| Wallet | Status | Features |
|--------|--------|----------|
| **MetaMask** | ✅ Implemented | EVM chains (ETH, Polygon, Arbitrum, BSC, etc.) - Read-only via public RPC |
| **Electrum** | ✅ Implemented | Bitcoin wallet via RPC |
| **Trust Wallet** | 🚧 Planned | Multi-chain mobile |
| **Phantom** | 🚧 Planned | Solana ecosystem |
| **Rabby** | 🚧 Planned | Multi-chain DeFi |

### 💰 Payment Processors
| Service | Status | Features |
|---------|--------|----------|
| **PayPal** | 🚧 Planned | Send/receive, balance |
| **Skrill** | 🚧 Planned | Forex funding, transfers |
| **Wise** | 🚧 Planned | Multi-currency, low fees |
| **Revolut** | 🚧 Planned | Crypto + fiat |

### 🪙 Exchange Wallets
| Exchange | Status | Features |
|----------|--------|----------|
| **Binance Pay** | 🚧 Planned | P2P, merchant payments |
| **Coinbase** | 🚧 Planned | Commerce API |
| **Kraken** | 🚧 Planned | Funding, withdrawals |

---

## ✅ Implemented Tools

### MetaMask / EVM Wallets (Read-Only)

```typescript
// Connect wallet address for monitoring
wallet_connect_address({ address: "0x..." })

// Get balances (ETH + tokens)
wallet_balance({ address?: string, chain?: string, allChains?: boolean })

// Get token holdings
wallet_tokens({ address?: string, chain?: string })

// Get recent transactions
wallet_transactions({ address?: string, chain?: string, limit?: number })

// Get gas prices
wallet_gas({ chain?: string })
```

**Supported Chains:**
- Ethereum Mainnet
- Polygon
- Arbitrum One
- Optimism
- BNB Smart Chain
- Avalanche C-Chain
- Base

### Electrum / Bitcoin

```typescript
// Connect to Electrum RPC
electrum_connect({ host?: string, port?: number })

// Get BTC balance
electrum_balance()

// Get transaction history
electrum_history({ limit?: number })

// Get addresses
electrum_addresses()

// Generate new address
electrum_new_address({ label?: string })

// Create transaction (requires confirmation in Electrum)
electrum_send({ destination: string, amount: string, feeRate?: number })
```

**Prerequisites for Electrum:**
```bash
# Start Electrum daemon
electrum daemon -d

# Enable RPC (default port 7777)
electrum setconfig rpcport 7777
```

---

## Example Usage

### Monitor ETH Wallet
```
K.I.T., track wallet 0x1234...abcd

📊 Wallet: 0x1234...abcd

🔗 Ethereum:
   2.5432 ETH
   1,000.00 USDC
   500.00 LINK

🔗 Polygon:
   1,234.56 MATIC
   5,000.00 USDC
```

### Check Gas Prices
```
K.I.T., what are gas prices on Ethereum?

⛽ Gas Prices (Ethereum)

Current: 25.50 gwei
Base Fee: 24.00 gwei
Priority Fee: 1.50 gwei

📊 Estimated Costs:
   Transfer: 0.000535 ETH
   Swap: 0.003825 ETH
   NFT Mint: 0.002550 ETH
```

### Bitcoin Balance
```
K.I.T., check my Bitcoin balance

₿ Bitcoin Wallet Balance

Confirmed: 0.15000000 BTC
Unconfirmed: 0.00500000 BTC

💰 Total: 0.15500000 BTC
📍 Addresses: 12
```

---

## Security Model

### ✅ Read-Only by Default
- K.I.T. can VIEW balances without transfer permission
- Uses public RPCs (no API keys needed for EVM)
- **No private keys stored or transmitted**

### ⚠️ Transaction Safety
- Bitcoin sends require confirmation in Electrum GUI
- EVM transactions not implemented (use hardware wallet)
- User retains full control at all times

### 🔒 Security Features
- Address validation (checksum)
- Local RPC only for Electrum
- No external API key requirements for basic use
- Cached balances (30s) to reduce RPC calls

---

## Architecture

```
K.I.T. Wallet Layer
│
├── EVM Wallets (Read-Only)
│   ├── Ethereum (Llama RPC)
│   ├── Polygon (polygon-rpc.com)
│   ├── Arbitrum (public RPC)
│   ├── Optimism (public RPC)
│   ├── BSC (Binance RPC)
│   ├── Avalanche (public RPC)
│   └── Base (public RPC)
│
├── Bitcoin
│   └── Electrum (Local RPC)
│
└── Future
    ├── Hardware Wallets (Ledger/Trezor)
    ├── Payment APIs (PayPal, Wise)
    └── Exchange APIs (Binance Pay)
```

---

## Files

```
skills/wallet-connector/
├── SKILL.md                     # This documentation
└── scripts/
    ├── metamask.ts              # MetaMask / EVM integration
    └── electrum.ts              # Electrum / Bitcoin integration

src/tools/
└── wallet-tools.ts              # Tool definitions and handlers
```

---

## Installation

The wallet tools are built into K.I.T. Just run:

```bash
npm run build
```

For Electrum integration:
```bash
# Install and start Electrum
electrum daemon -d
electrum setconfig rpcport 7777
electrum load_wallet
```

---

**Version:** 2.0.0  
**Status:** ✅ Phase 1 Complete (MetaMask + Electrum)  
**Priority:** HIGH - Core infrastructure for autonomous finance
