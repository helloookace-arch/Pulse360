import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  
  // @ts-expect-error - Edge runtime types
  const db = process.env.DB || (globalThis as unknown as { DB?: unknown }).DB;

  if (db) {
    const article = await db.prepare('SELECT * FROM Article WHERE id = ?').bind(id).first();
    if (article) {
      return NextResponse.json({
        success: true,
        article: {
          ...article,
          _id: article.id,
          tags: typeof article.tags === 'string' ? JSON.parse(article.tags) : article.tags
        }
      });
    }
  }

  return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 });
}
