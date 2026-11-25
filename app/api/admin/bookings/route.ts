import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const authCheck = await requireAdmin();
  if (authCheck instanceof NextResponse) return authCheck;

  try {
    const bookings = await prisma.booking.findMany({
      include: {
        car: {
          select: { id: true, name: true, brand: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Admin Fetch Bookings Error:', error);
    return NextResponse.json({ error: 'Gagal mengambil data booking.' }, { status: 500 });
  }
}
