import { NextResponse } from 'next/server';
import { BookingStatus } from '@prisma/client';
import { requireAdmin } from '@/lib/auth';
import { transitionBookingStatus } from '@/lib/bookings';

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
    console.error('Admin Update Booking Status Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}
