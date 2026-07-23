import { NextResponse } from 'next/server';
import { getD1 } from '../../../../lib/db';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const district = body.district || 'Kigali';
    const sessionToken = `token-${crypto.randomUUID()}`;
    const id = crypto.randomUUID();

    const db = getD1();

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
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Session creation failed';
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}
