import { SignJWT, jwtVerify } from 'jose';

const secretKey = process.env.JWT_SECRET || 'fallback-secret-key-untuk-dev';
const key = new TextEncoder().encode(secretKey);

/** Generate a signed HS256 JWT session token valid for 1 day. */
export async function generateToken(payload: { userId: string; role: string }) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(key);
}

/** Verify a JWT session token and return its payload, or null if invalid. */
export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, key);
    return payload as { userId: string; role: string };
  } catch {
    return null;
  }
}
