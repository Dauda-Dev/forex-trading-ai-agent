#!/usr/bin/env python3
"""
K.I.T. Example 02: Get Account Balance

Zeigt Kontostand und Account-Details an.

Voraussetzungen:
1. MT5 Terminal geöffnet und eingeloggt
2. pip install MetaTrader5

Usage:
    python 02_balance.py
"""

import MetaTrader5 as mt5
import sys


def main():
    print("\n💰 K.I.T. MT5 Balance Example")
    print("="*50)
    
    # Verbinden
    if not mt5.initialize():
        print("❌ MT5 Initialisierung fehlgeschlagen!")
        print("   Ist MT5 Terminal geöffnet?")
        return False
    
    # Account Info abrufen
    account = mt5.account_info()
    if account is None:
        print("❌ Kann Account-Info nicht abrufen!")
        mt5.shutdown()
        return False
    
    # Daten anzeigen
    print(f"\n📊 Account Information")
    print("─"*50)
    print(f"  Login:        {account.login}")
    print(f"  Name:         {account.name}")
    print(f"  Server:       {account.server}")
    print(f"  Company:      {account.company}")
    
    print(f"\n💵 Kontostand")
    print("─"*50)
    print(f"  Balance:      {account.balance:>12,.2f} {account.currency}")
    print(f"  Equity:       {account.equity:>12,.2f} {account.currency}")
    print(f"  Profit:       {account.profit:>+12,.2f} {account.currency}")
    
    print(f"\n📈 Margin")
    print("─"*50)
    print(f"  Margin:       {account.margin:>12,.2f} {account.currency}")
    print(f"  Free Margin:  {account.margin_free:>12,.2f} {account.currency}")
    print(f"  Margin Level: {account.margin_level:>12,.2f} %")
    
    print(f"\n⚙️  Account Settings")
    print("─"*50)
    print(f"  Leverage:     1:{account.leverage}")
    print(f"  Trade Mode:   {'Hedging' if account.margin_mode == 2 else 'Netting'}")
    print(f"  Max Orders:   {account.limit_orders}")
    
    print(f"\n🔐 Trading Status")
    print("─"*50)
    print(f"  Trading:      {'✅ Erlaubt' if account.trade_allowed else '❌ Nicht erlaubt'}")
    print(f"  Experts:      {'✅ Erlaubt' if account.trade_expert else '❌ Nicht erlaubt'}")
    
    # Demo oder Live?
    is_demo = 'demo' in account.server.lower() or 'practice' in account.server.lower()
    account_type = "🧪 DEMO" if is_demo else "💼 LIVE"
    print(f"\n  Account Type: {account_type}")
    
    # Trennen
    mt5.shutdown()
    
    print("\n" + "="*50)
    print("✅ Done!")
    return True


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
