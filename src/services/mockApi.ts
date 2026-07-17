// ZyptoX Mock API Service

export interface User {
username: string;
balance: number;
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

// Local Storage keys
const STORAGE_KEYS = {
USER: 'zyptox_user',
PORTFOLIO: 'zyptox_portfolio',
TRANSACTIONS: 'zyptox_transactions',
PRICES: 'zyptox_prices',
};

// Initial setup helper
const initializeMockData = () => {
  const storedPrices = localStorage.getItem(STORAGE_KEYS.PRICES);
  let shouldResetPrices = false;
  if (storedPrices) {
    try {
      const parsed = JSON.parse(storedPrices);
      if (!Array.isArray(parsed) || parsed.length < 10) {
        shouldResetPrices = true;
      }
    } catch (e) {
      shouldResetPrices = true;
    }
  } else {
    shouldResetPrices = true;
  }

  if (shouldResetPrices) {
    const initialPrices: MarketPrice[] = [
      { symbol: 'BTC', name: 'Bitcoin', price: 62500.00, change24h: 1.25, sparkline: [61800, 62000, 62100, 62300, 62400, 62200, 62500] },
      { symbol: 'ETH', name: 'Ethereum', price: 3450.00, change24h: -0.75, sparkline: [3480, 3470, 3450, 3460, 3440, 3430, 3450] },
      { symbol: 'SOL', name: 'Solana', price: 142.50, change24h: 4.82, sparkline: [135, 138, 137, 139, 141, 140, 142.5] },
      { symbol: 'BNB', name: 'BNB', price: 575.00, change24h: 0.15, sparkline: [573, 574, 576, 575, 574, 576, 575] },
      { symbol: 'XRP', name: 'Ripple', price: 0.59, change24h: -1.45, sparkline: [0.60, 0.59, 0.58, 0.59, 0.60, 0.60, 0.59] },
      { symbol: 'ADA', name: 'Cardano', price: 0.38, change24h: -2.10, sparkline: [0.39, 0.39, 0.38, 0.37, 0.38, 0.38, 0.38] },
      { symbol: 'DOT', name: 'Polkadot', price: 6.15, change24h: 0.82, sparkline: [6.10, 6.08, 6.12, 6.15, 6.11, 6.13, 6.15] },
      { symbol: 'DOGE', name: 'Dogecoin', price: 0.12, change24h: 8.54, sparkline: [0.11, 0.11, 0.12, 0.11, 0.12, 0.115, 0.12] },
      { symbol: 'AVAX', name: 'Avalanche', price: 26.80, change24h: 3.12, sparkline: [25.9, 26.1, 26.0, 26.4, 26.2, 26.5, 26.8] },
      { symbol: 'LINK', name: 'Chainlink', price: 13.90, change24h: -0.54, sparkline: [14.0, 13.95, 14.1, 13.85, 13.9, 13.8, 13.9] },
    ];
    localStorage.setItem(STORAGE_KEYS.PRICES, JSON.stringify(initialPrices));
  }

  if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.PORTFOLIO)) {
    localStorage.setItem(STORAGE_KEYS.PORTFOLIO, JSON.stringify([]));
  }
};

initializeMockData();

// Helper to simulate API delay
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
// Authentication
register: async (username: string): Promise<User> => {
await delay(500);
// Generate a random balance between 10,000 and 25,000 USD
const initialBalance = Math.round((10000 + Math.random() * 15000) * 100) / 100;
const user: User = {
username,
balance: initialBalance,
token: `mock-jwt-token-${Math.random().toString(36).substr(2, 9)}`,
};
localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
// Reset portfolio and transactions for new registered user
localStorage.setItem(STORAGE_KEYS.PORTFOLIO, JSON.stringify([]));
localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
return user;
},

