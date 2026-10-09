import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Peta Transisi Status yang Diizinkan (PRD §10.7)
const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['APPROVED', 'REJECTED'],
  APPROVED: ['COMPLETED'],
  // REJECTED, COMPLETED, CANCELLED tidak bisa pindah ke status lain
};

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  // 1. Guard: Wajib Admin
  const authCheck = await requireAdmin();
  if (authCheck instanceof NextResponse) return authCheck;

  try {
    const { status } = await request.json();
    const bookingId = params.id;

    // 2. Cari booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { car: true }, // Include car untuk update availability nanti
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking tidak ditemukan.' }, { status: 404 });
    }

    // 3. Validasi Lifecycle (Poin #18)
    const allowedNextStatuses = VALID_TRANSITIONS[booking.status] || [];
    
    if (!allowedNextStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Transisi status dari ${booking.status} ke ${status} tidak diizinkan.` },
        { status: 400 }
      );
    }

    // 4. Update Status Booking
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    });

    // 5. Logic Tambahan: Update Ketersediaan Mobil
    // Jika di-approve, mobil jadi tidak available. Jika di-reject/complete, available lagi.
    let carAvailabilityUpdate = {};
    if (status === 'APPROVED') {
      carAvailabilityUpdate = { isAvailable: false };
    } else if (status === 'REJECTED' || status === 'COMPLETED' || status === 'CANCELLED') {
      carAvailabilityUpdate = { isAvailable: true };
    }

    if (Object.keys(carAvailabilityUpdate).length > 0) {
      await prisma.car.update({
        where: { id: booking.carId },
        data: carAvailabilityUpdate,
      });
    }

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error('Update Status Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}