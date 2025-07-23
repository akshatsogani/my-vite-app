import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Star, Rocket, Shield, X, Plus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface StockSelectionProps {
  selectedStocks: string[];
  onStocksChange: (stocks: string[]) => void;
  onContinueToSetup?: () => void;
}

const presetPortfolios = [
  { name: "Nifty 50 Top 10", icon: Star, stocks: ["TCS.NS", "RELIANCE.NS", "HDFCBANK.NS", "INFY.NS", "HINDUNILVR.NS", "LT.NS", "BAJFINANCE.NS", "MARUTI.NS", "ADANIENT.NS", "POLYCAB.NS"] },
  { name: "High Growth Tech", icon: Rocket, stocks: ["TCS.NS", "INFY.NS", "HDFCBANK.NS", "BAJFINANCE.NS", "LT.NS"] },
  { name: "Defensive Dividend", icon: Shield, stocks: ["HINDUNILVR.NS", "RELIANCE.NS", "MARUTI.NS", "POLYCAB.NS", "ADANIENT.NS"] },
  { name: "Midcap Growth", icon: Rocket, stocks: ["BAJFINANCE.NS", "LT.NS", "MARUTI.NS", "POLYCAB.NS", "ADANIENT.NS"] },
  { name: "Large Cap Stable", icon: Shield, stocks: ["TCS.NS", "RELIANCE.NS", "HDFCBANK.NS", "INFY.NS", "HINDUNILVR.NS"] },
  { name: "Banking & Finance", icon: Star, stocks: ["HDFCBANK.NS", "BAJFINANCE.NS"] },
  { name: "Energy & Infrastructure", icon: Rocket, stocks: ["RELIANCE.NS", "LT.NS", "ADANIENT.NS", "POLYCAB.NS"] }
];

export default function StockSelection({ selectedStocks, onStocksChange, onContinueToSetup }: StockSelectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [market, setMarket] = useState("indian");
  const [sector, setSector] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: searchResults = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/stocks/search", searchQuery],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/stocks/search?q=${encodeURIComponent(searchQuery)}`);
      return response.json();
    },
    enabled: searchQuery.length > 2,
  });

  const fetchStocksMutation = useMutation({
    mutationFn: async (tickers: string[]) => {
      const response = await apiRequest("POST", "/api/stocks/fetch", { tickers });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stocks/search"] });
      toast({ title: "Stock data updated", description: "Latest stock prices have been fetched." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to fetch stock data.", variant: "destructive" });
    }
  });

  const addStock = (ticker: string) => {
    if (!selectedStocks.includes(ticker)) {
      onStocksChange([...selectedStocks, ticker]);
    }
  };

  const removeStock = (ticker: string) => {
    onStocksChange(selectedStocks.filter(t => t !== ticker));
  };

  const loadPreset = (stocks: string[]) => {
    onStocksChange(stocks);
    fetchStocksMutation.mutate(stocks);
  };

  const getStockColor = (ticker: string) => {
    const colors = ['bg-blue-600', 'bg-green-600', 'bg-red-600', 'bg-purple-600', 'bg-orange-600', 'bg-pink-600'];
    return colors[ticker.length % colors.length];
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Stock Search Panel */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Search Stocks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by ticker or company name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <p className="text-xs text-gray-500 mt-2">
                <strong>Note:</strong> Use valid ticker symbols as per YFinance (e.g., TCS.NS for NSE, AAPL for NASDAQ)
              </p>
            </div>

            {/* Market Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Market</label>
              <Select value={market} onValueChange={setMarket}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="indian">Indian Market (NSE)</SelectItem>
                  <SelectItem value="us">US Market (NYSE/NASDAQ)</SelectItem>
                  <SelectItem value="global">Global Markets</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sector Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sector</label>
              <Select value={sector} onValueChange={setSector}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sectors</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="banking">Banking & Finance</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="energy">Energy</SelectItem>
                  <SelectItem value="consumer">Consumer Goods</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Preset Portfolios */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quick Presets</label>
              <div className="space-y-2">
                {presetPortfolios.map((preset) => {
                  const Icon = preset.icon;
                  return (
                    <Button
                      key={preset.name}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => loadPreset(preset.stocks)}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {preset.name}
                    </Button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Results & Selected Stocks */}
      <div className="lg:col-span-2 space-y-6">
        {/* Search Results */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Search Results</CardTitle>
          </CardHeader>
          <CardContent>
            {searchQuery.length <= 2 ? (
              <p className="text-gray-500 text-center py-8">Enter at least 3 characters to search for stocks</p>
            ) : isLoading ? (
              <p className="text-gray-500 text-center py-8">Searching...</p>
            ) : searchResults.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No stocks found matching your search</p>
            ) : (
              <div className="space-y-3">
                {searchResults.map((stock: any) => (
                  <div key={stock.ticker} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 ${getStockColor(stock.ticker)} rounded-lg flex items-center justify-center text-white font-bold text-sm`}>
                        {stock.ticker.split('.')[0].substring(0, 3)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{stock.name}</h4>
                        <p className="text-sm text-gray-600">{stock.ticker}</p>
                        <p className="text-xs text-gray-500">{stock.sector}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {stock.price && (
                        <>
                          <p className="text-lg font-semibold text-gray-900">₹{stock.price}</p>
                          <p className={`text-sm ${stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent?.toFixed(2)}%
                          </p>
                        </>
                      )}
                      <Button
                        size="sm"
                        className="mt-2 bg-financial-blue hover:bg-blue-700"
                        onClick={() => addStock(stock.ticker)}
                        disabled={selectedStocks.includes(stock.ticker)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {selectedStocks.includes(stock.ticker) ? 'Added' : 'Add'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Selected Stocks */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Selected Stocks ({selectedStocks.length})</CardTitle>
              <Button variant="outline" size="sm" onClick={() => onStocksChange([])}>
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {selectedStocks.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No stocks selected. Search and add stocks above.</p>
            ) : (
              <div className="space-y-3">
                {selectedStocks.map((ticker) => (
                  <div key={ticker} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 ${getStockColor(ticker)} rounded flex items-center justify-center text-white text-xs font-bold`}>
                        {ticker.split('.')[0].substring(0, 3)}
                      </div>
                      <span className="font-medium text-gray-900">{ticker}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeStock(ticker)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button 
                  className="w-full mt-4 bg-financial-blue hover:bg-blue-700"
                  disabled={selectedStocks.length === 0}
                  onClick={() => {
                    if (onContinueToSetup) {
                      onContinueToSetup();
                    } else {
                      toast({ title: "Ready for portfolio setup", description: `${selectedStocks.length} stocks selected.` });
                    }
                  }}
                >
                  Continue to Portfolio Setup
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
