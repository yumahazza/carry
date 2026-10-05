import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // 1. Pastikan yang akses adalah ADMIN
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // 2. Hitung statistik mobil
    const totalCars = await prisma.car.count();
    const availableCars = await prisma.car.count({ where: { isAvailable: true } });
    
    // 3. Hitung statistik booking
    const totalBookings = await prisma.booking.count();
    const pendingBookings = await prisma.booking.count({ where: { status: 'PENDING' } });
    const confirmedBookings = await prisma.booking.count({ where: { status: 'CONFIRMED' } });
    
    // 4. Hitung estimasi pendapatan (hanya dari booking CONFIRMED & COMPLETED)
    const revenueResult = await prisma.booking.aggregate({
      _sum: { totalPrice: true },
      where: { status: { in: ['CONFIRMED', 'COMPLETED'] } },
    });
    const totalRevenue = revenueResult._sum.totalPrice || 0;

    // 5. Return data
    return NextResponse.json({
      totalCars,
      availableCars,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      totalRevenue,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Gagal mengambil statistik' }, { status: 500 });
  }
}