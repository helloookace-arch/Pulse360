import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const district = body.district || 'Kigali';
    const sessionToken = `token-${crypto.randomUUID()}`;
    const id = crypto.randomUUID();

    // Access Cloudflare D1 binding if available (env.DB)
    // @ts-expect-error - Edge runtime types
    const db = process.env.DB || (globalThis as unknown as { DB?: unknown }).DB;

    if (db) {
      await db.prepare(
        'INSERT INTO Session (id, sessionToken, district) VALUES (?, ?, ?)'
      ).bind(id, sessionToken, district).run();
    }

    return NextResponse.json({
      success: true,
      sessionToken,
      sessionId: id,
      district
    });
  } catch {
    return NextResponse.json(
      { success: false, error: error.message || 'Session creation failed' },
      { status: 500 }
    );
  }
}
