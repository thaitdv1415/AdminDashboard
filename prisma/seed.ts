import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Clear existing data
  await prisma.maintenanceLog.deleteMany();
  await prisma.locker.deleteMany();
  await prisma.user.deleteMany();
  await prisma.statistic.deleteMany();

  const hashedPassword = await bcrypt.hash('123456', 10);

  // Seed Users
  await prisma.user.createMany({
    data: [
      { 
        name: 'Admin User', 
        email: 'admin@example.com', 
        password: hashedPassword, 
        role: 'Admin', 
        status: 'Active', 
        avatar: 'https://picsum.photos/seed/1/40/40', 
        lastActive: 'Just now' 
      },
      { 
        name: 'Normal User', 
        email: 'user@example.com', 
        password: hashedPassword, 
        role: 'User', 
        status: 'Active', 
        avatar: 'https://picsum.photos/seed/2/40/40', 
        lastActive: '1 hour ago' 
      },
    ]
  });

  // Seed Statistics
  await prisma.statistic.createMany({
    data: [
      { month: 'T1', revenue: 4000000, utilization: 240, issues: 2 },
      { month: 'T2', revenue: 3000000, utilization: 198, issues: 1 },
      { month: 'T3', revenue: 5000000, utilization: 350, issues: 0 },
      { month: 'T4', revenue: 4780000, utilization: 308, issues: 3 },
      { month: 'T5', revenue: 5890000, utilization: 410, issues: 1 },
      { month: 'T6', revenue: 6390000, utilization: 480, issues: 0 },
      { month: 'T7', revenue: 7490000, utilization: 520, issues: 4 },
    ]
  });

  // Seed Lockers
  const ZONES = [
    { id: 'Z-A', name: 'Zone A - Sảnh chính' },
    { id: 'Z-B', name: 'Zone B - Tầng 2' },
    { id: 'Z-C', name: 'Zone C - Khu thể thao' },
  ];

  for (let i = 0; i < 40; i++) {
    const r = Math.random();
    let status = 'Available';
    let battery = Math.floor(Math.random() * 40) + 60;

    if (r > 0.7) status = 'Occupied';
    else if (r > 0.88) status = 'Maintenance';
    else if (r > 0.93) status = 'LowBattery';
    else if (r > 0.97) status = 'Offline';
    else if (r > 0.99) status = 'Error';

    if (status === 'LowBattery') battery = Math.floor(Math.random() * 15) + 1;

    const zoneIndex = i % 3;
    const zone = ZONES[zoneIndex];

    let x = 0, y = 0;
    if (zone.id === 'Z-A') {
      x = Math.random() * 25 + 5;
      y = Math.random() * 80 + 10;
    } else if (zone.id === 'Z-B') {
      x = Math.random() * 25 + 37;
      y = Math.random() * 80 + 10;
    } else {
      x = Math.random() * 25 + 70;
      y = Math.random() * 80 + 10;
    }

    const lockerId = `L-${i + 1}`;
    const locker = await prisma.locker.create({
      data: {
        id: lockerId,
        label: `${zone.id.split('-')[1]}-${(Math.floor(i / 3) + 1).toString().padStart(2, '0')}`,
        zoneId: zone.id,
        location: zone.name,
        status: status,
        isLocked: status !== 'Available' && status !== 'Maintenance',
        batteryLevel: battery,
        currentUserId: status === 'Occupied' ? `User-${Math.floor(Math.random() * 100)}` : null,
        lastOpened: '10 phút trước',
        totalRevenue: Math.floor(Math.random() * 5000000),
        totalRentals: Math.floor(Math.random() * 500),
        coordinateX: x,
        coordinateY: y,
      }
    });

    if (Math.random() > 0.5) {
      await prisma.maintenanceLog.create({
        data: {
          issue: ['Kẹt khóa', 'Thay pin', 'Mất kết nối WiFi', 'Vệ sinh định kỳ'][Math.floor(Math.random() * 4)],
          reportedBy: 'System Log',
          reportedAt: new Date(),
          estimatedCost: 50000,
          estimatedCompletion: new Date().toISOString(),
          technicianName: 'Trần Văn A',
          status: 'Resolved',
          notes: 'Đã xử lý xong',
          lockerId: lockerId
        }
      });
    }
  }

  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
