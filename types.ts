
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Staff' | 'Technician' | 'Courier' | 'User';
  status: string;
  avatar: string;
  balance: number; // New: Wallet balance
  lastActive: string;
}

export type LockerStatus = 'Available' | 'Occupied' | 'Maintenance' | 'Error' | 'LowBattery' | 'Offline' | 'Resolved' | 'Reserved';
export type LockerSize = 'Small' | 'Medium' | 'Large';

export interface MaintenanceLog {
  id?: string;
  issue: string;
  reportedBy?: string; // Name or ID
  reportedAt: string;
  estimatedCost: number;
  estimatedCompletion: string; 
  technicianName?: string;
  notes?: string; 
  status: 'Pending' | 'In Progress' | 'Resolved';
}

export interface Rental {
  id: string;
  type: 'Delivery' | 'Personal' | 'P2P';
  status: 'Pending' | 'Stored' | 'Completed' | 'Overdue' | 'Cancelled';
  startTime: string;
  endTime?: string;
  cost: number;
  pinCode?: string;
  locker?: Locker;
  lockerId: string;
  user?: User; // Added for history display
  userId?: string;
}

export interface Locker {
  id: string;
  label: string; 
  zoneId: string; 
  location: string; 
  size: LockerSize; // New
  status: LockerStatus;
  isLocked: boolean;
  batteryLevel: number;
  
  currentRentalId?: string | null;
  currentUserId?: string | null;
  currentRental?: Rental | null; // Hydrated data
  
  lastOpened?: string;
  maintenanceInfo?: MaintenanceLog; 
  maintenanceHistory?: MaintenanceLog[]; 
  
  // Computed fields for frontend display
  totalRevenue: number; 
  totalRentals: number; 
  
  coordinate?: { x: number; y: number }; 
  coordinateX?: number;
  coordinateY?: number;
}

export interface RevenueData {
  name: string;
  revenue: number;     
  utilization: number; 
  issues: number;      
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
  ANALYTICS = '/analytics',
  // Client Routes
  CLIENT_HOME = '/client',
  CLIENT_RENT = '/client/rent',
  CLIENT_HISTORY = '/client/history',
  CLIENT_WALLET = '/client/wallet'
}