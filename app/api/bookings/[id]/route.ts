import { NextResponse } from 'next/server';
import { BookingStatus } from '@prisma/client';
import { requireAdmin, requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isBookingOwner, transitionBookingStatus } from '@/lib/bookings';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await requireUser();
  if (authCheck instanceof NextResponse) return authCheck;
  const user = authCheck;

  try {
    const { id } = await params;
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        car: {
          select: {
            id: true,
            name: true,
            brand: true,
            pricePerDay: true,
            image: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking tidak ditemukan.' }, { status: 404 });
    }

    if (user.role !== 'ADMIN' && !isBookingOwner(booking, user)) {
      return NextResponse.json(
        { error: 'Akses ditolak. Anda tidak memiliki booking ini.' },
        { status: 403 }
      );
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error fetching booking detail:', error);
    return NextResponse.json({ error: 'Gagal mengambil detail booking.' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await requireAdmin();
  if (authCheck instanceof NextResponse) return authCheck;

  try {
    const { id } = await params;
    const body = await request.json();
    const status = body?.status as BookingStatus;

    const result = await transitionBookingStatus(id, status);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result.booking);
  } catch (error) {
    console.error('Error updating booking status:', error);
    return NextResponse.json({ error: 'Gagal mengupdate status booking.' }, { status: 500 });
  }
}
