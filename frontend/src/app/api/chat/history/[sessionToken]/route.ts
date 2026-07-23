import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(
  request: Request,
  { params }: { params: { sessionToken: string } }
) {
  try {
    const { sessionToken } = params;
    
    // @ts-expect-error - Edge runtime types
    const db = process.env.DB || (globalThis as unknown as { DB?: unknown }).DB;
    let messages: unknown[] = [];

    if (db) {
      const session = await db.prepare('SELECT id FROM Session WHERE sessionToken = ?').bind(sessionToken).first();
      if (session) {
        const { results } = await db.prepare(
          'SELECT id, role, content, emotionLabel, crisisTriggered, createdAt FROM Message WHERE sessionId = ? ORDER BY createdAt ASC'
        ).bind(session.id).all();
        messages = results || [];
      }
    }

    return NextResponse.json({
      success: true,
      messages
    });
  } catch {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to retrieve history' },
      { status: 500 }
    );
  }
}
