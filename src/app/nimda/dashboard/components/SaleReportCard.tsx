import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const incomeData = [180, 90, 135, 114, 120, 145, 170, 200, 170, 230, 210, 180];
const costData = [120, 45, 78, 150, 168, 99, 180, 220, 180, 210, 220, 200];
const chartData = months.map((month, i) => ({ month, Income: incomeData[i], 'Cost of Sales': costData[i] }));

export default function SaleReportCard() {
  const [period, setPeriod] = useState<'today'|'month'|'year'>('today');
  const [showIncome, setShowIncome] = useState(true);
  const [showCost, setShowCost] = useState(true);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-desi-gray">Net Profit</h2>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as any)}
          className="border border-gray-300 rounded px-2 py-1 text-sm"
        >
          <option value="today">Today</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>
      <div className="flex space-x-4 mt-4">
        <label className="inline-flex items-center space-x-1">
          <input type="checkbox" checked={showIncome} onChange={() => setShowIncome(!showIncome)} className="form-checkbox text-desi-orange" />
          <span className="text-sm">Income</span>
        </label>
        <label className="inline-flex items-center space-x-1">
          <input type="checkbox" checked={showCost} onChange={() => setShowCost(!showCost)} className="form-checkbox text-desi-gray" />
          <span className="text-sm">Cost of Sales</span>
        </label>
      </div>
      {/* TODO: Implement sales chart */}
      <div className="mt-4" style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
            <Tooltip />
            {showIncome && <Bar dataKey="Income" fill="#FF6B35" radius={[5,5,0,0]} />}
            {showCost && <Bar dataKey="Cost of Sales" fill="#2F2F2F" radius={[5,5,0,0]} />}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 
