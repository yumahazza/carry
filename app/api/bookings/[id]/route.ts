import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const authCheck = await requireUser();
  if (authCheck instanceof NextResponse) return authCheck;

  const user = authCheck;

  // Ambil booking MILIK user ini saja (Ownership Validation terpenuhi!)
  const bookings = await prisma.booking.findMany({
    where: { 
      userId: user.id // Atau fallback ke customerEmail jika userId null
    },
    include: {
      car: {
        select: { id: true, name: true, brand: true, image: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json(bookings);
}