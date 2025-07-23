#!/usr/bin/env python3
import sys
import json
import numpy as np
import pandas as pd
import yfinance as yf
from datetime import datetime, timedelta
import scipy.optimize as sco

def fetch_historical_data(tickers, start_date, end_date):
    """Fetch historical stock data"""
    try:
        data = yf.download(tickers, start=start_date, end=end_date, group_by='ticker', auto_adjust=False)
        
        if len(tickers) == 1:
            # Single ticker case
            close_data = pd.DataFrame({tickers[0]: data['Close']})
        else:
            # Multiple tickers case
            close_data = pd.DataFrame({ticker: data[ticker]['Close'] for ticker in tickers})
        
        return close_data.dropna()
    except Exception as e:
        raise Exception(f"Error fetching historical data: {str(e)}")

def calculate_portfolio_performance(weights, mean_returns, cov_matrix):
    """Calculate portfolio performance metrics"""
    returns = np.sum(mean_returns * weights) * 252
    std_dev = np.sqrt(np.dot(weights.T, np.dot(cov_matrix, weights))) * np.sqrt(252)
    return std_dev, returns

def neg_sharpe_ratio(weights, mean_returns, cov_matrix, risk_free_rate):
    """Calculate negative Sharpe ratio for optimization"""
    p_var, p_ret = calculate_portfolio_performance(weights, mean_returns, cov_matrix)
    return -(p_ret - risk_free_rate) / p_var

def portfolio_volatility(weights, mean_returns, cov_matrix):
    """Calculate portfolio volatility"""
    return calculate_portfolio_performance(weights, mean_returns, cov_matrix)[0]

def max_sharpe_ratio(mean_returns, cov_matrix, risk_free_rate):
    """Find portfolio with maximum Sharpe ratio"""
    num_assets = len(mean_returns)
    args = (mean_returns, cov_matrix, risk_free_rate)
    constraints = {"type": "eq", "fun": lambda x: np.sum(x) - 1}
    bounds = tuple((0.0, 1.0) for _ in range(num_assets))
    
    result = sco.minimize(
        neg_sharpe_ratio,
        num_assets * [1.0 / num_assets],
        args=args,
        method="SLSQP",
        bounds=bounds,
        constraints=constraints,
    )
    return result

def min_variance(mean_returns, cov_matrix):
    """Find minimum variance portfolio"""
    num_assets = len(mean_returns)
    args = (mean_returns, cov_matrix)
    bounds = tuple((0.0, 1.0) for _ in range(num_assets))
    constraints = {'type': 'eq', 'fun': lambda x: np.sum(x) - 1}

    result = sco.minimize(
        portfolio_volatility, 
        [1./num_assets]*num_assets,
        args=args, 
        method='SLSQP', 
        bounds=bounds, 
        constraints=constraints
    )
    return result

def efficient_return(mean_returns, cov_matrix, target_return):
    """Calculate efficient portfolio for target return"""
    num_assets = len(mean_returns)
    args = (mean_returns, cov_matrix)
    bounds = tuple((0.0, 1.0) for _ in range(num_assets))
    constraints = [
        {'type': 'eq', 'fun': lambda x: calculate_portfolio_performance(x, mean_returns, cov_matrix)[1] - target_return},
        {'type': 'eq', 'fun': lambda x: np.sum(x) - 1}
    ]

    result = sco.minimize(
        portfolio_volatility, 
        [1./num_assets]*num_assets,
        args=args, 
        method='SLSQP', 
        bounds=bounds, 
        constraints=constraints
    )
    return result

def generate_efficient_frontier(mean_returns, cov_matrix, num_points=50):
    """Generate efficient frontier points"""
    # Get min variance portfolio
    min_vol = min_variance(mean_returns, cov_matrix)
    min_vol_return = calculate_portfolio_performance(min_vol.x, mean_returns, cov_matrix)[1]
    
    # Get max return (just use the stock with highest expected return as upper bound)
    max_return = mean_returns.max() * 252 * 0.8  # Scale down a bit for feasibility
    
    # Generate target returns
    target_returns = np.linspace(min_vol_return, max_return, num_points)
    
    efficient_portfolios = []
    for target in target_returns:
        try:
            result = efficient_return(mean_returns, cov_matrix, target)
            if result.success:
                risk = result.fun
                efficient_portfolios.append({'risk': float(risk), 'return': float(target)})
        except:
            continue
    
    return efficient_portfolios

