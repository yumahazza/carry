import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // 1. Cek siapa yang login
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Ambil booking HANYA untuk email user ini
    const bookings = await prisma.booking.findMany({
      where: {
        customerEmail: user.email,
      },
      include: {
        car: {
          select: {
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
    return NextResponse.json({ error: 'Gagal mengambil data booking' }, { status: 500 });
  }
}