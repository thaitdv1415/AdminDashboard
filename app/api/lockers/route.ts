import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic'; // Ensure not cached

export async function GET() {
  try {
    const lockers = await prisma.locker.findMany({
      include: {
        maintenanceHistory: {
          orderBy: { reportedAt: 'desc' }
        }
      },
      orderBy: {
        id: 'asc'
      }
    });

    // Transform data to match frontend interface (converting coordinateX/Y to object)
    const formattedLockers = lockers.map(locker => ({
      ...locker,
      coordinate: { x: locker.coordinateX, y: locker.coordinateY },
      maintenanceHistory: locker.maintenanceHistory.map(h => ({
        ...h,
        reportedAt: h.reportedAt.toISOString(), // Convert Date to String for frontend
      }))
    }));

    return NextResponse.json(formattedLockers);
  } catch (error) {
    console.error('Error fetching lockers:', error);
    return NextResponse.json({ error: 'Failed to fetch lockers' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    
    // Separate coordinate if present, though usually we update status
    const { coordinate, maintenanceHistory, ...rest } = updateData;

    const updatedLocker = await prisma.locker.update({
      where: { id },
      data: rest,
    });

    return NextResponse.json(updatedLocker);
  } catch (error) {
     console.error('Error updating locker:', error);
     return NextResponse.json({ error: 'Failed to update locker' }, { status: 500 });
  }
}