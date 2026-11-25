import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const authCheck = await requireAdmin();
  if (authCheck instanceof NextResponse) return authCheck;

  try {
    const [
      totalCars,
      availableCars,
      totalBookings,
      pendingBookings,
      approvedBookings,
      completedBookings,
      cancelledBookings,
      rejectedBookings,
      revenueAggregate,
    ] = await Promise.all([
      prisma.car.count(),
      prisma.car.count({ where: { isAvailable: true } }),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: 'PENDING' } }),
      prisma.booking.count({ where: { status: 'APPROVED' } }),
      prisma.booking.count({ where: { status: 'COMPLETED' } }),
      prisma.booking.count({ where: { status: 'CANCELLED' } }),
      prisma.booking.count({ where: { status: 'REJECTED' } }),
      prisma.booking.aggregate({
        _sum: { totalPrice: true },
        where: { status: { in: ['APPROVED', 'COMPLETED'] } },
      }),
    ]);

    return NextResponse.json({
      totalCars,
      availableCars,
      unavailableCars: totalCars - availableCars,
      totalBookings,
      pendingBookings,
      approvedBookings,
      completedBookings,
      cancelledBookings,
      rejectedBookings,
      totalRevenue: revenueAggregate._sum.totalPrice ?? 0,
    });
  } catch (error) {
    console.error('Admin Stats Error:', error);
    return NextResponse.json({ error: 'Gagal memuat statistik admin.' }, { status: 500 });
  }
}
