import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockApi } from '../services/mockApi';
import type { User } from '../services/mockApi';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (username: string) => Promise<void>;
  register: (username: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const currentUser = mockApi.getCurrentUser();
        if (currentUser && currentUser.token) {
          setUser(currentUser);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Failed to load user session', err);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (username: string) => {
    setIsLoading(true);
    setError(null);
    try {
      if (!username.trim()) {
        throw new Error('Username cannot be empty.');
      }
      const data = await mockApi.login(username);
      setUser(data);
    } catch (err: any) {
      setError(err.message || 'Login failed.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string) => {
    setIsLoading(true);
    setError(null);
    try {
      if (!username.trim()) {
        throw new Error('Username cannot be empty.');
      }
      const data = await mockApi.register(username);
      setUser(data);
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await mockApi.logout();
      setUser(null);
    } catch (err) {
      console.error('Logout failed', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = () => {
    const currentUser = mockApi.getCurrentUser();
    if (currentUser && currentUser.token) {
      setUser(currentUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user?.token,
        isLoading,
        error,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
