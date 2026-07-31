import { NavLink } from 'react-router-dom';
import { useLive } from '../context/DataContext';

const links = [
  { to: '/',         label: 'Dashboard',  icon: '📊' },
  { to: '/portfolio', label: 'Portfolio',  icon: '💰' },
  { to: '/charts',   label: 'Charts',     icon: '📈' },
  { to: '/backtest', label: 'Backtest',   icon: '🔬' },
  { to: '/brain',    label: 'Brain',      icon: '🧠' },
  { to: '/trades',   label: 'Trades',     icon: '💹' },
  { to: '/chat',     label: 'Chat',       icon: '💬' },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { wsConnected } = useLive();

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-56 bg-kit-card border-r border-kit-border
          flex flex-col transform transition-transform duration-200 ease-out
          lg:relative lg:translate-x-0 lg:z-auto
          ${open ? 'translate-x-0 sidebar-enter' : '-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-kit-border flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-kit-cyan to-kit-purple bg-clip-text text-transparent">
              K.I.T.
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">Knight Industries Trading</p>
          </div>
          {/* Mobile close */}
          <button
            onClick={onClose}
            className="lg:hidden text-gray-500 hover:text-white p-1"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-kit-cyan/10 text-kit-cyan'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-kit-border space-y-2">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-kit-green' : 'bg-kit-red'}`} />
            <span className="text-xs text-gray-500">{wsConnected ? 'Live' : 'Offline'}</span>
          </div>
          <div className="text-xs text-gray-600">v2.0.0</div>
        </div>
      </aside>
    </>
  );
}
