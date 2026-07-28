import { NextResponse } from 'next/server';
import { getD1 } from '../../../../../lib/db';

export const runtime = 'edge';

type RouteContext = {
  params: Promise<{ sessionToken: string }>;
};

export async function GET(
  request: Request,
  { params }: RouteContext
) {
  try {
    const { sessionToken } = await params;
    
    const db = getD1();
    let messages: unknown[] = [];

    if (db) {
      const session = await db.prepare('SELECT id FROM Session WHERE sessionToken = ?').bind(sessionToken).first<{ id: string }>();
      if (session?.id) {
        const { results } = await db.prepare(
          'SELECT id, role, content, emotionLabel, crisisTriggered, createdAt FROM Message WHERE sessionId = ? ORDER BY createdAt ASC'
        ).bind(session.id).all<Record<string, unknown>>();
        messages = results || [];
      }
    }

    return NextResponse.json({
      success: true,
      messages
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve history';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
