# Session Timer ⏰

Zeigt aktive Trading-Sessions und optimale Trading-Zeiten. Wisse immer, wann die Märkte am liquidesten sind!

## Trigger Keywords

- session, sessions, trading session
- market hours, marktzeiten
- london, new york, tokyo, sydney
- wann traden, best time to trade
- session overlap

## Trading Sessions

| Session | Öffnung (UTC) | Schließung (UTC) | Charakteristik |
|---------|---------------|------------------|----------------|
| 🌸 **Sydney** | 22:00 | 07:00 | Ruhig, AUD/NZD aktiv |
| 🏯 **Tokyo** | 00:00 | 09:00 | JPY Pairs, moderate Volatilität |
| 🏛️ **London** | 08:00 | 17:00 | Höchste Liquidität, EUR/GBP aktiv |
| 🗽 **New York** | 13:00 | 22:00 | USD Pairs, News-getrieben |

## Session Overlaps (Beste Trading-Zeiten!)

| Overlap | Zeit (UTC) | Volatilität |
|---------|-----------|-------------|
| 🔥 **London + New York** | 13:00 - 17:00 | SEHR HOCH |
| 🌅 **Tokyo + London** | 08:00 - 09:00 | Hoch |
| 🌙 **Sydney + Tokyo** | 00:00 - 07:00 | Moderat |

## Beispiele

```
"K.I.T., welche Sessions sind gerade aktiv?"
"Wann ist die beste Zeit um EURUSD zu traden?"
"Zeige mir den Session-Kalender für heute"
"Ist London gerade offen?"
```

## API

```python
from skills.session_timer import (
    SessionTimer,
    get_active_sessions,
    get_session_info,
    is_session_open
)

# Aktive Sessions
timer = SessionTimer()
active = timer.get_active_sessions()
print(f"Aktive Sessions: {active}")

# Nächste Session
next_session = timer.get_next_session()
print(f"Nächste Session: {next_session['name']} öffnet in {next_session['opens_in']}")

# Best time für ein Pair
best_times = timer.get_best_times("EURUSD")
```

## Ausgabe Beispiel

```
🌍 TRADING SESSIONS - 09.02.2026 15:30 UTC

  🏯 Tokyo      ⬜ CLOSED   (öffnet in 8h 30m)
  🏛️ London     ✅ OPEN     (schließt in 1h 30m)
  🗽 New York   ✅ OPEN     (schließt in 6h 30m)
  🌸 Sydney     ⬜ CLOSED   (öffnet in 6h 30m)

  🔥 OVERLAP AKTIV: London + New York
     Beste Zeit für: EUR/USD, GBP/USD, USD/CHF

  📊 Volatilitäts-Level: HOCH
```

## Konfiguration

```yaml
session_timer:
  timezone: "Europe/Berlin"  # Deine lokale Zeitzone
  show_overlap: true
  show_volatility: true
```

## Warum Sessions wichtig sind

1. **Liquidität**: Mehr Volumen = bessere Fills, engere Spreads
2. **Volatilität**: Sessions haben unterschiedliche Bewegungsmuster
3. **News**: Wichtige Nachrichten kommen zu Session-Zeiten
4. **Pair-Matching**: Trade EUR zur London Session, JPY zur Tokyo Session

---

*K.I.T. - "Timing is everything in trading."* ⏰
