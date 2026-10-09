import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  // 1. Guard: Wajib Admin
  const authCheck = await requireAdmin();
  if (authCheck instanceof NextResponse) return authCheck;

  try {
    const body = await request.json();
    const { name, brand, year, pricePerDay, seats, transmission, fuel, image, description } = body;

    // 2. Validasi input sederhana
    if (!name || !brand || !pricePerDay) {
      return NextResponse.json(
        { error: 'Nama, merek, dan harga per hari wajib diisi.' },
        { status: 400 }
      );
    }

    // 3. Create ke Database
    const car = await prisma.car.create({
      data: {
        name,
        brand,
        year: parseInt(year) || new Date().getFullYear(),
        pricePerDay: parseInt(pricePerDay),
        seats: seats ? parseInt(seats) : null,
        transmission,
        fuel,
        image,
        description,
        isAvailable: true,
      },
    });

    return NextResponse.json(car, { status: 201 });
  } catch (error) {
    console.error('Create Car Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}