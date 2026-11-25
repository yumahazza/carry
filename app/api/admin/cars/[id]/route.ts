import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PUBLIC_CAR_SELECT, validateCarPayload } from '@/lib/cars';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await requireAdmin();
  if (authCheck instanceof NextResponse) return authCheck;

  try {
    const { id } = await params;
    const existingCar = await prisma.car.findUnique({ where: { id } });
    if (!existingCar) {
      return NextResponse.json({ error: 'Mobil tidak ditemukan.' }, { status: 404 });
    }

    const body = await request.json();
    const validation = validateCarPayload(body, { partial: true });

    if (validation.error || !validation.data || Object.keys(validation.data).length === 0) {
      return NextResponse.json(
        { error: validation.error || 'Tidak ada data yang diperbarui.' },
        { status: 400 }
      );
    }

    const updatedCar = await prisma.car.update({
      where: { id },
      data: validation.data,
      select: PUBLIC_CAR_SELECT,
    });

    return NextResponse.json(updatedCar);
  } catch (error) {
    console.error('Admin Update Car Error:', error);
    return NextResponse.json({ error: 'Gagal memperbarui data mobil.' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await requireAdmin();
  if (authCheck instanceof NextResponse) return authCheck;

  try {
    const { id } = await params;
    const existingCar = await prisma.car.findUnique({ where: { id } });
    if (!existingCar) {
      return NextResponse.json({ error: 'Mobil tidak ditemukan.' }, { status: 404 });
    }

    // PRD §10.8 & §25.15: Cegah hard delete jika ada booking aktif/historis (melindungi integritas riwayat dari Cascade)
    const activeBookingCount = await prisma.booking.count({
      where: {
        carId: id,
        status: { in: ['PENDING', 'APPROVED'] },
      },
    });

    if (activeBookingCount > 0) {
      return NextResponse.json(
        { error: 'Mobil ini tidak dapat dihapus karena masih memiliki booking aktif.' },
        { status: 409 }
      );
    }

    const totalBookingCount = await prisma.booking.count({ where: { carId: id } });
    if (totalBookingCount > 0) {
      return NextResponse.json(
        { error: 'Mobil ini memiliki riwayat booking sehingga tidak dapat dihapus permanen.' },
        { status: 409 }
      );
    }

    await prisma.car.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Armada mobil berhasil dihapus.' });
  } catch (error) {
    console.error('Admin Delete Car Error:', error);
    return NextResponse.json({ error: 'Gagal menghapus data mobil.' }, { status: 500 });
  }
}
