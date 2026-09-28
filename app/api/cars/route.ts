import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// GET: Mengambil semua data mobil
export async function GET() {
  try {
    const cars = await prisma.car.findMany();
    return NextResponse.json(cars);
  } catch (error) {
    return NextResponse.json(
      { error: 'Gagal mengambil data mobil' },
      { status: 500 }
    );
  }
}

// POST: Menambah data mobil baru
export async function POST(request: Request) {
  try {
    // 1. Ambil data JSON yang dikirim dari body request
    const body = await request.json();

    // 2. Simpan ke database menggunakan Prisma
    const newCar = await prisma.car.create({
      data: {
        name: body.name,
        brand: body.brand,
        year: body.year,
        pricePerDay: body.pricePerDay,
      },
    });

    // 3. Kembalikan data mobil yang baru dibuat
    return NextResponse.json(newCar, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Gagal menambah mobil' },
      { status: 500 }
    );
  }
}