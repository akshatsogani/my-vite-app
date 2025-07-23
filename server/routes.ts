import type { Express } from "express";
import { createServer, type Server } from "http";
import { spawn } from "child_process";
import path from "path";
import { storage } from "./storage";
import { insertStockSchema, insertPortfolioSchema, insertBacktestSchema, insertOptimizationSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Stock routes
  app.get("/api/stocks/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== "string") {
        return res.status(400).json({ message: "Query parameter 'q' is required" });
      }
      
      const stocks = await storage.searchStocks(q);
      res.json(stocks);
    } catch (error) {
      res.status(500).json({ message: "Failed to search stocks" });
    }
  });

  app.post("/api/stocks/fetch", async (req, res) => {
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

  // Portfolio routes
  app.get("/api/portfolios", async (req, res) => {
    try {
      const portfolios = await storage.getPortfolios();
      res.json(portfolios);
    } catch (error) {
      res.status(500).json({ message: "Failed to get portfolios" });
    }
  });

  app.post("/api/portfolios", async (req, res) => {
    try {
      const validated = insertPortfolioSchema.parse(req.body);
      const portfolio = await storage.createPortfolio(validated);
      res.status(201).json(portfolio);
    } catch (error) {
      res.status(400).json({ message: "Invalid portfolio data" });
    }
  });

  app.get("/api/portfolios/:id", async (req, res) => {
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

  // Backtest routes
  app.post("/api/backtests", async (req, res) => {
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

  app.get("/api/portfolios/:id/backtests", async (req, res) => {
    try {
      const portfolioId = parseInt(req.params.id);
      const backtests = await storage.getBacktestsByPortfolio(portfolioId);
      res.json(backtests);
    } catch (error) {
      res.status(500).json({ message: "Failed to get backtests" });
    }
  });

  // Optimization routes
  app.post("/api/optimizations", async (req, res) => {
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

  app.get("/api/portfolios/:id/optimizations", async (req, res) => {
    try {
      const portfolioId = parseInt(req.params.id);
      const optimizations = await storage.getOptimizationsByPortfolio(portfolioId);
      res.json(optimizations);
    } catch (error) {
      res.status(500).json({ message: "Failed to get optimizations" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
