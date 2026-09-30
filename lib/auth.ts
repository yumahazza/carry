import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers'; // <-- IMPORT INI YANG KURANG!
import { PrismaClient } from '@prisma/client'; // <-- IMPORT INI JUGA!

// --- JWT Setup ---
const secretKey = process.env.JWT_SECRET || 'fallback-secret-key';
const key = new TextEncoder().encode(secretKey);

// --- Prisma Client (buat 1x saja di level module) ---
const prisma = new PrismaClient();

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
    return payload;
  } catch (error) {
    return null;
  }
}

// --- Fungsi Mendapatkan User yang Sedang Login ---
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload || typeof payload.userId !== 'string') return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, name: true, email: true, role: true },
  });

  return user;
}