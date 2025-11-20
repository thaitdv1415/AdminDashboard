import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { rentalId } = await request.json();

    const rental = await prisma.rental.findUnique({
        where: { id: rentalId },
        include: { locker: true }
    });

    if (!rental || rental.userId !== session.id) {
        return NextResponse.json({ error: 'Không tìm thấy đơn hàng.' }, { status: 404 });
    }

    if (rental.status === 'Completed') {
        return NextResponse.json({ error: 'Đơn hàng đã hoàn tất.' }, { status: 400 });
    }

    // Release Process
    await prisma.$transaction([
        // Mark rental complete
        prisma.rental.update({
            where: { id: rentalId },
            data: { status: 'Completed' } // In real app, check if overdue and charge extra
        }),
        // Free the locker
        prisma.locker.update({
            where: { id: rental.lockerId },
            data: { status: 'Available', isLocked: false } // Open door
        })
    ]);

    return NextResponse.json({ success: true, message: 'Đã mở tủ thành công.' });

  } catch (error) {
    console.error("Release error:", error);
    return NextResponse.json({ error: 'Lỗi khi mở tủ.' }, { status: 500 });
  }
}