import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PUBLIC_CAR_SELECT, ValidatedCarData, validateCarPayload } from '@/lib/cars';

export async function GET() {
  const authCheck = await requireAdmin();
  if (authCheck instanceof NextResponse) return authCheck;

  try {
    const cars = await prisma.car.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(cars);
  } catch (error) {
    console.error('Admin Fetch Cars Error:', error);
    return NextResponse.json({ error: 'Gagal memuat daftar armada.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authCheck = await requireAdmin();
  if (authCheck instanceof NextResponse) return authCheck;

  try {
    const body = await request.json();
    const validation = validateCarPayload(body);

    if (validation.error || !validation.data) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const car = await prisma.car.create({
      data: validation.data as ValidatedCarData,
      select: PUBLIC_CAR_SELECT,
    });

    return NextResponse.json(car, { status: 201 });
  } catch (error) {
    console.error('Admin Create Car Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}
