import { BookingStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export const CANONICAL_BOOKING_STATUSES: readonly BookingStatus[] = [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'COMPLETED',
  'CANCELLED',
];

const VALID_ADMIN_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  PENDING: ['APPROVED', 'REJECTED', 'CANCELLED'],
  APPROVED: ['COMPLETED', 'CANCELLED'],
  REJECTED: [],
  COMPLETED: [],
  CANCELLED: [],
};

/**
 * Calculate total booking price in Rupiah per PRD §10.5.
 */
export function calculateBookingTotal(
  startDate: Date,
  endDate: Date,
  pricePerDay: number
): number {
  const diffTime = endDate.getTime() - startDate.getTime();
  const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  return diffDays * pricePerDay;
}

/**
 * Check if a user owns a booking (by userId or legacy customerEmail fallback).
 */
export function isBookingOwner(
  booking: { userId: string | null; customerEmail: string },
  user: { id: string; email: string }
): boolean {
  if (booking.userId === user.id) return true;
  if (booking.userId === null && booking.customerEmail.toLowerCase() === user.email.toLowerCase()) {
    return true;
  }
  return false;
}

export type TransitionResult =
  | { ok: true; booking: Awaited<ReturnType<typeof prisma.booking.update>> }
  | { ok: false; status: number; error: string };

/**
 * Atomically transition a booking status and synchronize Car.isAvailable.
 */
export async function transitionBookingStatus(
  bookingId: string,
  nextStatus: BookingStatus
): Promise<TransitionResult> {
  if (!CANONICAL_BOOKING_STATUSES.includes(nextStatus)) {
    return { ok: false, status: 400, error: 'Status booking tidak valid.' };
  }

  return await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
      include: { car: true },
    });

    if (!booking) {
      return { ok: false, status: 404, error: 'Booking tidak ditemukan.' };
    }

    const allowedNext = VALID_ADMIN_TRANSITIONS[booking.status] || [];
    if (!allowedNext.includes(nextStatus)) {
      return {
        ok: false,
        status: 400,
        error: `Transisi status dari ${booking.status} ke ${nextStatus} tidak diizinkan.`,
      };
    }

    if (nextStatus === 'APPROVED' && !booking.car.isAvailable) {
      return {
        ok: false,
        status: 409,
        error: 'Mobil sudah tidak tersedia untuk disetujui.',
      };
    }

    const updatedBooking = await tx.booking.update({
      where: { id: bookingId },
      data: { status: nextStatus },
    });

    if (nextStatus === 'APPROVED') {
      await tx.car.update({
        where: { id: booking.carId },
        data: { isAvailable: false },
      });
    } else if (
      booking.status === 'APPROVED' &&
      (nextStatus === 'COMPLETED' || nextStatus === 'CANCELLED')
    ) {
      await tx.car.update({
        where: { id: booking.carId },
        data: { isAvailable: true },
      });
    }

    return { ok: true, booking: updatedBooking };
  });
}
