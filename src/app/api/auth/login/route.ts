import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import { LoginSchema } from '@/lib/validations';
import { createSessionCookie, verifyPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ email: parsed.data.email.toLowerCase() });

    if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) {
      return Response.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const cookie = createSessionCookie(String(user._id));

    return Response.json(
      { user: { _id: String(user._id), name: user.name, email: user.email, role: user.role } },
      {
        status: 200,
        headers: {
          'Set-Cookie': `${cookie.name}=${cookie.value}; HttpOnly; Path=${cookie.path}; Max-Age=${cookie.maxAge}; SameSite=Lax${cookie.secure ? '; Secure' : ''}`,
        },
      }
    );
  } catch (err) {
    console.error('Login error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
