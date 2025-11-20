
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const lockerId = searchParams.get('lockerId');

    if (!lockerId) {
        return NextResponse.json({ error: 'Missing lockerId' }, { status: 400 });
    }

    try {
        const history = await prisma.rental.findMany({
            where: { lockerId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        avatar: true,
                        status: true,
                        lastActive: true,
                        balance: true
                    }
                }
            },
            orderBy: { startTime: 'desc' },
            take: 10
        });
        return NextResponse.json(history);
    } catch (error) {
        console.error("Error fetching locker history:", error);
        return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
    }
}
