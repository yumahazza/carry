import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role } = body;

    // 1. Validasi input dasar
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nama, email, dan password wajib diisi!' },
        { status: 400 }
      );
    }

    // 2. Cek apakah email sudah pernah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar. Gunakan email lain.' },
        { status: 400 }
      );
    }

    // 3. Acak password (Hashing) dengan salt rounds 10
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Simpan user baru ke database
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'CUSTOMER', // Default jadi CUSTOMER kalau nggak dikirm
      },
    });

    // 5. Return data user TAPI tanpa password (demi keamanan)
    const { password: _, ...userWithoutPassword } = newUser;
    
    return NextResponse.json(
      { message: 'Register berhasil!', user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat registrasi' },
      { status: 500 }
    );
  }
}