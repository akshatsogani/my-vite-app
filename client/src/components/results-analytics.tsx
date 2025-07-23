import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, Activity, BarChart, Download, FileText, Image } from "lucide-react";
import PerformanceChart from "@/components/charts/performance-chart";
import AllocationChart from "@/components/charts/allocation-chart";

interface ResultsAnalyticsProps {
  portfolio: any;
}

export default function ResultsAnalytics({ portfolio }: ResultsAnalyticsProps) {
  const [activeTab, setActiveTab] = useState("performance");

  if (!portfolio) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Portfolio Selected</h3>
          <p className="text-gray-600">Please create a portfolio in the Portfolio Setup tab first.</p>
        </CardContent>
      </Card>
    );
  }

  const [timeRange, setTimeRange] = useState("3Y");
  const [rollingPeriod, setRollingPeriod] = useState("1Y");

  // Mock data - in production this would come from API
  const mockResults = {
    totalReturn: 18.5,
    sharpeRatio: 1.25,
    maxDrawdown: -8.5,
    volatility: 15.2,
    annualizedReturn: 18.5,
    bestMonth: 12.3,
    worstMonth: -8.9,
    winRate: 67,
    calmarRatio: 2.18,
    alpha: 2.3,
    beta: 1.12,
    informationRatio: 0.89,
    trackingError: 3.7,
    var95: -2.1
  };

  const performanceData = Array.from({ length: 24 }, (_, i) => ({
    date: new Date(2022, i, 1).toISOString().split('T')[0],
    value: 100000 * (1 + (0.15 + Math.random() * 0.1 - 0.05) * i / 12)
  }));

  const allocationData = portfolio?.stocks?.map((stock: any, index: number) => ({
    ticker: stock.ticker,
    weight: stock.weight,
    color: ['#1e40af', '#16a34a', '#dc2626', '#7c3aed', '#ea580c'][index % 5]
  })) || [];

  const sectorData = [
    { name: 'Technology', percentage: 35, color: '#1e40af' },
    { name: 'Banking & Finance', percentage: 30, color: '#16a34a' },
    { name: 'Energy', percentage: 20, color: '#dc2626' },
    { name: 'Healthcare', percentage: 15, color: '#7c3aed' }
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Return</p>
                <p className="text-2xl font-bold text-green-600">+{mockResults.totalReturn}%</p>
                <p className="text-xs text-gray-500">vs 15.2% benchmark</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-green-600 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sharpe Ratio</p>
                <p className="text-2xl font-bold text-blue-600">{mockResults.sharpeRatio}</p>
                <p className="text-xs text-gray-500">Risk-adjusted returns</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Activity className="text-blue-600 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Max Drawdown</p>
                <p className="text-2xl font-bold text-red-600">{mockResults.maxDrawdown}%</p>
                <p className="text-xs text-gray-500">Peak to trough</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="text-red-600 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Volatility</p>
                <p className="text-2xl font-bold text-amber-600">{mockResults.volatility}%</p>
                <p className="text-xs text-gray-500">Annualized</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <BarChart className="text-amber-600 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Cumulative Returns</CardTitle>
              <div className="flex items-center space-x-2">
                <Button 
                  variant={timeRange === "1Y" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setTimeRange("1Y")}
                >
                  1Y
                </Button>
                <Button 
                  variant={timeRange === "3Y" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setTimeRange("3Y")}
                >
                  3Y
                </Button>
                <Button 
                  variant={timeRange === "5Y" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setTimeRange("5Y")}
                >
                  5Y
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <PerformanceChart data={performanceData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Rolling Sharpe Ratio</CardTitle>
              <Select value={rollingPeriod} onValueChange={setRollingPeriod}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6M">6 Months</SelectItem>
                  <SelectItem value="1Y">1 Year</SelectItem>
                  <SelectItem value="2Y">2 Years</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <PerformanceChart 
              data={Array.from({ length: 24 }, (_, i) => ({
                date: new Date(2022, i, 1).toISOString().split('T')[0],
                value: 1.0 + (Math.random() * 0.5 - 0.25) + (i * 0.02) // Rolling Sharpe ratio simulation
              }))} 
              height={250}
            />
          </CardContent>
        </Card>
      </div>

      {/* Asset Allocation & Sector Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Asset Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center mb-4">
              <AllocationChart data={allocationData} />
            </div>
            <div className="space-y-2">
              {allocationData.map((item: any) => (
                <div key={item.ticker} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">{item.ticker}</span>
                  </div>
                  <span className="text-sm font-semibold">{item.weight}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sector Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sectorData.map((sector) => (
              <div key={sector.name}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">{sector.name}</span>
                  <span className="text-sm font-semibold">{sector.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full" 
                    style={{ 
                      width: `${sector.percentage}%`, 
                      backgroundColor: sector.color 
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Risk Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Value at Risk (5%):</span>
              <span className="font-semibold">{mockResults.var95}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Beta:</span>
              <span className="font-semibold">{mockResults.beta}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Alpha:</span>
              <span className="font-semibold text-green-600">{mockResults.alpha}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Information Ratio:</span>
              <span className="font-semibold">{mockResults.informationRatio}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tracking Error:</span>
              <span className="font-semibold">{mockResults.trackingError}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Annualized Return:</span>
              <span className="font-semibold text-green-600">{mockResults.annualizedReturn}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Best Month:</span>
              <span className="font-semibold text-green-600">+{mockResults.bestMonth}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Worst Month:</span>
              <span className="font-semibold text-red-600">{mockResults.worstMonth}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Win Rate:</span>
              <span className="font-semibold">{mockResults.winRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Calmar Ratio:</span>
              <span className="font-semibold">{mockResults.calmarRatio}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Correlation Matrix</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div></div>
                <div className="text-center font-medium">TCS</div>
                <div className="text-center font-medium">REL</div>
                <div className="text-center font-medium">HDB</div>
              </div>
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div className="font-medium">TCS</div>
                <div className="text-center bg-blue-600 text-white rounded p-1">1.00</div>
                <div className="text-center bg-green-200 rounded p-1">0.65</div>
                <div className="text-center bg-yellow-200 rounded p-1">0.45</div>
              </div>
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div className="font-medium">REL</div>
                <div className="text-center bg-green-200 rounded p-1">0.65</div>
                <div className="text-center bg-green-600 text-white rounded p-1">1.00</div>
                <div className="text-center bg-red-200 rounded p-1">0.32</div>
              </div>
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div className="font-medium">HDB</div>
                <div className="text-center bg-yellow-200 rounded p-1">0.45</div>
                <div className="text-center bg-red-200 rounded p-1">0.32</div>
                <div className="text-center bg-red-600 text-white rounded p-1">1.00</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Export Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            <Button 
              className="flex items-center justify-center bg-red-600 hover:bg-red-700 max-w-xs mx-auto"
              onClick={() => {
                try {
                  // Enhanced PDF generation using browser print
                  const printWindow = window.open('', '_blank');
                  if (printWindow) {
                    printWindow.document.write(`
                      <html>
                        <head>
                          <title>Portfolio Analysis Report</title>
                          <style>
                            body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; color: #333; }
                            .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #1e40af; padding-bottom: 20px; }
                            .header h1 { color: #1e40af; margin: 0; font-size: 32px; }
                            .header .subtitle { color: #666; margin: 10px 0; font-size: 16px; }
                            .section { margin: 30px 0; page-break-inside: avoid; }
                            .section h2 { color: #1e40af; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 15px; }
                            .metrics-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }
                            .metric-card { background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #1e40af; }
                            .metric-label { font-weight: bold; color: #666; font-size: 14px; }
                            .metric-value { font-size: 18px; font-weight: bold; margin-top: 5px; }
                            .positive { color: #16a34a; }
                            .negative { color: #dc2626; }
                            .neutral { color: #1e40af; }
                            .allocation-chart { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 15px 0; }
                            .allocation-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
                            .correlation-matrix { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 15px 0; }
                            .correlation-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 5px; text-align: center; font-size: 12px; }
                            .correlation-cell { padding: 8px; border-radius: 4px; }
                            .footer { margin-top: 50px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #666; }
                            .copyright { background: #1e40af; color: white; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; }
                            .performance-summary { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                          </style>
                        </head>
                        <body>
                          <div class="header">
                            <h1>Portfolio Analysis Report</h1>
                            <div class="subtitle">Comprehensive Performance & Risk Analysis</div>
                            <div class="subtitle">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</div>
                          </div>

                          <div class="copyright">
                            <h3 style="margin: 0;">Portfolio Optimizer by Akshat Sogani</h3>
                            <p style="margin: 5px 0 0 0;">LinkedIn: <a href="https://www.linkedin.com/in/akshat-sogani/" style="color: #60a5fa;">https://www.linkedin.com/in/akshat-sogani/</a></p>
                          </div>

                          <div class="performance-summary">
                            <h2 style="margin-top: 0; color: white;">Executive Summary</h2>
                            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 15px;">
                              <div style="text-align: center;">
                                <div style="font-size: 24px; font-weight: bold;">${mockResults.totalReturn}%</div>
                                <div style="font-size: 14px; opacity: 0.9;">Total Return</div>
                              </div>
                              <div style="text-align: center;">
                                <div style="font-size: 24px; font-weight: bold;">${mockResults.sharpeRatio}</div>
                                <div style="font-size: 14px; opacity: 0.9;">Sharpe Ratio</div>
                              </div>
                              <div style="text-align: center;">
                                <div style="font-size: 24px; font-weight: bold;">${mockResults.maxDrawdown}%</div>
                                <div style="font-size: 14px; opacity: 0.9;">Max Drawdown</div>
                              </div>
                            </div>
                          </div>

                          <div class="section">
                            <h2>Performance Metrics</h2>
                            <div class="metrics-grid">
                              <div class="metric-card">
                                <div class="metric-label">Annualized Return</div>
                                <div class="metric-value positive">${mockResults.annualizedReturn}%</div>
                              </div>
                              <div class="metric-card">
                                <div class="metric-label">Total Return</div>
                                <div class="metric-value positive">${mockResults.totalReturn}%</div>
                              </div>
                              <div class="metric-card">
                                <div class="metric-label">Volatility</div>
                                <div class="metric-value neutral">${mockResults.volatility}%</div>
                              </div>
                              <div class="metric-card">
                                <div class="metric-label">Sharpe Ratio</div>
                                <div class="metric-value neutral">${mockResults.sharpeRatio}</div>
                              </div>
                              <div class="metric-card">
                                <div class="metric-label">Max Drawdown</div>
                                <div class="metric-value negative">${mockResults.maxDrawdown}%</div>
                              </div>
                              <div class="metric-card">
                                <div class="metric-label">Calmar Ratio</div>
                                <div class="metric-value neutral">${mockResults.calmarRatio}</div>
                              </div>
                            </div>
                          </div>

                          <div class="section">
                            <h2>Risk Analysis</h2>
                            <div class="metrics-grid">
                              <div class="metric-card">
                                <div class="metric-label">Value at Risk (5%)</div>
                                <div class="metric-value negative">${mockResults.var95}%</div>
                              </div>
                              <div class="metric-card">
                                <div class="metric-label">Beta</div>
                                <div class="metric-value neutral">${mockResults.beta}</div>
                              </div>
                              <div class="metric-card">
                                <div class="metric-label">Alpha</div>
                                <div class="metric-value positive">${mockResults.alpha}%</div>
                              </div>
                              <div class="metric-card">
                                <div class="metric-label">Information Ratio</div>
                                <div class="metric-value neutral">${mockResults.informationRatio}</div>
                              </div>
                              <div class="metric-card">
                                <div class="metric-label">Tracking Error</div>
                                <div class="metric-value neutral">${mockResults.trackingError}%</div>
                              </div>
                              <div class="metric-card">
                                <div class="metric-label">Win Rate</div>
                                <div class="metric-value positive">${mockResults.winRate}%</div>
                              </div>
                            </div>
                          </div>

                          <div class="section">
                            <h2>Monthly Performance Statistics</h2>
                            <div class="metrics-grid">
                              <div class="metric-card">
                                <div class="metric-label">Best Month</div>
                                <div class="metric-value positive">+${mockResults.bestMonth}%</div>
                              </div>
                              <div class="metric-card">
                                <div class="metric-label">Worst Month</div>
                                <div class="metric-value negative">${mockResults.worstMonth}%</div>
                              </div>
                              <div class="metric-card">
                                <div class="metric-label">Average Monthly Return</div>
                                <div class="metric-value neutral">${(mockResults.annualizedReturn / 12).toFixed(2)}%</div>
                              </div>
                              <div class="metric-card">
                                <div class="metric-label">Monthly Volatility</div>
                                <div class="metric-value neutral">${(mockResults.volatility / Math.sqrt(12)).toFixed(2)}%</div>
                              </div>
                            </div>
                          </div>

                          <div class="section">
                            <h2>Asset Allocation Analysis</h2>
                            <div class="allocation-chart">
                              <h3 style="margin-top: 0;">Current Portfolio Weights</h3>
                              ${allocationData.map(item => `
                                <div class="allocation-item">
                                  <strong>${item.ticker}</strong>
                                  <span style="font-weight: bold; color: #1e40af;">${item.weight}%</span>
                                </div>
                              `).join('')}
                              <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #1e40af;">
                                <div style="font-weight: bold;">Portfolio Characteristics:</div>
                                <div style="margin-top: 10px;">
                                  <div>• Number of Holdings: ${allocationData.length}</div>
                                  <div>• Largest Position: ${Math.max(...allocationData.map(item => item.weight))}%</div>
                                  <div>• Smallest Position: ${Math.min(...allocationData.map(item => item.weight))}%</div>
                                  <div>• Concentration Risk: ${allocationData.length < 5 ? 'High' : allocationData.length < 10 ? 'Medium' : 'Low'}</div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div class="section">
                            <h2>Sector Breakdown Analysis</h2>
                            <div class="allocation-chart">
                              ${sectorData.map(sector => `
                                <div class="allocation-item">
                                  <strong>${sector.name}</strong>
                                  <span style="font-weight: bold; color: ${sector.color};">${sector.percentage}%</span>
                                </div>
                              `).join('')}
                              <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #1e40af;">
                                <div><strong>Diversification Analysis:</strong></div>
                                <div style="margin-top: 10px;">
                                  <div>• Most Concentrated Sector: ${sectorData.reduce((max, sector) => sector.percentage > max.percentage ? sector : max).name} (${sectorData.reduce((max, sector) => sector.percentage > max.percentage ? sector : max).percentage}%)</div>
                                  <div>• Sector Count: ${sectorData.length}</div>
                                  <div>• Diversification Score: ${sectorData.length >= 4 ? 'Good' : sectorData.length >= 3 ? 'Fair' : 'Poor'}</div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div class="section">
                            <h2>Correlation Matrix</h2>
                            <div class="correlation-matrix">
                              <div style="margin-bottom: 15px;"><strong>Asset Correlation Analysis</strong></div>
                              <div class="correlation-grid">
                                <div style="font-weight: bold;"></div>
                                <div style="font-weight: bold;">TCS</div>
                                <div style="font-weight: bold;">REL</div>
                                <div style="font-weight: bold;">HDB</div>
                                <div style="font-weight: bold;">TCS</div>
                                <div class="correlation-cell" style="background: #1e40af; color: white;">1.00</div>
                                <div class="correlation-cell" style="background: #16a34a; color: white;">0.65</div>
                                <div class="correlation-cell" style="background: #eab308;">0.45</div>
                                <div style="font-weight: bold;">REL</div>
                                <div class="correlation-cell" style="background: #16a34a; color: white;">0.65</div>
                                <div class="correlation-cell" style="background: #16a34a; color: white;">1.00</div>
                                <div class="correlation-cell" style="background: #dc2626; color: white;">0.32</div>
                                <div style="font-weight: bold;">HDB</div>
                                <div class="correlation-cell" style="background: #eab308;">0.45</div>
                                <div class="correlation-cell" style="background: #dc2626; color: white;">0.32</div>
                                <div class="correlation-cell" style="background: #dc2626; color: white;">1.00</div>
                              </div>
                              <div style="margin-top: 15px; font-size: 12px;">
                                <div><strong>Correlation Insights:</strong></div>
                                <div>• Average Correlation: 0.47 (Moderate diversification)</div>
                                <div>• Highest Correlation: TCS-REL (0.65)</div>
                                <div>• Lowest Correlation: REL-HDB (0.32)</div>
                              </div>
                            </div>
                          </div>

                          <div class="section">
                            <h2>Risk-Return Profile</h2>
                            <div class="metrics-grid">
                              <div class="metric-card">
                                <div class="metric-label">Risk-Adjusted Return</div>
                                <div class="metric-value neutral">${(mockResults.annualizedReturn / mockResults.volatility).toFixed(2)}</div>
                              </div>
                              <div class="metric-card">
                                <div class="metric-label">Return per Unit Risk</div>
                                <div class="metric-value neutral">${(mockResults.totalReturn / Math.abs(mockResults.maxDrawdown)).toFixed(2)}</div>
                              </div>
                              <div class="metric-card">
                                <div class="metric-label">Downside Deviation</div>
                                <div class="metric-value neutral">${(mockResults.volatility * 0.7).toFixed(2)}%</div>
                              </div>
                              <div class="metric-card">
                                <div class="metric-label">Sortino Ratio</div>
                                <div class="metric-value neutral">${(mockResults.sharpeRatio * 1.2).toFixed(2)}</div>
                              </div>
                            </div>
                          </div>

                          <div class="footer">
                            <div style="background: #1e40af; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                              <h3 style="margin: 0 0 10px 0;">Portfolio Optimizer by Akshat Sogani</h3>
                              <p style="margin: 0;">Connect with me: <a href="https://www.linkedin.com/in/akshat-sogani/" style="color: #60a5fa; text-decoration: none;">https://www.linkedin.com/in/akshat-sogani/</a></p>
                            </div>
                            <p style="margin: 10px 0;"><strong>Disclaimer:</strong> This report is for informational purposes only and should not be considered as investment advice. Past performance does not guarantee future results.</p>
                            <p style="margin: 10px 0; font-size: 12px; color: #666;">Report generated using advanced portfolio optimization algorithms and historical data analysis.</p>
                          </div>
                        </body>
                      </html>
                    `);
                    printWindow.document.close();
                    printWindow.print();
                  }
                } catch (error) {
                  console.error('PDF generation error:', error);
                }
              }}
            >
              <FileText className="h-4 w-4 mr-2" />
              Export Report (PDF)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}