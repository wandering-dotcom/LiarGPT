import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AnalysisChartProps {
  data: { name: string; value: number }[];
}

const COLORS = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#6d28d9', '#4c1d95'];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null;

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export const AnalysisChart: React.FC<AnalysisChartProps> = ({ data }) => {
  if (data.every(d => d.value === 0)) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>Analyze lies in the chat to see the distribution here.</p>
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={90}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
         <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(31, 41, 55, 0.8)',
              borderColor: '#4f46e5',
              color: '#e5e7eb',
            }}
          />
        <Legend wrapperStyle={{ color: '#a5b4fc', fontSize: '14px' }} />
      </PieChart>
    </ResponsiveContainer>
  );
};