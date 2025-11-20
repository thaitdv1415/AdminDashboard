import React, { useState, useEffect } from 'react';
import { Locker, LockerStatus, MaintenanceLog } from '../types';
import { Lock, Unlock, Battery, AlertTriangle, PenTool, RefreshCw, WifiOff, BatteryWarning, Filter, X, Activity, Zap, MapPin, Wrench, Calendar, DollarSign, User, Save, Edit, FileText, Map as MapIcon, Grid, CheckCircle, ChevronRight, Clock, Key, History, ArrowRight } from 'lucide-react';

// Mock Zones (Static is fine for zones)
const ZONES = [
    { id: 'ALL', name: 'Tất cả khu vực' },
    { id: 'Z-A', name: 'Zone A - Sảnh chính' },
    { id: 'Z-B', name: 'Zone B - Tầng 2' },
    { id: 'Z-C', name: 'Zone C - Khu thể thao' },
];

export const LockerGrid: React.FC = () => {
    const [lockers, setLockers] = useState<Locker[]>([]);
    const [selectedLocker, setSelectedLocker] = useState<Locker | null>(null);
    const [filterStatus, setFilterStatus] = useState<LockerStatus | 'All'>('All');
    const [activeZoneId, setActiveZoneId] = useState('ALL');
    const [showBatteryAlert, setShowBatteryAlert] = useState(true);
    const [isSocketConnected, setIsSocketConnected] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
    const [activeTooltipLockerId, setActiveTooltipLockerId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Maintenance Form State
    const [maintenanceForm, setMaintenanceForm] = useState<Partial<MaintenanceLog>>({
        issue: '',
        estimatedCost: 0,
        estimatedCompletion: '',
        technicianName: '',
        notes: ''
    });
    const [isEditingMaintenance, setIsEditingMaintenance] = useState(false);

    // Fetch Data from API
    const fetchLockers = async () => {
        try {
            const res = await fetch('/api/lockers');
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setLockers(data);
            setIsLoading(false);
        } catch (error) {
            console.error("Failed to load lockers", error);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLockers();
        // Polling for updates (Simulating Real-time)
        const interval = setInterval(fetchLockers, 10000); 
        return () => clearInterval(interval);
    }, []);

    // Refresh selected locker data when lockers update
    useEffect(() => {
        if (selectedLocker) {
            const updated = lockers.find(l => l.id === selectedLocker.id);
            if (updated) setSelectedLocker(updated);
        }
    }, [lockers]);

    const filteredLockers = lockers.filter(locker => {
        const matchStatus = filterStatus === 'All' ? true : locker.status === filterStatus;
        const matchZone = activeZoneId === 'ALL' ? true : locker.zoneId === activeZoneId;
        return matchStatus && matchZone;
    });

    const lowBatteryLockers = lockers.filter(locker => locker.batteryLevel < 20);
    const hasLowBattery = lowBatteryLockers.length > 0;

    const handleOpenMaintenanceMode = () => {
        if (!selectedLocker) return;
        setIsEditingMaintenance(true);
        // Currently active maintenance is usually the latest in history or we need a separate field?
        // For this demo, we assume if status is Maintenance, the logic handles it, else new form.
        setMaintenanceForm({
            issue: '',
            estimatedCost: 150000,
            estimatedCompletion: new Date().toISOString().split('T')[0],
            technicianName: 'Kỹ thuật viên A',
            notes: ''
        });
    };

    const handleSaveMaintenance = async () => {
        if (!selectedLocker) return;
        
        const logData = {
            lockerId: selectedLocker.id,
            issue: maintenanceForm.issue || 'Bảo trì định kỳ',
            reportedBy: 'Admin',
            reportedAt: new Date().toISOString(),
            estimatedCost: Number(maintenanceForm.estimatedCost) || 0,
            estimatedCompletion: maintenanceForm.estimatedCompletion || new Date().toISOString(),
            technicianName: maintenanceForm.technicianName || 'Chưa chỉ định',
            notes: maintenanceForm.notes || '',
            status: 'In Progress'
        };

        try {
            // Save log
            const resLog = await fetch('/api/lockers/maintenance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(logData)
            });
            
            if (resLog.ok) {
                // Refetch to get updated status and history
                await fetchLockers();
                setIsEditingMaintenance(false);
            }
        } catch (err) {
            console.error("Failed to save maintenance", err);
        }
    };

    const handleCompleteMaintenance = async () => {
        if (!selectedLocker) return;
        
        // Simple update to set status back to Available
        try {
             const res = await fetch('/api/lockers', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    id: selectedLocker.id, 
                    status: 'Available',
                    // In a real app we would also update the latest log status to Resolved here
                })
            });
            if (res.ok) {
                fetchLockers();
                setIsEditingMaintenance(false);
            }
        } catch (err) {
            console.error("Failed to complete maintenance", err);
        }
    }

    const getStatusStyles = (status: LockerStatus) => {
        switch (status) {
            case 'Available': return {
                card: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100',
                badge: 'bg-green-100 text-green-700 ring-green-600/20',
                icon: 'text-green-600',
                header: 'bg-green-50',
                mapPin: 'bg-green-500 ring-green-300'
            };
            case 'Occupied': return {
                card: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
                badge: 'bg-blue-100 text-blue-700 ring-blue-600/10',
                icon: 'text-blue-600',
                header: 'bg-blue-50',
                mapPin: 'bg-blue-500 ring-blue-300'
            };
            case 'Maintenance': return {
                card: 'bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100',
                badge: 'bg-yellow-100 text-yellow-800 ring-yellow-600/20',
                icon: 'text-yellow-600',
                header: 'bg-yellow-50',
                mapPin: 'bg-yellow-500 ring-yellow-300'
            };
            case 'Error': return {
                card: 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100',
                badge: 'bg-red-100 text-red-700 ring-red-600/10',
                icon: 'text-red-600',
                header: 'bg-red-50',
                mapPin: 'bg-red-500 ring-red-300'
            };
            case 'LowBattery': return {
                card: 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100',
                badge: 'bg-orange-100 text-orange-800 ring-orange-600/20',
                icon: 'text-orange-600',
                header: 'bg-orange-50',
                mapPin: 'bg-orange-500 ring-orange-300'
            };
            case 'Offline': return {
                card: 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200',
                badge: 'bg-gray-200 text-gray-700 ring-gray-500/10',
                icon: 'text-gray-500',
                header: 'bg-gray-50',
                mapPin: 'bg-gray-500 ring-gray-300'
            };
            case 'Resolved': return {
                card: 'bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100',
                badge: 'bg-teal-100 text-teal-700 ring-teal-600/20',
                icon: 'text-teal-600',
                header: 'bg-teal-50',
                mapPin: 'bg-teal-500 ring-teal-300'
            };
            default: return {
                card: 'bg-gray-50 border-gray-200 text-gray-700',
                badge: 'bg-gray-100 text-gray-700',
                icon: 'text-gray-500',
                header: 'bg-gray-50',
                mapPin: 'bg-gray-500'
            };
        }
    };

    const getStatusIcon = (status: LockerStatus) => {
        switch (status) {
            case 'Available': return <Unlock size={24} />;
            case 'Occupied': return <Lock size={24} />;
            case 'Maintenance': return <Wrench size={24} />;
            case 'Error': return <AlertTriangle size={24} />;
            case 'LowBattery': return <BatteryWarning size={24} />;
            case 'Offline': return <WifiOff size={24} />;
            case 'Resolved': return <CheckCircle size={24} />;
            default: return <div />;
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    if (isLoading) {
        return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div></div>
    }

    return (
        <div className="space-y-6">
            {/* Stats Overview for Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-medium text-gray-500">Tổng số tủ</p>
                    <p className="mt-1 text-2xl font-semibold text-gray-900">{lockers.length}</p>
                </div>
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 shadow-sm">
                    <p className="text-xs font-medium text-green-600">Đang trống</p>
                    <p className="mt-1 text-2xl font-semibold text-green-700">
                        {lockers.filter(l => l.status === 'Available').length}
                    </p>
                </div>
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 shadow-sm">
                    <p className="text-xs font-medium text-blue-600">Đang sử dụng</p>
                    <p className="mt-1 text-2xl font-semibold text-blue-700">
                        {lockers.filter(l => l.status === 'Occupied').length}
                    </p>
                </div>
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 shadow-sm">
                    <p className="text-xs font-medium text-yellow-600">Cần bảo trì</p>
                    <p className="mt-1 text-2xl font-semibold text-yellow-700">
                        {lockers.filter(l => ['Maintenance', 'Error', 'LowBattery'].includes(l.status)).length}
                    </p>
                </div>
            </div>

            {/* Alerts */}
            {hasLowBattery && showBatteryAlert && (
                <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 animate-pulse">
                    <div className="flex items-center gap-3">
                        <BatteryWarning size={20} />
                        <p className="text-sm font-medium">Cảnh báo: Có {lowBatteryLockers.length} tủ đang có pin dưới 20%. Cần thay thế gấp.</p>
                    </div>
                    <button onClick={() => setShowBatteryAlert(false)} className="text-red-600 hover:text-red-800"><X size={18}/></button>
                </div>
            )}

            {/* Filter & Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-semibold text-gray-900">Danh sách Locker</h2>
                    
                    {/* View Toggle */}
                    <div className="flex items-center rounded-lg bg-gray-100 p-1">
                        <button 
                            onClick={() => setViewMode('grid')}
                            className={`rounded-md p-1.5 transition-all ${viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            title="Grid View"
                        >
                            <Grid size={18} />
                        </button>
                        <button 
                            onClick={() => setViewMode('map')}
                            className={`rounded-md p-1.5 transition-all ${viewMode === 'map' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            title="Map View"
                        >
                            <MapIcon size={18} />
                        </button>
                    </div>

                    <div className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium border ${isSocketConnected ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                         <div className={`h-2 w-2 rounded-full ${isSocketConnected ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                         {isSocketConnected ? 'Hệ thống Live' : 'Mất kết nối'}
                    </div>
                </div>

                {/* Zone Tabs */}
                <div className="flex overflow-x-auto pb-2 sm:pb-0">
                     <nav className="flex space-x-2" aria-label="Tabs">
                        {ZONES.map(zone => (
                            <button
                                key={zone.id}
                                onClick={() => setActiveZoneId(zone.id)}
                                className={`
                                    whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors
                                    ${activeZoneId === zone.id 
                                        ? 'bg-primary-100 text-primary-700' 
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}
                                `}
                            >
                                {zone.name}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-2">
                    <Filter size={18} className="text-gray-400" />
                    <select 
                        className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary-600 sm:text-sm sm:leading-6"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as LockerStatus | 'All')}
                    >
                        <option value="All">Tất cả trạng thái</option>
                        <option value="Available">Còn trống</option>
                        <option value="Occupied">Đang sử dụng</option>
                        <option value="Maintenance">Đang bảo trì</option>
                        <option value="Error">Báo lỗi</option>
                        <option value="LowBattery">Pin yếu</option>
                        <option value="Resolved">Đã xử lý (Resolved)</option>
                    </select>
                </div>
            </div>

            {/* Content Area */}
            {viewMode === 'grid' ? (
                /* Grid View */
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
                    {filteredLockers.map((locker) => {
                        const style = getStatusStyles(locker.status);
                        return (
                            <button
                                key={locker.id}
                                onClick={() => setSelectedLocker(locker)}
                                className={`group relative flex flex-col justify-between rounded-xl border p-4 transition-all hover:shadow-md hover:scale-105 text-left h-32 ${style.card}`}
                            >
                                <div className="flex w-full justify-between">
                                    <span className="font-bold text-lg">{locker.label}</span>
                                    <div className={`rounded-full p-1.5 ${style.badge}`}>
                                        {getStatusIcon(locker.status)}
                                    </div>
                                </div>
                                
                                <div className="space-y-1">
                                    <p className="text-xs font-medium opacity-75 truncate">{locker.location}</p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1 text-xs">
                                            {locker.batteryLevel < 20 ? (
                                                <BatteryWarning size={14} className="text-red-500 animate-pulse"/>
                                            ) : (
                                                <Battery size={14} className="opacity-60" />
                                            )}
                                            <span className={`${locker.batteryLevel < 20 ? 'text-red-600 font-bold' : 'opacity-80'}`}>
                                                {locker.batteryLevel}%
                                            </span>
                                        </div>
                                        {locker.status === 'Occupied' && (
                                            <span className="text-xs font-semibold bg-white/50 px-1.5 py-0.5 rounded">Thuê</span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            ) : (
                /* Map View */
                <div 
                    className="relative w-full h-[600px] bg-gray-100 rounded-xl border border-gray-200 overflow-hidden shadow-inner"
                    onClick={() => setActiveTooltipLockerId(null)}
                >
                    {/* Background / Floor Plan Decoration */}
                    <div className="absolute inset-0 opacity-10" style={{ 
                        backgroundImage: 'radial-gradient(#6b7280 1px, transparent 1px)', 
                        backgroundSize: '20px 20px' 
                    }}></div>
                    
                    {/* Zone Labels on Map */}
                    <div className="absolute top-4 left-[15%] text-gray-400 font-bold text-xl uppercase tracking-widest pointer-events-none">Zone A</div>
                    <div className="absolute top-4 left-[50%] translate-x-[-50%] text-gray-400 font-bold text-xl uppercase tracking-widest pointer-events-none">Zone B</div>
                    <div className="absolute top-4 right-[15%] text-gray-400 font-bold text-xl uppercase tracking-widest pointer-events-none">Zone C</div>
                    
                    {/* Dividers */}
                    <div className="absolute top-10 bottom-10 left-[33%] w-px border-l-2 border-dashed border-gray-300"></div>
                    <div className="absolute top-10 bottom-10 right-[33%] w-px border-l-2 border-dashed border-gray-300"></div>

                    {/* Pins */}
                    {filteredLockers.map((locker) => {
                        const style = getStatusStyles(locker.status);
                        if (!locker.coordinate) return null;
                        const isTooltipOpen = activeTooltipLockerId === locker.id;

                        return (
                            <div
                                key={locker.id}
                                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                                style={{ 
                                    left: `${locker.coordinate.x}%`, 
                                    top: `${locker.coordinate.y}%`,
                                    zIndex: isTooltipOpen ? 50 : 10
                                }}
                            >
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveTooltipLockerId(isTooltipOpen ? null : locker.id);
                                    }}
                                    className={`relative flex items-center justify-center h-8 w-8 rounded-full shadow-md ring-2 ring-white transition-transform hover:scale-110 focus:outline-none ${style.mapPin}`}
                                >
                                    <div className="text-white">
                                       {locker.status === 'Occupied' ? <Lock size={12} /> : 
                                        locker.status === 'Available' ? <Unlock size={12} /> :
                                        locker.status === 'Maintenance' || locker.status === 'Error' ? <Wrench size={12} /> :
                                        locker.status === 'Resolved' ? <CheckCircle size={12} /> :
                                        <div className="h-2 w-2 bg-white rounded-full"></div>}
                                    </div>
                                </button>

                                {/* Compact Tooltip */}
                                {isTooltipOpen && (
                                    <div 
                                        className="absolute bottom-full mb-3 left-1/2 transform -translate-x-1/2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 p-3 cursor-default animate-in fade-in zoom-in duration-200 origin-bottom"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="flex flex-col items-center text-center">
                                            <h4 className="font-bold text-gray-900">Tủ {locker.label}</h4>
                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset mt-1 mb-2 ${style.badge}`}>
                                                {locker.status}
                                            </span>
                                            
                                            <div className="flex items-center justify-center gap-3 text-xs text-gray-500 mb-3 w-full border-b border-gray-100 pb-2">
                                                 <div className="flex items-center gap-1" title="Battery">
                                                    <Battery size={12} />
                                                    <span>{locker.batteryLevel}%</span>
                                                 </div>
                                                 <div className="flex items-center gap-1" title="Zone">
                                                    <MapPin size={12} />
                                                    <span>{locker.zoneId.replace('Z-', 'Zone ')}</span>
                                                 </div>
                                            </div>

                                            <button 
                                                onClick={() => {
                                                    setSelectedLocker(locker);
                                                    setActiveTooltipLockerId(null);
                                                }}
                                                className="w-full flex items-center justify-center gap-1 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
                                            >
                                                Xem chi tiết <ChevronRight size={12} />
                                            </button>
                                        </div>
                                        
                                        {/* Arrow */}
                                        <div className="absolute top-full left-1/2 -ml-2 border-8 border-transparent border-t-white drop-shadow-sm"></div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Detail Modal/Sidebar */}
            {selectedLocker && (
                <div className="fixed inset-0 z-50 flex items-end justify-end sm:items-center" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
                    <div className="h-full w-full sm:w-[450px] transform bg-white shadow-2xl transition-all sm:h-screen sm:border-l sm:border-gray-200 overflow-y-auto">
                        <div className={`flex items-center justify-between border-b px-6 py-4 ${getStatusStyles(selectedLocker.status).header}`}>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Tủ {selectedLocker.label}</h3>
                                <p className="text-sm text-gray-500">{selectedLocker.location}</p>
                            </div>
                            <button 
                                onClick={() => {
                                    setSelectedLocker(null);
                                    setIsEditingMaintenance(false);
                                }}
                                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Status Badge */}
                            <div className="flex items-center justify-between">
                                <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset ${getStatusStyles(selectedLocker.status).badge}`}>
                                    {getStatusIcon(selectedLocker.status)}
                                    <span>{selectedLocker.status}</span>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center justify-end gap-1 text-sm text-gray-500">
                                        <Battery size={16} />
                                        <span>{selectedLocker.batteryLevel}%</span>
                                    </div>
                                    <div className="h-1.5 w-20 rounded-full bg-gray-200 mt-1">
                                        <div 
                                            className={`h-1.5 rounded-full ${selectedLocker.batteryLevel < 20 ? 'bg-red-500' : 'bg-green-500'}`} 
                                            style={{ width: `${selectedLocker.batteryLevel}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons based on status */}
                            <div className="grid grid-cols-2 gap-3">
                                <button className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                                    <Activity size={16} />
                                    Lịch sử Log
                                </button>
                                {selectedLocker.status === 'Occupied' ? (
                                    <button className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700">
                                        <Unlock size={16} />
                                        Mở khóa khẩn cấp
                                    </button>
                                ) : (
                                    <button className="flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700">
                                        <Lock size={16} />
                                        Khóa từ xa
                                    </button>
                                )}
                            </div>
                            
                            {/* Operational Statistics Section */}
                            <div className="space-y-3 pt-2 border-t border-gray-100">
                                <h4 className="text-sm font-medium text-gray-900">Thống kê hoạt động</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-cyan-50 rounded-lg border border-cyan-100 transition-colors hover:bg-cyan-100">
                                        <div className="flex items-center gap-2 text-cyan-700 mb-1">
                                            <DollarSign size={16} />
                                            <span className="text-xs font-semibold">Doanh thu</span>
                                        </div>
                                        <p className="text-xl font-bold text-cyan-900">{formatCurrency(selectedLocker.totalRevenue)}</p>
                                    </div>
                                    <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100 transition-colors hover:bg-indigo-100">
                                        <div className="flex items-center gap-2 text-indigo-700 mb-1">
                                            <RefreshCw size={16} />
                                            <span className="text-xs font-semibold">Lượt thuê</span>
                                        </div>
                                        <p className="text-xl font-bold text-indigo-900">{selectedLocker.totalRentals}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Maintenance Info or Form */}
                            {isEditingMaintenance ? (
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-4">
                                    <h4 className="font-medium text-gray-900 flex items-center gap-2">
                                        <PenTool size={16} /> Báo cáo/Cập nhật sự cố
                                    </h4>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700">Mô tả lỗi</label>
                                        <input 
                                            type="text" 
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                            value={maintenanceForm.issue}
                                            onChange={(e) => setMaintenanceForm({...maintenanceForm, issue: e.target.value})}
                                            placeholder="VD: Kẹt khóa, hỏng pin..."
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Chi phí dự tính (VNĐ)</label>
                                            <input 
                                                type="number" 
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                                value={maintenanceForm.estimatedCost}
                                                onChange={(e) => setMaintenanceForm({...maintenanceForm, estimatedCost: Number(e.target.value)})}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Ngày hoàn thành</label>
                                            <input 
                                                type="date" 
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                                value={maintenanceForm.estimatedCompletion}
                                                onChange={(e) => setMaintenanceForm({...maintenanceForm, estimatedCompletion: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700">Kỹ thuật viên</label>
                                        <input 
                                            type="text" 
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                            value={maintenanceForm.technicianName}
                                            onChange={(e) => setMaintenanceForm({...maintenanceForm, technicianName: e.target.value})}
                                        />
                                    </div>
                                     <div>
                                        <label className="block text-xs font-medium text-gray-700">Ghi chú kỹ thuật</label>
                                        <textarea
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                            rows={3}
                                            value={maintenanceForm.notes}
                                            onChange={(e) => setMaintenanceForm({...maintenanceForm, notes: e.target.value})}
                                            placeholder="Chi tiết sửa chữa, linh kiện thay thế..."
                                        />
                                    </div>
                                    <div className="flex flex-col gap-3 pt-2">
                                        <button 
                                            onClick={handleSaveMaintenance}
                                            className="flex items-center justify-center gap-2 w-full rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500"
                                        >
                                            <Save size={16} /> Lưu & Cập nhật
                                        </button>
                                        <div className="flex gap-3">
                                            <button 
                                                onClick={handleCompleteMaintenance}
                                                className="flex-1 flex items-center justify-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500"
                                            >
                                                <CheckCircle size={16} /> Mark as Resolved
                                            </button>
                                            <button 
                                                onClick={() => setIsEditingMaintenance(false)}
                                                className="flex-1 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                            >
                                                Hủy
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {(selectedLocker.status === 'Maintenance' || selectedLocker.status === 'Error') && selectedLocker.maintenanceHistory && selectedLocker.maintenanceHistory.length > 0 && selectedLocker.maintenanceHistory[0].status !== 'Resolved' ? (
                                        // Logic to show active maintenance: We assume the first item in history is the active one if status is not Resolved and locker is Maintenance
                                        // In real implementation, better to have an activeMaintenance relation or check specific status.
                                        // For simplicity here, if locker is Maintenance, we show the last history item as active.
                                        (() => {
                                            const activeLog = selectedLocker.maintenanceHistory[0];
                                            return (
                                                <div className="rounded-lg border border-red-100 bg-red-50 p-4 space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="font-medium text-red-900 flex items-center gap-2">
                                                            <Wrench size={16} /> Thông tin bảo trì
                                                        </h4>
                                                        <span className="inline-flex items-center rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                                                            {activeLog.status}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-red-800 space-y-2">
                                                        <p><span className="font-medium">Lỗi:</span> {activeLog.issue}</p>
                                                        {activeLog.technicianName && (
                                                            <p><span className="font-medium">Kỹ thuật:</span> {activeLog.technicianName}</p>
                                                        )}
                                                        
                                                        <div className="grid grid-cols-2 gap-2 text-xs text-red-700/80">
                                                            <div className="flex items-center gap-1">
                                                                <User size={12} />
                                                                <span>Người báo: {activeLog.reportedBy}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Clock size={12} />
                                                                <span>{new Date(activeLog.reportedAt).toLocaleDateString()}</span>
                                                            </div>
                                                        </div>

                                                        {activeLog.notes && (
                                                            <div className="flex gap-2 mt-2 p-2 bg-white/50 rounded border border-red-100">
                                                                <FileText size={14} className="flex-shrink-0 mt-0.5"/>
                                                                <p className="italic text-xs">{activeLog.notes}</p>
                                                            </div>
                                                        )}
                                                        <div className="flex justify-between border-t border-red-200 pt-2 mt-2">
                                                            <div className="flex items-center gap-1">
                                                                <DollarSign size={14} />
                                                                <span>{formatCurrency(activeLog.estimatedCost)}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Calendar size={14} />
                                                                <span>{activeLog.estimatedCompletion}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 mt-3">
                                                        <button 
                                                            onClick={handleCompleteMaintenance}
                                                            className="flex-1 rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                                        >
                                                            Đã sửa xong
                                                        </button>
                                                        <button
                                                            onClick={handleOpenMaintenanceMode}
                                                            className="flex items-center justify-center gap-1 rounded-md bg-primary-50 px-3 py-1.5 text-sm font-semibold text-primary-700 hover:bg-primary-100"
                                                        >
                                                            <Edit size={14} /> Cập nhật
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })()
                                    ) : (
                                        <button 
                                            onClick={handleOpenMaintenanceMode}
                                            className="w-full flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 p-4 text-sm font-medium text-gray-500 hover:border-gray-400 hover:text-gray-600"
                                        >
                                            <AlertTriangle size={16} />
                                            Báo cáo sự cố
                                        </button>
                                    )}
                                </>
                            )}

                            {/* Detail List */}
                            <div className="border-t pt-4 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Người dùng hiện tại</span>
                                    <span className="font-medium text-gray-900 flex items-center gap-1">
                                        {selectedLocker.currentUserId ? (
                                            <><User size={14}/> {selectedLocker.currentUserId}</>
                                        ) : '---'}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Lần mở gần nhất</span>
                                    <span className="font-medium text-gray-900">{selectedLocker.lastOpened || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Thời gian khóa</span>
                                    <span className="font-medium text-gray-900 flex items-center gap-1">
                                         <Key size={12} className="text-gray-400"/>
                                         {selectedLocker.lastLockedAt || '---'}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Thời gian mở</span>
                                    <span className="font-medium text-gray-900 flex items-center gap-1">
                                        <Unlock size={12} className="text-gray-400"/>
                                        {selectedLocker.lastUnlockedAt || '---'}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Trạng thái khóa</span>
                                    <span className={`font-medium ${selectedLocker.isLocked ? 'text-green-600' : 'text-orange-500'}`}>
                                        {selectedLocker.isLocked ? 'Locked' : 'Unlocked'}
                                    </span>
                                </div>
                            </div>

                            {/* Maintenance History */}
                            {selectedLocker.maintenanceHistory && selectedLocker.maintenanceHistory.length > 0 && (
                                <div className="border-t pt-6 space-y-4">
                                    <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                        <History size={18} className="text-gray-500" /> 
                                        Lịch sử bảo trì & Sửa chữa
                                    </h4>
                                    <div className="relative pl-2 space-y-0">
                                        {/* Vertical Line */}
                                        <div className="absolute left-[19px] top-2 bottom-2 w-px bg-gray-200"></div>
                                        
                                        {selectedLocker.maintenanceHistory.map((log, idx) => (
                                            <div key={idx} className="relative pl-10 pb-6 last:pb-0 group">
                                                 {/* Timeline Dot */}
                                                 <div className="absolute left-[13px] top-1 h-3 w-3 rounded-full border-2 border-white bg-gray-400 ring-1 ring-gray-200 group-hover:bg-primary-500 group-hover:ring-primary-300 transition-all"></div>
                                                 
                                                 <div className="flex flex-col gap-1.5 rounded-lg border border-gray-100 bg-gray-50/50 p-3 hover:bg-gray-50 transition-colors">
                                                    <div className="flex justify-between items-start">
                                                        <span className="font-medium text-sm text-gray-900">{log.issue}</span>
                                                        <span className="text-xs text-gray-500 font-mono bg-white px-1.5 py-0.5 rounded border border-gray-100">
                                                            {new Date(log.reportedAt).toLocaleDateString('vi-VN', {day: '2-digit', month: '2-digit', year: 'numeric'})}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="flex items-center justify-between mt-1">
                                                         <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                                             <User size={12} /> 
                                                             <span>{log.technicianName || 'Chưa rõ'}</span>
                                                         </div>
                                                         <div className="flex items-center gap-1">
                                                             {log.status === 'Resolved' && <CheckCircle size={12} className="text-green-600" />}
                                                             <span className={`text-xs font-medium ${log.status === 'Resolved' ? 'text-green-700' : 'text-gray-600'}`}>
                                                                 {log.status === 'Resolved' ? 'Đã xử lý' : log.status}
                                                             </span>
                                                         </div>
                                                    </div>
                                                    {log.notes && (
                                                        <p className="text-xs text-gray-500 italic mt-1 border-t border-gray-200/50 pt-2">
                                                            "{log.notes}"
                                                        </p>
                                                    )}
                                                 </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};