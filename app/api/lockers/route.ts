
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const lockers = await prisma.locker.findMany({
      include: {
        maintenanceLogs: {
          orderBy: { reportedAt: 'desc' },
          take: 5
        },
        // Fetch active rental info to see WHO is using the locker
        rentals: {
            where: { status: { in: ['Stored', 'Pending', 'Overdue'] } },
            take: 1,
            orderBy: { startTime: 'desc' }
        }
      },
      orderBy: {
        id: 'asc'
      }
    });

    // Transform data
    const formattedLockers = lockers.map(locker => {
      // Calculate aggregate stats on the fly (or these could be cached fields in DB)
      // For this demo, random revenue/rentals is fine, or we could aggregate from prisma.rental
      // Let's use the random values from seed but formatted properly
      
      const activeRental = locker.rentals[0];

      return {
        ...locker,
        coordinate: { x: locker.coordinateX, y: locker.coordinateY },
        maintenanceHistory: locker.maintenanceLogs.map(h => ({
          ...h,
          reportedAt: h.reportedAt.toISOString(),
        })),
        currentRentalId: activeRental?.id || null,
        currentUserId: activeRental?.userId || null, // For Admin to see who rented it
        totalRevenue: Math.floor(Math.random() * 5000000), // Mock aggregate for now
        totalRentals: Math.floor(Math.random() * 100),
      };
    });

    return NextResponse.json(formattedLockers);
  } catch (error) {
    console.error('Error fetching lockers:', error);
    return NextResponse.json({ error: 'Failed to fetch lockers' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status, maintenanceLog } = body; // simplified update

    const updateData: any = { status };

    // If setting to maintenance, ensure we handle that logic
    if (status === 'Maintenance' || status === 'Available') {
        updateData.isLocked = status === 'Available'; // Auto lock if available
    }

    const updatedLocker = await prisma.locker.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedLocker);
  } catch (error) {
     console.error('Error updating locker:', error);
     return NextResponse.json({ error: 'Failed to update locker' }, { status: 500 });
  }
}
