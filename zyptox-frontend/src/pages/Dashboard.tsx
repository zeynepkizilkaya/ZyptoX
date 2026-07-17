import React, { useState, useEffect } from 'react';
import { useMarket } from '../context/MarketContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '../components/UI';
import { api } from '../services/api';
import type { MarketPrice, Asset } from '../services/api';
import { CoinIcon } from './Portfolio';

interface DashboardProps {
  onTradeSelect: (symbol: string, action: 'BUY' | 'SELL') => void;
  onSignUpSelect: () => void;
  onGoToPortfolio: () => void;
}


const getSparklinePoints = (sparkline: number[]) => {
  const min = Math.min(...sparkline);
  const max = Math.max(...sparkline);
  const range = max - min || 1;
  return sparkline.map((val, idx) => {
    const x = (idx / (sparkline.length - 1)) * 100;
    const y = 28 - ((val - min) / range) * 26;
    return `${x},${y}`;
  });
};

export const Dashboard: React.FC<DashboardProps> = ({ onTradeSelect, onSignUpSelect, onGoToPortfolio }) => {
  const { prices, isPolling, setIsPolling, refreshPrices } = useMarket();
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'popular' | 'new' | 'gainers'>('popular');
  const [searchValue, setSearchValue] = useState('');
  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      const loadPortfolio = async () => {
        try {
          const portfolioData = await api.getPortfolio();
          setAssets(portfolioData);
        } catch (err) {
          console.error('Failed to load portfolio details', err);
        }
      };
      loadPortfolio();
    } else {
      setAssets([]);
    }
  }, [isAuthenticated, user]);

  const getFilteredPrices = (): MarketPrice[] => {
    let list = [...prices];

    if (searchValue.trim()) {
      const query = searchValue.toLowerCase();
      list = list.filter(p => p.symbol.toLowerCase().includes(query) || p.name.toLowerCase().includes(query));
    }

    if (activeTab === 'new') {
      return list.filter(p => ['SOL', 'ADA', 'DOT', 'DOGE', 'AVAX'].includes(p.symbol));
    }

    if (activeTab === 'gainers') {
      return list.sort((a, b) => b.change24h - a.change24h).slice(0, 5);
    }

    return list.filter(p => ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'AVAX', 'LINK'].includes(p.symbol));
  };



  const filteredPrices = getFilteredPrices();
  const liveMarketItems = prices.filter(p => ['BTC', 'ETH', 'SOL', 'BNB'].includes(p.symbol)).slice(0, 4);

  return (
    <div className="flex flex-col w-full font-sans bg-white dark:bg-canvas-dark text-ink dark:text-on-dark">

      <section className="w-full bg-[#fafafa] dark:bg-canvas-dark py-20 border-b border-hairline-light dark:border-hairline-dark text-left">
        <div className="max-w-[1280px] mx-auto px-6 flex flex-col lg:flex-row items-center justify-between gap-12">

          <div className="flex flex-col gap-6 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/20 text-primary-active dark:text-primary text-xs font-bold rounded-full w-max select-none">
              ⚡️ {t('nextGenTrading')}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-ink dark:text-on-dark leading-tight">
              {t('heroTitle')}
            </h1>
            <p className="text-base md:text-lg text-muted max-w-lg">
              {t('heroSubtitle')}
            </p>

            {isAuthenticated ? (
              <div className="mt-4 flex flex-wrap gap-4">
                <Button
                  variant="primary-pill"
                  onClick={() => onTradeSelect('BTC', 'BUY')}
                  className="h-12 px-8 text-sm font-bold"
                >
                  {t('goToTradeTerminal')}
                </Button>
                <button
                  type="button"
                  onClick={onGoToPortfolio}
                  className="inline-flex items-center justify-center font-sans font-semibold text-sm h-12 px-8 rounded-pill border border-hairline-light dark:border-hairline-dark hover:bg-surface-strong-light dark:hover:bg-surface-elevated-dark text-ink dark:text-on-dark transition-colors duration-150"
                >
                  {t('viewMyPortfolio')}
                </button>
              </div>
            ) : (
              <div className="mt-4 flex flex-wrap gap-4">
                <Button
                  variant="primary-pill"
                  onClick={onSignUpSelect}
                  className="h-12 px-8 text-sm font-bold"
                >
                  {t('getStartedBtn')}
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('market-outlook');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center justify-center font-sans font-semibold text-sm h-12 px-8 rounded-pill border border-hairline-light dark:border-hairline-dark hover:bg-surface-strong-light dark:hover:bg-surface-elevated-dark text-ink dark:text-on-dark transition-colors duration-150"
                >
                  {t('viewMarketsBtn')}
                </button>
              </div>
            )}
          </div>

          <div className="hidden lg:flex flex-col gap-4 w-[440px] select-none">
            <div className="flex justify-between items-center pb-2 border-b border-hairline-light dark:border-hairline-dark">
              <div className="flex flex-col text-left">
                <span className="font-extrabold text-base tracking-tight text-ink dark:text-on-dark">{t('liveMarket')}</span>
                <span className="text-[10px] text-muted font-normal mt-0.5 leading-none">{t('autoRefreshingCache')}</span>
              </div>
              <span className="text-[11px] text-muted font-semibold flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-trading-up opacity-75" style={{ animationDuration: '2.5s' }}></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-trading-up"></span>
                </span>
                {t('liveFeed')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-1">
              {liveMarketItems.map((item) => {
                const isUp = item.change24h >= 0;
                const assetHolding = assets.find(a => a.symbol === item.symbol);
                const heldAmount = assetHolding ? assetHolding.amount : 0;

                return (
                  <div
                    key={item.symbol}
                    onClick={() => onTradeSelect(item.symbol, 'BUY')}
                    className={`p-4 border rounded-2xl flex flex-col text-left transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:shadow-md h-auto ${isUp
                        ? 'bg-emerald-50/20 border-emerald-100/50 dark:bg-emerald-950/10 dark:border-emerald-900/25'
                        : 'bg-rose-50/20 border-rose-100/50 dark:bg-rose-950/10 dark:border-rose-900/25'
                      }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-black text-ink dark:text-on-dark">{item.symbol}</span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black tracking-wide ${isUp ? 'bg-emerald-500/15 text-trading-up' : 'bg-rose-500/15 text-trading-down'
                        }`}>
                        {isUp ? '+' : ''}{item.change24h.toFixed(2)}%
                      </span>
                    </div>

                    <span className="text-[10px] text-muted-strong dark:text-muted/70 font-medium font-sans leading-none mt-1 select-none">
                      {item.symbol}USDT
                    </span>

                    <div className="text-lg font-black font-mono text-ink dark:text-on-dark mt-2">
                      ${item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>

                    <div className="flex flex-col gap-1 mt-3.5 border-t border-hairline-light/40 dark:border-hairline-dark/15 pt-2 select-none">
                      <div className="text-[9px] text-muted-strong dark:text-muted/60 font-bold uppercase tracking-wider">24h</div>
                      {isAuthenticated && (
                        <div className="text-[10px] text-muted-strong dark:text-muted/70 font-semibold">
                          Held: <span className="font-mono text-ink dark:text-on-dark font-black">{heldAmount.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      <section id="market-outlook" className="w-full py-16 text-left bg-white dark:bg-canvas-dark">
        <div className="max-w-[1280px] mx-auto px-6 flex flex-col gap-6">

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-ink dark:text-on-dark">{t('allMarkets')}</h2>

            <div className="flex flex-wrap items-center gap-4">
              <input
                type="text"
                placeholder={t('marketSearchPlaceholder')}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="h-8 px-3 text-xs font-sans rounded border bg-transparent border-hairline-light dark:border-hairline-dark focus:outline-none focus:ring-1 focus:ring-primary text-ink dark:text-on-dark w-40"
              />
              <button
                onClick={refreshPrices}
                className="text-xs font-semibold px-3 py-1.5 rounded border border-hairline-light dark:border-hairline-dark hover:bg-surface-strong-light dark:hover:bg-surface-elevated-dark text-muted transition-colors flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                {t('refreshPrices') || 'Refresh'}
              </button>

              <div className="flex items-center gap-2 select-none">
                <span className="text-xs text-muted">Live Feed (15s):</span>
                <button
                  onClick={() => setIsPolling(!isPolling)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isPolling ? 'bg-primary' : 'bg-muted/40'
                    }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${isPolling ? 'translate-x-[18px]' : 'translate-x-[2px]'
                      }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="w-full bg-[#fafafa] dark:bg-surface-card-dark border border-hairline-light dark:border-hairline-dark rounded-xl p-6 shadow-sm overflow-x-auto">

            <div className="flex gap-6 border-b border-hairline-light dark:border-hairline-dark mb-4 pb-1">
              <button
                onClick={() => setActiveTab('popular')}
                className={`text-sm font-semibold pb-2 border-b-2 transition-colors ${activeTab === 'popular' ? 'border-primary text-ink dark:text-on-dark' : 'border-transparent text-muted hover:text-ink dark:hover:text-on-dark'
                  }`}
              >
                {t('popularCoins')}
              </button>
              <button
                onClick={() => setActiveTab('new')}
                className={`text-sm font-semibold pb-2 border-b-2 transition-colors ${activeTab === 'new' ? 'border-primary text-ink dark:text-on-dark' : 'border-transparent text-muted hover:text-ink dark:hover:text-on-dark'
                  }`}
              >
                {t('newCoins')}
              </button>
              <button
                onClick={() => setActiveTab('gainers')}
                className={`text-sm font-semibold pb-2 border-b-2 transition-colors ${activeTab === 'gainers' ? 'border-primary text-ink dark:text-on-dark' : 'border-transparent text-muted hover:text-ink dark:hover:text-on-dark'
                  }`}
              >
                {t('topGainers')}
              </button>
            </div>

            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-hairline-light dark:border-hairline-dark text-muted text-xs font-semibold">
                  <th className="py-3 px-4">{t('marketCoin')}</th>
                  <th className="py-3 px-4">{t('marketPrice')}</th>
                  <th className="py-3 px-4">{t('market24h')}</th>
                  <th className="py-3 px-4">{t('marketSparkline')}</th>
                  <th className="py-3 px-4 text-center">{t('marketAction')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrices.map((coin) => {
                  const isUp = coin.change24h >= 0;
                  const points = getSparklinePoints(coin.sparkline);
                  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.replace(',', ' ')}`).join(' ');
                  const areaD = `${pathD} L 100 30 L 0 30 Z`;

                  return (
                    <tr key={coin.symbol} className="border-b border-hairline-light/50 dark:border-hairline-dark/30 hover:bg-white dark:hover:bg-surface-elevated-dark/50 transition-colors duration-100 text-sm font-medium">

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <CoinIcon symbol={coin.symbol} className="w-8 h-8 text-[12px]" />
                          <div className="flex flex-col">
                            <span className="font-bold text-ink dark:text-on-dark">
                              {coin.symbol} <span className="text-[10px] text-muted font-normal">/ USD</span>
                            </span>
                            <span className="text-xs text-muted font-normal">{coin.name}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 font-mono font-semibold text-ink dark:text-on-dark">
                        ${coin.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>

                      <td className={`py-4 px-4 font-mono font-semibold ${isUp ? 'text-trading-up' : 'text-trading-down'}`}>
                        <div className="flex items-center gap-1">
                          <span>{isUp ? '▲' : '▼'}</span>
                          <span>{isUp ? '+' : ''}{coin.change24h}%</span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="w-24 h-7 select-none">
                          <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                            <defs>
                              <linearGradient id={`sparkline-grad-${coin.symbol}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={isUp ? '#0ecb81' : '#f6465d'} stopOpacity="0.2" />
                                <stop offset="100%" stopColor={isUp ? '#0ecb81' : '#f6465d'} stopOpacity="0" />
                              </linearGradient>
                            </defs>
                            <path
                              d={pathD}
                              fill="none"
                              stroke={isUp ? '#0ecb81' : '#f6465d'}
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d={areaD}
                              fill={`url(#sparkline-grad-${coin.symbol})`}
                            />
                          </svg>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => onTradeSelect(coin.symbol, 'BUY')}
                          className="px-4 py-1.5 rounded-full bg-primary text-on-primary hover:bg-primary-active active:scale-95 text-xs font-extrabold transition-all duration-100 shadow-sm"
                        >
                          {t('trade')}
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>

          </div>
        </div>
      </section>

      <section className="w-full bg-[#fafafa] dark:bg-canvas-dark border-t border-b border-hairline-light dark:border-hairline-dark py-16 text-left">
        <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="p-6 bg-white dark:bg-surface-card-dark border border-hairline-light dark:border-hairline-dark rounded-lg flex items-start gap-4">
            <svg className="w-8 h-8 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-primary">{t('realTime')}</span>
              <h3 className="font-bold text-sm">{t('liveFeedPriceTicker')}</h3>
              <p className="text-xs text-muted">{t('liveFeedPriceTickerDesc')}</p>
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-surface-card-dark border border-hairline-light dark:border-hairline-dark rounded-lg flex items-start gap-4">
            <svg className="w-8 h-8 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="m9 12 2 2 4-4" />
            </svg>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-primary">{t('riskFree')}</span>
              <h3 className="font-bold text-sm">{t('simulatedBalances')}</h3>
              <p className="text-xs text-muted">{t('simulatedBalancesDesc')}</p>
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-surface-card-dark border border-hairline-light dark:border-hairline-dark rounded-lg flex items-start gap-4">
            <svg className="w-8 h-8 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10h.01" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 10h.01" />
            </svg>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-primary">{t('intelligent')}</span>
              <h3 className="font-bold text-sm">{t('geminiAiAssistant')}</h3>
              <p className="text-xs text-muted">{t('geminiAiAssistantDesc')}</p>
            </div>
          </div>

        </div>
      </section>

      <section className="w-full py-16 text-left bg-white dark:bg-canvas-dark">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="p-10 bg-[#fafafa] dark:bg-surface-card-dark border border-hairline-light dark:border-hairline-dark rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col gap-2">
              <h2 className="text-xl md:text-2xl font-bold">
                {isAuthenticated ? t('startTradingTitle') : t('simulatedCryptoTradingTitle')}
              </h2>
              <p className="text-xs text-muted">
                {isAuthenticated
                  ? t('loggedInSubtitle')
                  : t('simulatedCryptoTradingDesc')
                }
              </p>
            </div>
            <Button
              variant="primary-pill"
              onClick={isAuthenticated ? () => onTradeSelect('BTC', 'BUY') : onSignUpSelect}
            >
              {isAuthenticated ? t('tradeNowBtn') : t('registerAndStartBtn')}
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
};
