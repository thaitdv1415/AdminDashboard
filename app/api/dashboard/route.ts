
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Get monthly revenue and usage (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const rentals = await prisma.rental.findMany({
        where: {
            startTime: { gte: sixMonthsAgo },
            status: { in: ['Completed', 'Stored'] } // Count active and completed
        },
        select: {
            startTime: true,
            cost: true,
            type: true
        }
    });

    // Group by Month
    const statsMap = new Map<string, { revenue: number, utilization: number, issues: number }>();
    
    rentals.forEach(r => {
        const month = new Date(r.startTime).toLocaleString('vi-VN', { month: 'short' });
        const current = statsMap.get(month) || { revenue: 0, utilization: 0, issues: 0 };
        
        current.revenue += r.cost;
        current.utilization += 1;
        statsMap.set(month, current);
    });

    // Get Mock Issues for chart (since we don't have historical logs in simple seed for all months)
    const monthKeys = Array.from(statsMap.keys());
    monthKeys.forEach(m => {
        const current = statsMap.get(m)!;
        current.issues = Math.floor(Math.random() * 5); // Simulate 0-5 issues per month
        statsMap.set(m, current);
    });

    // Transform to array
    const formattedStats = Array.from(statsMap.entries()).map(([name, data]) => ({
        name,
        revenue: data.revenue,
        utilization: data.utilization,
        issues: data.issues
    })).reverse(); // Reverse if needed based on iteration order

    return NextResponse.json(formattedStats);
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
