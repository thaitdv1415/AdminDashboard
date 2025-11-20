
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Support' | 'Editor' | 'Viewer';
  status: 'Active' | 'Inactive' | 'Pending';
  avatar: string;
  lastActive: string;
}

export type LockerStatus = 'Available' | 'Occupied' | 'Maintenance' | 'Error' | 'LowBattery' | 'Offline' | 'Resolved';

export interface MaintenanceLog {
  issue: string;
  reportedBy: string;
  reportedAt: string;
  estimatedCost: number;
  estimatedCompletion: string; // ISO Date or formatted string
  technicianName?: string;
  notes?: string; // New field for additional details
  status: 'Pending' | 'In Progress' | 'Resolved';
}

export interface Locker {
  id: string;
  label: string; // e.g., "A-01"
  zoneId: string; // e.g., "Z-A"
  location: string; // e.g., "Zone A - Lobby"
  status: LockerStatus;
  isLocked: boolean;
  batteryLevel: number;
  currentUserId?: string | null;
  lastOpened?: string;
  lastLockedAt?: string; // New field
  lastUnlockedAt?: string; // New field
  maintenanceInfo?: MaintenanceLog; // New field for detailed reporting
  maintenanceHistory?: MaintenanceLog[]; // New field for history
  totalRevenue: number; // New field for individual locker revenue
  totalRentals: number; // New field for usage statistics
  coordinate?: { x: number; y: number }; // Percentage coordinates (0-100) for map view
}

export interface RevenueData {
  name: string;
  revenue: number;     // Doanh thu
  utilization: number; // % sử dụng
  issues: number;      // Số lỗi báo cáo
}

export interface StatCardProps {
  title: string;
  value: string;
  trend: number;
  icon: React.ReactNode;
  trendLabel?: string;
  alert?: boolean;
}

export enum AppRoute {
  DASHBOARD = '/',
  LOCKERS = '/lockers',
  USERS = '/users',
  SETTINGS = '/settings',
  ANALYTICS = '/analytics'
}
