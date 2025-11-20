import React, { useState } from 'react';
import { MapPin, Box, Clock, ArrowRight, ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { WalletModal } from './WalletModal';

const ZONES = [
    { id: 'Z-A', name: 'Sảnh Chính - Zone A', desc: 'Tầng 1, Cạnh quầy lễ tân' },
    { id: 'Z-B', name: 'Khu Văn Phòng - Zone B', desc: 'Tầng 2, Hành lang phía Đông' },
    { id: 'Z-C', name: 'Khu Gym & Pool - Zone C', desc: 'Tầng 3, Cạnh phòng thay đồ' },
];

const SIZES = [
    { id: 'Small', name: 'Nhỏ (S)', desc: 'Vừa balo laptop, túi xách', price: 5000 },
    { id: 'Medium', name: 'Vừa (M)', desc: 'Vừa vali cabin, mũ bảo hiểm', price: 10000 },
    { id: 'Large', name: 'Lớn (L)', desc: 'Vừa vali ký gửi, bộ golf', price: 20000 },
];

const DURATIONS = [
    { hours: 2, label: '2 Giờ' },
    { hours: 4, label: '4 Giờ' },
    { hours: 8, label: '8 Giờ' },
    { hours: 24, label: '24 Giờ (1 Ngày)' },
];

export const BookingWizard: React.FC = () => {
  const [step, setStep] = useState(1);
  const [zone, setZone] = useState('');
  const [size, setSize] = useState('');
  const [duration, setDuration] = useState(0);
  const [isBooking, setIsBooking] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { user } = useAuth();

  // Computed
  const selectedSizePrice = SIZES.find(s => s.id === size)?.price || 0;
  const totalCost = selectedSizePrice * (duration || 0);
  const canAfford = (user?.balance || 0) >= totalCost;

  const handleBooking = async () => {
      if(!canAfford) {
          setShowWallet(true);
          return;
      }
      setIsBooking(true);
      setError('');

      try {
          const res = await fetch('/api/rentals/book', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({ zoneId: zone, size, durationHours: duration, cost: totalCost })
          });
          
          const data = await res.json();
          if(!res.ok) throw new Error(data.error);

          // Success
          navigate('/client');
      } catch (err: any) {
          setError(err.message);
          setIsBooking(false);
      }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
        <WalletModal isOpen={showWallet} onClose={() => setShowWallet(false)} onSuccess={() => setError('')} />

        {/* Progress Bar */}
        <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -z-10 h-0.5 w-full bg-gray-200 -translate-y-1/2"></div>
            {[1, 2, 3, 4].map((s) => (
                <div key={s} className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors ${step >= s ? 'border-cyan-600 bg-cyan-600 text-white' : 'border-gray-300 bg-white text-gray-400'}`}>
                    {s}
                </div>
            ))}
        </div>

        {/* Steps */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 min-h-[400px]">
            
            {/* Step 1: Location */}
            {step === 1 && (
                <div className="space-y-6 animate-fade-in">
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-gray-900">Chọn Khu Vực</h2>
                        <p className="text-gray-500">Bạn muốn gửi đồ ở đâu?</p>
                    </div>
                    <div className="grid gap-4">
                        {ZONES.map(z => (
                            <button key={z.id} onClick={() => setZone(z.id)} className={`flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all ${zone === z.id ? 'border-cyan-500 bg-cyan-50' : 'border-gray-100 hover:border-cyan-200'}`}>
                                <div className={`p-3 rounded-lg ${zone === z.id ? 'bg-cyan-100 text-cyan-600' : 'bg-gray-100 text-gray-500'}`}>
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{z.name}</h3>
                                    <p className="text-sm text-gray-500">{z.desc}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Step 2: Size */}
            {step === 2 && (
                <div className="space-y-6 animate-fade-in">
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-gray-900">Chọn Kích Thước</h2>
                        <p className="text-gray-500">Ước lượng kích thước đồ dùng của bạn</p>
                    </div>
                    <div className="grid gap-4">
                        {SIZES.map(s => (
                            <button key={s.id} onClick={() => setSize(s.id)} className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${size === s.id ? 'border-cyan-500 bg-cyan-50' : 'border-gray-100 hover:border-cyan-200'}`}>
                                <div className={`p-3 rounded-lg ${size === s.id ? 'bg-cyan-100 text-cyan-600' : 'bg-gray-100 text-gray-500'}`}>
                                    <Box size={24} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-900">{s.name}</h3>
                                    <p className="text-sm text-gray-500">{s.desc}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-cyan-600">{s.price.toLocaleString()}đ<span className="text-xs text-gray-500">/giờ</span></p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Step 3: Duration */}
            {step === 3 && (
                 <div className="space-y-6 animate-fade-in">
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-gray-900">Thời gian thuê</h2>
                        <p className="text-gray-500">Dự kiến thời gian bạn sẽ quay lại lấy đồ</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {DURATIONS.map(d => (
                            <button key={d.hours} onClick={() => setDuration(d.hours)} className={`p-6 rounded-xl border-2 text-center transition-all ${duration === d.hours ? 'border-cyan-500 bg-cyan-50' : 'border-gray-100 hover:border-cyan-200'}`}>
                                <Clock size={32} className={`mx-auto mb-3 ${duration === d.hours ? 'text-cyan-600' : 'text-gray-400'}`} />
                                <h3 className="font-bold text-gray-900">{d.label}</h3>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Step 4: Confirmation */}
            {step === 4 && (
                 <div className="space-y-6 animate-fade-in">
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-gray-900">Xác nhận thanh toán</h2>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                         <div className="flex justify-between text-sm">
                             <span className="text-gray-500">Khu vực:</span>
                             <span className="font-medium text-gray-900">{ZONES.find(z => z.id === zone)?.name}</span>
                         </div>
                         <div className="flex justify-between text-sm">
                             <span className="text-gray-500">Kích thước:</span>
                             <span className="font-medium text-gray-900">{SIZES.find(s => s.id === size)?.name}</span>
                         </div>
                         <div className="flex justify-between text-sm">
                             <span className="text-gray-500">Thời gian:</span>
                             <span className="font-medium text-gray-900">{duration} Giờ</span>
                         </div>
                         <div className="border-t pt-4 flex justify-between items-center">
                             <span className="font-bold text-gray-900">Tổng cộng</span>
                             <span className="text-xl font-bold text-cyan-600">{totalCost.toLocaleString()}đ</span>
                         </div>
                    </div>

                    {/* Wallet Check */}
                    <div className={`p-4 rounded-lg flex items-center justify-between ${canAfford ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        <div className="flex items-center gap-2">
                            {canAfford ? <CheckCircle size={20}/> : <AlertTriangle size={20}/>}
                            <span className="font-medium">Ví của bạn: {(user?.balance || 0).toLocaleString()}đ</span>
                        </div>
                        {!canAfford && (
                            <button onClick={() => setShowWallet(true)} className="text-sm font-bold underline">Nạp tiền ngay</button>
                        )}
                    </div>
                    
                    {error && <p className="text-center text-sm text-red-600">{error}</p>}
                </div>
            )}

        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
            <button 
                onClick={() => setStep(prev => Math.max(1, prev - 1))}
                disabled={step === 1}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-gray-600 hover:bg-gray-100'}`}
            >
                <ArrowLeft size={20} /> Quay lại
            </button>

            {step < 4 ? (
                <button 
                    onClick={() => setStep(prev => Math.min(4, prev + 1))}
                    disabled={(step === 1 && !zone) || (step === 2 && !size) || (step === 3 && !duration)}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg bg-cyan-600 text-white font-bold hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Tiếp tục <ArrowRight size={20} />
                </button>
            ) : (
                <button 
                    onClick={handleBooking}
                    disabled={isBooking}
                    className="flex items-center gap-2 px-8 py-3 rounded-lg bg-cyan-600 text-white font-bold hover:bg-cyan-500 shadow-lg shadow-cyan-200 disabled:opacity-70 transition-all"
                >
                    {isBooking ? 'Đang xử lý...' : 'Thanh toán & Mở tủ'}
                </button>
            )}
        </div>
    </div>
  );
};