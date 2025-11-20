import React from 'react';
import { LayoutDashboard, Users, Settings, PieChart, LogOut, Box, Lock, Wallet, History, PlusCircle } from 'lucide-react';
import { AppRoute } from '../types';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    // Admin Routes
    { name: 'Tổng quan', icon: <LayoutDashboard size={20} />, route: AppRoute.DASHBOARD, roles: ['Admin', 'Manager'] },
    { name: 'Quản lý Tủ', icon: <Box size={20} />, route: AppRoute.LOCKERS, roles: ['Admin', 'Manager', 'Staff', 'Technician'] },
    { name: 'Người dùng', icon: <Users size={20} />, route: AppRoute.USERS, roles: ['Admin'] },
    { name: 'Báo cáo', icon: <PieChart size={20} />, route: AppRoute.ANALYTICS, roles: ['Admin'] },
    
    // Client Routes
    { name: 'Trang chủ', icon: <LayoutDashboard size={20} />, route: AppRoute.CLIENT_HOME, roles: ['User', 'Courier'] },
    { name: 'Thuê tủ mới', icon: <PlusCircle size={20} />, route: AppRoute.CLIENT_RENT, roles: ['User'] },
    { name: 'Ví của tôi', icon: <Wallet size={20} />, route: AppRoute.CLIENT_WALLET, roles: ['User', 'Courier'] },
    { name: 'Lịch sử', icon: <History size={20} />, route: AppRoute.CLIENT_HISTORY, roles: ['User'] },
    
    // Settings
    { name: 'Cấu hình', icon: <Settings size={20} />, route: AppRoute.SETTINGS, roles: ['Admin'] },
  ];

  // Filter items based on user role
  const filteredItems = navItems.filter(item => user && item.roles.includes(user.role));

  const handleLogout = async () => {
      await logout();
      navigate('/login');
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 z-20 bg-black/50 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center justify-center border-b border-slate-800">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="bg-cyan-500 p-1.5 rounded-lg">
              <Lock size={20} className="text-white" />
            </div>
            <span>Smart<span className="text-cyan-500">Lock</span></span>
          </div>
        </div>

        <nav className="mt-6 px-4 space-y-2">
          {filteredItems.map((item) => {
            const isActive = location.pathname === item.route;
            return (
              <button
                key={item.name}
                onClick={() => {
                  navigate(item.route);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive 
                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/50' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
           <div className="mb-4 px-4 flex items-center gap-3">
               <img src={user?.avatar || 'https://ui-avatars.com/api/?name=User'} alt="" className="h-8 w-8 rounded-full bg-slate-700"/>
               <div className="overflow-hidden">
                   <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                   <p className="text-xs text-slate-500 truncate">{user?.role}</p>
               </div>
           </div>
           <button 
             onClick={handleLogout}
             className="flex w-full items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
           >
             <LogOut size={20} />
             <span className="font-medium">Đăng xuất</span>
           </button>
        </div>
      </div>
    </>
  );
};