import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
);

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'user' | 'admin';
  [key: string]: any;
}

export async function sign(payload: JWTPayload): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .sign(secret);

  return token;
}

export async function verify(token: string): Promise<JWTPayload> {
  const verified = await jwtVerify(token, secret);
  return verified.payload as unknown as JWTPayload;
}

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) return null;

  try {
    const verified = await verify(token);
    return verified;
  } catch (err) {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
}

// Extract token from NextRequest (Authorization header or cookies)
export function getToken(request: any): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  return request.cookies.get('token')?.value || null;
}

// Verify token (wraps verify with error handling)
export async function verifyToken(token: string | null): Promise<JWTPayload | null> {
  if (!token) return null;
  try {
    return await verify(token);
  } catch (err) {
    return null;
  }
}
