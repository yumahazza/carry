import { SignJWT, jwtVerify } from 'jose';

// Ambil secret key dari .env, kalau nggak ada pakai fallback (hanya untuk dev)
const secretKey = process.env.JWT_SECRET || 'fallback-secret-key';
const key = new TextEncoder().encode(secretKey);

// Fungsi untuk membuat token
export async function generateToken(payload: { userId: string; role: string }) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d') // Token berlaku selama 1 hari
    .sign(key);
}

// Fungsi untuk memverifikasi token
export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, key);
    return payload;
  } catch (error) {
    return null; // Token tidak valid atau expired
  }
}