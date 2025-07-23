#!/usr/bin/env python3
import sys
import json
import yfinance as yf
from datetime import datetime, timedelta
import pandas as pd

def fetch_stock_data(tickers):
    """Fetch current stock data using yfinance"""
    try:
        stocks_data = []
        
        for ticker in tickers:
            stock = yf.Ticker(ticker)
            
            # Get basic info
            info = stock.info
            
            # Get current price data
            hist = stock.history(period="2d")
            if hist.empty:
                continue
                
            current_price = hist['Close'].iloc[-1] if len(hist) > 0 else None
            prev_price = hist['Close'].iloc[-2] if len(hist) > 1 else current_price
            
            if current_price is None:
                continue
                
            change = current_price - prev_price if prev_price else 0
            change_percent = (change / prev_price * 100) if prev_price and prev_price != 0 else 0
            
            stock_data = {
                'ticker': ticker,
                'name': info.get('longName', ticker),
                'sector': info.get('sector', 'Unknown'),
                'price': round(float(current_price), 2),
                'change': round(float(change), 2),
                'changePercent': round(float(change_percent), 2),
                'marketCap': info.get('marketCap', 0)
            }
            
            stocks_data.append(stock_data)
            
        return stocks_data
        
    except Exception as e:
        raise Exception(f"Error fetching stock data: {str(e)}")

def main():
    try:
        if len(sys.argv) < 2:
            raise ValueError("No tickers provided")
            
        tickers = json.loads(sys.argv[1])
        
        if not isinstance(tickers, list):
            raise ValueError("Tickers must be a list")
            
        stock_data = fetch_stock_data(tickers)
        print(json.dumps(stock_data))
        
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
