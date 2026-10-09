import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth'; // Sesuaikan path
import { prisma } from '@/lib/prisma';

export async function GET() {
  // 1. Cek apakah user adalah admin. 
  // Jika bukan, fungsi ini langsung mengembalikan Response 403, kode di bawahnya tidak akan jalan.
  const authCheck = await requireAdmin();
  
  // 2. Type guard untuk TypeScript
  if (authCheck instanceof NextResponse) {
    return authCheck; 
  }

  // 3. Jika lolos, 'admin' dijamin bertipe SafeUser
  const admin = authCheck;

  // 4. Ambil data statistik (contoh)
  const totalCars = await prisma.car.count();
  const pendingBookings = await prisma.booking.count({ where: { status: 'PENDING' } });

  return NextResponse.json({
    totalCars,
    pendingBookings,
    message: `Halo Admin ${admin.name}, ini data statistik Anda.`
  });
}