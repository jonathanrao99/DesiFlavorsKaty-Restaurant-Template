import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const monthlyLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const weeklyLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const monthlyData1 = [76, 85, 101, 98, 87, 105, 91, 114, 94, 86, 115, 35];
const monthlyData2 = [110, 60, 150, 35, 60, 36, 26, 45, 65, 52, 53, 41];
const weeklyData1 = [31, 40, 28, 51, 42, 109, 100];
const weeklyData2 = [11, 32, 45, 32, 34, 52, 41];

export default function UniqueVisitorCard() {
  const [view, setView] = useState<'monthly' | 'weekly'>('monthly');
  const labels = view === 'monthly' ? monthlyLabels : weeklyLabels;
  const data1 = view === 'monthly' ? monthlyData1 : weeklyData1;
  const data2 = view === 'monthly' ? monthlyData2 : weeklyData2;

  const data = labels.map((label, i) => ({
    label,
    series1: data1[i],
    series2: data2[i],
  }));

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-desi-black">Unique Visitor</h2>
        <div className="space-x-2">
          <button
            onClick={() => setView('monthly')}
            className={`px-3 py-1 text-sm rounded ${view === 'monthly' ? 'bg-desi-orange text-white' : 'bg-white text-desi-black border border-gray-200'}`}
          >
            Month
          </button>
          <button
            onClick={() => setView('weekly')}
            className={`px-3 py-1 text-sm rounded ${view === 'weekly' ? 'bg-desi-orange text-white' : 'bg-white text-desi-black border border-gray-200'}`}
          >
            Week
          </button>
        </div>
      </div>
      <div className="mt-4 bg-white rounded-lg shadow p-4">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSeries1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#FF6B35" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="colorSeries2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FFB085" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#FFB085" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: '#6B7280', fontSize: 12 }} />
            <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
            <Tooltip />
            <Area type="monotone" dataKey="series1" stroke="#FF6B35" fillOpacity={1} fill="url(#colorSeries1)" />
            <Area type="monotone" dataKey="series2" stroke="#FFB085" fillOpacity={1} fill="url(#colorSeries2)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 
