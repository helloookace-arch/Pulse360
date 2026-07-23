import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // @ts-expect-error - Edge runtime types
  const db = process.env.DB || (globalThis as unknown as { DB?: unknown }).DB;

  if (db) {
    await db.prepare('UPDATE Story SET likes = likes + 1 WHERE id = ?').bind(id).run();
    const updated = await db.prepare('SELECT likes FROM Story WHERE id = ?').bind(id).first();
    return NextResponse.json({ success: true, likes: updated?.likes || 1 });
  }

  return NextResponse.json({ success: true, likes: 1 });
}
