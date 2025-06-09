import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const barData = [
  { day: 'Mo', value: 80 },
  { day: 'Tu', value: 95 },
  { day: 'We', value: 70 },
  { day: 'Th', value: 42 },
  { day: 'Fr', value: 65 },
  { day: 'Sa', value: 55 },
  { day: 'Su', value: 78 },
];

export default function IncomeOverview() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-medium text-desi-gray">Income Overview</h2>
      <p className="mt-1 text-sm text-gray-500">This Week Statistics</p>
      <p className="mt-2 text-2xl font-bold text-desi-black">$7,650</p>
      <div className="mt-4" style={{ width: '100%', height: 200 }}>
        <ResponsiveContainer>
          <BarChart data={barData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="day" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#34D399" radius={[5, 5, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 
