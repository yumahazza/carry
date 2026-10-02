import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID diperlukan' }, { status: 400 });
  }

  try {
    const bookings = await prisma.booking.findMany({
      where: { userId }, // Hanya ambil punya user ini
      include: { car: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(bookings);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil riwayat' }, { status: 500 });
  }
}