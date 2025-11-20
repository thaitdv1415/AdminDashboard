
import { PrismaClient, LockerStatus, LockerSize, RentalType, RentalStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Clean up
  await prisma.maintenanceLog.deleteMany();
  await prisma.rental.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.locker.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('123456', 10);

  // 2. Seed Users with specific roles (Flow 3 & 4)
  const admin = await prisma.user.create({
    data: { 
      name: 'System Admin', email: 'admin@nexus.com', password: hashedPassword, 
      role: 'Admin', status: 'Active', balance: 0,
      avatar: 'https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff'
    }
  });

  const techStaff = await prisma.user.create({
    data: { 
      name: 'Nguyen Van A (Tech)', email: 'tech@nexus.com', password: hashedPassword, 
      role: 'Technician', status: 'Active', balance: 0,
      avatar: 'https://ui-avatars.com/api/?name=Tech+Staff&background=ffc107&color=000'
    }
  });

  const courier = await prisma.user.create({
    data: { 
      name: 'Fast Delivery Co.', email: 'shipper@fast.com', password: hashedPassword, 
      role: 'Courier', status: 'Active', balance: 500000,
      avatar: 'https://ui-avatars.com/api/?name=Shipper&background=28a745&color=fff'
    }
  });

  const endUser = await prisma.user.create({
    data: { 
      name: 'Tran Thi B', email: 'user@gmail.com', password: hashedPassword, 
      role: 'User', status: 'Active', balance: 200000, // Ví có tiền (Flow 6)
      avatar: 'https://ui-avatars.com/api/?name=Tran+Thi+B&background=random'
    }
  });

  // 3. Seed Lockers
  const ZONES = [
    { id: 'Z-A', name: 'Zone A - Lobby' },
    { id: 'Z-B', name: 'Zone B - 2nd Floor' },
    { id: 'Z-C', name: 'Zone C - Gym Area' },
  ];

  const sizes: LockerSize[] = ['Small', 'Medium', 'Large'];

  for (let i = 0; i < 40; i++) {
    const r = Math.random();
    let status: LockerStatus = 'Available';
    let battery = Math.floor(Math.random() * 40) + 60;

    // Probability distribution for status
    if (r > 0.6) status = 'Occupied';
    else if (r > 0.90) status = 'Maintenance';
    else if (r > 0.95) status = 'LowBattery';
    else if (r > 0.98) status = 'Offline';

    if (status === 'LowBattery') battery = Math.floor(Math.random() * 15) + 1;

    const zone = ZONES[i % 3];
    const size = sizes[i % 3];

    // Map coordinates
    let x = 0, y = 0;
    if (zone.id === 'Z-A') { x = Math.random() * 25 + 5; y = Math.random() * 80 + 10; }
    else if (zone.id === 'Z-B') { x = Math.random() * 25 + 37; y = Math.random() * 80 + 10; }
    else { x = Math.random() * 25 + 70; y = Math.random() * 80 + 10; }

    const locker = await prisma.locker.create({
      data: {
        id: `L-${i + 1}`,
        label: `${zone.id.split('-')[1]}-${(Math.floor(i / 3) + 1).toString().padStart(2, '0')}`,
        zoneId: zone.id,
        location: zone.name,
        size: size,
        status: status,
        isLocked: status !== 'Available' && status !== 'Maintenance',
        batteryLevel: battery,
        coordinateX: x,
        coordinateY: y,
      }
    });

    // 4. Seed Active Rentals for Occupied Lockers
    if (status === 'Occupied') {
        const rentalType: RentalType = Math.random() > 0.5 ? 'Delivery' : 'Personal';
        const renterId = rentalType === 'Delivery' ? courier.id : endUser.id;
        
        await prisma.rental.create({
            data: {
                type: rentalType,
                status: 'Stored',
                userId: renterId,
                lockerId: locker.id,
                pinCode: '123456', // Example PIN
                startTime: new Date(Date.now() - Math.random() * 10000000), // Started recently
                cost: rentalType === 'Personal' ? 15000 : 0,
            }
        });
    }

    // 5. Seed Maintenance Log for Broken Lockers
    if (status === 'Maintenance') {
        await prisma.maintenanceLog.create({
            data: {
                lockerId: locker.id,
                issue: 'Cửa bị kẹt cơ khí',
                reportedById: admin.id,
                estimatedCost: 150000,
                estimatedCompletion: new Date(Date.now() + 86400000),
                technicianName: techStaff.name,
                status: 'In Progress',
                notes: 'Đang chờ linh kiện thay thế'
            }
        });
    }
  }

  // 6. Seed Historical Data (Completed Rentals) for Charts
  console.log("Seeding historical data...");
  const months = [0, 1, 2, 3, 4, 5]; // Last 6 months
  for (const m of months) {
      const date = new Date();
      date.setMonth(date.getMonth() - m);
      
      for(let k=0; k<15; k++) { // 15 transactions per month
         await prisma.rental.create({
             data: {
                 type: 'Personal',
                 status: 'Completed',
                 userId: endUser.id,
                 lockerId: `L-${Math.floor(Math.random()*10)+1}`,
                 startTime: date,
                 endTime: new Date(date.getTime() + 3600000 * 4), // 4 hours later
                 cost: 20000,
                 isPaid: true
             }
         });
      }
  }

  console.log('Seeding finished.');
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
