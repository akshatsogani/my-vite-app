import { pgTable, text, serial, real, timestamp, json, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const stocks = pgTable("stocks", {
  id: serial("id").primaryKey(),
  ticker: text("ticker").notNull().unique(),
  name: text("name").notNull(),
  sector: text("sector"),
  price: real("price"),
  change: real("change"),
  changePercent: real("change_percent"),
  marketCap: real("market_cap"),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const portfolios = pgTable("portfolios", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  stocks: json("stocks").$type<Array<{ticker: string, weight: number}>>().notNull(),
  initialInvestment: real("initial_investment").notNull(),
  rebalancingFrequency: text("rebalancing_frequency").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const backtests = pgTable("backtests", {
  id: serial("id").primaryKey(),
  portfolioId: serial("portfolio_id").references(() => portfolios.id),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  initialInvestment: real("initial_investment").notNull(),
  riskFreeRate: real("risk_free_rate").notNull(),
  benchmark: text("benchmark").notNull(),
  transactionCost: real("transaction_cost").notNull(),
  includeDividends: boolean("include_dividends").default(true),
  results: json("results").$type<{
    totalReturn: number;
    annualizedReturn: number;
    volatility: number;
    sharpeRatio: number;
    maxDrawdown: number;
    alpha: number;
    beta: number;
    performanceData: Array<{date: string, value: number}>;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const optimizations = pgTable("optimizations", {
  id: serial("id").primaryKey(),
  portfolioId: serial("portfolio_id").references(() => portfolios.id),
  objective: text("objective").notNull(), // 'sharpe', 'variance', 'return', 'risk'
  targetValue: real("target_value"),
  constraints: json("constraints").$type<{
    maxWeight: number;
    minWeight: number;
    sectorLimit: number;
    longOnly: boolean;
  }>(),
  method: text("method").notNull(), // 'markowitz', 'black_litterman', 'risk_parity'
  results: json("results").$type<{
    weights: Array<{ticker: string, weight: number}>;
    expectedReturn: number;
    volatility: number;
    sharpeRatio: number;
    efficientFrontier: Array<{risk: number, return: number}>;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertStockSchema = createInsertSchema(stocks).omit({
  id: true,
  lastUpdated: true,
});

export const insertPortfolioSchema = createInsertSchema(portfolios).omit({
  id: true,
  createdAt: true,
});

export const insertBacktestSchema = createInsertSchema(backtests).omit({
  id: true,
  createdAt: true,
});

export const insertOptimizationSchema = createInsertSchema(optimizations).omit({
  id: true,
  createdAt: true,
});

// Types
export type Stock = typeof stocks.$inferSelect;
export type InsertStock = z.infer<typeof insertStockSchema>;

export type Portfolio = typeof portfolios.$inferSelect;
export type InsertPortfolio = z.infer<typeof insertPortfolioSchema>;

export type Backtest = typeof backtests.$inferSelect;
export type InsertBacktest = z.infer<typeof insertBacktestSchema>;

export type Optimization = typeof optimizations.$inferSelect;
export type InsertOptimization = z.infer<typeof insertOptimizationSchema>;
