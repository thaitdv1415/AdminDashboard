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
    const history = await prisma.rental.findMany({
      where: {
        userId: session.id,
        status: { in: ['Completed', 'Cancelled'] } // Only fetch finished rentals
      },
      include: {
        locker: true
      },
      orderBy: {
        endTime: 'desc' // Most recent first
      }
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error("Error fetching history:", error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}