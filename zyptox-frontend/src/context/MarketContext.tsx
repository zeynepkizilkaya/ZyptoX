import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import type { MarketPrice } from '../services/api';

interface MarketContextType {
  prices: MarketPrice[];
  isPolling: boolean;
  setIsPolling: (val: boolean) => void;
  refreshPrices: () => Promise<void>;
}

const MarketContext = createContext<MarketContextType | undefined>(undefined);

export const MarketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [isPolling, setIsPolling] = useState<boolean>(true);

  const refreshPrices = useCallback(async () => {
    try {
      const data = await api.getPrices();
      setPrices(data);
    } catch (err) {
      console.error('Failed to fetch prices', err);
    }
  }, []);

  useEffect(() => {
    refreshPrices();
  }, [refreshPrices]);

  useEffect(() => {
    if (!isPolling) return;

    const interval = setInterval(async () => {
      try {
        await refreshPrices();
      } catch (err) {
        console.error('Failed to refresh prices', err);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [isPolling, refreshPrices]);

  return (
    <MarketContext.Provider
      value={{
        prices,
        isPolling,
        setIsPolling,
        refreshPrices,
      }}
    >
      {children}
    </MarketContext.Provider>
  );
};

export const useMarket = () => {
  const context = useContext(MarketContext);
  if (!context) {
    throw new Error('useMarket must be used within a MarketProvider');
  }
  return context;
};
