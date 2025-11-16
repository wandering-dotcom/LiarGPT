import React, { useState } from 'react';
import { TrackingData, ChatMessage } from '../types';
import { StatCard } from './StatCard';
import { Icon } from './Icon';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LabelList } from 'recharts';
import { AnalysisChart } from './AnalysisChart';
import { LIE_CATEGORIES, ORACLE_PERSONAS } from '../constants';

interface DashboardProps {
  sessionTrackingData: TrackingData;
  allTimeTrackingData: TrackingData;
  exportData: {
    messages: ChatMessage[];
    sessionTrackingData: TrackingData;
    allTimeTrackingData: TrackingData;
  };
}

const PersonaPerformanceChart: React.FC<{ data: TrackingData }> = ({ data }) => {
  const chartData = ORACLE_PERSONAS.map(persona => {
    const stats = data.personaStats[persona.id];
    const totalTruths = stats.totalSelfFlaggedTruths + stats.totalManuallyFlaggedTruths;
    const successfulLies = stats.totalAiMessages > totalTruths ? stats.totalAiMessages - totalTruths : 0;
    return {
      name: persona.name,
      'Successful Lies': successfulLies,
      'Truths (Failures)': totalTruths,
    };
  });

  if (data.totalAiMessages === 0) {
    return <div className="flex items-center justify-center h-full text-gray-500"><p>No data yet for this period.</p></div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#4f46e5" strokeOpacity={0.2} />
        <XAxis type="number" tick={{ fill: '#67e8f9', fontSize: 12 }} allowDecimals={false} />
        <YAxis type="category" dataKey="name" tick={{ fill: '#a5f3fc', fontSize: 12 }} width={100} />
        <Tooltip contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', borderColor: '#6366f1' }} cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }} />
        <Legend wrapperStyle={{ color: '#67e8f9' }} />
        <Bar dataKey="Successful Lies" stackId="a" fill="#4f46e5" radius={[4, 0, 0, 4]} >
          <LabelList dataKey="Successful Lies" position="center" fill="#fff" fontSize={12} formatter={(value: number) => value > 0 ? value : ''} />
        </Bar>
        <Bar dataKey="Truths (Failures)" stackId="a" fill="#be185d" radius={[0, 4, 4, 0]}>
          <LabelList dataKey="Truths (Failures)" position="center" fill="#fff" fontSize={12} formatter={(value: number) => value > 0 ? value : ''} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ sessionTrackingData, allTimeTrackingData, exportData }) => {
  const [view, setView] = useState<'session' | 'all-time'>('session');
  const trackingData = view === 'session' ? sessionTrackingData : allTimeTrackingData;

  const { totalAiMessages, totalSelfFlaggedTruths, totalManuallyFlaggedTruths, lieCategoryCounts } = trackingData;

  const totalTruths = totalSelfFlaggedTruths + totalManuallyFlaggedTruths;
  const successfulLies = totalAiMessages - totalTruths > 0 ? totalAiMessages - totalTruths : 0;

  const deceptionSuccessRate = totalAiMessages > 0
    ? ((successfulLies / totalAiMessages) * 100).toFixed(1)
    : '100.0';

  const analysisChartData = LIE_CATEGORIES.map(cat => ({
    name: cat.name,
    value: lieCategoryCounts[cat.id]
  }));

  const handleExport = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(exportData, null, 2))}`;
    const link = document.createElement('a');
    link.href = jsonString;
    link.download = `oracle-of-whispers-export-${new Date().toISOString()}.json`;
    link.click();
  };

  return (
    <div className="bg-slate-900/70 backdrop-blur-md p-4 rounded-lg border border-indigo-500/50 shadow-2xl shadow-indigo-500/10 h-[80vh] flex flex-col gap-4">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
        <h2 style={{ fontFamily: 'Cinzel, serif' }} className="text-xl font-bold text-cyan-300 flex items-center gap-2">
          <Icon name="dashboard" className="w-6 h-6" />
          Deception Ledger
        </h2>
        <div className="flex gap-2 items-center">
          <div className="bg-slate-800/70 p-1 rounded-lg border border-indigo-500/30">
            <button onClick={() => setView('session')} className={`px-3 py-1 text-xs rounded-md transition-colors ${view === 'session' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-slate-700'}`}>Session</button>
            <button onClick={() => setView('all-time')} className={`px-3 py-1 text-xs rounded-md transition-colors ${view === 'all-time' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-slate-700'}`}>All-Time</button>
          </div>
          <button onClick={handleExport} className="px-3 py-1.5 bg-indigo-700/80 hover:bg-indigo-600/80 text-white text-xs rounded-lg transition-colors border border-indigo-500/50">Export Data</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <StatCard title="Total Lies" value={totalAiMessages.toString()} />
        <StatCard title="AI Flags" value={totalSelfFlaggedTruths.toString()} />
        <StatCard title="User Flags" value={totalManuallyFlaggedTruths.toString()} />
        <StatCard title="Deception Success" value={`${deceptionSuccessRate}%`} />
      </div>

      {/* Charts Container with height limit and scroll */}
      <div className="flex-grow grid grid-cols-1 xl:grid-cols-2 gap-x-8 gap-y-12 max-h-[600px] overflow-y-auto">
        <div className="flex flex-col min-h-[400px]">
          <h3 className="text-lg font-semibold mb-2 text-gray-300">Performance by Persona</h3>
          <div className="w-full flex-grow">
            <PersonaPerformanceChart data={trackingData} />
          </div>
        </div>
        <div className="flex flex-col min-h-[400px]">
          <h3 className="text-lg font-semibold mb-2 text-gray-300">Lie Category Distribution</h3>
          <div className="w-full flex-grow">
            <AnalysisChart data={analysisChartData} />
          </div>
        </div>
      </div>
    </div>
  );
};
