import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
const prisma = new PrismaClient();

// PATCH: Mengubah status booking & update ketersediaan mobil
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    // 1. Update status booking di database
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status },
    });

    // 2. LOGIKA PENTING: Sinkronisasi status mobil
    if (status === 'COMPLETED' || status === 'CANCELLED') {
      // Jika sewa selesai atau dibatalkan, mobil jadi tersedia lagi
      await prisma.car.update({
        where: { id: updatedBooking.carId },
        data: { isAvailable: true },
      });
    } else if (status === 'CONFIRMED') {
      // Jika dikonfirmasi, mobil dikunci (tidak tersedia)
      await prisma.car.update({
        where: { id: updatedBooking.carId },
        data: { isAvailable: false },
      });
    }

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error('Error updating booking status:', error);
    return NextResponse.json({ error: 'Gagal update status' }, { status: 500 });
  }
}