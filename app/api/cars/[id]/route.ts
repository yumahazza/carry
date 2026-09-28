import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.car.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Mobil berhasil dihapus' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Gagal menghapus mobil' },
      { status: 500 }
    );
  }
}