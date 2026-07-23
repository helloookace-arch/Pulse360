import { NextResponse } from 'next/server';
import { getAuthUser } from '../../../../lib/auth';

export const runtime = 'edge';

const MOCK_AUDIT_LOGS = [
  {
    id: 'log-1',
    user: 'admin',
    action: 'Settings Changed',
    details: 'Enabled AI Crisis Auto-Escalation banner flag.',
    ipAddress: '197.243.12.88',
    createdAt: '2026-07-23T20:05:00Z'
  },
  {
    id: 'log-2',
    user: 'admin',
    action: 'Clinic Added',
    details: 'Created clinic: Kigali Youth Friendly Center.',
    ipAddress: '197.243.12.88',
    createdAt: '2026-07-23T19:50:00Z'
  },
  {
    id: 'log-3',
    user: 'moderator_keza',
    action: 'Story Moderation Decision',
    details: 'Approved story id: story-1',
    ipAddress: '197.243.15.110',
    createdAt: '2026-07-23T18:40:00Z'
  },
  {
    id: 'log-4',
    user: 'content_manager_gasana',
    action: 'Article Edited',
    details: 'Updated article: Gusobanukirwa Agahinda Gakabije',
    ipAddress: '197.243.10.42',
    createdAt: '2026-07-23T16:15:00Z'
  },
  {
    id: 'log-5',
    user: 'admin',
    action: 'User Role Promoted',
    details: 'Promoted user: mugisha_dr to role: medical_professional',
    ipAddress: '197.243.12.88',
    createdAt: '2026-07-22T14:22:00Z'
  }
];

export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ success: true, logs: MOCK_AUDIT_LOGS });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch audit logs';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
