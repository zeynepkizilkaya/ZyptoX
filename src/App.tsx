import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Dashboard } from './pages/Dashboard';
import { Trade } from './pages/Trade';
import { Portfolio } from './pages/Portfolio';
import { AIAssistant } from './pages/AIAssistant';
import { Auth } from './pages/Auth';
import { useAuth } from './context/AuthContext';
import { Button } from './components/UI';

function App() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedTradeSymbol, setSelectedTradeSymbol] = useState<string>('BTC');
  const [selectedTradeAction, setSelectedTradeAction] = useState<'BUY' | 'SELL'>('BUY');

  useEffect(() => {
    if (isAuthenticated && activeTab === 'auth') {
      setActiveTab('dashboard');
    }
  }, [isAuthenticated, activeTab]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            onTradeSelect={(symbol: string, action: 'BUY' | 'SELL') => {
              setSelectedTradeSymbol(symbol);
              setSelectedTradeAction(action);
              setActiveTab('trade');
            }}
            onSignUpSelect={() => setActiveTab('auth')}
            onGoToPortfolio={() => setActiveTab('portfolio')}
          />
        );
      
      case 'trade':
        if (!isAuthenticated) {
          return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center gap-4 px-6 font-sans">
              <div className="w-12 h-12 rounded-full bg-muted/20 text-muted flex items-center justify-center select-none mb-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold">Please Log In</h3>
              <p className="text-xs text-muted max-w-sm">
                You need to log in or register to execute orders and use your wallet balance.
              </p>
              <Button variant="primary" onClick={() => setActiveTab('auth')} className="h-10 mt-2">
                Log In / Register
              </Button>
            </div>
          );
        }
        return <Trade initialSymbol={selectedTradeSymbol} initialAction={selectedTradeAction} />;

      case 'ai-assistant':
        if (!isAuthenticated) {
          return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center gap-4 px-6 font-sans">
              <div className="w-12 h-12 rounded-full bg-muted/20 text-muted flex items-center justify-center select-none mb-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold">AI Assistant Locked</h3>
              <p className="text-xs text-muted max-w-sm">
                Please log in to analyze your portfolio and access market analysis.
              </p>
              <Button variant="primary" onClick={() => setActiveTab('auth')} className="h-10 mt-2">
                Log In / Register
              </Button>
            </div>
          );
        }
        return <AIAssistant />;

      case 'portfolio':
        if (!isAuthenticated) {
          return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center gap-4 px-6 font-sans">
              <div className="w-12 h-12 rounded-full bg-muted/20 text-muted flex items-center justify-center select-none mb-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold">Access Your Wallet</h3>
              <p className="text-xs text-muted max-w-sm">
                Please log in to view your total balance, asset distribution, and transaction history.
              </p>
              <Button variant="primary" onClick={() => setActiveTab('auth')} className="h-10 mt-2">
                Log In / Register
              </Button>
            </div>
          );
        }
        return (
          <Portfolio 
            onTradeSelect={(symbol: string, action: 'BUY' | 'SELL') => {
              setSelectedTradeSymbol(symbol);
              setSelectedTradeAction(action);
              setActiveTab('trade');
            }}
          />
        );

      case 'auth':
        return (
          <Auth
            onSuccess={() => {
              setActiveTab('dashboard');
            }}
          />
        );

      default:
        return <div className="p-10">Page not found.</div>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-canvas-dark text-ink dark:text-on-dark font-sans">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 w-full flex flex-col">
        {renderTabContent()}
      </main>
      <Footer />
    </div>
  );
}

export default App;
