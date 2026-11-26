import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateToken, verifyToken } from '@/lib/jwt';

export { generateToken, verifyToken };

export type SafeUser = {
  id: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN';
  phone: string | null;
};

/** Fetch the currently authenticated user without exposing the password hash. */
export async function getCurrentUser(): Promise<SafeUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload || typeof payload.userId !== 'string') return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, name: true, email: true, role: true, phone: true },
  });

  return user as SafeUser | null;
}

/** Guard for authenticated customer/admin routes. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: 'Anda harus masuk terlebih dahulu.' },
      { status: 401 }
    );
  }
  return user;
}

/** Guard for admin-only routes. */
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: 'Anda harus masuk terlebih dahulu.' },
      { status: 401 }
    );
  }
  if (user.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Akses ditolak. Hanya untuk Admin.' },
      { status: 403 }
    );
  }
  return user;
}
