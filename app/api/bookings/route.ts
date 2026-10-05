import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

const prisma = new PrismaClient();

// GET: Mengambil daftar semua booking (Untuk Admin)
export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      include: { car: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ error: 'Gagal mengambil data booking' }, { status: 500 });
  }
}

// POST: Membuat data booking baru
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { carId, customerName, customerPhone, customerEmail, startDate, endDate } = body;

    // 1. Validasi data wajib
    if (!carId || !customerName || !startDate || !endDate) {
      return NextResponse.json({ error: 'Data tidak lengkap.' }, { status: 400 });
    }

    // 2. Ambil data mobil
    const car = await prisma.car.findUnique({ where: { id: carId } });
    if (!car) return NextResponse.json({ error: 'Mobil tidak ditemukan.' }, { status: 404 });
    if (!car.isAvailable) return NextResponse.json({ error: 'Mobil tidak tersedia.' }, { status: 400 });

    // 3. Validasi Tanggal
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    if (start < today) return NextResponse.json({ error: 'Tanggal mulai tidak boleh di masa lalu.' }, { status: 400 });
    if (end <= start) return NextResponse.json({ error: 'Tanggal selesai harus lebih akhir.' }, { status: 400 });

    const diffTime = Math.abs(end.getTime() - start.getTime());
    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 1) diffDays = 1;
    const totalPrice = diffDays * car.pricePerDay;

    // 4. 🔥 AMBIL USER YANG SEDANG LOGIN
    const user = await getCurrentUser();

    // 5. Simpan ke database
    const newBooking = await prisma.booking.create({
      data: {
        carId,
        customerName,
        customerPhone: customerPhone || '-',
        customerEmail: user?.email || customerEmail || null,
        startDate: start,
        endDate: end,
        totalPrice,
        status: 'PENDING',
        userId: user?.id || null,
      },
    });

    return NextResponse.json(newBooking, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ error: 'Gagal memproses booking' }, { status: 500 });
  }
}