import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AllocationChart from "@/components/charts/allocation-chart";

interface PortfolioSetupProps {
  selectedStocks: string[];
  portfolio: any;
  onPortfolioChange: (portfolio: any) => void;
}

export default function PortfolioSetup({ selectedStocks, portfolio, onPortfolioChange }: PortfolioSetupProps) {
  const [portfolioName, setPortfolioName] = useState("My Growth Portfolio");
  const [initialInvestment, setInitialInvestment] = useState(1000000);
  const [rebalancingFrequency, setRebalancingFrequency] = useState("quarterly");
  const [weights, setWeights] = useState<Record<string, number>>({});
  const { toast } = useToast();

  useEffect(() => {
    if (selectedStocks.length > 0 && Object.keys(weights).length === 0) {
      // Initialize with equal weights
      const equalWeight = Math.round(100 / selectedStocks.length);
      const initialWeights: Record<string, number> = {};
      selectedStocks.forEach((stock, index) => {
        initialWeights[stock] = index === selectedStocks.length - 1 
          ? 100 - (equalWeight * (selectedStocks.length - 1)) // Adjust last weight for rounding
          : equalWeight;
      });
      setWeights(initialWeights);
    }
  }, [selectedStocks]);

  const createPortfolioMutation = useMutation({
    mutationFn: async (portfolioData: any) => {
      const response = await apiRequest("POST", "/api/portfolios", portfolioData);
      return response.json();
    },
    onSuccess: (data) => {
      onPortfolioChange(data);
      toast({ title: "Portfolio created", description: "Your portfolio has been saved successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create portfolio.", variant: "destructive" });
    }
  });

  const updateWeight = (ticker: string, value: number) => {
    setWeights(prev => ({ ...prev, [ticker]: value }));
  };

  const setEqualWeights = () => {
    const equalWeight = Math.round(100 / selectedStocks.length);
    const newWeights: Record<string, number> = {};
    selectedStocks.forEach((stock, index) => {
      newWeights[stock] = index === selectedStocks.length - 1 
        ? 100 - (equalWeight * (selectedStocks.length - 1))
        : equalWeight;
    });
    setWeights(newWeights);
  };

  const setMarketCapWeights = () => {
    // Simplified market cap weighting - would use real market cap data in production
    const mockMarketCaps: Record<string, number> = {
      'TCS.NS': 30,
      'RELIANCE.NS': 25,
      'HDFCBANK.NS': 20,
      'INFY.NS': 15,
      'HINDUNILVR.NS': 10
    };

    const totalMarketCap = selectedStocks.reduce((sum, stock) => sum + (mockMarketCaps[stock] || 10), 0);
    const newWeights: Record<string, number> = {};
    selectedStocks.forEach(stock => {
      newWeights[stock] = Math.round((mockMarketCaps[stock] || 10) / totalMarketCap * 100);
    });
    setWeights(newWeights);
  };

  const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);

  const savePortfolio = () => {
    const portfolioData = {
      name: portfolioName,
      description: `Portfolio with ${selectedStocks.length} stocks`,
      stocks: selectedStocks.map(ticker => ({
        ticker,
        weight: weights[ticker] || 0
      })),
      initialInvestment,
      rebalancingFrequency
    };

    createPortfolioMutation.mutate(portfolioData);
  };

  const getStockColor = (ticker: string) => {
    const colors = ['#1e40af', '#16a34a', '#dc2626', '#7c3aed', '#ea580c', '#db2777'];
    return colors[selectedStocks.indexOf(ticker) % colors.length];
  };

  if (selectedStocks.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Stocks Selected</h3>
          <p className="text-gray-600">Please select stocks in the Stock Selection tab first.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Portfolio Configuration */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Portfolio Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Portfolio Name</label>
              <Input
                value={portfolioName}
                onChange={(e) => setPortfolioName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Initial Investment (₹)</label>
              <Input
                type="number"
                value={initialInvestment}
                onChange={(e) => setInitialInvestment(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rebalancing Frequency</label>
              <Select value={rebalancingFrequency} onValueChange={setRebalancingFrequency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="semi-annually">Semi-annually</SelectItem>
                  <SelectItem value="annually">Annually</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quick Allocation</label>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={setEqualWeights}>
                  Equal Weight
                </Button>
                <Button variant="outline" size="sm" onClick={setMarketCapWeights}>
                  Market Cap
                </Button>
                <Button variant="outline" size="sm">
                  Risk Parity
                </Button>
                <Button variant="outline" size="sm">
                  Custom
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Weight Allocation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedStocks.map((ticker) => (
              <div key={ticker} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: getStockColor(ticker) }}
                    />
                    <span className="font-medium">{ticker}</span>
                  </div>
                  <span className="text-sm font-semibold">{weights[ticker] || 0}%</span>
                </div>
                <Slider
                  value={[weights[ticker] || 0]}
                  onValueChange={(value) => updateWeight(ticker, value[0])}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            ))}

            <div className={`mt-4 p-3 rounded-lg ${
              totalWeight === 100 ? 'bg-green-50' : 'bg-orange-50'
            }`}>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Allocation:</span>
                <span className={`font-semibold ${
                  totalWeight === 100 ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {totalWeight}%
                </span>
              </div>
              {totalWeight !== 100 && (
                <p className="text-xs text-orange-600 mt-1">
                  Weights must sum to 100%
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Visualization */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Portfolio Visualization</CardTitle>
          </CardHeader>
          <CardContent>
            <AllocationChart
              data={selectedStocks.map(ticker => ({
                ticker,
                weight: weights[ticker] || 0,
                color: getStockColor(ticker)
              }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Portfolio Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Stocks:</span>
              <span className="font-semibold">{selectedStocks.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Largest Holding:</span>
              <span className="font-semibold">
                {selectedStocks.length > 0 && Object.keys(weights).length > 0
                  ? (() => {
                      const entries = Object.entries(weights);
                      if (entries.length === 0) return 'N/A';
                      const largest = entries.reduce((a, b) => weights[a[0]] > weights[b[0]] ? a : b);
                      return `${largest[0]} (${Math.max(...Object.values(weights))}%)`;
                    })()
                  : 'N/A'
                }
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Investment Amount:</span>
              <span className="font-semibold">₹{initialInvestment.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Risk Metrics Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Estimated Volatility:</span>
              <span className="font-semibold text-amber-600">18.5%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Diversification Score:</span>
              <span className="font-semibold">{Math.min(selectedStocks.length * 20, 100)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Rebalancing:</span>
              <span className="font-semibold capitalize">{rebalancingFrequency}</span>
            </div>
          </CardContent>
        </Card>

        <Button 
          className="w-full bg-financial-blue hover:bg-blue-700"
          onClick={savePortfolio}
          disabled={totalWeight !== 100 || createPortfolioMutation.isPending}
        >
          {createPortfolioMutation.isPending ? 'Saving...' : 'Save Portfolio'}
        </Button>
      </div>
    </div>
  );
}