import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { sessionToken, counselorId, slotTime } = await request.json();

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: 'Session token required' },
        { status: 400 }
      );
    }

    const consultationId = `consult-${crypto.randomUUID()}`;
    const consultation = {
      id: consultationId,
      counselorId: counselorId || 'dr-mugisha',
      slotTime: slotTime || new Date(Date.now() + 86400000).toISOString(),
      status: 'pending'
    };

    // @ts-expect-error - Edge runtime types
    const db = process.env.DB || (globalThis as unknown as { DB?: unknown }).DB;
    if (db) {
      const session = await db.prepare('SELECT id FROM Session WHERE sessionToken = ?').bind(sessionToken).first();
      const sessionId = session?.id || sessionToken;

      await db.prepare(
        'INSERT INTO Consultation (id, sessionId, counselorId, slotTime, status) VALUES (?, ?, ?, ?, ?)'
      ).bind(consultationId, sessionId, consultation.counselorId, consultation.slotTime, 'pending').run();
    }

    return NextResponse.json({ success: true, consultation });
  } catch {
    return NextResponse.json(
      { success: false, error: error.message || 'Booking failed' },
      { status: 500 }
    );
  }
}
