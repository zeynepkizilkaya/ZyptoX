import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'tr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navigation
    markets: 'Markets',
    trade: 'Trade',
    aiAssistant: 'AI Assistant',
    portfolio: 'Portfolio',
    logOut: 'Log Out',
    logIn: 'Log In',
    signUp: 'Sign Up',
    
    // Auth Page
    createAccount: 'Create Account',
    accessAccount: 'Access your ZyptoX account.',
    freeSignUp: 'Sign up for free and start trading with your simulated balance.',
    username: 'Username',
    password: 'Password',
    email: 'Email',
    pleaseWait: 'Please wait...',
    registerBtn: 'Register',
    loginBtn: 'Log In',
    alreadyHaveAccount: 'Already have an account? ',
    dontHaveAccount: "Don't have an account? ",
    welcomeTitle: 'Welcome to ZyptoX!',
    welcomeDesc: 'Your account was successfully created and initial balance is allocated:',
    welcomeBalance: 'Welcome Balance (Simulated)',
    startTradingNow: 'Start Trading Now',
    passwordMinLengthError: 'Password must be at least 8 characters long.',
    fillAllFieldsError: 'Please fill in all fields.',
    
    // Dashboard / Market page
    marketSearchPlaceholder: 'Search by coin or symbol...',
    marketCoin: 'Asset',
    marketPrice: 'Price',
    market24h: '24h Change',
    marketSparkline: 'Last 7 Days',
    marketAction: 'Action',
    buy: 'BUY',
    sell: 'SELL',
    popularCoins: 'Popular Coins',
    newCoins: 'New Listing',
    topGainers: 'Top Gainers',
    allMarkets: 'All Markets',
    noCoinsFound: 'No assets found matching your search.',
    refreshPrices: 'Refresh',
    
    // Hero Section
    nextGenTrading: 'NEXT-GEN TRADING',
    heroTitle: 'TRADE CRYPTO WITH CONFIDENCE ON ZYPTOX',
    heroSubtitle: 'Trade crypto assets with the lowest commissions, fastest execution speeds, and smart analytics powered by Gemini.',
    getStartedBtn: 'Get Started',
    viewMarketsBtn: 'View Markets',
    liveMarket: 'Live Market',
    autoRefreshingCache: 'Auto-refreshing cache prices',
    liveFeed: 'Live Feed',
    goToTradeTerminal: 'Go to Trade Terminal',
    viewMyPortfolio: 'View My Portfolio',

    // Features Section
    realTime: 'REAL-TIME',
    liveFeedPriceTicker: 'Live Feed Price Ticker',
    liveFeedPriceTickerDesc: 'Track fluctuations for BTC, ETH, SOL and major digital assets every 15s.',
    riskFree: 'RISK-FREE',
    simulatedBalances: 'Simulated Balances',
    simulatedBalancesDesc: 'Test trading methods with a free mock balance allocated upon registration.',
    intelligent: 'INTELLIGENT',
    geminiAiAssistant: 'Gemini AI Assistant',
    geminiAiAssistantDesc: 'Ask for technical analysis and dynamic wallet breakdowns instantly.',
    
    // Bottom banner
    startTradingTitle: 'Start Trading on ZyptoX',
    simulatedCryptoTradingTitle: 'Simulated Crypto Trading on ZyptoX',
    loggedInSubtitle: 'You are logged in. Head over to the trading terminal now.',
    simulatedCryptoTradingDesc: 'Register now and start practicing with a simulated balance.',
    tradeNowBtn: 'Trade Now',
    registerAndStartBtn: 'Register & Start',
    
    // Portfolio page
    totalHoldingsValue: 'Total Holdings Value',
    usdCashBalance: 'USD Cash Balance',
    netProfitLoss: 'Net Profit/Loss',
    depositBtn: 'Deposit Funds',
    recentTransactions: 'Recent Transactions',
    noHoldings: 'No holdings found.',
    avgBuyPrice: 'Avg Buy Price',
    amount: 'Amount',
    totalValue: 'Total Value',
    roi: 'ROI',
    assetDistribution: 'Asset Distribution',
    type: 'Type',
    price: 'Price',
    total: 'Total',
    date: 'Date',
    noTransactions: 'No transaction history found.',
    dailyChange: 'Daily Change',
    allTimeRoi: 'All-Time ROI',
    bestPerformer: 'Best Performer',
    worstPerformer: 'Worst Performer',
    estimatedNetWorth: 'Estimated Net Worth',
    cash: 'Cash',
    crypto: 'Crypto',
    walletPortfolioAnalysis: 'Wallet & Portfolio Analysis',
    depositCash: 'Deposit Cash',
    myCryptoAssets: 'My Crypto Assets',
    all: 'All',
    gainers: 'Gainers',
    losers: 'Losers',
    
    // Deposit Modal
    depositTitle: 'Deposit Simulated Funds',
    depositDesc: 'Add play funds directly to your cash balance to practice buying more assets.',
    depositSuccessMsg: 'Funds deposited successfully!',
    depositActionBtn: 'Deposit',
    cancel: 'Cancel',
    depositSimulatedCash: 'Deposit Simulated Cash',
    amountToDeposit: 'Amount to Deposit (USD)',
    processingDeposit: 'Processing Deposit...',
    depositSuccessful: '✓ Deposit Successful!',
    confirmDeposit: 'Confirm Deposit',

    // Trade Page
    tradeAmountLabel: 'Amount',
    tradeTotalLabel: 'Total Cost',
    tradeActionBuy: 'BUY',
    tradeActionSell: 'SELL',
    executeOrderBtn: 'Execute Order',
    insufficientFunds: 'Insufficient funds to complete this trade.',
    insufficientAssets: 'Insufficient assets: You do not hold enough to sell.',
    successTrade: 'Trade executed successfully.',
    orderBook: 'Order Book',
    priceHeader: 'Price (USD)',
    amountHeader: 'Amount',
    totalHeader: 'Total',
    marketTradeForm: 'Market Order',
    holdingLabel: 'Holding',
    invalidAmount: 'Please enter a valid amount greater than zero.',
    
    // AI Chat
    aiQueryPlaceholder: 'Ask something about your portfolio or market trends...',
    aiSendBtn: 'Send',
    aiDisclaimer: 'Disclaimer: AI answers do not constitute financial advice.',
    quickSuggestions: 'Quick Suggestions',
    analyzePortfolio: 'Analyze my portfolio',
    analyzeBTC: 'Analyze BTC trend',
    listTransactions: 'Show my trade history',
    aiAdvisorTitle: 'AI Financial Advisor',
    aiAdvisorSubtitle: 'Powered by Gemini & Portfolio Analysis Module',
    aiPortfolioAnalysis: 'AI Portfolio Analysis',
    score: 'SCORE',
    moderateRiskProfile: 'Moderate Risk Profile',
    strongCoreTitle: 'Strong Core Bedrock',
    strongCoreDesc: 'Your portfolio holds substantial BTC and ETH, providing good long-term stability and liquidity.',
    liquidityTitle: 'Liquidity Suggestion',
    liquidityDesc: 'Cash balance is 0 USD. Keeping a small percentage of USDC is recommended to capitalize on sudden market dips.',
  },
  tr: {
    // Navigation
    markets: 'Piyasalar',
    trade: 'Al-Sat',
    aiAssistant: 'Yapay Zeka',
    portfolio: 'Portföy',
    logOut: 'Çıkış Yap',
    logIn: 'Giriş Yap',
    signUp: 'Kayıt Ol',
    
    // Auth Page
    createAccount: 'Hesap Oluştur',
    accessAccount: 'ZyptoX hesabınıza erişin.',
    freeSignUp: 'Ücretsiz üye olun ve simüle bakiyenizle hemen işlem yapmaya başlayın.',
    username: 'Kullanıcı Adı',
    password: 'Şifre',
    email: 'E-posta',
    pleaseWait: 'Lütfen bekleyin...',
    registerBtn: 'Kayıt Ol',
    loginBtn: 'Giriş Yap',
    alreadyHaveAccount: 'Zaten hesabınız var mı? ',
    dontHaveAccount: 'Hesabınız yok mu? ',
    welcomeTitle: 'ZyptoX\'e Hoş Geldiniz!',
    welcomeDesc: 'Hesabınız başarıyla oluşturuldu ve başlangıç bakiyeniz tahsis edildi:',
    welcomeBalance: 'Hoş Geldin Bakiyesi (Simüle)',
    startTradingNow: 'İşlemlere Başla',
    passwordMinLengthError: 'Şifre en az 8 karakter olmalıdır.',
    fillAllFieldsError: 'Lütfen tüm alanları doldurun.',
    
    // Dashboard / Market page
    marketSearchPlaceholder: 'Coin veya sembol ara...',
    marketCoin: 'Varlık',
    marketPrice: 'Fiyat',
    market24h: '24s Değişim',
    marketSparkline: 'Son 7 Gün',
    marketAction: 'İşlem',
    buy: 'AL',
    sell: 'SAT',
    popularCoins: 'Popüler Coinler',
    newCoins: 'Yeni Listelenenler',
    topGainers: 'En Çok Yükselenler',
    allMarkets: 'Tüm Piyasalar',
    noCoinsFound: 'Aramanızla eşleşen varlık bulunamadı.',
    refreshPrices: 'Yenile',
    
    // Hero Section
    nextGenTrading: 'YENİ NESİL TİCARET',
    heroTitle: 'ZYPTOX İLE GÜVENLE KRİPTO ALIP SATIN',
    heroSubtitle: 'Gemini destekli akıllı analitikler, en düşük komisyonlar ve en yüksek işlem hızlarıyla kripto ticareti yapın.',
    getStartedBtn: 'Başla',
    viewMarketsBtn: 'Piyasaları Gör',
    liveMarket: 'Canlı Piyasalar',
    autoRefreshingCache: 'Otomatik yenilenen önbellek fiyatları',
    liveFeed: 'Canlı Yayın',
    goToTradeTerminal: 'İşlem Terminaline Git',
    viewMyPortfolio: 'Portföyümü Görüntüle',

    // Features Section
    realTime: 'GERÇEK ZAMANLI',
    liveFeedPriceTicker: 'Canlı Fiyat Listesi',
    liveFeedPriceTickerDesc: 'BTC, ETH, SOL ve diğer büyük dijital varlıkların dalgalanmalarını her 15 saniyede bir takip edin.',
    riskFree: 'RİSKSİZ',
    simulatedBalances: 'Simüle Bakiyeler',
    simulatedBalancesDesc: 'Kayıt olunduğunda tahsis edilen ücretsiz oyun bakiyesiyle işlem yöntemlerini test edin.',
    intelligent: 'AKILLI',
    geminiAiAssistant: 'Gemini Yapay Zeka Asistanı',
    geminiAiAssistantDesc: 'Anında teknik analiz ve dinamik cüzdan dökümleri isteyin.',
    
    // Bottom banner
    startTradingTitle: 'ZyptoX\'te Ticarete Başlayın',
    simulatedCryptoTradingTitle: 'ZyptoX\'te Simüle Kripto Ticareti',
    loggedInSubtitle: 'Giriş yaptınız. Şimdi ticaret terminaline gidebilirsiniz.',
    simulatedCryptoTradingDesc: 'Şimdi üye olun ve simüle bakiye ile pratik yapmaya başlayın.',
    tradeNowBtn: 'Hemen Al-Sat',
    registerAndStartBtn: 'Kayıt Ol ve Başla',
    
    // Portfolio page
    totalHoldingsValue: 'Toplam Varlık Değeri',
    usdCashBalance: 'USD Nakit Bakiyesi',
    netProfitLoss: 'Net Kâr/Zarar',
    depositBtn: 'Para Yatır',
    recentTransactions: 'Son İşlemler',
    noHoldings: 'Cüzdanınızda henüz varlık bulunmuyor.',
    avgBuyPrice: 'Ort. Alış Fiyatı',
    amount: 'Miktar',
    totalValue: 'Toplam Değer',
    roi: 'K/Z Oranı',
    assetDistribution: 'Varlık Dağılımı',
    type: 'Tür',
    price: 'Fiyat',
    total: 'Toplam',
    date: 'Tarih',
    noTransactions: 'İşlem geçmişi bulunamadı.',
    dailyChange: 'Günlük Değişim',
    allTimeRoi: 'Toplam K/Z',
    bestPerformer: 'En İyi Performans',
    worstPerformer: 'En Kötü Performans',
    estimatedNetWorth: 'Toplam Varlık Değeri',
    cash: 'Nakit',
    crypto: 'Kripto',
    walletPortfolioAnalysis: 'Cüzdan ve Portföy Analizi',
    depositCash: 'Para Yatır',
    myCryptoAssets: 'Kripto Varlıklarım',
    all: 'Tümü',
    gainers: 'Yükselenler',
    losers: 'Düşenler',
    
    // Deposit Modal
    depositTitle: 'Simüle Para Yatır',
    depositDesc: 'Daha fazla varlık satın alma alıştırması yapmak için nakit bakiyenize oyun parası ekleyin.',
    depositSuccessMsg: 'Para başarıyla yatırıldı!',
    depositActionBtn: 'Yatır',
    cancel: 'İptal',
    depositSimulatedCash: 'Simüle Para Yatır',
    amountToDeposit: 'Yatırılacak Miktar (USD)',
    processingDeposit: 'Para Yatırılıyor...',
    depositSuccessful: '✓ Para Yatırma Başarılı!',
    confirmDeposit: 'Para Yatırmayı Onayla',

    // Trade Page
    tradeAmountLabel: 'Miktar',
    tradeTotalLabel: 'Toplam Maliyet',
    tradeActionBuy: 'AL',
    tradeActionSell: 'SAT',
    executeOrderBtn: 'Emri Gerçekleştir',
    insufficientFunds: 'Bu işlemi tamamlamak için yetersiz bakiye.',
    insufficientAssets: 'Yetersiz varlık: Satmak için yeterli varlığınız bulunmuyor.',
    successTrade: 'İşlem başarıyla gerçekleştirildi.',
    orderBook: 'Tahta (Order Book)',
    priceHeader: 'Fiyat (USD)',
    amountHeader: 'Miktar',
    totalHeader: 'Toplam',
    marketTradeForm: 'Piyasa Emri',
    holdingLabel: 'Varlık',
    invalidAmount: 'Lütfen sıfırdan büyük geçerli bir miktar girin.',
    
    // AI Chat
    aiQueryPlaceholder: 'Portföyünüz veya piyasa trendleri hakkında bir şeyler sorun...',
    aiSendBtn: 'Gönder',
    aiDisclaimer: 'Uyarı: Yapay zeka cevapları finansal tavsiye niteliği taşımaz.',
    quickSuggestions: 'Hızlı Öneriler',
    analyzePortfolio: 'Portföyümü analiz et',
    analyzeBTC: 'BTC trendini analiz et',
    listTransactions: 'İşlem geçmişimi göster',
    aiAdvisorTitle: 'Yapay Zeka Finans Danışmanı',
    aiAdvisorSubtitle: 'Gemini ve Portföy Analiz Modülü ile Güçlendirilmiştir',
    aiPortfolioAnalysis: 'Yapay Zeka Portföy Analizi',
    score: 'SKOR',
    moderateRiskProfile: 'Orta Risk Profili',
    strongCoreTitle: 'Güçlü Çekirdek Yapı',
    strongCoreDesc: 'Portföyünüz önemli miktarda BTC ve ETH barındırıyor; bu da uzun vadeli istikrar ve likidite sağlıyor.',
    liquidityTitle: 'Likidite Önerisi',
    liquidityDesc: 'Nakit bakiyeniz 0 USD. Ani piyasa düşüşlerinden yararlanmak için küçük bir oranda USDC tutmanız önerilir.',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('zyptox_lang');
    return (saved === 'tr' || saved === 'en') ? saved : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('zyptox_lang', lang);
  };

  const t = (key: string): string => {
    const dict = translations[language];
    return (dict as any)[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
