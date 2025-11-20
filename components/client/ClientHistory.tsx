import React, { useState, useEffect } from 'react';
import { Rental } from '../../types';
import { Calendar, MapPin, DollarSign, Clock, Package, CheckCircle, XCircle, Filter } from 'lucide-react';

export const ClientHistory: React.FC = () => {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('/api/rentals/history');
        const data = await res.json();
        if (Array.isArray(data)) {
          setRentals(data);
        }
      } catch (error) {
        console.error("Failed to load history", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // Calculate Summary Stats
  const totalSpent = rentals.reduce((acc, curr) => acc + curr.cost, 0);
  const totalRentals = rentals.length;
  // Calculate total duration (rough estimate in hours for demo)
  const totalHours = rentals.reduce((acc, curr) => {
      const start = new Date(curr.startTime).getTime();
      const end = curr.endTime ? new Date(curr.endTime).getTime() : start;
      return acc + ((end - start) / (1000 * 60 * 60));
  }, 0);

  const formatDate = (dateString?: string) => {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleString('vi-VN', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
      });
  };

  if (loading) {
      return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div></div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between">
          <div>
              <h1 className="text-2xl font-bold text-gray-900">Lịch sử hoạt động</h1>
              <p className="text-gray-500 text-sm">Xem lại các giao dịch thuê tủ và gửi hàng của bạn.</p>
          </div>
          <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg">
              <Filter size={20} />
          </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-cyan-50 text-cyan-600 rounded-lg">
                  <Package size={24} />
              </div>
              <div>
                  <p className="text-xs text-gray-500 font-medium uppercase">Tổng lượt thuê</p>
                  <p className="text-2xl font-bold text-gray-900">{totalRentals}</p>
              </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                  <DollarSign size={24} />
              </div>
              <div>
                  <p className="text-xs text-gray-500 font-medium uppercase">Tổng chi tiêu</p>
                  <p className="text-2xl font-bold text-gray-900">{totalSpent.toLocaleString()}đ</p>
              </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Clock size={24} />
              </div>
              <div>
                  <p className="text-xs text-gray-500 font-medium uppercase">Thời gian sử dụng</p>
                  <p className="text-2xl font-bold text-gray-900">{Math.floor(totalHours)}h <span className="text-sm font-normal text-gray-400">{(totalHours % 1 * 60).toFixed(0)}p</span></p>
              </div>
          </div>
      </div>

      {/* History List */}
      {rentals.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-200">
              <div className="mx-auto h-12 w-12 text-gray-300 mb-3">
                  <Clock size={48} />
              </div>
              <h3 className="text-gray-900 font-medium">Chưa có lịch sử</h3>
              <p className="text-gray-500 text-sm">Các giao dịch hoàn tất sẽ xuất hiện ở đây.</p>
          </div>
      ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="divide-y divide-gray-100">
                  {rentals.map((rental) => (
                      <div key={rental.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-start gap-4">
                              <div className={`p-3 rounded-full flex-shrink-0 ${rental.status === 'Completed' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                  {rental.status === 'Completed' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                              </div>
                              <div>
                                  <div className="flex items-center gap-2 mb-1">
                                      <h3 className="font-bold text-gray-900">{rental.locker?.label || 'Unknown Locker'}</h3>
                                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                          rental.type === 'Personal' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                                      }`}>
                                          {rental.type}
                                      </span>
                                      <span className="text-xs text-gray-400">• {rental.locker?.size}</span>
                                  </div>
                                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                                      <span className="flex items-center gap-1"><MapPin size={14}/> {rental.locker?.location}</span>
                                      <span className="flex items-center gap-1"><Calendar size={14}/> {formatDate(rental.startTime)}</span>
                                  </div>
                              </div>
                          </div>
                          
                          <div className="flex items-center justify-between sm:justify-end sm:text-right gap-4 pl-14 sm:pl-0">
                              <div>
                                  <p className="text-sm text-gray-500">Thành tiền</p>
                                  <p className="font-bold text-gray-900">{rental.cost.toLocaleString()}đ</p>
                              </div>
                              {rental.endTime && (
                                  <div className="hidden sm:block">
                                      <p className="text-sm text-gray-500">Kết thúc</p>
                                      <p className="text-sm font-medium text-gray-900">{formatDate(rental.endTime)}</p>
                                  </div>
                              )}
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}
    </div>
  );
};