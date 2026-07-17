import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMarket } from '../context/MarketContext';
import { mockApi } from '../services/mockApi';
import type { Asset, Transaction } from '../services/mockApi';
import { Skeleton } from '../components/UI';

interface PortfolioProps {
  onTradeSelect: (symbol: string, action: 'BUY' | 'SELL') => void;
}


// Sleek Custom Coin Badges for a Premium Interface (Gradient & Text Badge)
export const CoinIcon: React.FC<{ symbol: string; className?: string }> = ({ symbol, className = 'w-6 h-6' }) => {
  const gradientStyles: Record<string, string> = {
    BTC: 'from-[#f7931a] to-[#d97706]',
    ETH: 'from-[#627eea] to-[#4338ca]',
    SOL: 'from-[#14f195] to-[#9945ff]',
    BNB: 'from-[#f3ba2f] to-[#b45309]',
    DOGE: 'from-[#ba9f33] to-[#854d0e]',
    USD: 'from-slate-400 to-slate-600',
  };
  const gradient = gradientStyles[symbol] || 'from-indigo-500 to-purple-500';

  const getSymbolText = (sym: string) => {
    if (sym === 'BTC') return '₿';
    if (sym === 'ETH') return 'Ξ';
    return sym.substring(0, 3);
  };

  return (
    <div
      className={`flex items-center justify-center rounded-full text-white font-sans font-black tracking-tight select-none shadow-sm flex-shrink-0 text-center bg-gradient-to-tr ${gradient} ${className}`}
      style={{ fontSize: symbol.length > 3 ? '8px' : '10px', lineHeight: 1 }}
    >
      {getSymbolText(symbol)}
    </div>
  );
};

// Asset colors for allocation chart
const ALLOCATION_COLORS: Record<string, string> = {
  USD: '#64748b',
  Cash: '#64748b',
  BTC: '#f7931a',
  ETH: '#627eea',
  SOL: '#9945ff',
  BNB: '#f3ba2f',
  DOGE: '#ba9f33',
  XRP: '#00aae7',
  ADA: '#0033ad',
  DOT: '#e6007a',
  AVAX: '#e84142',
  LINK: '#375bd2',
  LTC: '#345d9d',
  FIL: '#00c4df',
};

