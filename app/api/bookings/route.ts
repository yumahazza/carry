import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// GET: Mengambil daftar semua booking (BARU!)
export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        car: true, // Ini yang ajaib: mengambil data mobil yang di-booking sekaligus
      },
      orderBy: {
        createdAt: 'desc', // Urutkan dari yang terbaru
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data booking' },
      { status: 500 }
    );
  }
}

// POST: Membuat data booking baru (BIARKAN YANG INI TETAP ADA DI BAWAHNYA)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { carId, customerName, customerPhone, startDate, endDate } = body;

    if (!carId || !customerName || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Data tidak lengkap. Mohon isi semua field.' },
        { status: 400 }
      );
    }

    const car = await prisma.car.findUnique({ where: { id: carId } });
    if (!car) {
      return NextResponse.json({ error: 'Mobil tidak ditemukan di database.' }, { status: 404 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 1) diffDays = 1; 

    const totalPrice = diffDays * car.pricePerDay;

    const newBooking = await prisma.booking.create({
      data: {
        carId,
        customerName,
        customerPhone: customerPhone || '-',
        startDate: start,
        endDate: end,
        totalPrice,
        status: 'PENDING',
      },
    });

    return NextResponse.json(newBooking, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ error: 'Gagal memproses booking' }, { status: 500 });
  }
}