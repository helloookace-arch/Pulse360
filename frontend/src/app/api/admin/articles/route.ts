import { NextResponse } from 'next/server';
import { getAuthUser } from '../../../../lib/auth';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin role required' }, { status: 403 });
    }

    const { title, category, body, tags, language, readingTime, thumbnail } = await request.json();

    if (!title || !category || !body) {
      return NextResponse.json({ success: false, error: 'Title, category, and body are required' }, { status: 400 });
    }

    // @ts-expect-error - Edge runtime types
    const db = process.env.DB || (globalThis as unknown as { DB?: unknown }).DB;

    if (!db) {
      return NextResponse.json({ success: false, error: 'Database binding unavailable' }, { status: 500 });
    }

    const articleId = `art_${Date.now()}`;
    const tagsJson = JSON.stringify(Array.isArray(tags) ? tags : [tags]);

    // @ts-expect-error - D1 prepare API
    await db.prepare(
      'INSERT INTO Article (id, title, category, body, tags, language, readingTime, thumbnail) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(
      articleId,
      title,
      category,
      body,
      tagsJson,
      language || 'English',
      readingTime || '4 min read',
      thumbnail || 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=500&auto=format&fit=crop'
    ).run();

    return NextResponse.json({ success: true, articleId });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create article';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
