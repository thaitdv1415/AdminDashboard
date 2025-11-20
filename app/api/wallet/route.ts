import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { balance: true }
  });

  const transactions = await prisma.transaction.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: 'desc' },
      take: 10
  });

  return NextResponse.json({ balance: user?.balance || 0, transactions });
}

export async function POST(request: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { amount } = await request.json();

    const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.update({
            where: { id: session.id },
            data: { balance: { increment: amount } }
        });

        await tx.transaction.create({
            data: {
                userId: session.id,
                amount: amount,
                type: 'Topup',
                description: 'Nạp tiền vào ví'
            }
        });

        return user;
    });

    return NextResponse.json({ balance: result.balance });
}