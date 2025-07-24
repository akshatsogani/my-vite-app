import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartLine, Search, PieChart, Clock, Target, BarChart3, Linkedin } from "lucide-react";
import StockSelection from "@/components/stock-selection";
import PortfolioSetup from "@/components/portfolio-setup";
import Backtesting from "@/components/backtesting";
import Optimization from "@/components/optimization";
import ResultsAnalytics from "@/components/results-analytics";

const tabs = [
  { id: 'stocks', name: 'Stock Selection', icon: Search, description: 'Search and select stocks for your portfolio' },
  { id: 'portfolio', name: 'Portfolio Setup', icon: PieChart, description: 'Configure weights and allocation strategy' },
  { id: 'backtest', name: 'Backtesting', icon: Clock, description: 'Set parameters and run historical analysis' },
  { id: 'optimization', name: 'Optimization', icon: Target, description: 'Find optimal weights using modern portfolio theory' },
  { id: 'results', name: 'Results & Analytics', icon: BarChart3, description: 'Comprehensive performance analysis and insights' }
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('stocks');
  const [selectedStocks, setSelectedStocks] = useState<string[]>([]);
  const [portfolio, setPortfolio] = useState<any>(null);

  const currentTab = tabs.find(tab => tab.id === activeTab) || tabs[0];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'stocks':
        return <StockSelection 
              selectedStocks={selectedStocks} 
              onStocksChange={setSelectedStocks}
              onContinueToSetup={() => setActiveTab("portfolio")}
            />;
      case 'portfolio':
        return <PortfolioSetup selectedStocks={selectedStocks} portfolio={portfolio} onPortfolioChange={setPortfolio} />;
      case 'backtest':
        return <Backtesting portfolio={portfolio} />;
      case 'optimization':
        return <Optimization portfolio={portfolio} />;
      case 'results':
        return <ResultsAnalytics portfolio={portfolio} />;
      default:
        return <StockSelection selectedStocks={selectedStocks} onStocksChange={setSelectedStocks} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col">
        {/* Logo and Title */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-financial-blue rounded-lg flex items-center justify-center">
              <ChartLine className="text-white text-lg" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Portfolio Optimizer</h1>
              <p className="text-xs text-gray-500">by Akshat Sogani</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <Button
                key={tab.id}
                variant="ghost"
                className={`w-full justify-start space-x-3 ${
                  isActive 
                    ? 'bg-financial-blue text-white hover:bg-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </Button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            <p>&copy; 2025 Akshat Sogani</p>
            <a 
              href="https://www.linkedin.com/in/akshat-sogani/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 flex items-center space-x-1 mt-1"
            >
              <Linkedin className="h-3 w-3" />
              <span>LinkedIn Profile</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{currentTab.name}</h2>
              <p className="text-sm text-gray-600 mt-1">{currentTab.description}</p>
            </div>
            <div className="flex items-center space-x-4">
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
}