def run_backtest(params):
    """Run portfolio backtest"""
    try:
        portfolio_stocks = params['portfolio']
        tickers = [stock['ticker'] for stock in portfolio_stocks]
        weights = np.array([stock['weight'] / 100.0 for stock in portfolio_stocks])
        
        # Fetch historical data
        price_data = fetch_historical_data(tickers, params['startDate'], params['endDate'])
        
        if price_data.empty:
            raise Exception("No historical data available")
        
        # Calculate returns
        returns = price_data.pct_change().dropna()
        
        # Calculate portfolio returns
        portfolio_returns = (returns * weights).sum(axis=1)
        
        # Calculate cumulative returns
        cumulative_returns = (1 + portfolio_returns).cumprod()
        
        # Calculate performance metrics
        total_return = (cumulative_returns.iloc[-1] - 1) * 100
        annualized_return = ((1 + portfolio_returns.mean()) ** 252 - 1) * 100
        volatility = portfolio_returns.std() * np.sqrt(252) * 100
        
        # Sharpe ratio
        excess_returns = portfolio_returns - (params['riskFreeRate'] / 100) / 252
        sharpe_ratio = excess_returns.mean() / portfolio_returns.std() * np.sqrt(252)
        
        # Max drawdown
        rolling_max = cumulative_returns.expanding().max()
        drawdown = (cumulative_returns - rolling_max) / rolling_max
        max_drawdown = drawdown.min() * 100
        
        # Performance data for charting
        performance_data = [
            {'date': date.strftime('%Y-%m-%d'), 'value': float(value * params['initialInvestment'])}
            for date, value in cumulative_returns.items()
        ]
        
        return {
            'totalReturn': float(total_return),
            'annualizedReturn': float(annualized_return),
            'volatility': float(volatility),
            'sharpeRatio': float(sharpe_ratio),
            'maxDrawdown': float(max_drawdown),
            'alpha': float(annualized_return - params['riskFreeRate']),  # Simplified alpha
            'beta': 1.0,  # Simplified beta
            'performanceData': performance_data
        }
        
    except Exception as e:
        raise Exception(f"Backtest failed: {str(e)}")

def run_optimization(params):
    """Run portfolio optimization"""
    try:
        portfolio_stocks = params['portfolio']
        tickers = [stock['ticker'] for stock in portfolio_stocks]
        
        # Fetch recent historical data for optimization (last 2 years)
        end_date = datetime.now()
        start_date = end_date - timedelta(days=730)
        
        price_data = fetch_historical_data(tickers, start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d'))
        
        if price_data.empty:
            raise Exception("No historical data available for optimization")
        
        # Calculate expected returns and covariance matrix
        returns = price_data.pct_change().dropna()
        mean_returns = returns.mean()
        cov_matrix = returns.cov()
        
        risk_free_rate = 0.06  # Default risk-free rate
        
        # Run optimization based on objective
        if params['objective'] == 'sharpe':
            result = max_sharpe_ratio(mean_returns, cov_matrix, risk_free_rate)
        elif params['objective'] == 'variance':
            result = min_variance(mean_returns, cov_matrix)
        else:
            # Default to max Sharpe
            result = max_sharpe_ratio(mean_returns, cov_matrix, risk_free_rate)
        
        if not result.success:
            raise Exception("Optimization failed to converge")
        
        # Calculate optimized portfolio metrics
        opt_weights = result.x
        opt_vol, opt_return = calculate_portfolio_performance(opt_weights, mean_returns, cov_matrix)
        opt_sharpe = (opt_return - risk_free_rate) / opt_vol
        
        # Generate efficient frontier
        efficient_frontier = generate_efficient_frontier(mean_returns, cov_matrix)
        
        # Format weights
        weights = [
            {'ticker': ticker, 'weight': float(weight * 100)} 
            for ticker, weight in zip(tickers, opt_weights)
        ]
        
        return {
            'weights': weights,
            'expectedReturn': float(opt_return * 100),
            'volatility': float(opt_vol * 100),
            'sharpeRatio': float(opt_sharpe),
            'efficientFrontier': efficient_frontier
        }
        
    except Exception as e:
        raise Exception(f"Optimization failed: {str(e)}")

def main():
    try:
        if len(sys.argv) < 2:
            raise ValueError("No parameters provided")
            
        params = json.loads(sys.argv[1])
        
        if params['action'] == 'backtest':
            result = run_backtest(params)
        elif params['action'] == 'optimize':
            result = run_optimization(params)
        else:
            raise ValueError(f"Unknown action: {params['action']}")
        
        print(json.dumps(result))
        
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
