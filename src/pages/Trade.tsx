import React, { useState, useEffect, useMemo } from 'react';
import { useMarket } from '../context/MarketContext';
import { useAuth } from '../context/AuthContext';
import { mockApi } from '../services/mockApi';
import type { Asset } from '../services/mockApi';
import { Button, Input, Spinner, Skeleton } from '../components/UI';
import { CoinIcon } from './Portfolio';

interface TradeProps {
  initialSymbol?: string;
  initialAction?: 'BUY' | 'SELL';
}

const TradeSkeleton: React.FC = () => {
  return (
    <div className="max-w-[1280px] mx-auto py-6 px-4 flex flex-col lg:flex-row gap-6 font-sans text-left min-h-[600px]">
      <div className="w-full lg:w-72 flex-shrink-0 bg-white dark:bg-surface-card-dark border border-hairline-light dark:border-hairline-dark rounded-xl p-4 flex flex-col gap-4">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-8 w-full" />
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="flex justify-between items-center py-2 border-b border-hairline-light/40 dark:border-hairline-dark/10 last:border-b-0">
              <div className="flex flex-col gap-1">
                <Skeleton className="h-3.5 w-16" />
                <Skeleton className="h-2.5 w-24" />
              </div>
              <div className="flex flex-col items-end gap-1">
                <Skeleton className="h-3.5 w-16" />
                <Skeleton className="h-2.5 w-10" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-w-0">
        <div className="flex-1 flex flex-col gap-6">
          <div className="bg-white dark:bg-surface-card-dark border border-hairline-light dark:border-hairline-dark rounded-xl p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <Skeleton className="h-4 w-20" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-10" />
                <Skeleton className="h-6 w-10" />
                <Skeleton className="h-6 w-10" />
              </div>
            </div>
            <Skeleton className="h-[380px] w-full rounded-lg" />
          </div>

          <div className="bg-white dark:bg-surface-card-dark border border-hairline-light dark:border-hairline-dark rounded-xl p-6 flex flex-col gap-4">
            <Skeleton className="h-5 w-40" />
            <div className="flex flex-col gap-3">
              {Array.from({ length: 2 }).map((_, idx) => (
                <div key={idx} className="flex justify-between items-center py-2 border-b border-hairline-light/50 dark:border-hairline-dark/10 last:border-b-0">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-5 h-5 rounded-full" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-3.5 w-16" />
                  <Skeleton className="h-6 w-12 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[360px] flex-shrink-0 bg-white dark:bg-surface-card-dark border border-hairline-light dark:border-hairline-dark rounded-xl p-6 flex flex-col gap-6">
          <div className="flex gap-1 bg-muted/10 p-0.5 rounded-lg">
            <Skeleton className="h-8 flex-1 rounded-md" />
            <Skeleton className="h-8 flex-1 rounded-md" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-3.5 w-24" />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3.5 w-12" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div className="grid grid-cols-4 gap-2">
            <Skeleton className="h-7 rounded" />
            <Skeleton className="h-7 rounded" />
            <Skeleton className="h-7 rounded" />
            <Skeleton className="h-7 rounded" />
          </div>
          <div className="flex flex-col gap-2 mt-4">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-11 w-full rounded-lg mt-2" />
        </div>
      </div>
    </div>
  );
};

export const Trade: React.FC<TradeProps> = ({ initialSymbol = 'BTC', initialAction }) => {
  const { prices } = useMarket();
  const { user, refreshUser } = useAuth();

  const [selectedSymbol, setSelectedSymbol] = useState<string>(initialSymbol);
  const [tradeAction, setTradeAction] = useState<'BUY' | 'SELL'>('BUY');
  const [amount, setAmount] = useState<string>('');
  const [userHoldings, setUserHoldings] = useState<Asset[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [timeframe, setTimeframe] = useState<'1H' | '4H' | '24H' | '1W'>('24H');
  const [watchlistSearch, setWatchlistSearch] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [tradeStatus, setTradeStatus] = useState<{ type: 'SUCCESS' | 'ERROR'; message: string } | null>(null);

  useEffect(() => {
    if (initialSymbol) {
      setSelectedSymbol(initialSymbol);
      setTradeStatus(null);
      setAmount('');
    }
    if (initialAction) {
      setTradeAction(initialAction);
    }
  }, [initialSymbol, initialAction]);

  const loadHoldings = async () => {
    try {
      const data = await mockApi.getPortfolio();
      setUserHoldings(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadHoldings();
  }, [submitting]);

  const currentCoin = prices.find(p => p.symbol === selectedSymbol) || prices[0];

  const chartData = useMemo(() => {
    if (!currentCoin) return null;
    let sparkline = [...currentCoin.sparkline];

    if (timeframe === '1H') {
      sparkline = Array.from({ length: 24 }, (_, i) =>
        currentCoin.price * (1 + Math.sin(i * 0.8) * 0.005 + (i * 0.0002))
      );
    } else if (timeframe === '4H') {
      sparkline = Array.from({ length: 24 }, (_, i) =>
        currentCoin.price * (1 + Math.cos(i * 0.5) * 0.012 - (i * 0.0005))
      );
    } else if (timeframe === '1W') {
      sparkline = Array.from({ length: 24 }, (_, i) =>
        currentCoin.price * (1 + Math.sin(i * 0.3) * 0.035 + Math.cos(i * 0.7) * 0.015)
      );
    }

    const pointsCount = 24;
    const dataPoints: { price: number; time: string; volume: number; isUp: boolean }[] = [];

    const minP = Math.min(...sparkline);
    const maxP = Math.max(...sparkline);
    const rangeP = (maxP - minP) || 1;

    const now = new Date();

    for (let i = 0; i < pointsCount; i++) {
      const ratio = i / (pointsCount - 1);
      const sparkIndexFloat = ratio * (sparkline.length - 1);
      const leftIdx = Math.floor(sparkIndexFloat);
      const rightIdx = Math.ceil(sparkIndexFloat);
      const fraction = sparkIndexFloat - leftIdx;

      const leftVal = sparkline[leftIdx];
      const rightVal = sparkline[rightIdx];
      const interpolatedPrice = leftVal + (rightVal - leftVal) * fraction;

      let timeLabel = '';
      if (timeframe === '1H') {
        const minsAgo = (23 - i) * 2.5;
        const targetDate = new Date(now.getTime() - minsAgo * 60 * 1000);
        timeLabel = targetDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
      } else if (timeframe === '4H') {
        const minsAgo = (23 - i) * 10;
        const targetDate = new Date(now.getTime() - minsAgo * 60 * 1000);
        timeLabel = targetDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
      } else if (timeframe === '1W') {
        const hoursAgo = (23 - i) * 7;
        const targetDate = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
        timeLabel = targetDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      } else {
        const hoursAgo = 23 - i;
        const targetDate = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
        timeLabel = targetDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
      }

      const simVolume = Math.round((50 + Math.abs(Math.sin(i * 1.5)) * 180 + (i % 3 === 0 ? 80 : 0)) * 100) / 100;
      const prevPrice = i > 0 ? dataPoints[i - 1].price : sparkline[0];
      const itemIsUp = interpolatedPrice >= prevPrice;

      dataPoints.push({
        price: Math.round(interpolatedPrice * 100) / 100,
        time: timeLabel,
        volume: simVolume,
        isUp: itemIsUp,
      });
    }

    const maxVolume = Math.max(...dataPoints.map(d => d.volume)) || 1;

    const pointsPath = dataPoints.map((dp, i) => {
      const x = 20 + (i / (pointsCount - 1)) * 920;
      const y = 250 - ((dp.price - minP) / rangeP) * 220;
      return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
    }).join(' ');

    const areaPath = `${pointsPath} L 940,330 L 20,330 Z`;

    return {
      dataPoints,
      minP,
      maxP,
      rangeP,
      maxVolume,
      pointsPath,
      areaPath,
    };
  }, [currentCoin, timeframe]);

  const filteredWatchlist = useMemo(() => {
    return prices.filter(p =>
      p.symbol.toLowerCase().includes(watchlistSearch.toLowerCase()) ||
      p.name.toLowerCase().includes(watchlistSearch.toLowerCase())
    );
  }, [prices, watchlistSearch]);

  if (!currentCoin || !chartData) {
    return <TradeSkeleton />;
  }

  const coinPrice = currentCoin.price;
  const change24h = currentCoin.change24h;
  const isUp = change24h >= 0;

  const currentHolding = userHoldings.find(h => h.symbol === selectedSymbol)?.amount || 0;
  const enterAmountFloat = parseFloat(amount) || 0;
  const calculatedTotal = Math.round(enterAmountFloat * coinPrice * 100) / 100;

  const handlePercentSelect = (pct: number) => {
    if (tradeAction === 'BUY') {
      const availableCash = user?.balance || 0;
      const maxBuyable = availableCash / coinPrice;
      const amountToBuy = maxBuyable * pct;
      setAmount(amountToBuy > 0 ? parseFloat(amountToBuy.toFixed(6)).toString() : '');
    } else {
      const maxSellable = currentHolding;
      const amountToSell = maxSellable * pct;
      setAmount(amountToSell > 0 ? parseFloat(amountToSell.toFixed(6)).toString() : '');
    }
    setTradeStatus(null);
  };

  const handleExecuteOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setTradeStatus(null);

    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      setTradeStatus({ type: 'ERROR', message: 'Please enter a valid amount greater than zero.' });
      return;
    }

    if (tradeAction === 'BUY' && user && user.balance < calculatedTotal) {
      setTradeStatus({ type: 'ERROR', message: 'Insufficient balance: You do not have enough USD cash to buy.' });
      return;
    }

    if (tradeAction === 'SELL' && currentHolding < val) {
      setTradeStatus({ type: 'ERROR', message: `Insufficient assets: You do not hold enough ${selectedSymbol} to sell.` });
      return;
    }

    setSubmitting(true);
    try {
      const res = await mockApi.executeTrade(selectedSymbol, tradeAction, val);
      if (res.status === 'SUCCESS') {
        setTradeStatus({ type: 'SUCCESS', message: res.message });
        setAmount('');
        refreshUser();
      } else {
        setTradeStatus({ type: 'ERROR', message: res.message });
      }
    } catch (err: any) {
      setTradeStatus({ type: 'ERROR', message: err.message || 'Trade execution failed.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const viewX = (x / rect.width) * 1000;
    const relativeX = viewX - 20;
    const chartWidth = 920;

    let pct = relativeX / chartWidth;
    if (pct < 0) pct = 0;
    if (pct > 1) pct = 1;

    const index = Math.round(pct * (chartData.dataPoints.length - 1));
    setHoverIdx(index);
  };

  const renderTooltip = () => {
    if (hoverIdx === null) return null;
    const item = chartData.dataPoints[hoverIdx];
    const hx = 20 + (hoverIdx / (chartData.dataPoints.length - 1)) * 920;
    const hy = 250 - ((item.price - chartData.minP) / chartData.rangeP) * 220;
    const leftPct = (hx / 1000) * 100;
    const topPct = (hy / 380) * 100;

    const isTooltipTooHigh = topPct < 25;
    let translateX = '-50%';
    let marginLeft = '0px';

    if (leftPct < 15) {
      translateX = '0%';
      marginLeft = '8px';
    } else if (leftPct > 85) {
      translateX = '-100%';
      marginLeft = '-8px';
    }

    return (
      <div
        style={{
          left: `${leftPct}%`,
          top: `${topPct}%`,
          transform: `translate(${translateX}, ${isTooltipTooHigh ? '0%' : '-100%'})`,
          marginTop: isTooltipTooHigh ? '12px' : '-12px',
          marginLeft
        }}
        className="absolute z-30 pointer-events-none p-3 rounded bg-white dark:bg-surface-elevated-dark border border-hairline-light dark:border-hairline-dark shadow-2xl text-[10px] flex flex-col gap-1 w-28 text-left transition-all duration-75 select-none"
      >
        <div className="flex justify-between border-b border-hairline-light dark:border-hairline-dark pb-1 text-muted">
          <span className="font-semibold">Time:</span>
          <span className="font-mono">{item.time}</span>
        </div>
        <div className="flex justify-between text-ink dark:text-on-dark">
          <span className="font-semibold">Price:</span>
          <span className="font-mono font-bold">${item.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between text-muted">
          <span className="font-semibold">Vol:</span>
          <span className="font-mono">{item.volume.toFixed(1)} {selectedSymbol}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full py-6 px-4 lg:px-8 bg-white dark:bg-canvas-dark text-ink dark:text-on-dark flex flex-col gap-6">

      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-hairline-light dark:border-hairline-dark">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative lg:hidden">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 text-xl font-bold bg-transparent border border-hairline-light dark:border-hairline-dark rounded px-3 py-1.5 focus:outline-none text-ink dark:text-on-dark cursor-pointer font-sans select-none"
            >
              <span>{selectedSymbol} / USD</span>
              <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                <div className="absolute left-0 mt-2 w-72 rounded-lg bg-white dark:bg-surface-elevated-dark border border-hairline-light dark:border-hairline-dark shadow-2xl py-2 z-20 max-h-80 overflow-y-auto">
                  {prices.map(p => (
                    <button
                      key={p.symbol}
                      type="button"
                      onClick={() => {
                        setSelectedSymbol(p.symbol);
                        setTradeStatus(null);
                        setAmount('');
                        setDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-sm font-sans hover:bg-surface-strong-light dark:hover:bg-surface-card-dark ${selectedSymbol === p.symbol ? 'bg-primary/10 text-primary-active dark:text-primary font-bold' : ''
                        }`}
                    >
                      <span>{p.symbol} / USD ({p.name})</span>
                      <span className="font-mono text-xs text-muted">${p.price.toLocaleString()}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="hidden lg:flex items-center gap-2">
            <CoinIcon symbol={selectedSymbol} className="w-8 h-8 text-[12px]" />
            <span className="text-xl font-bold">{selectedSymbol} / USD</span>
            <span className="text-xs text-muted">({currentCoin.name})</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col font-mono">
              <span className="text-xl font-bold text-ink dark:text-on-dark">${coinPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              <span className={`text-xs font-semibold ${isUp ? 'text-trading-up' : 'text-trading-down'}`}>
                {isUp ? '+' : ''}{change24h}% {isUp ? '▲' : '▼'}
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-6 border-l border-hairline-light dark:border-hairline-dark pl-6">
              <div className="flex flex-col font-mono">
                <span className="text-[9px] text-muted font-semibold uppercase">24h High</span>
                <span className="text-xs font-bold text-ink dark:text-on-dark">
                  ${(coinPrice * 1.032).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex flex-col font-mono">
                <span className="text-[9px] text-muted font-semibold uppercase">24h Low</span>
                <span className="text-xs font-bold text-ink dark:text-on-dark">
                  ${(coinPrice * 0.965).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex flex-col font-mono">
                <span className="text-[9px] text-muted font-semibold uppercase">24h Volume ({selectedSymbol})</span>
                <span className="text-xs font-bold text-ink dark:text-on-dark">
                  {(coinPrice * 18.2).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 text-right font-mono self-center">
          <div className="flex flex-col">
            <span className="text-[10px] text-muted font-semibold">USD Balance</span>
            <span className="text-sm font-bold">${user?.balance.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}</span>
          </div>
          <div className="flex flex-col border-l border-hairline-light dark:border-hairline-dark pl-6">
            <span className="text-[10px] text-muted font-semibold">Owned {selectedSymbol}</span>
            <span className="text-sm font-bold">{currentHolding} {selectedSymbol}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 w-full items-stretch">
        <div className="hidden lg:flex flex-col w-64 bg-[#fafafa] dark:bg-surface-card-dark border border-hairline-light dark:border-hairline-dark rounded-xl p-4 gap-3 flex-shrink-0">
          <span className="text-xs font-bold text-ink dark:text-on-dark uppercase tracking-wider">Markets Watchlist</span>

          <input
            type="text"
            placeholder="Search coin..."
            value={watchlistSearch}
            onChange={(e) => setWatchlistSearch(e.target.value)}
            className="h-8 px-2.5 text-xs font-sans rounded border bg-white dark:bg-canvas-dark border-hairline-light dark:border-hairline-dark focus:outline-none focus:ring-1 focus:ring-primary text-ink dark:text-on-dark w-full"
          />

          <div className="flex-1 flex flex-col gap-1 overflow-y-auto pr-1">
            {filteredWatchlist.map(p => {
              const coinIsUp = p.change24h >= 0;
              return (
                <button
                  key={p.symbol}
                  type="button"
                  onClick={() => {
                    setSelectedSymbol(p.symbol);
                    setTradeStatus(null);
                    setAmount('');
                    setHoverIdx(null);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded hover:bg-surface-strong-light dark:hover:bg-surface-elevated-dark transition-colors duration-75 text-left ${selectedSymbol === p.symbol ? 'bg-primary/10 border-l-2 border-primary-active' : ''
                    }`}
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-ink dark:text-on-dark">{p.symbol}/USD</span>
                    <span className="text-[9px] text-muted">{p.name}</span>
                  </div>
                  <div className="flex flex-col items-end font-mono">
                    <span className="text-xs font-bold text-ink dark:text-on-dark">${p.price.toLocaleString('en-US', { minimumFractionDigits: p.price < 1 ? 4 : 2 })}</span>
                    <span className={`text-[9px] font-semibold ${coinIsUp ? 'text-trading-up' : 'text-trading-down'}`}>
                      {coinIsUp ? '+' : ''}{p.change24h}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-6 w-full min-w-0">
          <div className="p-6 bg-[#fafafa] dark:bg-surface-card-dark border border-hairline-light dark:border-hairline-dark rounded-xl shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <span className="text-sm font-bold">Price Chart</span>

              <div className="flex items-center gap-1 bg-white dark:bg-canvas-dark rounded border border-hairline-light dark:border-hairline-dark p-0.5 select-none">
                {(['1H', '4H', '24H', '1W'] as const).map((tf) => (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => {
                      setTimeframe(tf);
                      setHoverIdx(null);
                    }}
                    className={`px-3 py-1 rounded text-[10px] font-bold font-mono transition-colors cursor-pointer ${timeframe === tf
                      ? 'bg-primary/20 text-primary-active dark:text-primary'
                      : 'text-muted hover:text-ink dark:hover:text-on-dark'
                      }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative h-[420px] bg-white dark:bg-canvas-dark/60 rounded-lg border border-hairline-light dark:border-hairline-dark overflow-hidden flex flex-col pt-4">
              <svg
                className="w-full h-full cursor-crosshair"
                viewBox="0 0 1000 380"
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setHoverIdx(null)}
              >
                <defs>
                  <linearGradient id="gradient-chart" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={isUp ? '#0ecb81' : '#f6465d'} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={isUp ? '#0ecb81' : '#f6465d'} stopOpacity="0" />
                  </linearGradient>
                  <filter id="glow" x="-10%" y="-10%" width="120%" height="120%">
                    <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor={isUp ? '#0ecb81' : '#f6465d'} floodOpacity="0.3" />
                  </filter>
                </defs>

                <line x1="20" y1="30" x2="940" y2="30" stroke="currentColor" strokeOpacity="0.05" strokeDasharray="2,2" />
                <line x1="20" y1="105" x2="940" y2="105" stroke="currentColor" strokeOpacity="0.05" strokeDasharray="2,2" />
                <line x1="20" y1="180" x2="940" y2="180" stroke="currentColor" strokeOpacity="0.05" strokeDasharray="2,2" />
                <line x1="20" y1="255" x2="940" y2="255" stroke="currentColor" strokeOpacity="0.05" strokeDasharray="2,2" />
                <line x1="20" y1="330" x2="940" y2="330" stroke="currentColor" strokeOpacity="0.08" />

                <text x="946" y="34" className="fill-muted text-[9px] font-mono select-none">${chartData.maxP.toLocaleString('en-US', { maximumFractionDigits: 0 })}</text>
                <text x="946" y="109" className="fill-muted text-[9px] font-mono select-none">${(chartData.minP + chartData.rangeP * (2 / 3)).toLocaleString('en-US', { maximumFractionDigits: 0 })}</text>
                <text x="946" y="184" className="fill-muted text-[9px] font-mono select-none">${(chartData.minP + chartData.rangeP * (1 / 3)).toLocaleString('en-US', { maximumFractionDigits: 0 })}</text>
                <text x="946" y="259" className="fill-muted text-[9px] font-mono select-none">${chartData.minP.toLocaleString('en-US', { maximumFractionDigits: 0 })}</text>

                <text x="20" y="360" className="fill-muted text-[8px] font-mono select-none" textAnchor="start">{chartData.dataPoints[0].time}</text>
                <text x="250" y="360" className="fill-muted text-[8px] font-mono select-none" textAnchor="middle">{chartData.dataPoints[6].time}</text>
                <text x="480" y="360" className="fill-muted text-[8px] font-mono select-none" textAnchor="middle">{chartData.dataPoints[12].time}</text>
                <text x="710" y="360" className="fill-muted text-[8px] font-mono select-none" textAnchor="middle">{chartData.dataPoints[18].time}</text>
                <text x="940" y="360" className="fill-muted text-[8px] font-mono select-none" textAnchor="end">{chartData.dataPoints[23].time}</text>

                {chartData.dataPoints.map((dp, i) => {
                  const barWidth = 8;
                  const barX = 20 + (i / (chartData.dataPoints.length - 1)) * 920 - barWidth / 2;
                  const barH = (dp.volume / chartData.maxVolume) * 55;
                  const barY = 330 - barH;
                  return (
                    <rect
                      key={i}
                      x={barX}
                      y={barY}
                      width={barWidth}
                      height={barH}
                      className={dp.isUp ? 'fill-trading-up opacity-[0.16]' : 'fill-trading-down opacity-[0.16]'}
                    />
                  );
                })}

                <path
                  d={chartData.pointsPath}
                  fill="none"
                  stroke={isUp ? '#0ecb81' : '#f6465d'}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#glow)"
                />

                <path
                  d={chartData.areaPath}
                  fill="url(#gradient-chart)"
                />

                {hoverIdx !== null && (
                  <>
                    <line
                      x1={20 + (hoverIdx / (chartData.dataPoints.length - 1)) * 920}
                      y1={20}
                      x2={20 + (hoverIdx / (chartData.dataPoints.length - 1)) * 920}
                      y2={330}
                      stroke="currentColor"
                      strokeOpacity="0.25"
                      strokeDasharray="3,3"
                    />
                    <line
                      x1={20}
                      y1={250 - ((chartData.dataPoints[hoverIdx].price - chartData.minP) / chartData.rangeP) * 220}
                      x2={940}
                      y2={250 - ((chartData.dataPoints[hoverIdx].price - chartData.minP) / chartData.rangeP) * 220}
                      stroke="currentColor"
                      strokeOpacity="0.25"
                      strokeDasharray="3,3"
                    />
                    <circle
                      cx={20 + (hoverIdx / (chartData.dataPoints.length - 1)) * 920}
                      cy={250 - ((chartData.dataPoints[hoverIdx].price - chartData.minP) / chartData.rangeP) * 220}
                      r="4"
                      className={isUp ? 'fill-trading-up stroke-white dark:stroke-canvas-dark stroke-2' : 'fill-trading-down stroke-white dark:stroke-canvas-dark stroke-2'}
                    />

                    <g transform={`translate(944, ${250 - ((chartData.dataPoints[hoverIdx].price - chartData.minP) / chartData.rangeP) * 220 - 8})`}>
                      <rect width="44" height="16" rx="3" className="fill-ink dark:fill-on-dark opacity-90" />
                      <text x="22" y="11" textAnchor="middle" className="fill-white dark:fill-canvas-dark text-[9px] font-mono font-semibold select-none">
                        ${chartData.dataPoints[hoverIdx].price.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                      </text>
                    </g>

                    <g transform={`translate(${20 + (hoverIdx / (chartData.dataPoints.length - 1)) * 920 - 24}, 332)`}>
                      <rect width="48" height="14" rx="3" className="fill-ink dark:fill-on-dark opacity-90" />
                      <text x="24" y="10" textAnchor="middle" className="fill-white dark:fill-canvas-dark text-[8px] font-mono font-semibold select-none">
                        {chartData.dataPoints[hoverIdx].time}
                      </text>
                    </g>
                  </>
                )}
              </svg>

              {renderTooltip()}

              <div className="absolute top-4 left-4 p-2 bg-black/40 text-on-dark rounded text-[10px] font-mono select-none">
                Min: ${chartData.minP.toLocaleString('en-US', { minimumFractionDigits: 2 })} - Max: ${chartData.maxP.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div className="p-6 bg-[#fafafa] dark:bg-surface-card-dark border border-hairline-light dark:border-hairline-dark rounded-xl shadow-sm flex flex-col gap-4">
            <span className="text-sm font-bold text-ink dark:text-on-dark px-2">Positions & Wallet Assets</span>

            <div className="overflow-x-auto w-full px-2">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-hairline-light dark:border-hairline-dark text-muted font-semibold">
                    <th className="py-2.5 pb-3 pl-4">Asset</th>
                    <th className="py-2.5 pb-3 px-2 text-right">Holdings</th>
                    <th className="py-2.5 pb-3 px-2 text-right">Avg Buy Price</th>
                    <th className="py-2.5 pb-3 px-2 text-right">Current Price</th>
                    <th className="py-2.5 pb-3 px-2 text-right">Total Value</th>
                    <th className="py-2.5 pb-3 px-2 text-right">Unrealized P&L</th>
                    <th className="py-2.5 pb-3 pr-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline-light dark:divide-hairline-dark font-mono text-ink dark:text-on-dark">
                  {userHoldings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-muted font-sans select-none">
                        No assets in wallet. Complete a BUY order to start trading.
                      </td>
                    </tr>
                  ) : (
                    userHoldings.map((asset) => {
                      const coin = prices.find(p => p.symbol === asset.symbol);
                      const currentP = coin?.price || asset.avgBuyPrice;
                      const totalCost = asset.amount * asset.avgBuyPrice;
                      const currentValue = asset.amount * currentP;
                      const pnl = currentValue - totalCost;
                      const pnlPct = totalCost > 0 ? (pnl / totalCost) * 100 : 0;
                      const isProfit = pnl >= 0;

                      return (
                        <tr key={asset.symbol} className="hover:bg-surface-strong-light dark:hover:bg-surface-elevated-dark transition-colors duration-75">
                          <td className="py-3 pl-4 font-sans font-bold flex items-center gap-2">
                            <CoinIcon symbol={asset.symbol} className="w-5 h-5 text-[8px]" />
                            <span>{asset.symbol} / USD</span>
                          </td>
                          <td className="py-3 px-2 text-right font-bold">{asset.amount.toLocaleString()} {asset.symbol}</td>
                          <td className="py-3 px-2 text-right text-muted">${asset.avgBuyPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                          <td className="py-3 px-2 text-right">${currentP.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                          <td className="py-3 px-2 text-right font-bold">${currentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className={`py-3 px-2 text-right font-bold ${isProfit ? 'text-trading-up' : 'text-trading-down'}`}>
                            {isProfit ? '+' : ''}${pnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({isProfit ? '+' : ''}{pnlPct.toFixed(2)}%)
                          </td>
                          <td className="py-3 pr-4 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedSymbol(asset.symbol);
                                setTradeAction('SELL');
                                setTradeStatus(null);
                                setAmount('');
                                setHoverIdx(null);
                              }}
                              className="px-2.5 py-1 rounded bg-primary/15 text-primary-active dark:text-primary hover:bg-primary/25 text-[10px] font-sans font-bold transition-colors select-none"
                            >
                              Sell
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-6">
          <div className="p-6 bg-[#fafafa] dark:bg-surface-card-dark border border-hairline-light dark:border-hairline-dark rounded-xl shadow-sm flex flex-col gap-6 w-full">

            <div className="grid grid-cols-2 p-1 bg-white dark:bg-canvas-dark rounded border border-hairline-light dark:border-hairline-dark select-none">
              <button
                type="button"
                onClick={() => {
                  setTradeAction('BUY');
                  setTradeStatus(null);
                }}
                className={`py-2 rounded font-bold text-xs transition-colors ${tradeAction === 'BUY'
                  ? 'bg-trading-up text-on-dark font-semibold'
                  : 'text-muted hover:text-ink dark:hover:text-on-dark hover:bg-surface-strong-light dark:hover:bg-surface-elevated-dark'
                  }`}
              >
                BUY
              </button>
              <button
                type="button"
                onClick={() => {
                  setTradeAction('SELL');
                  setTradeStatus(null);
                }}
                className={`py-2 rounded font-bold text-xs transition-colors ${tradeAction === 'SELL'
                  ? 'bg-trading-down text-on-dark font-semibold'
                  : 'text-muted hover:text-ink dark:hover:text-on-dark hover:bg-surface-strong-light dark:hover:bg-surface-elevated-dark'
                  }`}
              >
                SELL
              </button>
            </div>

            <form onSubmit={handleExecuteOrder} className="flex flex-col gap-5">

              <div className="flex flex-col gap-2">
                <Input
                  label={`Trade Amount (${selectedSymbol})`}
                  type="number"
                  step="any"
                  min="0"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (parseFloat(val) < 0) {
                      setAmount('0');
                    } else {
                      setAmount(val);
                    }
                    setTradeStatus(null);
                  }}
                  disabled={submitting}
                />

                <div className="grid grid-cols-4 gap-2 mt-1">
                  {[0.25, 0.50, 0.75, 1.0].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => handlePercentSelect(pct)}
                      className="py-1.5 text-[10px] font-mono font-bold rounded border border-hairline-light dark:border-hairline-dark bg-white dark:bg-canvas-dark hover:bg-surface-strong-light dark:hover:bg-surface-elevated-dark text-muted hover:text-ink dark:hover:text-on-dark transition-colors cursor-pointer select-none"
                    >
                      {pct * 100}%
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-white dark:bg-canvas-dark border border-hairline-light dark:border-hairline-dark rounded-md flex flex-col gap-1 text-left">
                <span className="text-[10px] text-muted font-semibold">Estimated Total USD</span>
                <span className="text-lg font-bold font-mono">
                  ${calculatedTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {tradeStatus && (
                <div className={`p-3 rounded text-xs border font-medium ${tradeStatus.type === 'SUCCESS'
                  ? 'bg-trading-up/10 text-trading-up border-trading-up/20'
                  : 'bg-trading-down/10 text-trading-down border-trading-down/20'
                  }`}>
                  {tradeStatus.message}
                </div>
              )}

              <Button
                type="submit"
                variant={tradeAction === 'BUY' ? 'trading-up' : 'trading-down'}
                className="w-full h-11 text-sm font-bold uppercase transition-colors flex items-center justify-center gap-2"
                disabled={submitting || !amount}
              >
                {submitting ? (
                  <>
                    <Spinner size="sm" className="text-white" />
                    Executing Order...
                  </>
                ) : (
                  `${tradeAction} ${selectedSymbol}`
                )}
              </Button>

            </form>

          </div>
        </div>

      </div>

    </div>
  );
};
