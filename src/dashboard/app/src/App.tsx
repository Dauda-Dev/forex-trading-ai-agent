import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import DataProvider from './context/DataContext';
import AlertProvider from './context/AlertContext';
import ErrorBoundary from './components/ErrorBoundary';
import Sidebar from './components/Sidebar';
import AlertBell from './components/AlertBell';
import Dashboard from './pages/Dashboard';
import Charts from './pages/Charts';
import Brain from './pages/Brain';
import TradeHistory from './pages/TradeHistory';
import Chat from './pages/Chat';
import Portfolio from './pages/Portfolio';
import Backtest from './pages/Backtest';

function Shell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-kit-dark">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-kit-border bg-kit-card/80 backdrop-blur-sm sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-400 hover:text-white p-1"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-bold bg-gradient-to-r from-kit-cyan to-kit-purple bg-clip-text text-transparent">
              K.I.T.
            </h1>
          </div>
          <AlertBell />
        </header>

        {/* Desktop header with alert bell */}
        <header className="hidden lg:flex items-center justify-end px-6 py-3 border-b border-kit-border bg-kit-card/40">
          <AlertBell />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <ErrorBoundary>
            <div className="page-enter">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/charts" element={<Charts />} />
                <Route path="/backtest" element={<Backtest />} />
                <Route path="/brain" element={<Brain />} />
                <Route path="/trades" element={<TradeHistory />} />
                <Route path="/chat" element={<Chat />} />
              </Routes>
            </div>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <DataProvider>
      <AlertProvider>
        <Shell />
      </AlertProvider>
    </DataProvider>
  );
}
