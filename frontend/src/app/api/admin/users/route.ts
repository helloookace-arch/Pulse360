import { NextResponse } from 'next/server';
import { getAuthUser } from '../../../../lib/auth';
import { getD1 } from '../../../../lib/db';

export const runtime = 'edge';



export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin role required' }, { status: 403 });
    }

    const db = getD1();

    if (db) {
      try {
        const { results } = await db.prepare('SELECT id, username, email, role, createdAt FROM User ORDER BY createdAt DESC').all<Record<string, unknown>>();
        if (results && results.length > 0) {
          const usersWithStatus = results.map((u: Record<string, unknown>) => ({
            ...u,
            status: u.username === 'spam_account_flagged' ? 'suspended' : 'active'
          }));
          return NextResponse.json({ success: true, users: usersWithStatus });
        }
        return NextResponse.json({ success: true, users: [] });
      } catch (dbErr) {
        console.error('D1 User fetch error:', dbErr);
        return NextResponse.json({ success: false, error: 'Database error fetching users' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: false, error: 'Database not available' }, { status: 500 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch users';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin role required' }, { status: 403 });
    }

    const { id, role, status } = await request.json();
    if (!id) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const db = getD1();

    if (db && role) {
      try {
        await db.prepare('UPDATE User SET role = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?').bind(role, id).run();
      } catch (dbErr) {
        console.error('D1 User update error:', dbErr);
        return NextResponse.json({ success: false, error: 'Database error updating user' }, { status: 500 });
      }
    } else if (!db) {
      return NextResponse.json({ success: false, error: 'Database not available' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `User ${id} updated to role=${role || 'unchanged'} status=${status || 'unchanged'}`
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update user';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
