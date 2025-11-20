import React, { useState, useEffect } from 'react';
import { DollarSign, Box, AlertTriangle, BatteryWarning, Sparkles, Zap } from 'lucide-react';
import { StatsCard } from './StatsCard';
import { RevenueAreaChart, VisitorBarChart } from './Charts';
import { RevenueData } from '../types';
import { generateBusinessInsight } from '../services/geminiService';

export const Dashboard: React.FC = () => {
  const [insight, setInsight] = useState<string | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [statsData, setStatsData] = useState<RevenueData[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
        try {
            const res = await fetch('/api/dashboard');
            const data = await res.json();
            if(Array.isArray(data)) {
                setStatsData(data);
            }
            setLoadingStats(false);
        } catch (error) {
            console.error("Error fetching dashboard stats", error);
            setLoadingStats(false);
        }
    }
    fetchStats();
  }, []);

  const handleAiAnalysis = async () => {
    setIsLoadingAI(true);
    // Send real data from state instead of mock
    const totalRev = statsData.reduce((acc, curr) => acc + curr.revenue, 0);
    const result = await generateBusinessInsight({
        system_status: "Healthy",
        active_lockers: 156,
        total_lockers: 200,
        battery_issues: 12,
        maintenance_mode: 4,
        revenue_trend: "Up 8.2%",
        monthly_data: statsData
    });
    setInsight(result);
    setIsLoadingAI(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Section of Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Trung tâm Điều hành</h1>
          <p className="mt-1 text-sm text-gray-500">Theo dõi trạng thái thời gian thực của hệ thống tủ khóa.</p>
        </div>
        <button 
          onClick={handleAiAnalysis}
          disabled={isLoadingAI || loadingStats}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-cyan-500 hover:to-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 disabled:opacity-70 transition-all"
        >
          {isLoadingAI ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Sparkles size={16} />
          )}
          {isLoadingAI ? 'Đang phân tích...' : 'Phân tích AI Vận hành'}
        </button>
      </div>

      {/* AI Insight Box */}
      {insight && (
        <div className="rounded-xl border border-cyan-100 bg-cyan-50/50 p-6 animate-fade-in">
            <div className="flex items-start gap-4">
                <div className="p-2 bg-cyan-100 rounded-lg text-cyan-600">
                    <Sparkles size={20} />
                </div>
                <div className="flex-1">
                    <h3 className="text-sm font-semibold text-cyan-900 uppercase tracking-wide">Gemini Engineer Report</h3>
                    <div 
                        className="mt-2 text-sm text-cyan-900/80 prose prose-sm prose-cyan max-w-none"
                        dangerouslySetInnerHTML={{ __html: insight }}
                    />
                </div>
                <button onClick={() => setInsight(null)} className="text-cyan-400 hover:text-cyan-600">×</button>
            </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Tổng số Locker" 
          value="200" 
          trend={0} 
          trendLabel="Tủ đã lắp đặt"
          icon={<Box size={20} />} 
        />
        <StatsCard 
          title="Đang hoạt động" 
          value="156" 
          trend={12.5} 
          trendLabel="Tăng nhu cầu"
          icon={<Zap size={20} />} 
        />
        <StatsCard 
          title="Cảnh báo Pin yếu" 
          value="12" 
          trend={-2} 
          trendLabel="Cần thay thế sớm"
          icon={<BatteryWarning size={20} />} 
          alert={true}
        />
         <StatsCard 
          title="Doanh thu tháng" 
          value="7,490k" 
          trend={8.2} 
          icon={<DollarSign size={20} />} 
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
          <h3 className="mb-4 text-base font-semibold leading-6 text-gray-900">Xu hướng thuê & Doanh thu</h3>
          {loadingStats ? (
              <div className="h-[300px] w-full flex items-center justify-center bg-gray-50 rounded">Loading data...</div>
          ) : (
              <RevenueAreaChart data={statsData} />
          )}
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
          <h3 className="mb-4 text-base font-semibold leading-6 text-gray-900">Báo cáo sự cố phần cứng</h3>
          {loadingStats ? (
              <div className="h-[300px] w-full flex items-center justify-center bg-gray-50 rounded">Loading data...</div>
          ) : (
              <VisitorBarChart data={statsData} />
          )}
        </div>
      </div>
    </div>
  );
};