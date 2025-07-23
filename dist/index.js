// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";
import { spawn } from "child_process";
import path from "path";

// server/storage.ts
var MemStorage = class {
  stocks = /* @__PURE__ */ new Map();
  portfolios = /* @__PURE__ */ new Map();
  backtests = /* @__PURE__ */ new Map();
  optimizations = /* @__PURE__ */ new Map();
  currentStockId = 1;
  currentPortfolioId = 1;
  currentBacktestId = 1;
  currentOptimizationId = 1;
  constructor() {
    this.initializeSampleStocks();
  }
  initializeSampleStocks() {
    const sampleStocks = [
      { ticker: "RELIANCE.NS", name: "Reliance Industries Limited", sector: "Energy", price: 1424.6, change: 11.8, changePercent: 0.84 },
      { ticker: "TCS.NS", name: "Tata Consultancy Services Limited", sector: "Technology", price: 3179.1, change: 19.5, changePercent: 0.62 },
      { ticker: "HDFCBANK.NS", name: "HDFC Bank Limited", sector: "Banking & Finance", price: 2024.3, change: 17.2, changePercent: 0.86 },
      { ticker: "INFY.NS", name: "Infosys Limited", sector: "Technology", price: 1574.5, change: -10, changePercent: -0.63 },
      { ticker: "HINDUNILVR.NS", name: "Hindustan Unilever Limited", sector: "Consumer Goods", price: 2450.4, change: -59.4, changePercent: -2.36 },
      { ticker: "LT.NS", name: "Larsen & Toubro Limited", sector: "Infrastructure", price: 3484.9, change: 20.3, changePercent: 0.58 },
      { ticker: "BAJFINANCE.NS", name: "Bajaj Finance Limited", sector: "Banking & Finance", price: 968.3, change: 15.7, changePercent: 1.64 },
      { ticker: "MARUTI.NS", name: "Maruti Suzuki India Limited", sector: "Auto", price: 12627, change: 135, changePercent: 1.08 },
      { ticker: "ADANIENT.NS", name: "Adani Enterprises Limited", sector: "Diversified", price: 2614.5, change: 26.7, changePercent: 1.03 },
      { ticker: "POLYCAB.NS", name: "Polycab India Limited", sector: "Electrical Equipment", price: 6885, change: -157, changePercent: -2.23 }
    ];
    sampleStocks.forEach((stock) => {
      const fullStock = {
        ...stock,
        id: this.currentStockId++,
        marketCap: Math.random() * 1e12,
        // Random market cap
        lastUpdated: /* @__PURE__ */ new Date()
      };
      this.stocks.set(stock.ticker, fullStock);
    });
  }
  // Stocks
  async getStock(ticker) {
    return this.stocks.get(ticker);
  }
  async createStock(insertStock) {
    const stock = {
      ...insertStock,
      id: this.currentStockId++,
      lastUpdated: /* @__PURE__ */ new Date()
    };
    this.stocks.set(stock.ticker, stock);
    return stock;
  }
  async updateStock(ticker, stockUpdate) {
    const existing = this.stocks.get(ticker);
    if (!existing) return void 0;
    const updated = {
      ...existing,
      ...stockUpdate,
      lastUpdated: /* @__PURE__ */ new Date()
    };
    this.stocks.set(ticker, updated);
    return updated;
  }
  async searchStocks(query) {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.stocks.values()).filter(
      (stock) => stock.ticker.toLowerCase().includes(lowerQuery) || stock.name.toLowerCase().includes(lowerQuery) || stock.sector && stock.sector.toLowerCase().includes(lowerQuery)
    );
  }
  // Portfolios
  async getPortfolio(id) {
    return this.portfolios.get(id);
  }
  async createPortfolio(insertPortfolio) {
    const portfolio = {
      ...insertPortfolio,
      id: this.currentPortfolioId++,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.portfolios.set(portfolio.id, portfolio);
    return portfolio;
  }
  async updatePortfolio(id, portfolioUpdate) {
    const existing = this.portfolios.get(id);
    if (!existing) return void 0;
    const updated = {
      ...existing,
      ...portfolioUpdate
    };
    this.portfolios.set(id, updated);
    return updated;
  }
  async getPortfolios() {
    return Array.from(this.portfolios.values());
  }
  // Backtests
  async getBacktest(id) {
    return this.backtests.get(id);
  }
  async createBacktest(insertBacktest) {
    const backtest = {
      ...insertBacktest,
      id: this.currentBacktestId++,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.backtests.set(backtest.id, backtest);
    return backtest;
  }
  async getBacktestsByPortfolio(portfolioId) {
    return Array.from(this.backtests.values()).filter(
      (backtest) => backtest.portfolioId === portfolioId
    );
  }
  // Optimizations
  async getOptimization(id) {
    return this.optimizations.get(id);
  }
  async createOptimization(insertOptimization) {
    const optimization = {
      ...insertOptimization,
      id: this.currentOptimizationId++,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.optimizations.set(optimization.id, optimization);
    return optimization;
  }
  async getOptimizationsByPortfolio(portfolioId) {
    return Array.from(this.optimizations.values()).filter(
      (optimization) => optimization.portfolioId === portfolioId
    );
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { pgTable, text, serial, real, timestamp, json, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var stocks = pgTable("stocks", {
  id: serial("id").primaryKey(),
  ticker: text("ticker").notNull().unique(),
  name: text("name").notNull(),
  sector: text("sector"),
  price: real("price"),
  change: real("change"),
  changePercent: real("change_percent"),
  marketCap: real("market_cap"),
  lastUpdated: timestamp("last_updated").defaultNow()
});
var portfolios = pgTable("portfolios", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  stocks: json("stocks").$type().notNull(),
  initialInvestment: real("initial_investment").notNull(),
  rebalancingFrequency: text("rebalancing_frequency").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var backtests = pgTable("backtests", {
  id: serial("id").primaryKey(),
  portfolioId: serial("portfolio_id").references(() => portfolios.id),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  initialInvestment: real("initial_investment").notNull(),
  riskFreeRate: real("risk_free_rate").notNull(),
  benchmark: text("benchmark").notNull(),
  transactionCost: real("transaction_cost").notNull(),
  includeDividends: boolean("include_dividends").default(true),
  results: json("results").$type(),
  createdAt: timestamp("created_at").defaultNow()
});
var optimizations = pgTable("optimizations", {
  id: serial("id").primaryKey(),
  portfolioId: serial("portfolio_id").references(() => portfolios.id),
  objective: text("objective").notNull(),
  // 'sharpe', 'variance', 'return', 'risk'
  targetValue: real("target_value"),
  constraints: json("constraints").$type(),
  method: text("method").notNull(),
  // 'markowitz', 'black_litterman', 'risk_parity'
  results: json("results").$type(),
  createdAt: timestamp("created_at").defaultNow()
});
var insertStockSchema = createInsertSchema(stocks).omit({
  id: true,
  lastUpdated: true
});
var insertPortfolioSchema = createInsertSchema(portfolios).omit({
  id: true,
  createdAt: true
});
var insertBacktestSchema = createInsertSchema(backtests).omit({
  id: true,
  createdAt: true
});
var insertOptimizationSchema = createInsertSchema(optimizations).omit({
  id: true,
  createdAt: true
});

// server/routes.ts
async function registerRoutes(app2) {
  app2.get("/api/stocks/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== "string") {
        return res.status(400).json({ message: "Query parameter 'q' is required" });
      }
      const stocks2 = await storage.searchStocks(q);
      res.json(stocks2);
    } catch (error) {
      res.status(500).json({ message: "Failed to search stocks" });
    }
  });
  app2.post("/api/stocks/fetch", async (req, res) => {
    try {
      const { tickers } = req.body;
      if (!Array.isArray(tickers)) {
        return res.status(400).json({ message: "Tickers must be an array" });
      }
      const pythonScript = path.join(process.cwd(), "server", "python", "stock_data.py");
      const python = spawn("python3", [pythonScript, JSON.stringify(tickers)]);
      let data = "";
      let error = "";
      python.stdout.on("data", (chunk) => {
        data += chunk.toString();
      });
      python.stderr.on("data", (chunk) => {
        error += chunk.toString();
      });
      python.on("close", async (code) => {
        if (code !== 0) {
          console.error("Python script error:", error);
          return res.status(500).json({ message: "Failed to fetch stock data" });
        }
        try {
          const stockData = JSON.parse(data);
          const updatedStocks = [];
          for (const stock of stockData) {
            const existing = await storage.getStock(stock.ticker);
            if (existing) {
              const updated = await storage.updateStock(stock.ticker, stock);
              updatedStocks.push(updated);
            } else {
              const created = await storage.createStock(stock);
              updatedStocks.push(created);
            }
          }
          res.json(updatedStocks);
        } catch (parseError) {
          console.error("Failed to parse stock data:", parseError);
          res.status(500).json({ message: "Failed to parse stock data" });
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stock data" });
    }
  });
  app2.get("/api/portfolios", async (req, res) => {
    try {
      const portfolios2 = await storage.getPortfolios();
      res.json(portfolios2);
    } catch (error) {
      res.status(500).json({ message: "Failed to get portfolios" });
    }
  });
  app2.post("/api/portfolios", async (req, res) => {
    try {
      const validated = insertPortfolioSchema.parse(req.body);
      const portfolio = await storage.createPortfolio(validated);
      res.status(201).json(portfolio);
    } catch (error) {
      res.status(400).json({ message: "Invalid portfolio data" });
    }
  });
  app2.get("/api/portfolios/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const portfolio = await storage.getPortfolio(id);
      if (!portfolio) {
        return res.status(404).json({ message: "Portfolio not found" });
      }
      res.json(portfolio);
    } catch (error) {
      res.status(500).json({ message: "Failed to get portfolio" });
    }
  });
  app2.post("/api/backtests", async (req, res) => {
    try {
      const validated = insertBacktestSchema.parse(req.body);
      const portfolio = await storage.getPortfolio(validated.portfolioId);
      if (!portfolio) {
        return res.status(404).json({ message: "Portfolio not found" });
      }
      const pythonScript = path.join(process.cwd(), "server", "python", "portfolio_optimizer.py");
      const backtestParams = {
        action: "backtest",
        portfolio: portfolio.stocks,
        startDate: validated.startDate,
        endDate: validated.endDate,
        initialInvestment: validated.initialInvestment,
        riskFreeRate: validated.riskFreeRate,
        benchmark: validated.benchmark,
        transactionCost: validated.transactionCost,
        includeDividends: validated.includeDividends
      };
      const python = spawn("python3", [pythonScript, JSON.stringify(backtestParams)]);
      let data = "";
      let error = "";
      python.stdout.on("data", (chunk) => {
        data += chunk.toString();
      });
      python.stderr.on("data", (chunk) => {
        error += chunk.toString();
      });
      python.on("close", async (code) => {
        if (code !== 0) {
          console.error("Python backtest error:", error);
          return res.status(500).json({ message: "Backtest failed" });
        }
        try {
          const results = JSON.parse(data);
          const backtest = await storage.createBacktest({
            ...validated,
            results
          });
          res.status(201).json(backtest);
        } catch (parseError) {
          console.error("Failed to parse backtest results:", parseError);
          res.status(500).json({ message: "Failed to parse backtest results" });
        }
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid backtest data" });
    }
  });
  app2.get("/api/portfolios/:id/backtests", async (req, res) => {
    try {
      const portfolioId = parseInt(req.params.id);
      const backtests2 = await storage.getBacktestsByPortfolio(portfolioId);
      res.json(backtests2);
    } catch (error) {
      res.status(500).json({ message: "Failed to get backtests" });
    }
  });
  app2.post("/api/optimizations", async (req, res) => {
    try {
      const validated = insertOptimizationSchema.parse(req.body);
      const portfolio = await storage.getPortfolio(validated.portfolioId);
      if (!portfolio) {
        return res.status(404).json({ message: "Portfolio not found" });
      }
      const pythonScript = path.join(process.cwd(), "server", "python", "portfolio_optimizer.py");
      const optimizationParams = {
        action: "optimize",
        portfolio: portfolio.stocks,
        objective: validated.objective,
        targetValue: validated.targetValue,
        constraints: validated.constraints,
        method: validated.method
      };
      const python = spawn("python3", [pythonScript, JSON.stringify(optimizationParams)]);
      let data = "";
      let error = "";
      python.stdout.on("data", (chunk) => {
        data += chunk.toString();
      });
      python.stderr.on("data", (chunk) => {
        error += chunk.toString();
      });
      python.on("close", async (code) => {
        if (code !== 0) {
          console.error("Python optimization error:", error);
          return res.status(500).json({ message: "Optimization failed" });
        }
        try {
          const results = JSON.parse(data);
          const optimization = await storage.createOptimization({
            ...validated,
            results
          });
          res.status(201).json(optimization);
        } catch (parseError) {
          console.error("Failed to parse optimization results:", parseError);
          res.status(500).json({ message: "Failed to parse optimization results" });
        }
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid optimization data" });
    }
  });
  app2.get("/api/portfolios/:id/optimizations", async (req, res) => {
    try {
      const portfolioId = parseInt(req.params.id);
      const optimizations2 = await storage.getOptimizationsByPortfolio(portfolioId);
      res.json(optimizations2);
    } catch (error) {
      res.status(500).json({ message: "Failed to get optimizations" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path2.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
