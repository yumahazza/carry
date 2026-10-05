import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// GET: Mengambil daftar mobil (dengan fitur Search & Filter)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const availableParam = searchParams.get('available');

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (availableParam === 'true') {
      where.isAvailable = true;
    } else if (availableParam === 'false') {
      where.isAvailable = false;
    }

    const cars = await prisma.car.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(cars);

  } catch (error) {
    console.error('Error fetching cars:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data mobil' },
      { status: 500 }
    );
  }
}

// POST: Menambah mobil baru
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const newCar = await prisma.car.create({
      data: {
        name: body.name,
        brand: body.brand,
        year: parseInt(body.year),
        pricePerDay: parseInt(body.pricePerDay),
        isAvailable: true,
      },
    });
    
    return NextResponse.json(newCar, { status: 201 });
  } catch (error) {
    console.error('Error creating car:', error);
    return NextResponse.json(
      { error: 'Gagal menambahkan mobil' },
      { status: 500 }
    );
  }
}