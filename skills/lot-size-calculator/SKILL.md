# Lot Size Calculator 📊

Berechnet die optimale Positionsgröße basierend auf deinem Risikomanagement. Nie mehr zu große oder zu kleine Positionen!

## Trigger Keywords

- lot size, position size, positionsgröße
- wie viel lot, wieviel lot
- calculate lot, berechne lot
- risk based position
- position sizing

## Was kann dieser Skill?

- **Risiko-basierte Berechnung**: Lot Size basierend auf % des Kapitals
- **Stop Loss berücksichtigen**: Berechnung mit genauem SL in Pips
- **Multi-Asset Support**: Forex, Gold, Indices, Crypto
- **Account-Währung**: Unterstützt USD, EUR, GBP, etc.

## Beispiele

### Einfache Berechnung
```
"Berechne Lot Size für EURUSD mit 2% Risiko und 30 Pips SL"
"Lot size for GBPUSD, $10,000 account, 1% risk, 50 pips stop"
```

### Mit K.I.T.
```
"K.I.T., wie viel Lot soll ich bei EURUSD traden wenn ich maximal $200 riskieren will und mein SL bei 25 Pips liegt?"
```

## Formel

```
Lot Size = (Account Balance × Risk %) / (Stop Loss Pips × Pip Value)

Beispiel:
- Balance: $10,000
- Risk: 2% = $200
- SL: 30 Pips
- EURUSD Pip Value: $10 per Standard Lot

Lot Size = $200 / (30 × $10) = $200 / $300 = 0.67 Lots
```

## API

```python
from skills.lot_size_calculator import calculate_lot_size

result = calculate_lot_size(
    balance=10000,           # Account Balance
    risk_percent=2.0,        # Risiko in %
    stop_loss_pips=30,       # Stop Loss in Pips
    symbol="EURUSD",         # Trading Pair
    account_currency="USD"   # Account Währung
)

print(f"Lot Size: {result['lot_size']}")
print(f"Risk Amount: ${result['risk_amount']}")
print(f"Pip Value: ${result['pip_value']}")
```

## Konfiguration

```yaml
# In TOOLS.md oder config.yaml
lot_size_calculator:
  default_risk_percent: 2.0
  max_risk_percent: 5.0
  round_to_step: true
  min_lot: 0.01
  max_lot: 100.0
```

## Sicherheits-Features

- ⚠️ Warnung bei Risiko > 5%
- 🛡️ Automatische Lot-Rundung auf Broker-Step
- 📊 Zeigt immer den tatsächlichen Geldbetrag der riskiert wird

## Pip Values (Standard Lot = 100,000)

| Symbol | Pip Value (USD Account) |
|--------|------------------------|
| EURUSD | $10.00 |
| GBPUSD | $10.00 |
| USDJPY | ~$9.09 (variiert) |
| XAUUSD | $1.00 per 0.01 |
| BTCUSD | $1.00 per 1.0 |

---

*K.I.T. - "Proper position sizing is the key to longevity in trading."* 🎯
