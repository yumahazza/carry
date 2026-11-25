import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const authCheck = await requireUser();
  if (authCheck instanceof NextResponse) return authCheck;
  const user = authCheck;

  try {
    const bookings = await prisma.booking.findMany({
      where: {
        OR: [
          { userId: user.id },
          { userId: null, customerEmail: user.email },
        ],
      },
      include: {
        car: {
          select: {
            id: true,
            name: true,
            brand: true,
            pricePerDay: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching my bookings:', error);
    return NextResponse.json({ error: 'Gagal mengambil data booking.' }, { status: 500 });
  }
}
