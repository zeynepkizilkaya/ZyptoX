import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Button } from './UI';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout, login } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Markets' },
    { id: 'trade', label: 'Trade' },
    { id: 'ai-assistant', label: 'AI Assistant' },
    { id: 'portfolio', label: 'Portfolio' },
  ];

  const handleDemoLogin = () => {
    login('DemoTrader');
  };

  return (
    <nav className="sticky top-0 z-50 w-full h-16 border-b font-sans transition-colors duration-200 bg-white border-hairline-light dark:bg-canvas-dark dark:border-hairline-dark">
      <div className="max-w-[1440px] h-full mx-auto px-6 flex items-center justify-between">
        
        <div className="flex items-center gap-8">
          <div 
            onClick={() => setActiveTab('dashboard')} 
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold text-on-primary text-lg">
              ZX
            </div>
            <span className="font-sans font-bold text-lg text-ink dark:text-on-dark tracking-wide">
              Zypto<span className="text-primary">X</span>
            </span>
          </div>

          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-6">
              {menuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`text-sm font-medium transition-colors duration-150 py-2 border-b-2 ${
                    activeTab === item.id
                      ? 'border-primary text-ink dark:text-on-dark font-semibold'
                      : 'border-transparent text-muted hover:text-ink dark:hover:text-on-dark'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-md hover:bg-surface-strong-light dark:hover:bg-surface-elevated-dark text-muted dark:text-muted-strong transition-colors duration-150"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {isAuthenticated && user ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-semibold text-muted">{user.username}</span>
                <span className="text-sm font-bold font-mono text-trading-up">
                  ${user.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <button
                type="button"
                onClick={logout}
                className="text-xs text-muted hover:text-trading-down transition-colors duration-150"
              >
                Log Out
              </button>
            </div>
          ) : activeTab !== 'auth' ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleDemoLogin}
                className="text-sm font-semibold text-muted hover:text-ink dark:hover:text-on-dark transition-colors duration-150 px-2 py-1"
              >
                Log In
              </button>
              <Button
                variant="primary"
                onClick={() => setActiveTab('auth')}
                className="h-8 px-4 text-xs font-bold"
              >
                Sign Up
              </Button>
            </div>
          ) : null}

        </div>
      </div>
    </nav>
  );
};
