import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface Alert {
  id: string;
  kind: 'trade_executed' | 'trade_failed' | 'opportunity' | 'system' | 'error';
  title: string;
  message: string;
  severity: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read?: boolean;
}

interface AlertState {
  alerts: Alert[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  dismiss: (id: string) => void;
}

const AlertContext = createContext<AlertState>({
  alerts: [],
  unreadCount: 0,
  markRead: () => {},
  markAllRead: () => {},
  dismiss: () => {},
});

export function useAlerts() {
  return useContext(AlertContext);
}

export default function AlertProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  // Load initial alerts
  useEffect(() => {
    fetch('/api/alerts?limit=50')
      .then((r) => r.ok ? r.json() : { alerts: [] })
      .then((d) => setAlerts((d.alerts || []).map((a: Alert) => ({ ...a, read: false }))))
      .catch(() => {});
  }, []);

  // Listen for live alerts via WebSocket
  useEffect(() => {
    const proto = location.protocol === 'https:' ? 'wss' : 'ws';
    const ws = new WebSocket(`${proto}://${location.host}/ws`);

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === 'alert' && msg.alert) {
          setAlerts((prev) => {
            const next = [...prev, { ...msg.alert, read: false }];
            return next.length > 100 ? next.slice(-100) : next;
          });
        }
      } catch {}
    };

    return () => ws.close();
  }, []);

  const markRead = useCallback((id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)));
  }, []);

  const markAllRead = useCallback(() => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  }, []);

  const dismiss = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const unreadCount = alerts.filter((a) => !a.read).length;

  return (
    <AlertContext.Provider value={{ alerts, unreadCount, markRead, markAllRead, dismiss }}>
      {children}
    </AlertContext.Provider>
  );
}
