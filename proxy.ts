import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

// UBAH NAMA FUNGSI DARI 'middleware' MENJADI 'proxy'
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  // 1. Jika tidak ada token sama sekali, tendang ke login untuk halaman yang butuh auth
  if (!token && (pathname.startsWith('/bookings') || pathname.startsWith('/my-bookings'))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Verifikasi token jika ada
  let payload: any = null;
  if (token) {
    payload = await verifyToken(token);
  }

  // 3. Jika token tidak valid (misal expired atau dimanipulasi), hapus cookie dan tendang ke login
  if (!payload && token) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('token');
    return response;
  }

  // 4. Proteksi Halaman ADMIN (Hanya role 'ADMIN' yang boleh akses)
  if (pathname.startsWith('/bookings') || pathname.startsWith('/admin')) {
    if (payload?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/my-bookings', request.url));
    }
  }

  // 5. Proteksi Halaman CUSTOMER (Harus login, role bebas asal punya token valid)
  if (pathname.startsWith('/my-bookings')) {
    if (!payload) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Kalau semua aman, lanjutkan request
  return NextResponse.next();
}

export const config = {
  matcher: ['/bookings/:path*', '/my-bookings/:path*'],
};

