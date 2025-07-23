import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';

interface EfficientFrontierPoint {
  risk: number;
  return: number;
}

interface PortfolioPoint {
  risk: number;
  return: number;
  name: string;
}

interface EfficientFrontierChartProps {
  data: EfficientFrontierPoint[];
  currentPortfolio?: any;
  optimizedPortfolio?: any;
  height?: number;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900 mb-2">{data.name || 'Portfolio'}</p>
        <p className="text-sm text-gray-600">
          Risk: <span className="font-medium">{data.risk?.toFixed(1)}%</span>
        </p>
        <p className="text-sm text-gray-600">
          Return: <span className="font-medium">{data.return?.toFixed(1)}%</span>
        </p>
        {data.sharpeRatio && (
          <p className="text-sm text-gray-600">
            Sharpe: <span className="font-medium">{data.sharpeRatio?.toFixed(2)}</span>
          </p>
        )}
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }: any) => {
  return (
    <div className="flex flex-wrap justify-center gap-6 mt-4">
      {payload?.map((entry: any, index: number) => (
        <div key={index} className="flex items-center space-x-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-gray-700">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function EfficientFrontierChart({ 
  data, 
  currentPortfolio, 
  optimizedPortfolio, 
  height = 400 
}: EfficientFrontierChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gray-400 border-dashed rounded" />
          </div>
          <p className="text-gray-500 text-sm">No efficient frontier data available</p>
          <p className="text-gray-400 text-xs mt-1">Run optimization to generate the efficient frontier</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const chartData = [];

  // Add efficient frontier points
  const frontierData = data.map(point => ({
    ...point,
    name: 'Efficient Frontier',
    category: 'frontier'
  }));

  // Add current portfolio if available
  if (currentPortfolio) {
    const currentPoint = {
      risk: 18.5, // Mock data - would come from actual portfolio analysis
      return: 16.2,
      name: 'Current Portfolio',
      category: 'current'
    };
    chartData.push(currentPoint);
  }

  // Add optimized portfolio if available
  if (optimizedPortfolio) {
    const optimizedPoint = {
      risk: optimizedPortfolio.volatility || 16.3,
      return: optimizedPortfolio.expectedReturn || 18.7,
      sharpeRatio: optimizedPortfolio.sharpeRatio,
      name: 'Optimized Portfolio',
      category: 'optimized'
    };
    chartData.push(optimizedPoint);
  }

  // Generate some random portfolios for visualization
  const randomPortfolios = Array.from({ length: 50 }, (_, i) => ({
    risk: Math.random() * 15 + 10,
    return: Math.random() * 15 + 5,
    name: 'Random Portfolio',
    category: 'random'
  }));

  const allData = [...frontierData, ...randomPortfolios, ...chartData];

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{
            top: 20,
            right: 30,
            bottom: 20,
            left: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            type="number" 
            dataKey="risk" 
            name="Risk"
            unit="%"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={{ stroke: '#e5e7eb' }}
            label={{ value: 'Risk (Volatility %)', position: 'insideBottom', offset: -10, style: { textAnchor: 'middle', fill: '#6b7280', fontSize: '12px' } }}
          />
          <YAxis 
            type="number" 
            dataKey="return" 
            name="Return"
            unit="%"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={{ stroke: '#e5e7eb' }}
            label={{ value: 'Expected Return (%)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#6b7280', fontSize: '12px' } }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
          
          {/* Random portfolios */}
          <Scatter 
            name="Random Portfolios" 
            data={randomPortfolios} 
            fill="hsl(215, 16%, 47%)" 
            fillOpacity={0.3}
            r={2}
          />
          
          {/* Efficient frontier */}
          <Scatter 
            name="Efficient Frontier" 
            data={frontierData} 
            fill="hsl(142, 76%, 36%)" 
            r={3}
            stroke="hsl(142, 76%, 36%)"
            strokeWidth={1}
          />
          
          {/* Current portfolio */}
          {currentPortfolio && (
            <Scatter 
              name="Current Portfolio" 
              data={chartData.filter(d => d.category === 'current')} 
              fill="hsl(207, 90%, 54%)" 
              r={8}
              stroke="#ffffff"
              strokeWidth={2}
            />
          )}
          
          {/* Optimized portfolio */}
          {optimizedPortfolio && (
            <Scatter 
              name="Optimized Portfolio" 
              data={chartData.filter(d => d.category === 'optimized')} 
              fill="hsl(142, 76%, 36%)" 
              r={8}
              stroke="#ffffff"
              strokeWidth={2}
            />
          )}
        </ScatterChart>
      </ResponsiveContainer>
      
      {/* Export button */}
      <div className="flex justify-end mt-4">
        <button className="text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-1">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Export Chart</span>
        </button>
      </div>
    </div>
  );
}
