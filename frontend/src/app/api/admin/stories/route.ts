import { NextResponse } from 'next/server';
import { getAuthUser } from '../../../../lib/auth';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin role required' }, { status: 403 });
    }

    // @ts-expect-error - Edge runtime types
    const db = process.env.DB || (globalThis as unknown as { DB?: unknown }).DB;

    if (!db) {
      return NextResponse.json({ success: false, error: 'Database binding unavailable' }, { status: 500 });
    }

    // @ts-expect-error - D1 prepare API
    const { results } = await db.prepare('SELECT * FROM Story ORDER BY createdAt DESC').all();

    return NextResponse.json({ success: true, stories: results || [] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch admin stories';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin role required' }, { status: 403 });
    }

    const { id, status } = await request.json();
    if (!id || !['approved', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid story ID or status' }, { status: 400 });
    }

    // @ts-expect-error - Edge runtime types
    const db = process.env.DB || (globalThis as unknown as { DB?: unknown }).DB;

    if (!db) {
      return NextResponse.json({ success: false, error: 'Database binding unavailable' }, { status: 500 });
    }

    // @ts-expect-error - D1 prepare API
    await db.prepare('UPDATE Story SET status = ? WHERE id = ?').bind(status, id).run();

    return NextResponse.json({ success: true, message: `Story status updated to ${status}` });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update story status';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
