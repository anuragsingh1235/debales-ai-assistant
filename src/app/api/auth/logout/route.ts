import { clearSessionCookie } from '@/lib/auth';

export async function POST() {
  const cookie = clearSessionCookie();
  return Response.json(
    { message: 'Logged out' },
    {
      headers: {
        'Set-Cookie': `${cookie.name}=${cookie.value}; HttpOnly; Path=${cookie.path}; Max-Age=${cookie.maxAge}`,
      },
    }
  );
}
