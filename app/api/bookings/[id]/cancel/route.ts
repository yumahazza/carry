import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  // 1. Guard: Wajib Login (Customer)
  const authCheck = await requireUser();
  if (authCheck instanceof NextResponse) return authCheck;
  
  const user = authCheck; // user adalah SafeUser

  try {
    const bookingId = params.id;

    // 2. Cari Booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking tidak ditemukan.' }, { status: 404 });
    }

    // 3. Validasi Ownership (Poin #22) - CRITICAL!
    // Pastikan booking.userId sama dengan user.id yang login
    // (Catatan: Jika skema kamu pakai customerEmail sebagai penghubung, sesuaikan kondisinya)
    if (booking.userId !== user.id) {
      return NextResponse.json(
        { error: 'Akses ditolak. Anda tidak memiliki booking ini.' },
        { status: 403 }
      );
    }

    // 4. Validasi Status (Poin #12)
    // Hanya PENDING atau APPROVED yang bisa di-cancel
    if (booking.status !== 'PENDING' && booking.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Hanya booking dengan status PENDING atau APPROVED yang dapat dibatalkan.' },
        { status: 400 }
      );
    }

    // 5. Update Status ke CANCELLED
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED' },
    });

    // 6. Kembalikan ketersediaan mobil
    await prisma.car.update({
      where: { id: booking.carId },
      data: { isAvailable: true },
    });

    return NextResponse.json({ success: true, message: 'Booking berhasil dibatalkan.' });
  } catch (error) {
    console.error('Cancel Booking Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}