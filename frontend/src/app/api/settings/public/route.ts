import { NextResponse } from 'next/server';
import { getD1 } from '../../../../lib/db';

export const runtime = 'edge';

const DEFAULT_PUBLIC_SETTINGS = {
  aiCrisisAutoEscalation: true,
  storySubmissionsOpen: true,
  instantCounselorBooking: true,
  maintenanceMode: false,
  broadcastNotice: 'Welcome to Pulse360! 24/7 Confidential Youth Health & Psychological Support in Rwanda.'
};

type PublicSettingsShape = typeof DEFAULT_PUBLIC_SETTINGS;

function applyPublicSettingValue(
  settings: PublicSettingsShape,
  key: string,
  value: string
) {
  if (key === 'broadcastNotice') {
    settings.broadcastNotice = value;
    return;
  }

  if (key in settings) {
    const booleanKey = key as Exclude<keyof PublicSettingsShape, 'broadcastNotice'>;
    settings[booleanKey] = value === 'true';
  }
}

export async function GET() {
  try {
    const db = getD1();

    if (db) {
      try {
        const { results } = await db.prepare('SELECT key, value FROM SystemSetting').all<{ key: string; value: string }>();
        if (results && results.length > 0) {
          const settingsObj = { ...DEFAULT_PUBLIC_SETTINGS };
          results.forEach((row) => {
            applyPublicSettingValue(settingsObj, row.key, row.value);
          });
          return NextResponse.json({ success: true, settings: settingsObj });
        }
      } catch (err) {
        console.warn('Public settings fetch warning:', err);
      }
    }

    return NextResponse.json({ success: true, settings: DEFAULT_PUBLIC_SETTINGS });
  } catch (error: unknown) {
    console.warn('Public settings fallback:', error);
    return NextResponse.json({ success: true, settings: DEFAULT_PUBLIC_SETTINGS });
  }
}
