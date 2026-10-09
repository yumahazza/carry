import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// --- JWT Setup ---
const secretKey = process.env.JWT_SECRET || 'fallback-secret-key-untuk-dev';
const key = new TextEncoder().encode(secretKey);

// --- Prisma Client (buat 1x saja di level module) ---
const prisma = new PrismaClient();

// --- Tipe Data User yang Aman ---
export type SafeUser = {
  id: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN';
};

// --- Fungsi Membuat Token ---
export async function generateToken(payload: { userId: string; role: string }) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(key);
}

// --- Fungsi Verifikasi Token ---
export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, key);
    return payload as { userId: string; role: string };
  } catch (error) {
    return null;
  }
}

// --- Fungsi Mendapatkan User yang Sedang Login ---
export async function getCurrentUser(): Promise<SafeUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload || typeof payload.userId !== 'string') return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, name: true, email: true, role: true },
  });

  return user as SafeUser | null;
}

// --- GUARD: Wajib Login (Untuk Customer API) ---
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized: Anda harus login terlebih dahulu.' },
      { status: 401 }
    );
  }
  return user;
}

// --- GUARD: Wajib Admin (Untuk Admin API) ---
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Forbidden: Akses ditolak. Hanya untuk Admin.' },
      { status: 403 }
    );
  }
  return user;
}