import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

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

// PUT: Mengupdate data mobil (BARU!)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Prisma akan mencari mobil berdasarkan ID, lalu update datanya
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