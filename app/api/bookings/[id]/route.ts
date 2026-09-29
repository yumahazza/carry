import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// PATCH: Mengupdate status booking
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    // Validasi status agar tidak sembarangan
    const validStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Status tidak valid' }, { status: 400 });
    }

    // 1. Update status booking di database
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status },
    });

    // 2. Logika otomatis untuk update ketersediaan mobil
    if (status === 'CONFIRMED') {
      await prisma.car.update({
        where: { id: updatedBooking.carId },
        data: { isAvailable: false }, // Mobil jadi tidak tersedia
      });
    } else if (status === 'CANCELLED') {
      await prisma.car.update({
        where: { id: updatedBooking.carId },
        data: { isAvailable: true }, // Mobil jadi tersedia lagi
      });
    }

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error('Error updating booking status:', error);
    return NextResponse.json({ error: 'Gagal mengupdate status' }, { status: 500 });
  }
}