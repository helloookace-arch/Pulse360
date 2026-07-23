import { NextResponse } from 'next/server';
import { hashPassword, createToken } from '../../../../lib/auth';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { identifier, password } = body || {};

    if (!identifier || !password) {
      return NextResponse.json({ success: false, error: 'Identifier and password are required' }, { status: 400 });
    }

    // @ts-expect-error - Edge runtime types
    const db = process.env.DB || (globalThis as unknown as { DB?: unknown }).DB;

    if (!db) {
      return NextResponse.json({ success: false, error: 'Database binding unavailable' }, { status: 500 });
    }

    // Fetch user by username or email
    // @ts-expect-error - D1 prepare API
    const user = await db.prepare('SELECT * FROM User WHERE email = ? OR username = ?').bind(identifier, identifier).first();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid username/email or password' }, { status: 401 });
    }

    const calculatedHash = await hashPassword(password, user.salt);
    if (calculatedHash !== user.passwordHash) {
      return NextResponse.json({ success: false, error: 'Invalid username/email or password' }, { status: 401 });
    }

    const userPayload = {
      userId: user.id as string,
      username: user.username as string,
      email: user.email as string,
      role: (user.role as 'user' | 'admin') || 'user'
    };

    const token = await createToken(userPayload);

    const response = NextResponse.json({ success: true, user: userPayload });
    response.headers.set(
      'Set-Cookie',
      `pulse360_auth_token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax; ${process.env.NODE_ENV === 'production' ? 'Secure;' : ''}`
    );

    return response;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Login failed';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
