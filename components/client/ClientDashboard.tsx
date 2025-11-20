import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Package, Clock, MapPin, Lock, Unlock, Wallet, AlertCircle } from 'lucide-react';
import { Rental, AppRoute } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { WalletModal } from './WalletModal';

export const ClientDashboard: React.FC = () => {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showWallet, setShowWallet] = useState(false);
  const navigate = useNavigate();
  const { user, checkSession } = useAuth();

  const fetchRentals = async () => {
    try {
        const res = await fetch('/api/rentals/active');
        const data = await res.json();
        if(Array.isArray(data)) setRentals(data);
    } catch (error) {
        console.error(error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
      fetchRentals();
  }, []);

  const handleRelease = async (rentalId: string) => {
      if(!confirm("Bạn có chắc chắn muốn kết thúc thuê và mở tủ không?")) return;
      setProcessingId(rentalId);
      try {
          const res = await fetch('/api/rentals/release', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({ rentalId })
          });
          if(res.ok) {
              fetchRentals(); // Refresh list
          } else {
              const d = await res.json();
              alert(d.error);
          }
      } catch (error) {
          alert("Lỗi kết nối");
      } finally {
          setProcessingId(null);
      }
  };

  return (
    <div className="space-y-8">
      <WalletModal isOpen={showWallet} onClose={() => setShowWallet(false)} onSuccess={() => checkSession()} />
      
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-600 p-8 text-white shadow-lg">
          <div className="relative z-10">
              <h1 className="text-3xl font-bold">Xin chào, {user?.name} 👋</h1>
              <p className="mt-2 text-indigo-100">Quản lý tủ đồ cá nhân và đơn hàng của bạn.</p>
              
              <div className="mt-6 flex items-center gap-4">
                  <div className="rounded-lg bg-white/10 p-3 backdrop-blur-sm">
                      <p className="text-xs text-indigo-200">Số dư ví</p>
                      <p className="text-2xl font-bold">{(user?.balance || 0).toLocaleString()}đ</p>
                  </div>
                  <button onClick={() => setShowWallet(true)} className="flex h-full items-center gap-2 rounded-lg bg-white px-4 py-3 font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors">
                      <Wallet size={20} /> Nạp tiền
                  </button>
              </div>
          </div>
          
          {/* Decoration */}
          <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
      </div>

      {/* Quick Actions */}
      {rentals.length === 0 && !loading && (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
              <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Package size={32} className="text-gray-400"/>
              </div>
              <h3 className="text-lg font-medium text-gray-900">Bạn chưa thuê tủ nào</h3>
              <p className="text-gray-500 mb-6">Hãy bắt đầu trải nghiệm dịch vụ tủ khóa thông minh ngay.</p>
              <button 
                  onClick={() => navigate(AppRoute.CLIENT_RENT)}
                  className="inline-flex items-center gap-2 bg-cyan-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-cyan-500 transition-colors"
              >
                  <Plus size={20} /> Thuê tủ ngay
              </button>
          </div>
      )}

      {/* Active Rentals Grid */}
      {rentals.length > 0 && (
          <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Tủ đang thuê ({rentals.length})</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {rentals.map((rental) => {
                      // Calculate time remaining (simple version)
                      const end = new Date(rental.endTime || '');
                      const now = new Date();
                      const diffMs = end.getTime() - now.getTime();
                      const hoursLeft = Math.floor(diffMs / (1000 * 60 * 60));
                      const isOverdue = diffMs < 0;

                      return (
                          <div key={rental.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden">
                               {isOverdue && <div className="absolute top-0 right-0 bg-red-500 text-white text-xs px-3 py-1 rounded-bl-lg font-bold">Quá hạn</div>}
                               
                               <div className="flex justify-between items-start mb-4">
                                   <div>
                                       <h3 className="text-lg font-bold text-gray-900">{rental.locker?.label}</h3>
                                       <p className="text-sm text-gray-500">{rental.locker?.location}</p>
                                   </div>
                                   <div className="p-2 bg-cyan-50 text-cyan-600 rounded-lg">
                                       <Lock size={24} />
                                   </div>
                               </div>

                               <div className="space-y-3 mb-6">
                                   <div className="flex items-center gap-3 text-sm text-gray-600">
                                       <Clock size={16} className="text-gray-400"/>
                                       <span>{isOverdue ? `Quá hạn ${Math.abs(hoursLeft)} giờ` : `Còn lại ${hoursLeft} giờ`}</span>
                                   </div>
                                   <div className="flex items-center gap-3 text-sm text-gray-600">
                                       <MapPin size={16} className="text-gray-400"/>
                                       <span>Size {rental.locker?.size}</span>
                                   </div>
                                   <div className="p-3 bg-gray-50 rounded-lg text-center">
                                       <p className="text-xs text-gray-500 uppercase tracking-wider">Mã PIN Mở Tủ</p>
                                       <p className="text-2xl font-mono font-bold tracking-widest text-gray-900">{rental.pinCode}</p>
                                   </div>
                               </div>

                               <button 
                                  onClick={() => handleRelease(rental.id)}
                                  disabled={!!processingId}
                                  className="w-full flex items-center justify-center gap-2 bg-white border-2 border-red-100 text-red-600 py-2.5 rounded-lg font-semibold hover:bg-red-50 transition-colors"
                               >
                                  {processingId === rental.id ? 'Đang xử lý...' : <><Unlock size={18}/> Kết thúc & Lấy đồ</>}
                               </button>
                          </div>
                      );
                  })}
                  
                  {/* Add New Card */}
                  <button 
                      onClick={() => navigate(AppRoute.CLIENT_RENT)}
                      className="flex flex-col items-center justify-center gap-3 bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-200 hover:border-cyan-400 hover:bg-cyan-50 transition-all group h-full min-h-[250px]"
                  >
                      <div className="p-4 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                          <Plus size={24} className="text-cyan-600"/>
                      </div>
                      <span className="font-semibold text-gray-600 group-hover:text-cyan-700">Thuê thêm tủ</span>
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};