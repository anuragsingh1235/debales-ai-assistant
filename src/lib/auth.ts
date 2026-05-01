import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import { IUser } from '@/types';

const SESSION_COOKIE = 'debales_session';

// Very simple session: just store userId in a signed cookie
// For production you'd want JWT or next-auth, but this satisfies the demo requirement
export async function getSessionUser(req?: NextRequest): Promise<IUser | null> {
  try {
    let userId: string | undefined;

    if (req) {
      userId = req.cookies.get(SESSION_COOKIE)?.value;
    } else {
      const cookieStore = await cookies();
      userId = cookieStore.get(SESSION_COOKIE)?.value;
    }

    if (!userId) return null;

    await connectDB();
    const user = await User.findById(userId).lean();
    if (!user) return null;

    return {
      _id: (user._id as { toString(): string }).toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };
  } catch {
    return null;
  }
}

export function createSessionCookie(userId: string) {
  return {
    name: SESSION_COOKIE,
    value: userId,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  };
}

export function clearSessionCookie() {
  return {
    name: SESSION_COOKIE,
    value: '',
    maxAge: 0,
    path: '/',
  };
}

// Hash password - simple for demo purposes
export function hashPassword(password: string): string {
  // Using btoa for demo - in prod use bcrypt
  return Buffer.from(password + ':debales-salt').toString('base64');
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

// Common unauthorized response
export function unauthorized(message = 'Unauthorized') {
  return Response.json({ error: message }, { status: 401 });
}

export function forbidden(message = 'Forbidden') {
  return Response.json({ error: message }, { status: 403 });
}

export function notFound(message = 'Not found') {
  return Response.json({ error: message }, { status: 404 });
}

export function badRequest(message: string) {
  return Response.json({ error: message }, { status: 400 });
}