login: async (username: string): Promise<User> => {
await delay(500);
const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
if (storedUser) {
const parsed = JSON.parse(storedUser) as User;
if (parsed.username.toLowerCase() === username.toLowerCase()) {
const user: User = {
...parsed,
token: `mock-jwt-token-${Math.random().toString(36).substr(2, 9)}`,
};
localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
return user;
}
}
// If user is not found, automatically register them as a convenience for mock testing
return mockApi.register(username);
},

getCurrentUser: (): User | null => {
const user = localStorage.getItem(STORAGE_KEYS.USER);
return user ? JSON.parse(user) : null;
},

logout: async (): Promise<void> => {
await delay(100);
const user = mockApi.getCurrentUser();
if (user) {
const loggedOut = { ...user, token: undefined };
localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(loggedOut));
}
},

// Market Prices
getPrices: async (): Promise<MarketPrice[]> => {
// No simulated delay on prices to prevent dashboard lag on polling
const prices = localStorage.getItem(STORAGE_KEYS.PRICES);
return prices ? JSON.parse(prices) : [];
},

// Fluctuate prices slightly (simulates live ticker background engine)
  fluctuatePrices: (): MarketPrice[] => {
    const pricesStr = localStorage.getItem(STORAGE_KEYS.PRICES);
    if (!pricesStr) return [];

    const prices = JSON.parse(pricesStr) as MarketPrice[];
    const updatedPrices = prices.map(item => {
      // Fluctuate price by -1.2% to +1.2%
      const pct = (Math.random() * 2.4 - 1.2) / 100;
      const newPrice = Math.round(item.price * (1 + pct) * 100) / 100;

      // Update 24h change slightly
      const newChange = Math.round((item.change24h + pct * 100) * 100) / 100;

      // Ensure sparkline trend matches 24h change mathematically:
      const startPrice = newPrice / (1 + newChange / 100);
      const endPrice = newPrice;
      const diff = endPrice - startPrice;

      const rawSparkline = [...item.sparkline.slice(1), newPrice];
      const minRaw = Math.min(...rawSparkline);
      const maxRaw = Math.max(...rawSparkline);
      const rangeRaw = (maxRaw - minRaw) || 1;

      const newSparkline = rawSparkline.map((val, idx) => {
        const ratio = idx / (rawSparkline.length - 1);
        const normalized = (val - minRaw) / rangeRaw - 0.5;
        const base = startPrice + diff * ratio;
        
        // Dynamic wave structure ensuring exact anchoring at endpoints (ratio=0 and ratio=1)
        const wave = normalized * Math.abs(diff) * (ratio * (1 - ratio) * 4);
        
        return Math.round((base + wave) * 100) / 100;
      });

      return {
        ...item,
        price: newPrice,
        change24h: newChange,
        sparkline: newSparkline,
      };
    });

    localStorage.setItem(STORAGE_KEYS.PRICES, JSON.stringify(updatedPrices));
    return updatedPrices;
  },

// Portfolio
getPortfolio: async (): Promise<Asset[]> => {
await delay(100);
const portfolio = localStorage.getItem(STORAGE_KEYS.PORTFOLIO);
return portfolio ? JSON.parse(portfolio) : [];
},

// Transactions
getTransactions: async (): Promise<Transaction[]> => {
await delay(200);
const transactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
return transactions ? JSON.parse(transactions) : [];
},

