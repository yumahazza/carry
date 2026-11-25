import { NextResponse } from 'next/server';
import { requireAdmin, requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateBookingTotal } from '@/lib/bookings';

/** Admin endpoint (legacy path) to list all bookings. */
export async function GET() {
  const authCheck = await requireAdmin();
  if (authCheck instanceof NextResponse) return authCheck;

  try {
    const bookings = await prisma.booking.findMany({
      include: {
        car: {
          select: { id: true, name: true, brand: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ error: 'Gagal mengambil data booking.' }, { status: 500 });
  }
}

/** Customer/Authenticated endpoint to create a new booking. */
export async function POST(request: Request) {
  const authCheck = await requireUser();
  if (authCheck instanceof NextResponse) return authCheck;
  const user = authCheck;

  try {
    const body = await request.json();
    const { carId, customerName, customerPhone, customerEmail, startDate, endDate } = body;

    const resolvedName =
      typeof customerName === 'string' && customerName.trim()
        ? customerName.trim()
        : user.name;
    const resolvedPhone =
      typeof customerPhone === 'string' && customerPhone.trim()
        ? customerPhone.trim()
        : user.phone || '';
    const resolvedEmail =
      user.email ||
      (typeof customerEmail === 'string' ? customerEmail.trim() : '');

    if (!carId || !resolvedName || !resolvedPhone || !resolvedEmail || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Nama lengkap, nomor telepon, tanggal mulai, dan tanggal selesai wajib diisi.' },
        { status: 400 }
      );
    }

    const car = await prisma.car.findUnique({ where: { id: carId } });
    if (!car) {
      return NextResponse.json({ error: 'Mobil tidak ditemukan.' }, { status: 404 });
    }
    if (!car.isAvailable) {
      return NextResponse.json({ error: 'Mobil sedang tidak tersedia untuk disewa.' }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return NextResponse.json({ error: 'Format tanggal tidak valid.' }, { status: 400 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return NextResponse.json(
        { error: 'Tanggal mulai tidak boleh di masa lalu.' },
        { status: 400 }
      );
    }
    if (end <= start) {
      return NextResponse.json(
        { error: 'Tanggal selesai harus setelah tanggal mulai.' },
        { status: 400 }
      );
    }

    const totalPrice = calculateBookingTotal(start, end, car.pricePerDay);

    const newBooking = await prisma.booking.create({
      data: {
        carId,
        userId: user.id,
        customerName: resolvedName,
        customerPhone: resolvedPhone,
        customerEmail: resolvedEmail,
        startDate: start,
        endDate: end,
        totalPrice,
        status: 'PENDING',
      },
    });

    return NextResponse.json(newBooking, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ error: 'Gagal memproses booking.' }, { status: 500 });
  }
}
