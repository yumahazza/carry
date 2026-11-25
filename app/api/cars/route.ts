import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PUBLIC_CAR_SELECT, ValidatedCarData, validateCarPayload } from '@/lib/cars';

/** Public endpoint to list vehicles with optional search, availability, brand, and sort. */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim();
    const available = searchParams.get('available');
    const brand = searchParams.get('brand')?.trim();
    const sort = searchParams.get('sort');

    const where: Prisma.CarWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (available === 'true') {
      where.isAvailable = true;
    } else if (available === 'false') {
      where.isAvailable = false;
    }

    if (brand && brand !== 'all') {
      where.brand = { equals: brand, mode: 'insensitive' };
    }

    let orderBy: Prisma.CarOrderByWithRelationInput = { createdAt: 'desc' };
    if (sort === 'price_asc') {
      orderBy = { pricePerDay: 'asc' };
    } else if (sort === 'price_desc') {
      orderBy = { pricePerDay: 'desc' };
    }

    const cars = await prisma.car.findMany({
      where,
      select: PUBLIC_CAR_SELECT,
      orderBy,
    });

    return NextResponse.json(cars);
  } catch (error) {
    console.error('Fetch Cars Error:', error);
    return NextResponse.json(
      { error: 'Gagal memuat daftar armada.' },
      { status: 500 }
    );
  }
}

/** Admin endpoint (legacy path) to create a new car. */
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
    console.error('Create Car Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}
