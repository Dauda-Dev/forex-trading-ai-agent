# MetaTrader 5 Examples 📚

Diese Examples zeigen dir Schritt für Schritt, wie K.I.T. mit MetaTrader 5 arbeitet.

## Voraussetzungen

1. **MT5 Terminal installiert** - [Download](https://www.metatrader5.com/de/download)
2. **MT5 eingeloggt** (Demo Account empfohlen)
3. **Algo-Trading aktiviert** (Tools → Options → Expert Advisors)
4. **Python Libraries:**
   ```bash
   pip install MetaTrader5 pandas
   ```

## Die Examples

| # | Datei | Beschreibung | Schwierigkeit |
|---|-------|--------------|---------------|
| 01 | `01_connect.py` | Verbindung testen | ⭐ Anfänger |
| 02 | `02_balance.py` | Kontostand anzeigen | ⭐ Anfänger |
| 03 | `03_market_order.py` | Demo Trade ausführen | ⭐⭐ Mittel |
| -- | `quick_test.py` | Vollständiger Test | ⭐⭐⭐ Fortgeschritten |
| -- | `example_trade.py` | Interaktives Trading | ⭐⭐⭐ Fortgeschritten |

## Schnellstart

```bash
cd skills/metatrader

# 1. Verbindung testen
python examples/01_connect.py

# 2. Balance anzeigen
python examples/02_balance.py

# 3. Demo Trade (⚠️ nur auf Demo-Accounts!)
python examples/03_market_order.py

# 4. Vollständiger Test
python examples/quick_test.py --trade
```

## Example Details

### 01_connect.py - Verbindung testen
```python
# Zeigt wie man:
# - MT5 Terminal initialisiert
# - Optional mit Credentials einloggt
# - Verbindung sauber trennt
```

### 02_balance.py - Kontostand anzeigen
```python
# Zeigt:
# - Balance, Equity, Free Margin
# - Account-Einstellungen
# - Trading-Status
```

### 03_market_order.py - Demo Trade
```python
# Führt einen kompletten Trade durch:
# 1. Verbinden
# 2. Prüfen ob Demo-Account
# 3. Market Order (BUY) mit SL/TP
# 4. Warten
# 5. Position schließen
# 6. P/L anzeigen
```

### quick_test.py - Vollständiger Test
```bash
# Optionen:
python quick_test.py                    # Nur Connect + Info Tests
python quick_test.py --trade            # Mit Trade Test
python quick_test.py --symbol GBPUSD    # Anderes Symbol
python quick_test.py --volume 0.05      # Andere Lot-Größe

# Mit Credentials:
python quick_test.py --account 12345 --password xxx --server RoboForex-Demo
```

## Häufige Fehler

| Error Code | Bedeutung | Lösung |
|------------|-----------|--------|
| -6 | No connection | Internetverbindung prüfen |
| 10010 | Algo disabled | Algo-Trading in MT5 aktivieren |
| 10015 | Invalid stops | SL/TP Abstand erhöhen |
| 10018 | Market closed | Marktzeiten beachten |
| 10019 | Not enough money | Lot-Größe reduzieren |

## Broker Empfehlung

**RoboForex** ist ideal zum Testen:
- Unbegrenztes Demo-Konto
- $100.000 virtuelles Kapital
- Server: `RoboForex-Demo`
- [Account erstellen](https://www.roboforex.com/register/)

## Nächste Schritte

Nach den Basics:
1. 📖 [SKILL.md](../SKILL.md) - Alle Features
2. 🔧 [scripts/](../scripts/) - Die Hauptmodule
3. 📝 [QUICKSTART.md](../QUICKSTART.md) - Schnellanleitung

---

**Happy Trading! 🚗💰**
