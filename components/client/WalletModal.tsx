import React, { useState } from 'react';
import { X, CreditCard, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [amount, setAmount] = useState(50000);
  const [loading, setLoading] = useState(false);
  const { checkSession } = useAuth();

  if (!isOpen) return null;

  const handleTopup = async () => {
    setLoading(true);
    try {
        const res = await fetch('/api/wallet', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ amount })
        });
        if(res.ok) {
            await checkSession();
            onSuccess();
            onClose();
        }
    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl animate-fade-in">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Nạp tiền vào ví</h3>
            <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>

        <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
                {[20000, 50000, 100000, 200000, 500000].map(val => (
                    <button
                        key={val}
                        onClick={() => setAmount(val)}
                        className={`py-2 px-1 rounded border text-sm font-medium transition-all ${amount === val ? 'bg-cyan-50 border-cyan-500 text-cyan-700' : 'border-gray-200 hover:bg-gray-50'}`}
                    >
                        {val.toLocaleString()}đ
                    </button>
                ))}
            </div>

            <div className="bg-gray-50 p-3 rounded-lg flex items-start gap-3 text-sm text-gray-600">
                <AlertCircle size={16} className="mt-0.5 text-cyan-600 shrink-0" />
                <p>Đây là môi trường giả lập. Tiền sẽ được cộng ngay lập tức vào ví của bạn mà không cần thẻ tín dụng thật.</p>
            </div>

            <button
                onClick={handleTopup}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-cyan-600 py-3 font-bold text-white hover:bg-cyan-500 transition-colors disabled:opacity-50"
            >
                {loading ? 'Đang xử lý...' : `Thanh toán ${amount.toLocaleString()}đ`}
            </button>
        </div>
      </div>
    </div>
  );
};