import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Mengambil detail 1 mobil berdasarkan ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // Next.js 15+ params adalah Promise
) {
  try {
    const { id } = await params;

    const car = await prisma.car.findUnique({
      where: { id },
    });

    if (!car) {
      return NextResponse.json({ error: 'Mobil tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(car);
  } catch (error) {
    console.error('Error fetching car:', error);
    return NextResponse.json({ error: 'Gagal mengambil data mobil' }, { status: 500 });
  }
}