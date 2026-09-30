import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Daftar halaman yang WAJIB login untuk mengaksesnya
const protectedRoutes = ['/bookings'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Cek apakah halaman yang diakses ada di daftar protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute) {
    // Ambil token dari cookie
    const token = request.cookies.get('token')?.value;

    if (!token) {
      // Kalau nggak ada token, tendang ke login
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Verifikasi apakah token masih valid (belum expired & signature cocok)
    const payload = await verifyToken(token);
    if (!payload) {
      // Kalau token invalid/expired, hapus cookie dan tendang ke login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }
  }

  // Kalau aman, lanjutkan request seperti biasa
  return NextResponse.next();
}

// Konfigurasi agar middleware hanya berjalan di path tertentu (opsional, tapi bagus untuk performa)
export const config = {
  matcher: ['/bookings/:path*'],
};