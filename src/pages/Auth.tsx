import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button, Input } from '../components/UI';

interface AuthProps {
  onSuccess: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [registeredBalance, setRegisteredBalance] = useState<number | null>(null);
  
  const { login, register, isLoading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setRegisteredBalance(null);

    if (!username.trim() || !password.trim()) {
      setLocalError('Please fill in all fields.');
      return;
    }

    try {
      if (isRegister) {
        await register(username);
        const storedUser = localStorage.getItem('zyptox_user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setRegisteredBalance(parsed.balance);
        }
      } else {
        await login(username);
        onSuccess();
      }
    } catch (err: any) {
    }
  };

  const handleStartTrading = () => {
    onSuccess();
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4 py-12 bg-white dark:bg-canvas-dark text-ink dark:text-on-dark font-sans">
      <div className="w-full max-w-[420px] p-8 rounded-xl border bg-[#fafafa] dark:bg-surface-card-dark border-hairline-light dark:border-hairline-dark shadow-sm">
        
        {registeredBalance !== null ? (
          <div className="flex flex-col items-center text-center gap-6">
            <div className="w-16 h-16 rounded-full bg-primary/20 text-primary flex items-center justify-center select-none animate-bounce">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-ink dark:text-on-dark">Welcome to ZyptoX!</h2>
              <p className="text-xs text-muted mt-2">Your account was successfully created and initial balance is allocated:</p>
            </div>
            
            <div className="p-4 rounded-lg bg-white dark:bg-surface-elevated-dark border border-hairline-light dark:border-hairline-dark w-full">
              <span className="text-xs font-semibold text-muted block mb-1">Welcome Balance (Simulated)</span>
              <span className="text-3xl font-bold font-mono text-trading-up">
                ${registeredBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <Button variant="primary" className="w-full h-11" onClick={handleStartTrading}>
              Start Trading Now
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight text-ink dark:text-on-dark">
                {isRegister ? 'Create Account' : 'Log In'}
              </h2>
              <p className="text-xs text-muted mt-1.5">
                {isRegister 
                  ? 'Sign up for free and start trading with your simulated balance.' 
                  : 'Access your ZyptoX account.'
                }
              </p>
            </div>

            {(error || localError) && (
              <div className="p-3 text-xs bg-trading-down/10 text-trading-down rounded border border-trading-down/20 font-medium text-center">
                {localError || error}
              </div>
            )}

            <div className="flex flex-col gap-4">
              <Input
                label="Username"
                type="text"
                placeholder="e.g. TraderAli"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full h-11 text-sm font-bold"
              disabled={isLoading}
            >
              {isLoading ? 'Please wait...' : (isRegister ? 'Register' : 'Log In')}
            </Button>

            <div className="text-center text-xs">
              <span className="text-muted">
                {isRegister ? 'Already have an account? ' : "Don't have an account? "}
              </span>
              <button
                type="button"
                className="font-bold text-primary hover:text-primary-active underline transition-colors"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setLocalError(null);
                }}
                disabled={isLoading}
              >
                {isRegister ? 'Log In' : 'Register'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
