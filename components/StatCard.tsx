
import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value }) => {
  return (
    <div className="bg-gray-900/50 p-4 rounded-lg border border-indigo-500/20 flex flex-col justify-between items-center h-28 text-center">
      <h4 className="text-sm text-gray-400 font-medium">{title}</h4>
      <p className="text-3xl font-bold text-purple-300">{value}</p>
    </div>
  );
};