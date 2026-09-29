import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { generateToken } from '@/lib/auth'; // Import helper JWT kita

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // 1. Validasi input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan password wajib diisi!' },
        { status: 400 }
      );
    }

    // 2. Cari user berdasarkan email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Kalau user nggak ada, tolak (Jangan bilang "user tidak ada" biar hacker nggak bisa nebak email)
    if (!user) {
      return NextResponse.json(
        { error: 'Email atau password salah!' },
        { status: 401 }
      );
    }

    // 3. Bandingkan password yang diketik dengan hash di database
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Email atau password salah!' },
        { status: 401 }
      );
    }

    // 4. Kalau password benar, buatkan JWT Token
    const token = await generateToken({
      userId: user.id,
      role: user.role,
    });

    // 5. Siapkan response JSON (tanpa password)
    const response = NextResponse.json({
      message: 'Login berhasil!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    // 6. Simpan token di HTTP-Only Cookie
    response.cookies.set('token', token, {
      httpOnly: true, // JavaScript frontend TIDAK BISA baca cookie ini (Aman dari XSS)
      secure: process.env.NODE_ENV === 'production', // Hanya kirim via HTTPS kalau di production
      sameSite: 'lax', // Proteksi dari CSRF
      maxAge: 60 * 60 * 24, // Berlaku 1 hari (dalam detik)
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat login' },
      { status: 500 }
    );
  }
}