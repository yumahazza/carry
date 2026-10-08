import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// DEFINISIKAN TIPE DI LEVEL MODULE (paling atas, di luar function)
interface UserSession {
  id: string
  role: 'ADMIN' | 'CUSTOMER'
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // PAKSA TIPE DENGAN TYPE ANNOTATION YANG EKSPLISIT
  const user: UserSession | null = null

  const sessionCookie = request.cookies.get('session_token')?.value

  if (sessionCookie) {
    try {
      // TODO: Implementasi verify session
      // const decoded = verifyToken(sessionCookie)
      // user = { id: decoded.id, role: decoded.role }
    } catch (error) {
      // Biarkan null
    }
  }

  // 16. Redirect Guest dari /my-bookings ke /login
  if (pathname.startsWith('/my-bookings') && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 17. Redirect Customer dari /admin ke /my-bookings
  // PAKSA CHECK DENGAN TYPE GUARD
  if (pathname.startsWith('/admin') && user && (user as UserSession).role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/my-bookings', request.url))
  }

  // 6. Redirect /bookings ke route yang sesuai
  if (pathname === '/bookings') {
    if (user && (user as UserSession).role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/bookings', request.url))
    } else if (user) {
      return NextResponse.redirect(new URL('/my-bookings', request.url))
    } else {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/my-bookings/:path*',
    '/admin/:path*',
    '/bookings',
  ],
}