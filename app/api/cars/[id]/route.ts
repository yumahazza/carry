import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PUBLIC_CAR_SELECT } from '@/lib/cars';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const car = await prisma.car.findUnique({
      where: { id },
      select: PUBLIC_CAR_SELECT,
    });

    if (!car) {
      return NextResponse.json({ error: 'Mobil tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json(car);
  } catch (error) {
    console.error('Error fetching car:', error);
    return NextResponse.json({ error: 'Gagal mengambil data mobil.' }, { status: 500 });
  }
}
