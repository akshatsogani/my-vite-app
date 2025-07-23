import { stocks, portfolios, backtests, optimizations, type Stock, type InsertStock, type Portfolio, type InsertPortfolio, type Backtest, type InsertBacktest, type Optimization, type InsertOptimization } from "@shared/schema";

export interface IStorage {
  // Stocks
  getStock(ticker: string): Promise<Stock | undefined>;
  createStock(stock: InsertStock): Promise<Stock>;
  updateStock(ticker: string, stock: Partial<InsertStock>): Promise<Stock | undefined>;
  searchStocks(query: string): Promise<Stock[]>;
  
  // Portfolios
  getPortfolio(id: number): Promise<Portfolio | undefined>;
  createPortfolio(portfolio: InsertPortfolio): Promise<Portfolio>;
  updatePortfolio(id: number, portfolio: Partial<InsertPortfolio>): Promise<Portfolio | undefined>;
  getPortfolios(): Promise<Portfolio[]>;
  
  // Backtests
  getBacktest(id: number): Promise<Backtest | undefined>;
  createBacktest(backtest: InsertBacktest): Promise<Backtest>;
  getBacktestsByPortfolio(portfolioId: number): Promise<Backtest[]>;
  
  // Optimizations
  getOptimization(id: number): Promise<Optimization | undefined>;
  createOptimization(optimization: InsertOptimization): Promise<Optimization>;
  getOptimizationsByPortfolio(portfolioId: number): Promise<Optimization[]>;
}

export class MemStorage implements IStorage {
  private stocks: Map<string, Stock> = new Map();
  private portfolios: Map<number, Portfolio> = new Map();
  private backtests: Map<number, Backtest> = new Map();
  private optimizations: Map<number, Optimization> = new Map();
  
  private currentStockId = 1;
  private currentPortfolioId = 1;
  private currentBacktestId = 1;
  private currentOptimizationId = 1;

  constructor() {
    // Initialize with some sample Indian stocks
    this.initializeSampleStocks();
  }

  private initializeSampleStocks() {
    const sampleStocks = [
      { ticker: 'RELIANCE.NS', name: 'Reliance Industries Limited', sector: 'Energy', price: 1424.6, change: 11.8, changePercent: 0.84 },
      { ticker: 'TCS.NS', name: 'Tata Consultancy Services Limited', sector: 'Technology', price: 3179.1, change: 19.5, changePercent: 0.62 },
      { ticker: 'HDFCBANK.NS', name: 'HDFC Bank Limited', sector: 'Banking & Finance', price: 2024.3, change: 17.2, changePercent: 0.86 },
      { ticker: 'INFY.NS', name: 'Infosys Limited', sector: 'Technology', price: 1574.5, change: -10.0, changePercent: -0.63 },
      { ticker: 'HINDUNILVR.NS', name: 'Hindustan Unilever Limited', sector: 'Consumer Goods', price: 2450.4, change: -59.4, changePercent: -2.36 },
      { ticker: 'LT.NS', name: 'Larsen & Toubro Limited', sector: 'Infrastructure', price: 3484.9, change: 20.3, changePercent: 0.58 },
      { ticker: 'BAJFINANCE.NS', name: 'Bajaj Finance Limited', sector: 'Banking & Finance', price: 968.3, change: 15.7, changePercent: 1.64 },
      { ticker: 'MARUTI.NS', name: 'Maruti Suzuki India Limited', sector: 'Auto', price: 12627.0, change: 135.0, changePercent: 1.08 },
      { ticker: 'ADANIENT.NS', name: 'Adani Enterprises Limited', sector: 'Diversified', price: 2614.5, change: 26.7, changePercent: 1.03 },
      { ticker: 'POLYCAB.NS', name: 'Polycab India Limited', sector: 'Electrical Equipment', price: 6885.0, change: -157.0, changePercent: -2.23 }
    ];

    sampleStocks.forEach(stock => {
      const fullStock: Stock = {
        ...stock,
        id: this.currentStockId++,
        marketCap: Math.random() * 1000000000000, // Random market cap
        lastUpdated: new Date()
      };
      this.stocks.set(stock.ticker, fullStock);
    });
  }

  // Stocks
  async getStock(ticker: string): Promise<Stock | undefined> {
    return this.stocks.get(ticker);
  }

  async createStock(insertStock: InsertStock): Promise<Stock> {
    const stock: Stock = {
      ...insertStock,
      id: this.currentStockId++,
      lastUpdated: new Date(),
    };
    this.stocks.set(stock.ticker, stock);
    return stock;
  }

  async updateStock(ticker: string, stockUpdate: Partial<InsertStock>): Promise<Stock | undefined> {
    const existing = this.stocks.get(ticker);
    if (!existing) return undefined;
    
    const updated: Stock = {
      ...existing,
      ...stockUpdate,
      lastUpdated: new Date(),
    };
    this.stocks.set(ticker, updated);
    return updated;
  }

  async searchStocks(query: string): Promise<Stock[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.stocks.values()).filter(
      stock => 
        stock.ticker.toLowerCase().includes(lowerQuery) ||
        stock.name.toLowerCase().includes(lowerQuery) ||
        (stock.sector && stock.sector.toLowerCase().includes(lowerQuery))
    );
  }

  // Portfolios
  async getPortfolio(id: number): Promise<Portfolio | undefined> {
    return this.portfolios.get(id);
  }

  async createPortfolio(insertPortfolio: InsertPortfolio): Promise<Portfolio> {
    const portfolio: Portfolio = {
      ...insertPortfolio,
      id: this.currentPortfolioId++,
      createdAt: new Date(),
    };
    this.portfolios.set(portfolio.id, portfolio);
    return portfolio;
  }

  async updatePortfolio(id: number, portfolioUpdate: Partial<InsertPortfolio>): Promise<Portfolio | undefined> {
    const existing = this.portfolios.get(id);
    if (!existing) return undefined;
    
    const updated: Portfolio = {
      ...existing,
      ...portfolioUpdate,
    };
    this.portfolios.set(id, updated);
    return updated;
  }

  async getPortfolios(): Promise<Portfolio[]> {
    return Array.from(this.portfolios.values());
  }

  // Backtests
  async getBacktest(id: number): Promise<Backtest | undefined> {
    return this.backtests.get(id);
  }

  async createBacktest(insertBacktest: InsertBacktest): Promise<Backtest> {
    const backtest: Backtest = {
      ...insertBacktest,
      id: this.currentBacktestId++,
      createdAt: new Date(),
    };
    this.backtests.set(backtest.id, backtest);
    return backtest;
  }

  async getBacktestsByPortfolio(portfolioId: number): Promise<Backtest[]> {
    return Array.from(this.backtests.values()).filter(
      backtest => backtest.portfolioId === portfolioId
    );
  }

  // Optimizations
  async getOptimization(id: number): Promise<Optimization | undefined> {
    return this.optimizations.get(id);
  }

  async createOptimization(insertOptimization: InsertOptimization): Promise<Optimization> {
    const optimization: Optimization = {
      ...insertOptimization,
      id: this.currentOptimizationId++,
      createdAt: new Date(),
    };
    this.optimizations.set(optimization.id, optimization);
    return optimization;
  }

  async getOptimizationsByPortfolio(portfolioId: number): Promise<Optimization[]> {
    return Array.from(this.optimizations.values()).filter(
      optimization => optimization.portfolioId === portfolioId
    );
  }
}

export const storage = new MemStorage();
