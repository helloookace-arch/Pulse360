import { NextResponse } from 'next/server';
import { getAuthUser } from '../../../../lib/auth';

export const runtime = 'edge';

const DEFAULT_SETTINGS = {
  aiCrisisAutoEscalation: true,
  storySubmissionsOpen: true,
  instantCounselorBooking: true,
  maintenanceMode: false,
  broadcastNotice: 'Welcome to Pulse360! 24/7 Confidential Youth Health & Psychological Support in Rwanda.'
};

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
        const { results } = await db.prepare('SELECT key, value FROM SystemSetting').all();
        if (results && results.length > 0) {
          const settingsObj = { ...DEFAULT_SETTINGS };
          results.forEach((row: { key: string; value: string }) => {
            if (row.key === 'broadcastNotice') {
              // @ts-expect-error - dynamic key assignment
              settingsObj[row.key] = row.value;
            } else {
              // @ts-expect-error - dynamic boolean key assignment
              settingsObj[row.key] = row.value === 'true';
            }
          });
          return NextResponse.json({ success: true, settings: settingsObj });
        }
      } catch (dbErr) {
        console.warn('SystemSetting table fetch warning, using default settings:', dbErr);
      }
    }

    return NextResponse.json({ success: true, settings: DEFAULT_SETTINGS });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch settings';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin role required' }, { status: 403 });
    }

    const settings = await request.json();

    // @ts-expect-error - Edge runtime types
    const db = process.env.DB || (globalThis as unknown as { DB?: unknown }).DB;

    if (db) {
      for (const [key, val] of Object.entries(settings)) {
        const strVal = typeof val === 'boolean' ? (val ? 'true' : 'false') : String(val);
        await db.prepare(
          'INSERT INTO SystemSetting (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updatedAt = CURRENT_TIMESTAMP'
        ).bind(key, strVal).run();
      }
    }

    return NextResponse.json({ success: true, settings });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update settings';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
