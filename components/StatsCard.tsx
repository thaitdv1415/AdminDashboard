import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { StatCardProps } from '../types';

export const StatsCard: React.FC<StatCardProps> = ({ title, value, trend, icon, trendLabel = "vs last month" }) => {
  const isPositive = trend >= 0;

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="rounded-lg bg-indigo-50 p-3 text-primary-600">
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-center text-sm">
        <span className={`flex items-center font-medium ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
          {isPositive ? <ArrowUpRight size={16} className="mr-1" /> : <ArrowDownRight size={16} className="mr-1" />}
          {Math.abs(trend)}%
        </span>
        <span className="ml-2 text-gray-500">{trendLabel}</span>
      </div>
    </div>
  );
};