const getAssetColor = (symbol: string): string => {
  if (ALLOCATION_COLORS[symbol]) return ALLOCATION_COLORS[symbol];
  const colors = [
    '#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#ec4899',
    '#8b5cf6', '#06b6d4', '#14b8a6', '#f97316', '#a855f7'
  ];
  let hash = 0;
  for (let i = 0; i < symbol.length; i++) {
    hash = symbol.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

const PortfolioSkeleton: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto py-8 px-4 flex flex-col gap-6 font-sans text-left">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-64" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-28 rounded-full" />
          <Skeleton className="h-10 w-32 rounded-full" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
        <div className="flex flex-col gap-6">
          <div className="bg-white dark:bg-surface-card-dark border border-hairline-light dark:border-hairline-dark rounded-2xl p-6 flex flex-col gap-6">
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-40" />
                <div className="flex gap-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
              <Skeleton className="h-9 w-32 rounded-lg" />
            </div>
            <Skeleton className="h-[130px] w-full rounded-xl" />
          </div>
          <div className="bg-white dark:bg-surface-card-dark border border-hairline-light dark:border-hairline-dark rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-5 w-32" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-36" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
            <div className="flex flex-col gap-3 mt-2">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="flex justify-between items-center py-2 border-b border-hairline-light/50 dark:border-hairline-dark/10 last:border-b-0">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="flex flex-col gap-1.5">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-2.5 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <div className="bg-white dark:bg-surface-card-dark border border-hairline-light dark:border-hairline-dark rounded-2xl p-5">
            <Skeleton className="h-4 w-32 mb-4" />
            <div className="grid grid-cols-2">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="flex flex-col gap-1.5 p-3">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-2.5 w-12" />
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white dark:bg-surface-card-dark border border-hairline-light dark:border-hairline-dark rounded-2xl p-5 flex flex-col gap-4">
            <Skeleton className="h-4 w-36" />
            <div className="flex flex-col gap-4">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="flex flex-col gap-2 py-2 border-b border-hairline-light/50 dark:border-hairline-dark/20 last:border-b-0">
                  <div className="flex justify-between">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-3.5 w-16" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-2.5 w-32" />
                    <Skeleton className="h-2.5 w-12" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Portfolio: React.FC<PortfolioProps> = ({ onTradeSelect }) => {
  const { user, refreshUser } = useAuth();
  const { prices } = useMarket();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Interaction Sync States
  const [hoveredSymbol, setHoveredSymbol] = useState<string | null>(null);
  const [hoveredEquityIdx, setHoveredEquityIdx] = useState<number | null>(null);
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);

  // Timeframe state for the main portfolio value chart
  const [timeframe, setTimeframe] = useState<'24H' | '7D' | '1M' | '1Y' | 'ALL'>('7D');

  // Deposit Cash Simulator modal states
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('5000');
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositSuccess, setDepositSuccess] = useState(false);

  // Sorting & Filtering States
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'symbol' | 'amount' | 'value' | 'roiPercent'>('value');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [performanceFilter, setPerformanceFilter] = useState<'all' | 'gainers' | 'losers'>('all');

  useEffect(() => {
    const loadPortfolioData = async () => {
      try {
        const [portfolioData, transactionData] = await Promise.all([
          mockApi.getPortfolio(),
          mockApi.getTransactions(),
        ]);
        setAssets(portfolioData);
        setTransactions(transactionData);
      } catch (err) {
        console.error('Failed to load portfolio details', err);
      } finally {
        setLoading(false);
      }
    };
    loadPortfolioData();
  }, [user]);

  const portfolioHoldings = useMemo(() => {
    return assets.map(asset => {
      const coin = prices.find(p => p.symbol === asset.symbol);
      const currentPrice = coin ? coin.price : asset.avgBuyPrice;
      const value = asset.amount * currentPrice;
      const costBasis = asset.amount * asset.avgBuyPrice;
      const roiUSD = value - costBasis;
      const roiPercent = asset.avgBuyPrice > 0 ? (roiUSD / costBasis) * 100 : 0;
      const change24h = coin ? coin.change24h : 0;
      const dailyDiffUSD = value * (change24h / 100);
      const sparkline = coin ? coin.sparkline : [];

      return {
        ...asset,
        currentPrice,
        value,
        costBasis,
        roiUSD,
        roiPercent,
        change24h,
        dailyDiffUSD,
        sparkline,
      };
    });
  }, [assets, prices]);

  const cryptoTotal = useMemo(() => {
    return portfolioHoldings.reduce((sum, h) => sum + h.value, 0);
  }, [portfolioHoldings]);

  const estimatedTotal = (user?.balance || 0) + cryptoTotal;
  const totalCostBasis = portfolioHoldings.reduce((sum, h) => sum + h.costBasis, 0);

  const dailyChangeUSD = portfolioHoldings.reduce((sum, h) => sum + h.dailyDiffUSD, 0);
  const dailyChangePercent = estimatedTotal > 0 ? (dailyChangeUSD / estimatedTotal) * 100 : 0;

  const allTimeDiffUSD = cryptoTotal - totalCostBasis;
  const allTimeChangePercent = totalCostBasis > 0 ? (allTimeDiffUSD / totalCostBasis) * 100 : 0;

  let bestAsset = useMemo(() => {
    if (portfolioHoldings.length === 0) return null;
    return [...portfolioHoldings].sort((a, b) => b.roiPercent - a.roiPercent)[0];
  }, [portfolioHoldings]);

  let worstAsset = useMemo(() => {
    if (portfolioHoldings.length === 0) return null;
    const sorted = [...portfolioHoldings].sort((a, b) => b.roiPercent - a.roiPercent);
    return sorted[sorted.length - 1];
  }, [portfolioHoldings]);

  const allocationItems = useMemo(() => {
    const items = [];
    const cashVal = user?.balance || 0;
    if (cashVal > 0) {
      items.push({
        symbol: 'Cash',
        name: 'Cash Balance',
        value: cashVal,
        color: '#64748b',
      });
    }
    portfolioHoldings.forEach(hold => {
      if (hold.value > 0) {
        items.push({
          symbol: hold.symbol,
          name: hold.name,
          value: hold.value,
          color: getAssetColor(hold.symbol),
        });
      }
    });

    if (items.length === 0) {
      items.push({
        symbol: 'Cash',
        name: 'Cash Balance',
        value: 0,
        color: '#64748b',
      });
    }

    // Sort by value descending
    items.sort((a, b) => b.value - a.value);

    const total = items.reduce((sum, item) => sum + item.value, 0);
    return items.map(item => ({
      ...item,
      percentage: total > 0 ? (item.value / total) * 100 : 0,
    }));
  }, [user?.balance, portfolioHoldings]);

  const displayAllocationItems = useMemo(() => {
    if (allocationItems.length <= 6) return allocationItems;

    const topItems = allocationItems.slice(0, 5);
    const otherItems = allocationItems.slice(5);
    const otherValue = otherItems.reduce((sum, item) => sum + item.value, 0);
    const otherPercentage = otherItems.reduce((sum, item) => sum + item.percentage, 0);

    return [
      ...topItems,
      {
        symbol: 'Others',
        name: 'Other Assets',
        value: otherValue,
        color: '#94a3b8',
        percentage: otherPercentage,
      }
    ];
  }, [allocationItems]);



  // Dynamic multi-timeframe equity chart data simulation
  const equityData = useMemo(() => {
    if (!user) return [];

    let pointsCount = 7;
    let baseVol = 0.04;
    let trend = allTimeDiffUSD;
    let days: string[] = [];

    switch (timeframe) {
      case '24H':
        pointsCount = 12;
        baseVol = 0.015;
        trend = dailyChangeUSD;
        break;
      case '7D':
        pointsCount = 7;
        baseVol = 0.04;
        trend = dailyChangeUSD * 4.5;
        days = ['6d ago', '5d ago', '4d ago', '3d ago', '2d ago', 'Yesterday', 'Today'];
        break;
      case '1M':
        pointsCount = 15;
        baseVol = 0.07;
        trend = allTimeDiffUSD * 0.7;
        break;
      case '1Y':
        pointsCount = 12;
        baseVol = 0.18;
        trend = allTimeDiffUSD * 1.5;
        break;
      case 'ALL':
        pointsCount = 20;
        baseVol = 0.32;
        trend = allTimeDiffUSD * 2.5;
        break;
    }

    const historyPoints = [];
    const day7Val = user.balance + cryptoTotal;
    const day1Val = day7Val - trend;

    for (let i = 0; i < pointsCount; i++) {
      const fraction = i / (pointsCount - 1 || 1);
      let val = day1Val + trend * fraction;

      if (i > 0 && i < pointsCount - 1) {
        // Compose smooth sinusoids for elegant look
        const noise =
          (Math.sin(i * 1.9) * 0.07 + Math.cos(i * 3.1) * 0.03) *
          (Math.abs(trend) || day7Val * baseVol);
        val += noise;
      }

      let label = '';
      if (timeframe === '24H') {
        const hoursAgo = 24 - Math.round(24 * fraction);
        label = hoursAgo === 0 ? 'Now' : `${hoursAgo}h ago`;
      } else if (timeframe === '7D') {
        label = days[i] || '';
      } else if (timeframe === '1M') {
        const daysAgo = 30 - Math.round(30 * fraction);
        label = daysAgo === 0 ? 'Today' : `${daysAgo}d ago`;
      } else if (timeframe === '1Y') {
        const monthsAgo = 12 - Math.round(12 * fraction);
        label = monthsAgo === 0 ? 'Today' : `${monthsAgo}m ago`;
      } else {
        label = i === 0 ? 'Start' : i === Math.floor(pointsCount / 2) ? 'Mid' : i === pointsCount - 1 ? 'Today' : '';
      }

      historyPoints.push({
        day: label,
        value: Math.max(0, val),
      });
    }

    return historyPoints;
  }, [user, cryptoTotal, timeframe, allTimeDiffUSD, dailyChangeUSD]);

  const getEquityChartPaths = () => {
    if (equityData.length === 0) return { linePath: '', areaPath: '', minV: 0, maxV: 0 };
    const values = equityData.map(d => d.value);
    const minV = Math.min(...values) * 0.98;
    const maxV = Math.max(...values) * 1.02;
    const rangeV = maxV - minV || 1;

    const linePath = equityData
      .map((d, i) => {
        const x = 30 + (i / (equityData.length - 1)) * 440;
        const y = 110 - ((d.value - minV) / rangeV) * 90;
        return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
      })
      .join(' ');

    const areaPath = `${linePath} L 470,115 L 30,115 Z`;

    return { linePath, areaPath, minV, maxV };
  };

  const { linePath: equityLinePath, areaPath: equityAreaPath, minV: equityMinV, maxV: equityMaxV } = getEquityChartPaths();

  const isChartUp = useMemo(() => {
    if (equityData.length < 2) return true;
    return equityData[equityData.length - 1].value >= equityData[0].value;
  }, [equityData]);

  const chartColor = isChartUp ? '#10b981' : '#ef4444';


  // Handle line chart hover
  const handleEquityMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (equityData.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 500;
    const len = equityData.length;
    const idx = Math.min(len - 1, Math.max(0, Math.round(((x - 30) / 440) * (len - 1))));
    setHoveredEquityIdx(idx);
  };

  // Perform deposit to mock account
  const handleDeposit = async () => {
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) return;
    setIsDepositing(true);

    await new Promise(r => setTimeout(r, 600));

    const userStr = localStorage.getItem('zyptox_user');
    if (userStr) {
      const u = JSON.parse(userStr);
      u.balance = Math.round((u.balance + amt) * 100) / 100;
      localStorage.setItem('zyptox_user', JSON.stringify(u));
      refreshUser();
    }

    setIsDepositing(false);
    setDepositSuccess(true);
    setTimeout(() => {
      setDepositSuccess(false);
      setShowDepositModal(false);
    }, 1000);
  };

  // Sorting Handler
  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Filtered and Sorted list of holdings for rendering in table
  const filteredAndSortedHoldings = useMemo(() => {
    return portfolioHoldings
      .filter(hold => {
        const matchesSearch =
          hold.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          hold.name.toLowerCase().includes(searchQuery.toLowerCase());

        if (performanceFilter === 'gainers') {
          return matchesSearch && hold.roiPercent > 0;
        }
        if (performanceFilter === 'losers') {
          return matchesSearch && hold.roiPercent < 0;
        }
        return matchesSearch;
      })
      .sort((a, b) => {
        let aVal: any = a[sortField];
        let bVal: any = b[sortField];

        if (sortField === 'symbol') {
          return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }

        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      });
  }, [portfolioHoldings, searchQuery, sortField, sortOrder, performanceFilter]);

  // Mini sparkline renderer inside the table
  const renderSparkline = (points: number[] | undefined, change24h: number) => {
    if (!points || points.length === 0) return <div className="text-muted text-[10px]">—</div>;
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const w = 70;
    const h = 20;

    const path = points
      .map((p, i) => {
        const x = (i / (points.length - 1)) * w;
        const y = h - 2 - ((p - min) / range) * (h - 4);
        return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
      })
      .join(' ');

    const strokeColor = change24h >= 0 ? '#10b981' : '#ef4444';

    return (
      <svg width={w} height={h} className="overflow-visible select-none">
        <path d={path} fill="none" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  };

  if (loading) {
    return <PortfolioSkeleton />;
  }

  const formatUSD = (v: number) => v.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 flex flex-col gap-6 animate-fade-in font-sans">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Wallet & Portfolio Analysis</h1>
        <button
          onClick={() => setShowDepositModal(true)}
          className="inline-flex items-center gap-1.5 px-4 h-9 text-xs font-bold bg-primary text-on-primary hover:bg-primary-active rounded-xl shadow-sm transition-all duration-150 active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          Deposit Cash
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-surface-card-dark border border-hairline-light dark:border-hairline-dark rounded-2xl shadow-sm flex flex-col gap-1 text-left">
          <span className="text-[9px] text-muted font-bold uppercase tracking-wider font-sans">Daily Change</span>
          <span className={`text-base font-extrabold font-mono mt-0.5 ${dailyChangeUSD >= 0 ? 'text-trading-up' : 'text-trading-down'}`}>
            {dailyChangeUSD >= 0 ? '+' : ''}{formatUSD(dailyChangeUSD)}
          </span>
          <span className={`text-[10px] font-bold font-mono ${dailyChangeUSD >= 0 ? 'text-trading-up' : 'text-trading-down'}`}>
            {dailyChangeUSD >= 0 ? '▲' : '▼'} {dailyChangePercent.toFixed(2)}%
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-surface-card-dark border border-hairline-light dark:border-hairline-dark rounded-2xl shadow-sm flex flex-col gap-1 text-left">
          <span className="text-[9px] text-muted font-bold uppercase tracking-wider font-sans">All-Time ROI</span>
          <span className={`text-base font-extrabold font-mono mt-0.5 ${allTimeDiffUSD >= 0 ? 'text-trading-up' : 'text-trading-down'}`}>
            {allTimeDiffUSD >= 0 ? '+' : ''}{formatUSD(allTimeDiffUSD)}
          </span>
          <span className={`text-[10px] font-bold font-mono ${allTimeDiffUSD >= 0 ? 'text-trading-up' : 'text-trading-down'}`}>
            {allTimeDiffUSD >= 0 ? '▲' : '▼'} {allTimeChangePercent.toFixed(2)}%
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-surface-card-dark border border-hairline-light dark:border-hairline-dark rounded-2xl shadow-sm flex flex-col gap-1 text-left">
          <span className="text-[9px] text-muted font-bold uppercase tracking-wider font-sans">Best Performer</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <CoinIcon symbol={bestAsset?.symbol || ''} className="w-5 h-5" />
            <span className="text-sm font-extrabold text-ink dark:text-on-dark truncate font-sans">{bestAsset?.symbol || '—'}</span>
          </div>
          <span className="text-[10px] font-bold text-trading-up font-mono">
            {bestAsset ? `+${bestAsset.roiPercent.toFixed(2)}%` : '—'}
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-surface-card-dark border border-hairline-light dark:border-hairline-dark rounded-2xl shadow-sm flex flex-col gap-1 text-left">
          <span className="text-[9px] text-muted font-bold uppercase tracking-wider font-sans">Worst Performer</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <CoinIcon symbol={worstAsset?.symbol || ''} className="w-5 h-5" />
            <span className="text-sm font-extrabold text-ink dark:text-on-dark truncate font-sans">{worstAsset?.symbol || '—'}</span>
          </div>
          <span className="text-[10px] font-bold text-trading-down font-mono">
            {worstAsset ? `${worstAsset.roiPercent.toFixed(2)}%` : '—'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        <div className="flex flex-col gap-6 min-w-0">
          <div className="p-6 bg-white dark:bg-surface-card-dark border border-hairline-light dark:border-hairline-dark rounded-2xl shadow-sm flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex flex-col">
                <span className="text-[10px] text-muted font-bold uppercase tracking-wider">Estimated Net Worth</span>
                <p className="text-3xl font-extrabold text-primary select-all font-mono mt-0.5">
                  ${estimatedTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <span className="text-[10px] text-muted mt-1 font-semibold flex items-center gap-1.5 flex-wrap">
                  <span>Cash:</span> <span className="font-extrabold text-ink dark:text-on-dark font-mono">${(user?.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  <span className="opacity-40">•</span>
                  <span>Crypto:</span> <span className="font-extrabold text-accent font-mono">${cryptoTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </span>
              </div>

              {/* Timeframe Selector Tabs */}
              <div className="flex rounded-lg bg-canvas-light dark:bg-canvas-dark p-0.5 border border-hairline-light dark:border-hairline-dark">
                {(['24H', '7D', '1M', '1Y', 'ALL'] as const).map(tf => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all duration-150 ${
                      timeframe === tf
                        ? 'bg-white dark:bg-surface-card-dark text-primary shadow-sm'
                        : 'text-muted hover:text-ink dark:hover:text-on-dark'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative mt-2">
              {equityData.length === 0 ? (
                <p className="text-muted text-xs text-center py-10 font-semibold">No equity data available yet</p>
              ) : (
                <svg
                  className="w-full h-auto overflow-visible"
                  preserveAspectRatio="none"
                  viewBox="0 0 500 130"
                  onMouseMove={handleEquityMouseMove}
                  onMouseLeave={() => setHoveredEquityIdx(null)}
                >
                  <defs>
                    <linearGradient id="gradient-equity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={chartColor} stopOpacity="0.2" />
                      <stop offset="100%" stopColor={chartColor} stopOpacity="0" />
                    </linearGradient>
                    <filter id="glow-equity" x="-10%" y="-10%" width="120%" height="120%">
                      <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor={chartColor} floodOpacity="0.25" />
                    </filter>
                  </defs>

                  {/* Horizontal dotted gridlines */}
                  <line x1="30" y1="20" x2="470" y2="20" stroke="currentColor" strokeOpacity="0.03" strokeDasharray="3,3" />
                  <line x1="30" y1="65" x2="470" y2="65" stroke="currentColor" strokeOpacity="0.03" strokeDasharray="3,3" />
                  <line x1="30" y1="110" x2="470" y2="110" stroke="currentColor" strokeOpacity="0.06" />

                  {/* Main paths */}
                  <path d={equityAreaPath} fill="url(#gradient-equity)" />
                  <path d={equityLinePath} fill="none" stroke={chartColor} strokeWidth="2.5" strokeLinecap="round" filter="url(#glow-equity)" />

                  {/* Time Axis Labels */}
                  {equityData.map((d, i) => {
                    const showLabel = equityData.length < 10 || i % 2 === 0 || i === equityData.length - 1;
                    if (!showLabel || !d.day) return null;
                    return (
                      <text key={i} x={30 + (i / (equityData.length - 1)) * 440} y="125" textAnchor="middle" className="fill-muted text-[8px] font-mono select-none">
                        {d.day}
                      </text>
                    );
                  })}

                  {/* Interactive Tooltip Vertical Bar */}
                  {hoveredEquityIdx !== null && (
                    <>
                      <line
                        x1={30 + (hoveredEquityIdx / (equityData.length - 1)) * 440}
                        y1={10}
                        x2={30 + (hoveredEquityIdx / (equityData.length - 1)) * 440}
                        y2={115}
                        stroke="currentColor"
                        strokeOpacity="0.15"
                        strokeDasharray="3,3"
                      />
                      <circle
                        cx={30 + (hoveredEquityIdx / (equityData.length - 1)) * 440}
                        cy={110 - ((equityData[hoveredEquityIdx].value - equityMinV) / (equityMaxV - equityMinV || 1)) * 90}
                        r="4"
                        fill={chartColor}
                        className="stroke-white dark:stroke-canvas-dark stroke-2"
                      />

                      {/* Premium Tooltip overlay inside SVG */}
                      <g transform={`translate(${Math.max(55, Math.min(445, 30 + (hoveredEquityIdx / (equityData.length - 1)) * 440)) - 55}, 5)`}>
                        <rect width="110" height="24" rx="6" className="fill-ink dark:fill-on-dark opacity-95 shadow-lg" />
                        <text x="55" y="15" textAnchor="middle" className="fill-white dark:fill-canvas-dark text-[9px] font-mono font-bold select-none">
                          ${equityData[hoveredEquityIdx].value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </text>
                      </g>
                    </>
                  )}
                </svg>
              )}
            </div>
          </div>

          {/* Crypto Assets Table Widget */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-lg font-bold">My Crypto Assets</h3>

              {/* Table search and sorting controllers */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search Asset..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="h-8 pl-8 pr-3 text-[10px] font-bold rounded-lg border border-hairline-light dark:border-hairline-dark bg-white dark:bg-canvas-dark text-ink dark:text-on-dark focus:outline-none focus:ring-1 focus:ring-primary w-[140px]"
                  />
                  <svg className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                {/* Performance Filter Selector */}
                <div className="flex rounded-lg bg-canvas-light dark:bg-canvas-dark p-0.5 border border-hairline-light dark:border-hairline-dark">
                  {(['all', 'gainers', 'losers'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setPerformanceFilter(f)}
                      className={`px-2.5 py-1 text-[9px] font-black rounded-md capitalize transition-colors duration-100 ${
                        performanceFilter === f
                          ? 'bg-white dark:bg-surface-card-dark text-primary shadow-xs'
                          : 'text-muted hover:text-ink dark:hover:text-on-dark'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-surface-card-dark border border-hairline-light dark:border-hairline-dark rounded-2xl p-4 shadow-sm overflow-x-auto">
              {filteredAndSortedHoldings.length === 0 ? (
                <p className="text-xs text-muted py-10 text-center font-semibold">No crypto assets match your criteria.</p>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-hairline-light dark:border-hairline-dark text-muted text-[10px] font-bold uppercase tracking-wider select-none">
                      <th className="py-2.5 pl-3 cursor-pointer hover:text-ink dark:hover:text-on-dark" onClick={() => handleSort('symbol')}>
                        Asset {sortField === 'symbol' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                      </th>
                      <th className="py-2.5 px-2 text-right cursor-pointer hover:text-ink dark:hover:text-on-dark" onClick={() => handleSort('amount')}>
                        Holdings {sortField === 'amount' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                      </th>
                      <th className="py-2.5 px-2 text-right">Current Price</th>
                      <th className="py-2.5 px-2 text-right cursor-pointer hover:text-ink dark:hover:text-on-dark" onClick={() => handleSort('value')}>
                        Total Value {sortField === 'value' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                      </th>
                      <th className="py-2.5 px-2 text-center hidden md:table-cell">24H Trend</th>
                      <th className="py-2.5 px-2 text-right cursor-pointer hover:text-ink dark:hover:text-on-dark" onClick={() => handleSort('roiPercent')}>
                        Profit/Loss {sortField === 'roiPercent' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                      </th>
                      <th className="py-2.5 pr-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedHoldings.map(hold => {
                      const isHovered = hoveredSymbol === hold.symbol;
                      return (
                        <tr
                          key={hold.symbol}
                          onMouseEnter={() => setHoveredSymbol(hold.symbol)}
                          onMouseLeave={() => setHoveredSymbol(null)}
                          className={`border-b border-hairline-light/50 dark:border-hairline-dark/30 text-xs font-semibold transition-all duration-100 ${
                            isHovered
                              ? 'bg-slate-50/70 dark:bg-surface-elevated-dark/20'
                              : 'hover:bg-slate-50/30 dark:hover:bg-surface-elevated-dark/10'
                          }`}
                        >
                          <td className="py-3 pl-3">
                            <div className="flex items-center gap-2.5">
                              <CoinIcon symbol={hold.symbol} className="w-6 h-6" />
                              <div className="flex flex-col">
                                <span className="font-bold text-ink dark:text-on-dark">{hold.symbol}</span>
                                <span className="text-[9px] text-muted font-medium font-sans">{hold.name}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-right font-mono text-ink dark:text-on-dark">
                            {hold.amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 6 })}
                          </td>
                          <td className="py-3 px-2 text-right font-mono text-muted">
                            ${hold.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-2 text-right font-mono font-extrabold text-ink dark:text-on-dark">
                            ${hold.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-2 align-middle hidden md:table-cell">
                            <div className="flex justify-center">{renderSparkline(hold.sparkline, hold.change24h)}</div>
                          </td>
                          <td className={`py-3 px-2 text-right font-mono font-black ${hold.roiPercent >= 0 ? 'text-trading-up' : 'text-trading-down'}`}>
                            {hold.roiPercent >= 0 ? '+' : ''}
                            {hold.roiPercent.toFixed(2)}%
                          </td>
                          <td className="py-3 pr-3 text-right">
                            <div className="flex items-center justify-end gap-1.5 font-sans">
                              <button
                                type="button"
                                onClick={() => onTradeSelect(hold.symbol, 'BUY')}
                                className="px-3 py-1 rounded-full bg-trading-up/10 hover:bg-trading-up/25 active:scale-95 text-trading-up text-[10px] font-extrabold transition-all duration-100"
                              >
                                Buy
                              </button>
                              <button
                                type="button"
                                onClick={() => onTradeSelect(hold.symbol, 'SELL')}
                                className="px-3 py-1 rounded-full bg-trading-down/10 hover:bg-trading-down/25 active:scale-95 text-trading-down text-[10px] font-extrabold transition-all duration-100"
                              >
                                Sell
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Performance highlights grid + Son işlemler */}
        <div className="flex flex-col gap-6">
          {/* Asset Allocation Widget (Donut Chart) */}
          <div className="p-5 bg-white dark:bg-surface-card-dark border border-hairline-light dark:border-hairline-dark rounded-2xl shadow-sm flex flex-col gap-4 animate-fade-in">
            <h3 className="text-sm font-bold text-ink dark:text-on-dark text-left">Portfolio Allocation</h3>
            
            {/* CASH BALANCE Sub-Card */}
            <div className="bg-slate-50 dark:bg-canvas-dark border border-hairline-light/60 dark:border-hairline-dark/25 rounded-xl p-3.5 flex flex-col text-left">
              <span className="text-[9px] text-muted font-bold uppercase tracking-wider font-sans">Cash Balance</span>
              <span className="text-xl font-extrabold text-ink dark:text-on-dark font-mono mt-0.5">
                ${(user?.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {/* Donut Chart and Legend Row */}
            <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-5 mt-1">
              {/* Donut SVG */}
              <div className="relative w-36 h-36 flex-shrink-0 flex items-center justify-center">
                {(() => {
                  const r = 38;
                  const C = 2 * Math.PI * r;
                  const ARC = C * 0.75;
                  
                  const handleSvgMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const size = 100;
                    const cx = 50;
                    const cy = 50;
                    const strokeWidth = 8;
                    
                    const mx = ((e.clientX - rect.left) / rect.width) * size - cx;
                    const my = ((e.clientY - rect.top) / rect.height) * size - cy;
                    
                    const dist = Math.sqrt(mx * mx + my * my);
                    if (dist < r - strokeWidth / 2 - 2 || dist > r + strokeWidth / 2 + 2) {
                      setHoveredSlice(null);
                      return;
                    }
                    
                    let angleRad = Math.atan2(my, mx);
                    let angleDeg = (angleRad * 180) / Math.PI;
                    
                    let adjustedAngle = angleDeg - 135;
                    if (adjustedAngle < 0) {
                      adjustedAngle += 360;
                    }
                    
                    if (adjustedAngle > 270) {
                      setHoveredSlice(null);
                      return;
                    }
                    
                    const arcPos = (adjustedAngle / 270) * ARC;
                    
                    let cumulativeOffset = 0;
                    for (const item of displayAllocationItems) {
                      const segLen = (item.percentage / 100) * ARC;
                      if (arcPos >= cumulativeOffset && arcPos <= cumulativeOffset + segLen) {
                        setHoveredSlice(item.symbol);
                        return;
                      }
                      cumulativeOffset += segLen;
                    }
                    
                    setHoveredSlice(null);
                  };

                  return (
                    <svg
                      className="w-full h-full cursor-pointer"
                      viewBox="0 0 100 100"
                      onMouseMove={handleSvgMouseMove}
                      onMouseLeave={() => setHoveredSlice(null)}
                    >
                      {/* Background Circle */}
                      <circle
                        cx="50"
                        cy="50"
                        r={r}
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="8"
                        className="text-slate-100 dark:text-slate-800/50 pointer-events-none"
                        strokeDasharray={`${ARC} ${C - ARC}`}
                        strokeDashoffset={0}
                        transform="rotate(135 50 50)"
                      />
                      {/* Slices */}
                      {(() => {
                        let cumulativeOffset = 0;
                        return displayAllocationItems.map((item, idx) => {
                          const segLen = (item.percentage / 100) * ARC;
                          const strokeOffset = -cumulativeOffset;
                          cumulativeOffset += segLen;
                          
                          const isHovered = hoveredSlice === item.symbol;
                          
                          return (
                            <circle
                              key={idx}
                              cx="50"
                              cy="50"
                              r={r}
                              fill="transparent"
                              stroke={item.color}
                              strokeWidth={isHovered ? 10 : 8}
                              strokeDasharray={`${segLen} ${C - segLen}`}
                              strokeDashoffset={strokeOffset}
                              transform="rotate(135 50 50)"
                              className="transition-[stroke-width] duration-200 pointer-events-none"
                            />
                          );
                        });
                      })()}
                    </svg>
                  );
                })()}
                
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-2">
                  {(() => {
                    if (hoveredSlice) {
                      const hoveredItem = displayAllocationItems.find(item => item.symbol === hoveredSlice);
                      if (hoveredItem) {
                        return (
                          <>
                            <span className="text-[9px] text-muted font-bold uppercase tracking-wider truncate max-w-[80px] font-sans">
                              {hoveredItem.symbol}
                            </span>
                            <span className="text-xs font-black font-mono text-ink dark:text-on-dark mt-0.5">
                              ${hoveredItem.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </>
                        );
                      }
                    }
                    return (
                      <>
                        <span className="text-[9px] text-muted font-bold uppercase tracking-wider font-sans">
                          Total Value
                        </span>
                        <span className="text-xs font-black font-mono text-ink dark:text-on-dark mt-0.5">
                          ${estimatedTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Legend List */}
              <div className="flex flex-col gap-2 flex-grow min-w-0 w-full sm:w-auto text-left">
                {displayAllocationItems.map((item, idx) => {
                  const isHovered = hoveredSlice === item.symbol;
                  return (
                    <div
                      key={idx}
                      className={`flex items-center justify-between gap-2.5 py-0.5 px-2 -mx-2 rounded-lg transition-colors duration-150 cursor-pointer ${
                        isHovered ? 'bg-slate-100/60 dark:bg-surface-elevated-dark/25' : 'hover:bg-slate-50 dark:hover:bg-surface-elevated-dark/10'
                      }`}
                      onMouseEnter={() => setHoveredSlice(item.symbol)}
                      onMouseLeave={() => setHoveredSlice(null)}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-xs font-bold text-ink dark:text-on-dark truncate font-sans">
                          {item.symbol}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-muted font-mono flex-shrink-0">
                        {item.percentage.toFixed(1)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Transactions List Widget */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold">Recent Transactions</h3>

            <div className="bg-white dark:bg-surface-card-dark border border-hairline-light dark:border-hairline-dark rounded-2xl p-5 shadow-sm max-h-[360px] overflow-y-auto">
              {transactions.length === 0 ? (
                <p className="text-xs text-muted py-10 text-center font-semibold">You have not executed any transactions yet.</p>
              ) : (
                <div className="flex flex-col gap-4 pb-2">
                  {transactions.map(tx => (
                    <div
                      key={tx.id}
                      className="flex flex-col gap-1.5 py-3 border-b border-hairline-light/50 dark:border-hairline-dark/20 first:pt-0 last:pb-0 last:border-b-0 text-left"
                    >
                      <div className="flex justify-between text-xs font-bold">
                        <span className="flex items-center gap-1.5">
                          <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-black tracking-wide ${
                            tx.type === 'BUY' ? 'bg-trading-up/10 text-trading-up' : 'bg-trading-down/10 text-trading-down'
                          }`}>
                            {tx.type}
                          </span>
                          <span className="text-ink dark:text-on-dark">{tx.symbol}</span>
                        </span>
                        <span className="font-mono text-ink dark:text-on-dark font-extrabold">
                          ${tx.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between text-[10px] text-muted">
                        <span>
                          {tx.amount} units @ ${tx.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="font-mono font-medium">
                          {new Date(tx.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Premium Deposit Modal Portal Popup */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-surface-card-dark border border-hairline-light dark:border-hairline-dark rounded-2xl p-6 w-full max-w-sm shadow-2xl flex flex-col gap-4 animate-scale-up font-sans text-left">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-black text-ink dark:text-on-dark">Deposit Simulated Cash</h3>
              <button
                onClick={() => setShowDepositModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-surface-elevated-dark text-muted hover:text-ink dark:hover:text-on-dark transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-muted">Amount to Deposit (USD)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted font-bold text-sm">$</span>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={e => setDepositAmount(e.target.value)}
                  className="w-full h-11 pl-8 pr-4 text-sm font-bold bg-canvas-light dark:bg-canvas-dark border border-hairline-light dark:border-hairline-dark rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono text-ink dark:text-on-dark"
                  placeholder="5,000"
                />
              </div>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {['1000', '5000', '10000'].map(val => (
                  <button
                    key={val}
                    onClick={() => setDepositAmount(val)}
                    className="py-1.5 px-3 text-xs font-bold rounded-lg border border-hairline-light dark:border-hairline-dark bg-canvas-light hover:bg-surface-strong-light dark:bg-canvas-dark dark:hover:bg-surface-elevated-dark transition-colors font-mono"
                  >
                    +${parseInt(val).toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleDeposit}
              disabled={isDepositing || depositSuccess}
              className="w-full h-11 mt-2 bg-primary text-on-primary font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-primary-active disabled:opacity-50 transition-all duration-150 text-sm shadow-sm"
            >
              {isDepositing ? (
                <>
                  <div className="w-4 h-4 border-2 border-t-transparent border-white animate-spin rounded-full" />
                  Processing Deposit...
                </>
              ) : depositSuccess ? (
                '✓ Deposit Successful!'
              ) : (
                'Confirm Deposit'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};