// Execute Trade
executeTrade: async (symbol: string, action: 'BUY' | 'SELL', amount: number): Promise<{ status: 'SUCCESS' | 'FAILED'; message: string; balance: number }> => {
await delay(600);
const userStr = localStorage.getItem(STORAGE_KEYS.USER);
if (!userStr) {
return { status: 'FAILED', message: 'User session not found. Please log in.', balance: 0 };
}
const user = JSON.parse(userStr) as User;

const pricesStr = localStorage.getItem(STORAGE_KEYS.PRICES);
const prices = pricesStr ? (JSON.parse(pricesStr) as MarketPrice[]) : [];
const marketAsset = prices.find(p => p.symbol === symbol);
if (!marketAsset) {
return { status: 'FAILED', message: `Asset ${symbol} not found in market pricing.`, balance: user.balance };
}

const currentPrice = marketAsset.price;
const totalCost = Math.round(currentPrice * amount * 100) / 100;

const portfolioStr = localStorage.getItem(STORAGE_KEYS.PORTFOLIO);
const portfolio = portfolioStr ? (JSON.parse(portfolioStr) as Asset[]) : [];
const assetIndex = portfolio.findIndex(a => a.symbol === symbol);

if (action === 'BUY') {
if (user.balance < totalCost) {
return { status: 'FAILED', message: 'Insufficient funds to complete this trade.', balance: user.balance };
}

// Deduct balance
user.balance = Math.round((user.balance - totalCost) * 100) / 100;
localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

// Update Portfolio
if (assetIndex >= 0) {
const existingAsset = portfolio[assetIndex];
const newAmount = existingAsset.amount + amount;
// Calculate new average buy price: (old_amount * old_avg + new_amount * price) / total_amount
const newAvg = Math.round(((existingAsset.amount * existingAsset.avgBuyPrice) + totalCost) / newAmount * 100) / 100;
portfolio[assetIndex] = {
...existingAsset,
amount: newAmount,
avgBuyPrice: newAvg,
};
} else {
portfolio.push({
symbol,
name: marketAsset.name,
amount,
avgBuyPrice: currentPrice,
});
}
} else { // SELL
if (assetIndex < 0 || portfolio[assetIndex].amount < amount) {
return { status: 'FAILED', message: `You do not hold enough ${symbol} to sell.`, balance: user.balance };
}

// Add to balance
user.balance = Math.round((user.balance + totalCost) * 100) / 100;
localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

// Update Portfolio
const existingAsset = portfolio[assetIndex];
const newAmount = existingAsset.amount - amount;
if (newAmount <= 0) {
portfolio.splice(assetIndex, 1);
} else {
portfolio[assetIndex] = {
...existingAsset,
amount: newAmount,
};
}
}

localStorage.setItem(STORAGE_KEYS.PORTFOLIO, JSON.stringify(portfolio));

// Log Transaction
const transactionsStr = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
const transactions = transactionsStr ? (JSON.parse(transactionsStr) as Transaction[]) : [];
const newTx: Transaction = {
id: transactions.length + 1,
timestamp: new Date().toISOString(),
symbol,
type: action,
amount,
price: currentPrice,
total: totalCost,
};
transactions.unshift(newTx); // Newest first
localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));

return {
status: 'SUCCESS',
message: `Successfully executed ${action} order for ${amount} ${symbol}.`,
balance: user.balance,
};
},

