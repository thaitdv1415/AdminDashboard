
import React, { useState, useEffect } from 'react';
import { Locker, LockerStatus, MaintenanceLog, Rental } from '../types';
import { Lock, Unlock, Battery, AlertTriangle, PenTool, RefreshCw, WifiOff, BatteryWarning, Filter, X, Activity, Zap, MapPin, Wrench, Calendar, DollarSign, User, Save, Edit, FileText, Map as MapIcon, Grid, CheckCircle, ChevronRight, Clock, Key, History, Truck, Package, ZoomIn, ZoomOut } from 'lucide-react';

const ZONES = [
    { id: 'ALL', name: 'Tất cả khu vực' },
    { id: 'Z-A', name: 'Zone A - Lobby' },
    { id: 'Z-B', name: 'Zone B - 2nd Floor' },
    { id: 'Z-C', name: 'Zone C - Gym Area' },
];

export const LockerGrid: React.FC = () => {
    const [lockers, setLockers] = useState<Locker[]>([]);
    const [selectedLocker, setSelectedLocker] = useState<Locker | null>(null);
    const [filterStatus, setFilterStatus] = useState<LockerStatus | 'All'>('All');
    const [activeZoneId, setActiveZoneId] = useState('ALL');
    const [showBatteryAlert, setShowBatteryAlert] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
    const [activeTooltipLockerId, setActiveTooltipLockerId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Map State
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    // History State
    const [rentalHistory, setRentalHistory] = useState<Rental[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // Maintenance Form State
    const [maintenanceForm, setMaintenanceForm] = useState<Partial<MaintenanceLog>>({
        issue: '', estimatedCost: 0, estimatedCompletion: '', technicianName: '', notes: ''
    });
    const [isEditingMaintenance, setIsEditingMaintenance] = useState(false);

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
        const interval = setInterval(fetchLockers, 10000); 
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (selectedLocker) {
            const updated = lockers.find(l => l.id === selectedLocker.id);
            if (updated) setSelectedLocker(updated);
        }
    }, [lockers]);

    // Fetch History when locker is selected
    useEffect(() => {
        if (selectedLocker) {
            setLoadingHistory(true);
            fetch(`/api/lockers/history?lockerId=${selectedLocker.id}`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) setRentalHistory(data);
                })
                .catch(console.error)
                .finally(() => setLoadingHistory(false));
        } else {
            setRentalHistory([]);
        }
    }, [selectedLocker?.id]);

    // Reset map on view change
    useEffect(() => {
        if (viewMode === 'grid') {
            setScale(1);
            setPosition({ x: 0, y: 0 });
        }
    }, [viewMode]);

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
        setMaintenanceForm({
            issue: '',
            estimatedCost: 150000,
            estimatedCompletion: new Date().toISOString().split('T')[0],
            technicianName: 'Nguyen Van A (Tech)',
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
            const resLog = await fetch('/api/lockers/maintenance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(logData)
            });
            if (resLog.ok) {
                await fetchLockers();
                setIsEditingMaintenance(false);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleCompleteMaintenance = async () => {
        if (!selectedLocker) return;
        try {
             const res = await fetch('/api/lockers', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: selectedLocker.id, status: 'Available' })
            });
            if (res.ok) {
                fetchLockers();
                setIsEditingMaintenance(false);
            }
        } catch (err) {
            console.error(err);
        }
    }

    // Map Handlers
    const handleZoomIn = () => setScale(prev => Math.min(prev + 0.5, 4));
    const handleZoomOut = () => setScale(prev => Math.max(prev - 0.5, 1));

    const handleMouseDown = (e: React.MouseEvent) => {
        if (viewMode !== 'map') return;
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || viewMode !== 'map') return;
        e.preventDefault();
        setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const getStatusStyles = (status: LockerStatus) => {
        switch (status) {
            case 'Available': return {
                card: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100',
                badge: 'bg-green-100 text-green-700 ring-green-600/20',
                mapPin: 'bg-green-500 ring-green-300',
                header: 'bg-green-50'
            };
            case 'Occupied': return {
                card: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
                badge: 'bg-blue-100 text-blue-700 ring-blue-600/10',
                mapPin: 'bg-blue-500 ring-blue-300',
                header: 'bg-blue-50'
            };
            case 'Maintenance': return {
                card: 'bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100',
                badge: 'bg-yellow-100 text-yellow-800 ring-yellow-600/20',
                mapPin: 'bg-yellow-500 ring-yellow-300',
                header: 'bg-yellow-50'
            };
            case 'Error': return {
                card: 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100',
                badge: 'bg-red-100 text-red-700 ring-red-600/10',
                mapPin: 'bg-red-500 ring-red-300',
                header: 'bg-red-50'
            };
            default: return {
                card: 'bg-gray-50 border-gray-200 text-gray-700',
                badge: 'bg-gray-100 text-gray-700',
                mapPin: 'bg-gray-500',
                header: 'bg-gray-50'
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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('vi-VN', {
            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
        });
    };

    if (isLoading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div></div>;

    return (
        <div className="space-y-6">
            {/* Header Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-medium text-gray-500">Tổng số tủ</p>
                    <p className="mt-1 text-2xl font-semibold text-gray-900">{lockers.length}</p>
                </div>
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 shadow-sm">
                    <p className="text-xs font-medium text-green-600">Đang trống (Available)</p>
                    <p className="mt-1 text-2xl font-semibold text-green-700">{lockers.filter(l => l.status === 'Available').length}</p>
                </div>
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 shadow-sm">
                    <p className="text-xs font-medium text-blue-600">Đang thuê/Gửi</p>
                    <p className="mt-1 text-2xl font-semibold text-blue-700">{lockers.filter(l => l.status === 'Occupied').length}</p>
                </div>
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 shadow-sm">
                    <p className="text-xs font-medium text-yellow-600">Cần bảo trì (Flow 4)</p>
                    <p className="mt-1 text-2xl font-semibold text-yellow-700">{lockers.filter(l => ['Maintenance', 'Error', 'LowBattery'].includes(l.status)).length}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                 <div className="flex items-center gap-4">
                    <h2 className="text-lg font-semibold text-gray-900">Trạng thái Locker</h2>
                    <div className="flex items-center rounded-lg bg-gray-100 p-1">
                        <button onClick={() => setViewMode('grid')} className={`rounded-md p-1.5 ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}><Grid size={18} /></button>
                        <button onClick={() => setViewMode('map')} className={`rounded-md p-1.5 ${viewMode === 'map' ? 'bg-white shadow-sm' : ''}`}><MapIcon size={18} /></button>
                    </div>
                </div>
                <div className="flex gap-2">
                    {ZONES.map(zone => (
                        <button key={zone.id} onClick={() => setActiveZoneId(zone.id)} 
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeZoneId === zone.id ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:bg-gray-100'}`}>
                            {zone.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid View */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
                    {filteredLockers.map((locker) => {
                        const style = getStatusStyles(locker.status);
                        return (
                            <button
                                key={locker.id}
                                onClick={() => setSelectedLocker(locker)}
                                className={`group relative flex flex-col justify-between rounded-xl border p-4 transition-all hover:shadow-md hover:scale-105 text-left h-36 ${style.card}`}
                            >
                                <div className="flex w-full justify-between">
                                    <span className="font-bold text-lg">{locker.label}</span>
                                    <div className={`rounded-full p-1.5 ${style.badge}`}>{getStatusIcon(locker.status)}</div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs opacity-75">{locker.size} Size</p>
                                    <p className="text-xs font-medium opacity-75 truncate">{locker.location}</p>
                                    {locker.status === 'Occupied' && (
                                        <div className="mt-1 flex items-center gap-1">
                                             <Truck size={12} className="opacity-70" />
                                             <span className="text-[10px] font-bold uppercase tracking-wider">Active</span>
                                        </div>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            ) : (
                // Map View with Zoom/Pan
                <div 
                    className="relative w-full h-[600px] bg-slate-100 rounded-xl border border-gray-200 overflow-hidden cursor-grab active:cursor-grabbing"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                     {/* Draggable Container */}
                    <div 
                        className="absolute inset-0 w-full h-full transition-transform duration-100 ease-out origin-center"
                        style={{ 
                            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                        }}
                    >
                         {/* Map Background Grid */}
                         <div className="absolute inset-0 w-full h-full" 
                             style={{
                                 backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', 
                                 backgroundSize: '20px 20px' 
                             }}
                        >
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                                <span className="text-6xl font-bold text-slate-400">FLOOR MAP</span>
                            </div>
                        </div>

                         {filteredLockers.map((locker) => (
                            locker.coordinate && (
                                <div key={locker.id} 
                                    className="absolute rounded-full border-2 border-white shadow-md flex items-center justify-center transition-colors z-10 hover:z-20"
                                    style={{ 
                                        left: `${locker.coordinate.x}%`, 
                                        top: `${locker.coordinate.y}%`, 
                                        width: '24px', 
                                        height: '24px',
                                        // Counter-scale markers to keep them viewable size
                                        transform: `translate(-50%, -50%) scale(${1/scale})`,
                                        backgroundColor: locker.status === 'Available' ? '#22c55e' : locker.status === 'Occupied' ? '#3b82f6' : '#eab308',
                                        cursor: 'pointer'
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation(); 
                                        setSelectedLocker(locker);
                                    }}
                                >
                                    {/* Show label only if zoomed in enough */}
                                    <div className="absolute -bottom-5 whitespace-nowrap bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                                        {locker.label}
                                    </div>
                                </div>
                            )
                         ))}
                    </div>
                    
                    {/* Controls */}
                    <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-20">
                         <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-1 flex flex-col">
                            <button onClick={handleZoomIn} className="p-2 hover:bg-gray-50 text-gray-700 rounded-t border-b" title="Zoom In"><ZoomIn size={20}/></button>
                            <button onClick={handleZoomOut} className="p-2 hover:bg-gray-50 text-gray-700 rounded-b" title="Zoom Out"><ZoomOut size={20}/></button>
                         </div>
                         <button 
                            onClick={() => { setScale(1); setPosition({x:0,y:0}); }}
                            className="bg-white p-2 rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 text-gray-700"
                            title="Reset View"
                         >
                             <RefreshCw size={20}/>
                         </button>
                    </div>
                </div>
            )}

            {/* Modal Detail */}
            {selectedLocker && (
                <div className="fixed inset-0 z-50 flex items-end justify-end sm:items-center" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
                    <div className="h-full w-full sm:w-[500px] transform bg-white shadow-2xl sm:h-screen sm:border-l sm:border-gray-200 overflow-y-auto transition-transform duration-300 ease-in-out">
                         <div className={`flex items-center justify-between border-b px-6 py-4 ${getStatusStyles(selectedLocker.status).header}`}>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    {selectedLocker.label} 
                                    <span className="text-xs font-normal bg-white/50 px-2 py-0.5 rounded border border-black/5">{selectedLocker.size}</span>
                                </h3>
                                <p className="text-sm text-gray-600 flex items-center gap-1 mt-1"><MapPin size={14}/> {selectedLocker.location}</p>
                            </div>
                            <button onClick={() => setSelectedLocker(null)} className="rounded-full p-2 hover:bg-black/5 transition-colors"><X size={20}/></button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Battery & Status Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 rounded-lg border border-gray-100 bg-gray-50">
                                    <p className="text-xs text-gray-500 mb-1">Pin</p>
                                    <div className="flex items-center gap-2">
                                        <Battery size={20} className={selectedLocker.batteryLevel < 20 ? 'text-red-500' : 'text-green-500'} />
                                        <span className="font-bold">{selectedLocker.batteryLevel}%</span>
                                    </div>
                                </div>
                                <div className="p-3 rounded-lg border border-gray-100 bg-gray-50">
                                    <p className="text-xs text-gray-500 mb-1">Tổng doanh thu</p>
                                    <div className="flex items-center gap-2">
                                        <DollarSign size={20} className="text-yellow-600" />
                                        <span className="font-bold">{selectedLocker.totalRevenue.toLocaleString()}đ</span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="grid grid-cols-2 gap-3">
                                {selectedLocker.status === 'Occupied' ? (
                                    <button className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 shadow-sm">
                                        <Unlock size={16} /> Mở khóa khẩn cấp
                                    </button>
                                ) : selectedLocker.status === 'Available' ? (
                                    <button className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 shadow-sm">
                                        <Lock size={16} /> Đặt trước (Reserve)
                                    </button>
                                ) : null}
                                <button className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm">
                                    <Activity size={16} /> Xem nhật ký IoT
                                </button>
                            </div>

                            {/* Active Rental */}
                            {selectedLocker.currentUserId && (
                                <div className="rounded-lg bg-blue-50 p-4 border border-blue-100">
                                    <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                        <Package size={16}/> Đơn hàng hiện tại
                                    </h4>
                                    <div className="space-y-2 text-sm text-blue-800">
                                        <div className="flex justify-between">
                                            <span className="text-blue-600">User ID:</span>
                                            <span className="font-medium">{selectedLocker.currentUserId}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-blue-600">Loại:</span>
                                            <span className="font-medium">Thuê cá nhân / Gửi đồ</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Rental History Section - NEW */}
                            <div className="border-t pt-4">
                                <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <History size={16} /> Lịch sử sử dụng gần đây
                                </h4>
                                
                                {loadingHistory ? (
                                    <div className="text-center py-4 text-sm text-gray-500">Đang tải lịch sử...</div>
                                ) : rentalHistory.length > 0 ? (
                                    <div className="space-y-3">
                                        {rentalHistory.map(rental => (
                                            <div key={rental.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100 text-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                                        {rental.user?.avatar ? (
                                                            <img src={rental.user.avatar} alt="" className="h-full w-full object-cover" />
                                                        ) : (
                                                            <User size={14} className="text-gray-500" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{rental.user?.name || 'Unknown User'}</p>
                                                        <p className="text-xs text-gray-500">{formatDate(rental.startTime)}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                     <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${rental.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                        {rental.status}
                                                     </span>
                                                     <p className="text-xs font-medium text-gray-700 mt-0.5">{rental.type}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-sm text-gray-400 italic bg-gray-50 rounded-lg border border-dashed">
                                        Chưa có dữ liệu lịch sử
                                    </div>
                                )}
                            </div>

                            {/* Maintenance Section */}
                            <div className="pt-4 border-t">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-semibold text-gray-900 flex items-center gap-2"><Wrench size={16}/> Quản lý kỹ thuật</h4>
                                    {selectedLocker.status === 'Maintenance' ? (
                                        <button onClick={handleCompleteMaintenance} className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-md font-medium hover:bg-green-200 transition-colors">Hoàn thành sửa chữa</button>
                                    ) : (
                                        <button onClick={handleOpenMaintenanceMode} className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md font-medium hover:bg-gray-200 transition-colors">Báo cáo sự cố</button>
                                    )}
                                </div>
                                {isEditingMaintenance && (
                                    <div className="space-y-3 bg-gray-50 p-4 rounded-lg border animate-fade-in">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Mô tả lỗi</label>
                                            <input className="w-full p-2 text-sm border rounded-md focus:ring-2 focus:ring-cyan-500 outline-none" placeholder="VD: Kẹt cửa, hỏng khóa..." value={maintenanceForm.issue} onChange={e => setMaintenanceForm({...maintenanceForm, issue: e.target.value})} />
                                        </div>
                                        <div>
                                             <label className="block text-xs font-medium text-gray-700 mb-1">Kỹ thuật viên</label>
                                            <input className="w-full p-2 text-sm border rounded-md focus:ring-2 focus:ring-cyan-500 outline-none" placeholder="Tên KTV..." value={maintenanceForm.technicianName} onChange={e => setMaintenanceForm({...maintenanceForm, technicianName: e.target.value})} />
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                            <button onClick={() => setIsEditingMaintenance(false)} className="flex-1 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-200">Hủy</button>
                                            <button onClick={handleSaveMaintenance} className="flex-1 bg-black text-white py-2 rounded-md text-sm font-medium hover:bg-gray-800">Lưu thông tin</button>
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
