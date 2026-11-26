import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

interface UserSession {
  id: string;
  role: 'ADMIN' | 'CUSTOMER';
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let user: UserSession | null = null;
  const sessionCookie = request.cookies.get('token')?.value;

  if (sessionCookie) {
    const decoded = await verifyToken(sessionCookie);
    if (
      decoded &&
      typeof decoded.userId === 'string' &&
      (decoded.role === 'ADMIN' || decoded.role === 'CUSTOMER')
    ) {
      user = { id: decoded.userId, role: decoded.role };
    }
  }

  // Proteksi halaman customer: guest diarahkan ke /login
  if (pathname.startsWith('/my-bookings') && !user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Proteksi halaman admin: guest ke /login, non-admin ke /my-bookings
  if (pathname.startsWith('/admin')) {
    if (!user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/my-bookings', request.url));
    }
  }

  // Sinkronisasi route legacy /bookings sesuai PRD §7.1 & §7.2
  if (pathname === '/bookings') {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (user.role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/bookings', request.url));
    }
    return NextResponse.redirect(new URL('/my-bookings', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/my-bookings/:path*', '/admin/:path*', '/bookings'],
};
