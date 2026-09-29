import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// GET: Mengambil detail 1 mobil
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const car = await prisma.car.findUnique({
      where: { id },
    });

    if (!car) {
      return NextResponse.json(
        { error: 'Mobil tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json(car);
  } catch (error) {
    console.error('Error fetching car detail:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil detail mobil' }, // Ini baru tempatnya error 'detail'
      { status: 500 }
    );
  }
}

// PUT: Mengupdate data mobil
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const updatedCar = await prisma.car.update({
      where: { id },
      data: {
        name: body.name,
        brand: body.brand,
        year: body.year,
        pricePerDay: body.pricePerDay,
      },
    });
    
    return NextResponse.json(updatedCar);
  } catch (error) {
    return NextResponse.json(
      { error: 'Gagal mengupdate mobil' },
      { status: 500 }
    );
  }
}

// DELETE: Menghapus mobil
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.car.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Mobil berhasil dihapus' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Gagal menghapus mobil' },
      { status: 500 }
    );
  }
}