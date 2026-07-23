import { NextResponse } from 'next/server';
import { generateSalt, hashPassword, createToken } from '../../../../lib/auth';
import { getD1 } from '../../../../lib/db';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, email, password, adminKey } = body || {};

    if (!username || !email || !password) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const db = getD1();

    if (!db) {
      return NextResponse.json({ success: false, error: 'Database binding unavailable. Please ensure D1 binding "DB" is attached in Cloudflare Pages.' }, { status: 500 });
    }

    // Check existing user
    // @ts-expect-error - D1 prepare API
    const existing = await db.prepare('SELECT id FROM User WHERE email = ? OR username = ?').bind(email, username).first();
    if (existing) {
      return NextResponse.json({ success: false, error: 'Username or email already exists' }, { status: 400 });
    }

    const salt = generateSalt();
    const passwordHash = await hashPassword(password, salt);
    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    // Assign admin role if secret key matches or if email ends with @pulse360.admin
    const role = (adminKey && adminKey === 'pulse360_admin_passkey_2026') ? 'admin' : 'user';

    // @ts-expect-error - D1 prepare API
    await db.prepare('INSERT INTO User (id, username, email, passwordHash, salt, role) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(userId, username, email, passwordHash, salt, role)
      .run();

    const userPayload = { userId, username, email, role: role as 'user' | 'admin' };
    const token = await createToken(userPayload);

    const response = NextResponse.json({ success: true, user: userPayload });
    response.headers.set(
      'Set-Cookie',
      `pulse360_auth_token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax; ${process.env.NODE_ENV === 'production' ? 'Secure;' : ''}`
    );

    return response;
  } catch (err: unknown) {
    console.error('Registration API error:', err);
    const msg = err instanceof Error ? err.message : 'Registration failed';
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}
