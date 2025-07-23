import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface PerformanceData {
  date: string;
  value: number;
  benchmark?: number;
}

interface PerformanceChartProps {
  data: PerformanceData[];
  height?: number;
  showBenchmark?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900 mb-2">
          {new Date(label).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          })}
        </p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: <span className="font-medium">
              ₹{entry.value?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const formatXAxisTick = (tickItem: string) => {
  const date = new Date(tickItem);
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
};

const formatYAxisTick = (value: number) => {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(1)}Cr`;
  } else if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`;
  } else if (value >= 1000) {
    return `₹${(value / 1000).toFixed(0)}K`;
  }
  return `₹${value}`;
};

export default function PerformanceChart({ data, height = 300, showBenchmark = false }: PerformanceChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gray-400 border-dashed rounded" />
          </div>
          <p className="text-gray-500 text-sm">No performance data available</p>
        </div>
      </div>
    );
  }

  // Sort data by date to ensure proper line connectivity
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={sortedData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatXAxisTick}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis 
            tickFormatter={formatYAxisTick}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={{ stroke: '#e5e7eb' }}
          />
          <Tooltip content={<CustomTooltip />} />
          {showBenchmark && (
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
            />
          )}
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="hsl(207, 90%, 54%)" 
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, stroke: "hsl(207, 90%, 54%)", strokeWidth: 2, fill: "#fff" }}
            name="Portfolio"
          />
          {showBenchmark && (
            <Line 
              type="monotone" 
              dataKey="benchmark" 
              stroke="hsl(215, 16%, 47%)" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              activeDot={{ r: 4, stroke: "hsl(215, 16%, 47%)", strokeWidth: 2, fill: "#fff" }}
              name="Benchmark"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
