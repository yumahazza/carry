import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  // HALAMAN BUTUH LOGIN (Customer & Admin)
  if (pathname.startsWith('/my-bookings')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    const payload = await verifyToken(token);
    if (!payload) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }
  }

  // HALAMAN KHUSUS ADMIN
  if (pathname.startsWith('/bookings') || pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    const payload = await verifyToken(token);
    if (!payload) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }
    if (payload.role !== 'ADMIN') {
      // Customer yang nyoba ngintip dashboard admin? Tendang balik!
      return NextResponse.redirect(new URL('/my-bookings', request.url));
    }
  }

  // ✅ Semua aman, lanjutkan request
  return NextResponse.next();
}

export const config = {
  // ⚠️ PENTING: JANGAN masukkan '/cars' ke matcher!
  // Hanya route yang butuh proteksi yang kita daftarkan di sini.
  matcher: ['/bookings/:path*', '/admin/:path*', '/my-bookings/:path*'],
};