import { NextResponse } from 'next/server';
import { hashPassword, createToken } from '../../../../lib/auth';
import { getD1 } from '../../../../lib/db';

export const runtime = 'edge';

type LoginUserRecord = {
  id: string;
  username: string;
  email: string;
  role?: 'user' | 'admin';
  passwordHash: string;
  salt: string;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { identifier, password } = body || {};

    if (!identifier || !password) {
      return NextResponse.json({ success: false, error: 'Identifier and password are required' }, { status: 400 });
    }



    const db = getD1();

    if (!db) {
      return NextResponse.json({ success: false, error: 'Database binding unavailable' }, { status: 500 });
    }

    const user = await db
      .prepare('SELECT * FROM User WHERE email = ? OR username = ?')
      .bind(identifier, identifier)
      .first<LoginUserRecord>();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid username/email or password' }, { status: 401 });
    }

    const calculatedHash = await hashPassword(password, user.salt);
    const isPasswordValid = calculatedHash === user.passwordHash;

    if (!isPasswordValid) {
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
    console.error('Login error:', err);
    const msg = err instanceof Error ? err.message : 'Login failed';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
