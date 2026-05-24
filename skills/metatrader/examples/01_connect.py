#!/usr/bin/env python3
"""
K.I.T. Example 01: Connect to MetaTrader 5

Einfachstes Beispiel - nur verbinden und wieder trennen.

Voraussetzungen:
1. MT5 Terminal installiert
2. MT5 Terminal geöffnet und eingeloggt
3. pip install MetaTrader5

Usage:
    python 01_connect.py                          # Nutzt eingeloggtes Terminal
    python 01_connect.py 12345 password Server    # Mit Credentials
"""

import MetaTrader5 as mt5
import sys


def main():
    print("\n🚗 K.I.T. MT5 Connect Example")
    print("="*40)
    
    # Parse optional args
    account = int(sys.argv[1]) if len(sys.argv) > 1 else None
    password = sys.argv[2] if len(sys.argv) > 2 else None
    server = sys.argv[3] if len(sys.argv) > 3 else None
    
    # ===== SCHRITT 1: Terminal initialisieren =====
    print("\n1️⃣  Initialisiere MT5...")
    
    if not mt5.initialize():
        error = mt5.last_error()
        print(f"❌ Initialisierung fehlgeschlagen!")
        print(f"   Error: {error}")
        print("\n💡 Tipps:")
        print("   - Ist MT5 Terminal geöffnet?")
        print("   - pip install MetaTrader5")
        return False
    
    print("✅ MT5 initialisiert!")
    
    # Zeige Terminal Info
    terminal_info = mt5.terminal_info()
    print(f"\n   Terminal Build: {terminal_info.build}")
    print(f"   Company:        {terminal_info.company}")
    print(f"   Connected:      {'Ja' if terminal_info.connected else 'Nein'}")
    
    # ===== SCHRITT 2: Login (optional) =====
    if account and password and server:
        print(f"\n2️⃣  Login zu Account {account} auf {server}...")
        
        if not mt5.login(account, password=password, server=server):
            error = mt5.last_error()
            print(f"❌ Login fehlgeschlagen!")
            print(f"   Error: {error}")
            mt5.shutdown()
            return False
        
        print("✅ Login erfolgreich!")
    else:
        print("\n2️⃣  Nutze bereits eingeloggten Account")
    
    # ===== SCHRITT 3: Kurze Verbindungsinfo =====
    account_info = mt5.account_info()
    if account_info:
        print(f"\n📊 Verbunden als:")
        print(f"   Login:  {account_info.login}")
        print(f"   Server: {account_info.server}")
        print(f"   Name:   {account_info.name}")
    
    # ===== SCHRITT 4: Trennen =====
    print("\n3️⃣  Trenne Verbindung...")
    mt5.shutdown()
    print("✅ Getrennt!")
    
    print("\n" + "="*40)
    print("🎉 Verbindung erfolgreich getestet!")
    return True


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
