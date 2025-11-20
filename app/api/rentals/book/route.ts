import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { zoneId, size, durationHours, cost } = await request.json();

    // 1. Check Balance
    const user = await prisma.user.findUnique({ where: { id: session.id } });
    if (!user || user.balance < cost) {
        return NextResponse.json({ error: 'Số dư không đủ. Vui lòng nạp thêm tiền.' }, { status: 402 });
    }

    // 2. Find Available Locker
    const availableLocker = await prisma.locker.findFirst({
        where: {
            zoneId: zoneId,
            size: size,
            status: 'Available'
        }
    });

    if (!availableLocker) {
        return NextResponse.json({ error: 'Hiện tại không còn tủ trống phù hợp.' }, { status: 404 });
    }

    // 3. Transaction: Deduct Money & Create Rental
    const result = await prisma.$transaction(async (tx) => {
        // Deduct wallet
        await tx.user.update({
            where: { id: user.id },
            data: { balance: { decrement: cost } }
        });

        // Create Transaction Log
        await tx.transaction.create({
            data: {
                userId: user.id,
                amount: -cost,
                type: 'Payment',
                description: `Thuê tủ ${availableLocker.label} (${durationHours}h)`
            }
        });

        // Update Locker Status
        await tx.locker.update({
            where: { id: availableLocker.id },
            data: { status: 'Occupied', isLocked: true }
        });

        // Create Rental Record
        const rental = await tx.rental.create({
            data: {
                userId: user.id,
                lockerId: availableLocker.id,
                type: 'Personal',
                status: 'Stored',
                cost: cost,
                startTime: new Date(),
                // Calculate end time
                endTime: new Date(new Date().getTime() + durationHours * 60 * 60 * 1000),
                pinCode: Math.floor(100000 + Math.random() * 900000).toString() // Generate 6 digit PIN
            }
        });

        return rental;
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json({ error: 'Lỗi hệ thống khi đặt tủ.' }, { status: 500 });
  }
}