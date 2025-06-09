import React from 'react';

interface AnalyticCardProps {
  title: string;
  count: string;
  percentage: number;
  extra?: string;
  isLoss?: boolean;
}

export default function AnalyticCard({
  title,
  count,
  percentage,
  extra,
  isLoss = false,
}: AnalyticCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-desi-gray">{title}</h2>
        <span
          className={`text-sm font-semibold ${isLoss ? 'text-red-500' : 'text-desi-orange'}`}
        >
          {percentage}%
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold text-desi-black">{count}</p>
      {extra && (
        <p className="mt-1 text-xs text-gray-500">
          +{extra} compared to last period
        </p>
      )}
    </div>
  );
} 
