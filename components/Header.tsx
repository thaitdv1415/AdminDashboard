import React from 'react';
import { Bell, Search, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 shadow-sm sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100"
          >
            <Menu size={24} />
          </button>
          <div className="hidden md:flex relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input 
              type="text"
              className="block w-full rounded-lg border-0 py-2 pl-10 pr-4 bg-gray-50 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 transition-all"
              placeholder="Search data, users..."
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
          </button>
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-900">{user?.name || 'Guest'}</p>
              <p className="text-xs text-gray-500">{user?.role || 'Viewer'}</p>
            </div>
            <img 
              src={user?.avatar || "https://ui-avatars.com/api/?name=User"} 
              alt="Profile" 
              className="h-10 w-10 rounded-full object-cover border-2 border-gray-100 shadow-sm cursor-pointer hover:border-primary-500 transition-all"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
