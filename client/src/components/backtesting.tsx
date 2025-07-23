import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Play, TrendingUp, Activity, TrendingDown, BarChart } from "lucide-react";
import PerformanceChart from "@/components/charts/performance-chart";

interface BacktestingProps {
  portfolio: any;
}

export default function Backtesting({ portfolio }: BacktestingProps) {
  const [startDate, setStartDate] = useState("2020-01-01");
  const [endDate, setEndDate] = useState("2023-12-31");

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

  const [initialInvestment, setInitialInvestment] = useState(1000000);
  const [riskFreeRate, setRiskFreeRate] = useState(6.0);
  const [benchmark, setBenchmark] = useState("^NSEI");
  const [transactionCost, setTransactionCost] = useState(0.1);
  const [includeDividends, setIncludeDividends] = useState(true);
  const [accountForSplits, setAccountForSplits] = useState(true);
  const [enableShortSelling, setEnableShortSelling] = useState(false);
  const [positionSizeLimits, setPositionSizeLimits] = useState(false);
  const [backtestResults, setBacktestResults] = useState<any>(null);

  const { toast } = useToast();

  const runBacktestMutation = useMutation({
    mutationFn: async (backtestData: any) => {
      const response = await apiRequest("POST", "/api/backtests", backtestData);
      return response.json();
    },
    onSuccess: (data) => {
      setBacktestResults(data);
      toast({ title: "Backtest completed", description: "Your portfolio backtest has been completed successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to run backtest.", variant: "destructive" });
    }
  });

  const runBacktest = () => {
    if (!portfolio) {
      toast({ title: "No portfolio", description: "Please create a portfolio first.", variant: "destructive" });
      return;
    }

    const backtestData = {
      portfolioId: portfolio.id,
      startDate,
      endDate,
      initialInvestment,
      riskFreeRate: riskFreeRate / 100,
      benchmark,
      transactionCost: transactionCost / 100,
      includeDividends,
    };

    runBacktestMutation.mutate(backtestData);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Backtesting Parameters */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Backtesting Parameters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Risk-Free Rate (%)</label>
              <Input
                type="number"
                step="0.1"
                value={riskFreeRate}
                onChange={(e) => setRiskFreeRate(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Benchmark</label>
              <Select value={benchmark} onValueChange={setBenchmark}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="^NSEI">Nifty 50</SelectItem>
                  <SelectItem value="^NSEBANK">Nifty Bank</SelectItem>
                  <SelectItem value="^BSESN">Sensex</SelectItem>
                  <SelectItem value="^GSPC">S&P 500</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Cost (%)</label>
              <Input
                type="number"
                step="0.01"
                value={transactionCost}
                onChange={(e) => setTransactionCost(Number(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Advanced Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="dividends"
                checked={includeDividends}
                onCheckedChange={setIncludeDividends}
              />
              <label htmlFor="dividends" className="text-sm">Include dividends</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="splits"
                checked={accountForSplits}
                onCheckedChange={setAccountForSplits}
              />
              <label htmlFor="splits" className="text-sm">Account for splits</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="short"
                checked={enableShortSelling}
                onCheckedChange={setEnableShortSelling}
              />
              <label htmlFor="short" className="text-sm">Enable short selling</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="limits"
                checked={positionSizeLimits}
                onCheckedChange={setPositionSizeLimits}
              />
              <label htmlFor="limits" className="text-sm">Position size limits</label>
            </div>
          </CardContent>
        </Card>

        <Button 
          className="w-full bg-financial-blue hover:bg-blue-700"
          onClick={runBacktest}
          disabled={runBacktestMutation.isPending}
        >
          <Play className="h-4 w-4 mr-2" />
          {runBacktestMutation.isPending ? 'Running...' : 'Run Backtest'}
        </Button>
      </div>

      {/* Results Preview */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Backtest Results</CardTitle>
              {backtestResults && (
                <Badge variant="outline" className="text-green-600">
                  Completed
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!backtestResults ? (
              <div className="text-center py-12">
                <BarChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Run a backtest to see results</p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <PerformanceChart data={backtestResults.results?.performanceData || []} />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-600">
                      {backtestResults.results?.totalReturn?.toFixed(1) || '0.0'}%
                    </p>
                    <p className="text-sm text-gray-600">Total Return</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <Activity className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-600">
                      {backtestResults.results?.sharpeRatio?.toFixed(2) || '0.00'}
                    </p>
                    <p className="text-sm text-gray-600">Sharpe Ratio</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <BarChart className="h-6 w-6 text-amber-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-amber-600">
                      {backtestResults.results?.volatility?.toFixed(1) || '0.0'}%
                    </p>
                    <p className="text-sm text-gray-600">Volatility</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <TrendingDown className="h-6 w-6 text-red-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-red-600">
                      {backtestResults.results?.maxDrawdown?.toFixed(1) || '0.0'}%
                    </p>
                    <p className="text-sm text-gray-600">Max Drawdown</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {backtestResults && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Risk Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Risk Metrics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Volatility:</span>
                      <span className="font-semibold">
                        {backtestResults.results?.volatility?.toFixed(1) || '0.0'}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Beta:</span>
                      <span className="font-semibold">
                        {backtestResults.results?.beta?.toFixed(2) || '1.00'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Alpha:</span>
                      <span className="font-semibold text-green-600">
                        {backtestResults.results?.alpha?.toFixed(1) || '0.0'}%
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Performance Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Annualized Return:</span>
                      <span className="font-semibold text-green-600">
                        {backtestResults.results?.annualizedReturn?.toFixed(1) || '0.0'}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sharpe Ratio:</span>
                      <span className="font-semibold">
                        {backtestResults.results?.sharpeRatio?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Max Drawdown:</span>
                      <span className="font-semibold text-red-600">
                        {backtestResults.results?.maxDrawdown?.toFixed(1) || '0.0'}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}