import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const activeRentals = await prisma.rental.findMany({
      where: {
        userId: session.id,
        status: { in: ['Pending', 'Stored', 'Overdue'] }
      },
      include: {
        locker: true
      },
      orderBy: {
        startTime: 'desc'
      }
    });

    return NextResponse.json(activeRentals);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch rentals' }, { status: 500 });
  }
}