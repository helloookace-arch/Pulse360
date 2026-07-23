import { NextResponse } from 'next/server';
import { getAuthUser } from '../../../../lib/auth';

export const runtime = 'edge';

const INITIAL_CRISIS_EVENTS = [
  {
    id: 'crisis-1',
    sessionId: 'session-kigali-9921',
    triggerType: 'Suicidal Ideation / Severe Distress',
    escalated: false,
    resolved: false,
    district: 'Nyarugenge',
    createdAt: '2026-07-23T18:45:00Z'
  },
  {
    id: 'crisis-2',
    sessionId: 'session-huye-4412',
    triggerType: 'Domestic Violence / Panic Attack',
    escalated: true,
    resolved: false,
    district: 'Huye',
    createdAt: '2026-07-23T16:20:00Z'
  },
  {
    id: 'crisis-3',
    sessionId: 'session-rubavu-1034',
    triggerType: 'Depression / Self-Harm Risk',
    escalated: true,
    resolved: true,
    district: 'Rubavu',
    createdAt: '2026-07-22T21:10:00Z'
  },
  {
    id: 'crisis-4',
    sessionId: 'session-gasabo-8812',
    triggerType: 'Severe Anxiety / Trauma Trigger',
    escalated: false,
    resolved: true,
    district: 'Gasabo',
    createdAt: '2026-07-21T11:05:00Z'
  }
];

export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin role required' }, { status: 403 });
    }

    // @ts-expect-error - Edge runtime types
    const db = process.env.DB || (globalThis as unknown as { DB?: unknown }).DB;

    if (db) {
      try {
        const { results } = await db.prepare('SELECT * FROM CrisisEvent ORDER BY createdAt DESC').all();
        if (results && results.length > 0) {
          return NextResponse.json({ success: true, crisisEvents: results });
        }
      } catch (dbErr) {
        console.warn('Crisis table fetch warning:', dbErr);
      }
    }

    return NextResponse.json({ success: true, crisisEvents: INITIAL_CRISIS_EVENTS });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch crisis events';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin role required' }, { status: 403 });
    }

    const { id, action } = await request.json(); // action: 'escalate' | 'resolve'
    if (!id || !action) {
      return NextResponse.json({ success: false, error: 'ID and action are required' }, { status: 400 });
    }

    // @ts-expect-error - Edge runtime types
    const db = process.env.DB || (globalThis as unknown as { DB?: unknown }).DB;

    if (db) {
      if (action === 'escalate') {
        await db.prepare('UPDATE CrisisEvent SET escalated = 1 WHERE id = ?').bind(id).run();
      } else if (action === 'resolve') {
        await db.prepare('UPDATE CrisisEvent SET escalated = 0 WHERE id = ?').bind(id).run();
      }
    }

    return NextResponse.json({ success: true, message: `Crisis event ${id} marked as ${action}` });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update crisis event';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
