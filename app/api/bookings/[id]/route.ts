import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    // Validasi status
    const validStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Status tidak valid' }, { status: 400 });
    }

    // 1. Update status booking di database
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status },
    });

    // 2. 🔥 LOGIKA KUNCI: Update ketersediaan mobil berdasarkan status
    if (status === 'CONFIRMED') {
      // Jika dikonfirmasi, mobil dikunci (Tidak Tersedia)
      await prisma.car.update({
        where: { id: updatedBooking.carId },
        data: { isAvailable: false },
      });
    } else if (status === 'CANCELLED' || status === 'COMPLETED') {
      // Jika dibatalkan ATAU SELESAI, mobil LANGSUNG dilepas (Tersedia)
      await prisma.car.update({
        where: { id: updatedBooking.carId },
        data: { isAvailable: true },
      });
    }

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error('Error updating booking status:', error);
    return NextResponse.json({ error: 'Gagal mengupdate status' }, { status: 500 });
  }
}