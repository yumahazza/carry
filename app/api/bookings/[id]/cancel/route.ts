import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isBookingOwner } from '@/lib/bookings';

async function handleCancelBooking(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await requireUser();
  if (authCheck instanceof NextResponse) return authCheck;
  const user = authCheck;

  try {
    const { id: bookingId } = await params;

    const result = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
      });

      if (!booking) {
        return { ok: false as const, status: 404, error: 'Booking tidak ditemukan.' };
      }

      if (user.role !== 'ADMIN' && !isBookingOwner(booking, user)) {
        return {
          ok: false as const,
          status: 403,
          error: 'Akses ditolak. Anda tidak memiliki booking ini.',
        };
      }

      if (booking.status !== 'PENDING' && booking.status !== 'APPROVED') {
        return {
          ok: false as const,
          status: 400,
          error: 'Hanya booking berstatus Pending atau Approved yang dapat dibatalkan.',
        };
      }

      const updated = await tx.booking.update({
        where: { id: bookingId },
        data: { status: 'CANCELLED' },
      });

      // Hanya kembalikan ketersediaan mobil jika booking sebelumnya sudah APPROVED
      if (booking.status === 'APPROVED') {
        await tx.car.update({
          where: { id: booking.carId },
          data: { isAvailable: true },
        });
      }

      return { ok: true as const, booking: updated };
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({
      success: true,
      message: 'Pesanan berhasil dibatalkan.',
      booking: result.booking,
    });
  } catch (error) {
    console.error('Cancel Booking Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  return handleCancelBooking(request, context);
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  return handleCancelBooking(request, context);
}
