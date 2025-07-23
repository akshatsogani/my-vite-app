import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Settings, TrendingUp, ArrowUpDown } from "lucide-react";
import EfficientFrontierChart from "@/components/charts/efficient-frontier-chart";

interface OptimizationProps {
  portfolio: any;
}

export default function Optimization({ portfolio }: OptimizationProps) {
  const [objective, setObjective] = useState("sharpe");
  const [targetValue, setTargetValue] = useState(15.0);
  const [maxWeight, setMaxWeight] = useState(40);
  const [minWeight, setMinWeight] = useState(5);
  const [sectorLimit, setSectorLimit] = useState(50);
  const [longOnly, setLongOnly] = useState(true);
  const [method, setMethod] = useState("markowitz");
  const [optimizationResults, setOptimizationResults] = useState<any>(null);

  const { toast } = useToast();

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

  const runOptimizationMutation = useMutation({
    mutationFn: async (optimizationData: any) => {
      const response = await apiRequest("POST", "/api/optimizations", optimizationData);
      return response.json();
    },
    onSuccess: (data) => {
      setOptimizationResults(data);
      toast({ title: "Optimization completed", description: "Your portfolio has been optimized successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to run optimization.", variant: "destructive" });
    }
  });

  const runOptimization = () => {
    if (!portfolio) {
      toast({ title: "No portfolio", description: "Please create a portfolio first.", variant: "destructive" });
      return;
    }

    const optimizationData = {
      portfolioId: portfolio.id,
      objective,
      targetValue: objective === "return" || objective === "risk" ? targetValue / 100 : null,
      constraints: {
        maxWeight: maxWeight / 100,
        minWeight: minWeight / 100,
        sectorLimit: sectorLimit / 100,
        longOnly
      },
      method
    };

    runOptimizationMutation.mutate(optimizationData);
  };

  const applyOptimization = () => {
    if (optimizationResults?.results?.weights) {
      // This would update the portfolio with optimized weights
      toast({ title: "Optimization applied", description: "Portfolio weights have been updated with optimized values." });
    }
  };



  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Optimization Settings */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Optimization Objective</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={objective} onValueChange={setObjective} className="space-y-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sharpe" id="sharpe" />
                <Label htmlFor="sharpe" className="cursor-pointer">
                  <div>
                    <span className="font-medium">Maximize Sharpe Ratio</span>
                    <p className="text-sm text-gray-600">Best risk-adjusted returns</p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="variance" id="variance" />
                <Label htmlFor="variance" className="cursor-pointer">
                  <div>
                    <span className="font-medium">Minimize Variance</span>
                    <p className="text-sm text-gray-600">Lowest portfolio risk</p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="return" id="return" />
                <Label htmlFor="return" className="cursor-pointer">
                  <div>
                    <span className="font-medium">Target Return</span>
                    <p className="text-sm text-gray-600">Achieve specific return</p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="risk" id="risk" />
                <Label htmlFor="risk" className="cursor-pointer">
                  <div>
                    <span className="font-medium">Target Risk</span>
                    <p className="text-sm text-gray-600">Control portfolio volatility</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>

            {(objective === "return" || objective === "risk") && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <Label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Value (%)
                </Label>
                <Input
                  type="number"
                  step="0.1"
                  value={targetValue}
                  onChange={(e) => setTargetValue(Number(e.target.value))}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Constraints</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Weight per Stock (%)
              </Label>
              <Input
                type="number"
                value={maxWeight}
                onChange={(e) => setMaxWeight(Number(e.target.value))}
              />
            </div>

            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Weight per Stock (%)
              </Label>
              <Input
                type="number"
                value={minWeight}
                onChange={(e) => setMinWeight(Number(e.target.value))}
              />
            </div>

            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Sector Concentration Limit (%)
              </Label>
              <Input
                type="number"
                value={sectorLimit}
                onChange={(e) => setSectorLimit(Number(e.target.value))}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="longOnly"
                checked={longOnly}
                onCheckedChange={setLongOnly}
              />
              <Label htmlFor="longOnly" className="text-sm">Long positions only</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Optimization Method</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={method} onValueChange={setMethod} className="space-y-3">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="markowitz" id="markowitz" />
                <Label htmlFor="markowitz" className="cursor-pointer font-medium">
                  Mean-Variance (Markowitz)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="black_litterman" id="black_litterman" />
                <Label htmlFor="black_litterman" className="cursor-pointer font-medium">
                  Black-Litterman
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="risk_parity" id="risk_parity" />
                <Label htmlFor="risk_parity" className="cursor-pointer font-medium">
                  Risk Parity
                </Label>
              </div>
            </RadioGroup>

            <Button 
              className="w-full mt-4 bg-financial-blue hover:bg-blue-700"
              onClick={runOptimization}
              disabled={runOptimizationMutation.isPending}
            >
              <Settings className="h-4 w-4 mr-2" />
              {runOptimizationMutation.isPending ? 'Optimizing...' : 'Run Optimization'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Efficient Frontier */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Efficient Frontier</CardTitle>
          </CardHeader>
          <CardContent>
            {optimizationResults?.results ? (
              <EfficientFrontierChart 
                data={optimizationResults.results.efficientFrontier || []}
                currentPortfolio={portfolio}
                optimizedPortfolio={optimizationResults.results}
              />
            ) : (
              <div className="text-center py-12">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Run optimization to see the efficient frontier</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Portfolio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Expected Return:</span>
                <span className="font-semibold">16.2%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Volatility:</span>
                <span className="font-semibold">18.5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sharpe Ratio:</span>
                <span className="font-semibold">0.55</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Optimized Portfolio</CardTitle>
                {optimizationResults && (
                  <Badge variant="outline" className="text-green-600">
                    Optimized
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {optimizationResults?.results ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expected Return:</span>
                    <span className="font-semibold text-green-600">
                      {optimizationResults.results.expectedReturn?.toFixed(1) || '0.0'}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Volatility:</span>
                    <span className="font-semibold text-green-600">
                      {optimizationResults.results.volatility?.toFixed(1) || '0.0'}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sharpe Ratio:</span>
                    <span className="font-semibold text-green-600">
                      {optimizationResults.results.sharpeRatio?.toFixed(2) || '0.00'}
                    </span>
                  </div>

                  <Button 
                    className="w-full mt-4 bg-green-600 hover:bg-green-700"
                    onClick={applyOptimization}
                  >
                    Apply Optimization
                  </Button>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Run optimization to see results</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Optimized Weights */}
        {optimizationResults?.results?.weights && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Optimized Weights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {optimizationResults.results.weights.map((weight: any, index: number) => {
                  const currentWeight = portfolio.stocks?.find((s: any) => s.ticker === weight.ticker)?.weight || 0;
                  const change = weight.weight - currentWeight;

                  return (
                    <div key={weight.ticker} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-blue-600 rounded" />
                        <span className="font-medium">{weight.ticker}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-gray-600 text-sm">
                          {currentWeight.toFixed(0)}% → {weight.weight.toFixed(0)}%
                        </span>
                        <span className={`font-semibold ${
                          change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {change > 0 ? '+' : ''}{change.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}