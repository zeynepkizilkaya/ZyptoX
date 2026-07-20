const API_BASE = '/api';

// Intercept all fetch requests to automatically log out on 401 Unauthorized (e.g. session expired)
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  const response = await originalFetch(...args);
  if (response.status === 401 || response.status === 403) {
    console.warn("Session expired or unauthorized (401/403). Auto logging out...");
    localStorage.removeItem('zyptox_user');
    // If not already on landing page, reload to trigger auth state reset
    if (window.location.pathname !== '/' || localStorage.getItem('zyptox_user') !== null) {
      window.location.reload();
    }
  }
  return response;
};


export interface User {
  username: string;
  balance: number;
  email?: string;
  token?: string;
}

export interface Asset {
  symbol: string;
  name: string;
  amount: number;
  avgBuyPrice: number;
}

export interface Transaction {
  id: number;
  timestamp: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  amount: number;
  price: number;
  total: number;
}

export interface MarketPrice {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  sparkline: number[];
}

const getHeaders = () => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  const userStr = localStorage.getItem('zyptox_user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user && user.token) {
        headers['Authorization'] = `Bearer ${user.token}`;
      }
    } catch (e) {
      console.error('Failed to parse user for authorization token', e);
    }
  }
  return headers;
};

export const api = {
  register: async (username: string, email: string, password: string): Promise<User> => {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });

    if (!response.ok) {
      let message = 'Registration failed';
      try {
        const errorData = await response.json();
        message = errorData.message || message;
      } catch (e) {}
      throw new Error(message);
    }

    // Auto-login after successful registration
    return api.login(username, password);
  },

  login: async (username: string, password: string): Promise<User> => {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      let message = 'Login failed';
      try {
        const errorData = await response.json();
        message = errorData.message || message;
      } catch (e) {}
      throw new Error(message);
    }

    const data = await response.json(); // contains token, username, email
    
    // Fetch profile info to retrieve user balance
    const meResponse = await fetch(`${API_BASE}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${data.token}`
      }
    });

    let balance = 0;
    if (meResponse.ok) {
      const meData = await meResponse.json();
      balance = meData.balance;
    }

    const user: User = {
      username: data.username,
      balance: balance,
      token: data.token,
      email: data.email
    };

    localStorage.setItem('zyptox_user', JSON.stringify(user));
    return user;
  },

  getCurrentUser: (): User | null => {
    const user = localStorage.getItem('zyptox_user');
    return user ? JSON.parse(user) : null;
  },

  logout: async (): Promise<void> => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: getHeaders(),
      });
    } catch (e) {
      console.error('Logout request failed', e);
    } finally {
      localStorage.removeItem('zyptox_user');
    }
  },

  getPrices: async (): Promise<MarketPrice[]> => {
    const response = await fetch(`${API_BASE}/prices`);
    if (!response.ok) {
      throw new Error('Failed to fetch prices');
    }
    return response.json();
  },

  fluctuatePrices: async (): Promise<MarketPrice[]> => {
    const response = await fetch(`${API_BASE}/prices/fluctuate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) {
      throw new Error('Failed to fluctuate prices');
    }
    return response.json();
  },

  getPortfolio: async (): Promise<Asset[]> => {
    const response = await fetch(`${API_BASE}/wallet/portfolio`, {
      headers: getHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch portfolio');
    }
    return response.json();
  },

  getTransactions: async (): Promise<Transaction[]> => {
    const response = await fetch(`${API_BASE}/wallet/transactions`, {
      headers: getHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch transactions');
    }
    return response.json();
  },

  executeTrade: async (
    symbol: string,
    action: 'BUY' | 'SELL',
    amount: number
  ): Promise<{ status: 'SUCCESS' | 'FAILED'; message: string; balance: number }> => {
    const response = await fetch(`${API_BASE}/trade/execute`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ symbol, action, amount }),
    });

    if (!response.ok) {
      let message = 'Trade execution failed';
      try {
        const errorData = await response.json();
        message = errorData.message || message;
      } catch (e) {}
      return { status: 'FAILED', message, balance: 0 };
    }

    const data = await response.json(); // contains status, message, balance
    
    if (data.status === 'SUCCESS') {
      const user = api.getCurrentUser();
      if (user) {
        user.balance = data.balance;
        localStorage.setItem('zyptox_user', JSON.stringify(user));
      }
    }

    return data;
  },

  deposit: async (amount: number): Promise<{ balance: number }> => {
    const response = await fetch(`${API_BASE}/wallet/deposit`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ amount }),
    });

    if (!response.ok) {
      throw new Error('Deposit failed');
    }

    const data = await response.json(); // contains balance
    
    const user = api.getCurrentUser();
    if (user) {
      user.balance = data.balance;
      localStorage.setItem('zyptox_user', JSON.stringify(user));
    }

    return data;
  },

  queryAI: async (message: string): Promise<string> => {
    const response = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      let message = 'AI Chat failed';
      try {
        const errorData = await response.json();
        message = errorData.message || message;
      } catch (e) {}
      throw new Error(message);
    }

    const data = await response.json(); // contains answer
    return data.answer || data.message || '';
  },

  getKlines: async (symbol: string, interval: string, limit: number): Promise<any[][]> => {
    const response = await fetch(`${API_BASE}/prices/${symbol}/klines?interval=${interval}&limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch klines');
    return response.json();
  },
};
