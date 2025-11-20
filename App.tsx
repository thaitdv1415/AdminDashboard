import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { UserList } from './components/UserList';
import { LockerGrid } from './components/LockerGrid';
import { ClientDashboard } from './components/client/ClientDashboard';
import { BookingWizard } from './components/client/BookingWizard';
import { ClientHistory } from './components/client/ClientHistory';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppRoute } from './types';

const PrivateRoute: React.FC<{ children: React.ReactNode, roles?: string[] }> = ({ children, roles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-gray-50"><div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div></div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return (
        <div className="flex h-full flex-col items-center justify-center p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
            <p className="mt-2 text-gray-500">You do not have permission to view this page.</p>
        </div>
    );
  }

  return <>{children}</>;
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  // Don't show layout for login/register
  const location = useLocation();
  if (['/login', '/register'].includes(location.pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50/50">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

const AnalyticsPlaceholder = () => (
  <div className="flex h-full min-h-[400px] items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white p-12 text-center">
    <div>
      <h3 className="mt-2 text-sm font-semibold text-gray-900">Chưa có dữ liệu báo cáo</h3>
      <p className="mt-1 text-sm text-gray-500">Hệ thống đang thu thập dữ liệu sử dụng từ các Locker.</p>
    </div>
  </div>
);

const SettingsPlaceholder = () => (
    <div className="divide-y divide-gray-200 rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5">
      <div className="px-4 py-5 sm:p-6">
          <h3 className="text-base font-semibold leading-6 text-gray-900">Cấu hình hệ thống</h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>Thiết lập thời gian chờ, giá cước thuê và thông báo.</p>
          </div>
          <div className="mt-5">
              <button className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Chỉnh sửa</button>
          </div>
      </div>
      <div className="px-4 py-5 sm:p-6">
          <h3 className="text-base font-semibold leading-6 text-gray-900">Bảo mật IoT</h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>Quản lý API Key và kết nối MQTT tới tủ khóa.</p>
          </div>
      </div>
  </div>
);

const AppRoutes = () => {
    const { user } = useAuth();
    
    // Redirect based on role if at root
    if(window.location.hash === '#/' && user?.role === 'User') {
        return <Navigate to={AppRoute.CLIENT_HOME} replace />;
    }

    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Admin Routes */}
            <Route path={AppRoute.DASHBOARD} element={
                <PrivateRoute roles={['Admin', 'Manager', 'Technician']}>
                    <Dashboard />
                </PrivateRoute>
            } />
            
            <Route path={AppRoute.LOCKERS} element={
                <PrivateRoute roles={['Admin', 'Manager', 'Staff', 'Technician']}>
                    <LockerGrid />
                </PrivateRoute>
            } />
            
            <Route path={AppRoute.USERS} element={
                <PrivateRoute roles={['Admin']}>
                    <UserList />
                </PrivateRoute>
            } />
            
            <Route path={AppRoute.ANALYTICS} element={
                <PrivateRoute roles={['Admin']}>
                    <AnalyticsPlaceholder />
                </PrivateRoute>
            } />
            
            <Route path={AppRoute.SETTINGS} element={
                <PrivateRoute roles={['Admin']}>
                    <SettingsPlaceholder />
                </PrivateRoute>
            } />

            {/* Client/User Routes */}
            <Route path={AppRoute.CLIENT_HOME} element={
                <PrivateRoute roles={['User', 'Courier']}>
                    <ClientDashboard />
                </PrivateRoute>
            } />

            <Route path={AppRoute.CLIENT_RENT} element={
                <PrivateRoute roles={['User']}>
                    <BookingWizard />
                </PrivateRoute>
            } />
            
             <Route path={AppRoute.CLIENT_WALLET} element={
                <PrivateRoute roles={['User', 'Courier']}>
                     <ClientDashboard /> {/* Just show dashboard with wallet modal trigger for now */}
                </PrivateRoute>
            } />

            <Route path={AppRoute.CLIENT_HISTORY} element={
                <PrivateRoute roles={['User']}>
                    <ClientHistory />
                </PrivateRoute>
            } />

            <Route path="*" element={<Navigate to={user?.role === 'User' ? AppRoute.CLIENT_HOME : AppRoute.DASHBOARD} replace />} />
        </Routes>
    );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
        <Router>
          <Layout>
            <AppRoutes />
          </Layout>
        </Router>
    </AuthProvider>
  );
};

export default App;