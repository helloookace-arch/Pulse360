import { NextResponse } from 'next/server';

export const runtime = 'edge';

const DEFAULT_PUBLIC_SETTINGS = {
  aiCrisisAutoEscalation: true,
  storySubmissionsOpen: true,
  instantCounselorBooking: true,
  maintenanceMode: false,
  broadcastNotice: 'Welcome to Pulse360! 24/7 Confidential Youth Health & Psychological Support in Rwanda.'
};

export async function GET() {
  try {
    // @ts-expect-error - Edge runtime types
    const db = process.env.DB || (globalThis as unknown as { DB?: unknown }).DB;

    if (db) {
      try {
        const { results } = await db.prepare('SELECT key, value FROM SystemSetting').all();
        if (results && results.length > 0) {
          const settingsObj = { ...DEFAULT_PUBLIC_SETTINGS };
          results.forEach((row: { key: string; value: string }) => {
            if (row.key === 'broadcastNotice') {
              // @ts-expect-error - dynamic key
              settingsObj[row.key] = row.value;
            } else {
              // @ts-expect-error - dynamic boolean key
              settingsObj[row.key] = row.value === 'true';
            }
          });
          return NextResponse.json({ success: true, settings: settingsObj });
        }
      } catch (err) {
        console.warn('Public settings fetch warning:', err);
      }
    }

    return NextResponse.json({ success: true, settings: DEFAULT_PUBLIC_SETTINGS });
  } catch {
    return NextResponse.json({ success: true, settings: DEFAULT_PUBLIC_SETTINGS });
  }
}