// AI Assistant (Gemini simulation)
queryAI: async (message: string): Promise<string> => {
await delay(1200); // AI takes a bit longer to simulate "thought"

const userStr = localStorage.getItem(STORAGE_KEYS.USER);
const user = userStr ? (JSON.parse(userStr) as User) : null;
const portfolioStr = localStorage.getItem(STORAGE_KEYS.PORTFOLIO);
const portfolio = portfolioStr ? (JSON.parse(portfolioStr) as Asset[]) : [];
const transactionsStr = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
const transactions = transactionsStr ? (JSON.parse(transactionsStr) as Transaction[]) : [];

const query = message.toLowerCase();

// 1. Portfolio Analysis
if (query.includes('portfolio') || query.includes('portföy') || query.includes('varlık') || query.includes('bakiye') || query.includes('holding') || query.includes('balance')) {
if (!user) {
return "Please log in first to use the AI assistant.";
}

const holdingsText = portfolio.length > 0 
? portfolio.map(a => `- **${a.symbol} (${a.name})**: ${a.amount} units (Avg Buy Price: $${a.avgBuyPrice})`).join('\n')
: "_You do not hold any crypto assets in your portfolio yet._";

return `### 📊 Portfolio Analysis Report

Hello **${user.username}**, I have analyzed your wallet status and asset distribution:

- **USD Cash Balance:** \`$${user.balance.toLocaleString()}\`
- **Crypto Assets:**
${holdingsText}

#### **AI Commentary:**
${portfolio.length === 0 
? "You currently only hold cash balance in your wallet. You might consider purchasing small fractions of **BTC** or **ETH** to capture market dips." 
: "Your portfolio diversification is well balanced. For proper risk management, I recommend keeping at least 30% of your balance in cash to buy dips."}

> *Note: This analysis is generated with simulated data and does not constitute financial advice.*`;
}

// 2. Market/Crypto specific trends
if (query.includes('btc') || query.includes('bitcoin') || query.includes('eth') || query.includes('ethereum')) {
const isBTC = query.includes('btc') || query.includes('bitcoin');
const coinSym = isBTC ? 'BTC' : 'ETH';
const coinName = isBTC ? 'Bitcoin' : 'Ethereum';

const pricesStr = localStorage.getItem(STORAGE_KEYS.PRICES);
const prices = pricesStr ? (JSON.parse(pricesStr) as MarketPrice[]) : [];
const currentPrice = prices.find(p => p.symbol === coinSym)?.price || (isBTC ? 62500 : 3450);
const change = prices.find(p => p.symbol === coinSym)?.change24h || 0;

return `### 📈 ${coinName} (${coinSym}) Technical Outlook

I have analyzed the real-time price movements and market indicators for **${coinName}**:

- **Current Price:** \`$${currentPrice.toLocaleString()}\`
- **24h Change:** %${change > 0 ? '+' : ''}${change} ${change > 0 ? '🟢' : '🔴'}
- **Support Level:** \`$${Math.round(currentPrice * 0.96).toLocaleString()}\`
- **Resistance Level:** \`$${Math.round(currentPrice * 1.04).toLocaleString()}\`

#### **Technical Analysis Summary:**
The price action over the last 24 hours indicates that ${change >= 0 ? "buyers are starting to dominate the market" : "selling pressure is increasing"}. RSI (Relative Strength Index) levels remain in the neutral zone. 

* **Recommendation:** If you are trading short-term, look for buying opportunities if the resistance breaks; otherwise, buying near the support level could be considered.`;
}

// 3. Transactions Query
if (query.includes('işlem') || query.includes('gecmis') || query.includes('geçmiş') || query.includes('transaction') || query.includes('history') || query.includes('trade')) {
if (transactions.length === 0) {
return `### 📜 Transaction History

You do not have any registered transaction history. You can use the **Trade** page to execute orders.`;
}
const lastTx = transactions[0];
return `### 📜 Last Transaction Details

Here are the details of your most recent transaction:

* **Transaction Type:** ${lastTx.type === 'BUY' ? '🟢 BUY' : '🔴 SELL'}
* **Crypto Asset:** **${lastTx.symbol}**
* **Amount:** ${lastTx.amount} units
* **Execution Price:** \`$${lastTx.price.toLocaleString()}\`
* **Total Value:** \`$${lastTx.total.toLocaleString()}\`
* **Timestamp:** ${new Date(lastTx.timestamp).toLocaleString('en-US')}

You have a total of **${transactions.length}** executed orders.`;
}

// 4. Default generic chatbot response
return `### ZyptoX AI Financial Assistant

Hello! I am your **ZyptoX AI** assistant. How can I help you today? 

You can ask me questions about the following topics:
- 📊 **"Analyze my portfolio"** or **"Show my holdings"**
- 📈 **"Analyze BTC"** or **"Outlook for ETH"**
- 📜 **"List my transactions"** or **"Show trade history"**

#### 💡 Investment Tip of the Day (Simulation):
Success in crypto markets relies on **patience** and **discipline**. Always trade with amounts you can afford to lose, and diversify your holdings to minimize risk.`;
},
};
