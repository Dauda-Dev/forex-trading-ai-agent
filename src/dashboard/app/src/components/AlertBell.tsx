import { useState, useRef, useEffect } from 'react';
import { useAlerts } from '../context/AlertContext';

const severityColor: Record<string, string> = {
  success: 'text-kit-green',
  error: 'text-kit-red',
  warning: 'text-yellow-400',
  info: 'text-kit-cyan',
};

const severityBg: Record<string, string> = {
  success: 'bg-kit-green/10',
  error: 'bg-kit-red/10',
  warning: 'bg-yellow-500/10',
  info: 'bg-kit-cyan/10',
};

const kindIcon: Record<string, string> = {
  trade_executed: '✅',
  trade_failed: '❌',
  opportunity: '📊',
  system: '⚙️',
  error: '🚨',
};

export default function AlertBell() {
  const { alerts, unreadCount, markRead, markAllRead, dismiss } = useAlerts();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-gray-400 hover:text-white transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-kit-red text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-kit-card border border-kit-border rounded-xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-kit-border">
            <span className="text-sm font-semibold text-gray-300">Alerts</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-kit-cyan hover:text-kit-cyan/80 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Alert list */}
          <div className="max-h-80 overflow-y-auto">
            {alerts.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-600">
                No alerts yet
              </div>
            ) : (
              alerts.slice().reverse().map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => markRead(alert.id)}
                  className={`px-4 py-3 border-b border-kit-border/50 hover:bg-white/5 cursor-pointer transition-colors ${
                    !alert.read ? 'bg-white/[0.02]' : ''
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-sm mt-0.5">{kindIcon[alert.kind] || '📌'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${severityColor[alert.severity]}`}>
                          {alert.title}
                        </span>
                        {!alert.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-kit-cyan shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{alert.message}</p>
                      <span className="text-[10px] text-gray-600 mt-1 block">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); dismiss(alert.id); }}
                      className="text-gray-600 hover:text-gray-400 text-xs p-1 shrink-0"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
