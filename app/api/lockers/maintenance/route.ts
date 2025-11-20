import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { lockerId, ...logData } = body;

    // Create the log
    const newLog = await prisma.maintenanceLog.create({
      data: {
        ...logData,
        lockerId: lockerId,
        reportedAt: logData.reportedAt ? new Date(logData.reportedAt) : new Date(),
      }
    });

    // Update locker status if needed (e.g., if status is In Progress, set locker to Maintenance)
    if (logData.status === 'In Progress' || logData.status === 'Pending') {
        await prisma.locker.update({
            where: { id: lockerId },
            data: { status: 'Maintenance' }
        });
    }

    return NextResponse.json(newLog);
  } catch (error) {
    console.error('Error creating maintenance log:', error);
    return NextResponse.json({ error: 'Failed to create log' }, { status: 500 });
  }
}