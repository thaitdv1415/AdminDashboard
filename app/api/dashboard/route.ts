import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const stats = await prisma.statistic.findMany({
      orderBy: { month: 'asc' }
    });

    const formattedStats = stats.map(s => ({
        name: s.month,
        revenue: s.revenue,
        utilization: s.utilization,
        issues: s.issues
    }));

    return NextResponse.json(formattedStats);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}