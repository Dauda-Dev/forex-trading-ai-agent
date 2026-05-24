#!/usr/bin/env python3
"""
K.I.T. Example 03: Place Market Order (Demo)

Platziert eine Market Order und schließt sie wieder.
⚠️  NUR AUF DEMO-ACCOUNTS VERWENDEN!

Voraussetzungen:
1. MT5 Terminal geöffnet und eingeloggt (Demo Account!)
2. pip install MetaTrader5
3. Algo-Trading aktiviert in MT5

Usage:
    python 03_market_order.py                  # 0.01 lot EURUSD
    python 03_market_order.py GBPUSD 0.05      # 0.05 lot GBPUSD
"""

import MetaTrader5 as mt5
import sys
import time


def main():
    # Parse args
    symbol = sys.argv[1] if len(sys.argv) > 1 else "EURUSD"
    volume = float(sys.argv[2]) if len(sys.argv) > 2 else 0.01
    
    print(f"\n📈 K.I.T. MT5 Market Order Example")
    print("="*50)
    print(f"   Symbol: {symbol}")
    print(f"   Volume: {volume} lots")
    
    # ===== 1. Verbinden =====
    print("\n1️⃣  Verbinde mit MT5...")
    if not mt5.initialize():
        print("❌ MT5 nicht verfügbar!")
        return False
    print("✅ Verbunden!")
    
    # ===== 2. Account prüfen =====
    account = mt5.account_info()
    is_demo = 'demo' in account.server.lower() or 'practice' in account.server.lower()
    
    print(f"\n2️⃣  Account Check...")
    print(f"   Server: {account.server}")
    
    if not is_demo:
        print("❌ WARNUNG: Dies ist ein LIVE Account!")
        print("   Dieses Script ist nur für Demo gedacht.")
        print("   Beende aus Sicherheitsgründen.")
        mt5.shutdown()
        return False
    print("✅ Demo Account - sicher zum Testen!")
    
    # Algo-Trading prüfen
    terminal = mt5.terminal_info()
    if not terminal.trade_allowed:
        print("❌ Algo-Trading ist deaktiviert!")
        print("   → MT5: Tools → Options → Expert Advisors")
        print("   → Aktiviere 'Allow Algorithmic Trading'")
        mt5.shutdown()
        return False
    print("✅ Algo-Trading aktiviert!")
    
    # ===== 3. Symbol Info =====
    print(f"\n3️⃣  Hole {symbol} Info...")
    symbol_info = mt5.symbol_info(symbol)
    if symbol_info is None:
        print(f"❌ Symbol {symbol} nicht gefunden!")
        mt5.shutdown()
        return False
    
    if not symbol_info.visible:
        print(f"   Symbol nicht sichtbar, aktiviere...")
        if not mt5.symbol_select(symbol, True):
            print(f"❌ Kann {symbol} nicht aktivieren!")
            mt5.shutdown()
            return False
    
    # Get tick
    tick = mt5.symbol_info_tick(symbol)
    print(f"✅ {symbol} verfügbar!")
    print(f"   Bid: {tick.bid:.5f}")
    print(f"   Ask: {tick.ask:.5f}")
    print(f"   Min Lot: {symbol_info.volume_min}")
    
    # ===== 4. Order Request erstellen =====
    print(f"\n4️⃣  Erstelle BUY Order...")
    
    # Berechne SL/TP (20 pips)
    point = symbol_info.point
    digits = symbol_info.digits
    
    price = tick.ask
    sl = round(price - 200 * point, digits)  # 20 pips (200 points bei 5 digits)
    tp = round(price + 200 * point, digits)  # 20 pips
    
    request = {
        "action": mt5.TRADE_ACTION_DEAL,      # Market Order
        "symbol": symbol,
        "volume": volume,
        "type": mt5.ORDER_TYPE_BUY,
        "price": price,
        "sl": sl,
        "tp": tp,
        "deviation": 20,                        # Max Slippage in points
        "magic": 123456,                        # Identifier für K.I.T.
        "comment": "KIT-Demo-Test",
        "type_time": mt5.ORDER_TIME_GTC,
        "type_filling": mt5.ORDER_FILLING_IOC,  # Immediate or Cancel
    }
    
    print(f"   Price: {price:.5f}")
    print(f"   SL:    {sl:.5f} (-20 pips)")
    print(f"   TP:    {tp:.5f} (+20 pips)")
    
    # ===== 5. Order senden =====
    print(f"\n5️⃣  Sende Order...")
    result = mt5.order_send(request)
    
    if result is None:
        error = mt5.last_error()
        print(f"❌ Order fehlgeschlagen: {error}")
        mt5.shutdown()
        return False
    
    if result.retcode != mt5.TRADE_RETCODE_DONE:
        print(f"❌ Order abgelehnt!")
        print(f"   Retcode: {result.retcode}")
        print(f"   Comment: {result.comment}")
        
        # Hilfreiche Hinweise
        if result.retcode == 10019:
            print("   → Nicht genug Geld - reduziere Lot Size")
        elif result.retcode == 10015:
            print("   → Ungültige Stops - entferne SL/TP oder erhöhe Abstand")
        elif result.retcode == 10010:
            print("   → Algo-Trading deaktiviert")
        
        mt5.shutdown()
        return False
    
    print("✅ Order ausgeführt!")
    print(f"   Ticket: {result.order}")
    print(f"   Deal:   {result.deal}")
    print(f"   Price:  {result.price:.5f}")
    print(f"   Volume: {result.volume}")
    
    ticket = result.order
    
    # ===== 6. Position anzeigen =====
    print(f"\n6️⃣  Position Check...")
    time.sleep(1)  # Kurz warten
    
    positions = mt5.positions_get(ticket=ticket)
    if positions:
        pos = positions[0]
        print(f"   Symbol:  {pos.symbol}")
        print(f"   Type:    {'BUY' if pos.type == 0 else 'SELL'}")
        print(f"   Volume:  {pos.volume}")
        print(f"   Entry:   {pos.price_open:.5f}")
        print(f"   Current: {pos.price_current:.5f}")
        print(f"   P/L:     {pos.profit:+.2f}")
    
    # ===== 7. Position schließen =====
    print(f"\n7️⃣  Schließe Position...")
    time.sleep(2)  # Warte 2 Sekunden
    
    # Get current position
    positions = mt5.positions_get(ticket=ticket)
    if not positions:
        print("   Position bereits geschlossen")
        mt5.shutdown()
        return True
    
    pos = positions[0]
    tick = mt5.symbol_info_tick(symbol)
    
    close_request = {
        "action": mt5.TRADE_ACTION_DEAL,
        "symbol": symbol,
        "volume": pos.volume,
        "type": mt5.ORDER_TYPE_SELL,  # Gegenteil von BUY
        "position": ticket,
        "price": tick.bid,
        "deviation": 20,
        "magic": 123456,
        "comment": "KIT-Close",
        "type_time": mt5.ORDER_TIME_GTC,
        "type_filling": mt5.ORDER_FILLING_IOC,
    }
    
    close_result = mt5.order_send(close_request)
    
    if close_result and close_result.retcode == mt5.TRADE_RETCODE_DONE:
        print("✅ Position geschlossen!")
        print(f"   Exit Price: {close_result.price:.5f}")
        
        # Berechne P/L
        pl = (close_result.price - result.price) * symbol_info.trade_contract_size * volume
        print(f"   Profit:     {pl:+.2f}")
    else:
        print("⚠️  Schließen fehlgeschlagen")
        if close_result:
            print(f"   Retcode: {close_result.retcode}")
            print(f"   Comment: {close_result.comment}")
    
    # ===== 8. Aufräumen =====
    mt5.shutdown()
    
    print("\n" + "="*50)
    print("🎉 Demo-Trade abgeschlossen!")
    return True


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
