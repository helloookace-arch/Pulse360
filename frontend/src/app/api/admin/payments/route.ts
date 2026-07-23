import { NextResponse } from 'next/server';
import { getAuthUser } from '../../../../lib/auth';

export const runtime = 'edge';

const MOCK_PAYMENTS = [
  {
    id: 'pay-7712',
    sessionId: 'sess-8812',
    provider: 'MTN MoMo',
    amount: 5000,
    status: 'completed',
    paymentRef: 'TXN-MOMO-9912093',
    purpose: 'Counselor Consultation Booking',
    createdAt: '2026-07-23T20:00:00Z'
  },
  {
    id: 'pay-4412',
    sessionId: 'sess-4412',
    provider: 'Airtel Money',
    amount: 5000,
    status: 'failed',
    paymentRef: 'TXN-AIRTEL-4412093',
    purpose: 'Counselor Consultation Booking',
    createdAt: '2026-07-23T19:50:00Z'
  },
  {
    id: 'pay-9921',
    sessionId: 'sess-9921',
    provider: 'MTN MoMo',
    amount: 5000,
    status: 'refunded',
    paymentRef: 'TXN-MOMO-1039482',
    purpose: 'Psychologist Session Booking',
    createdAt: '2026-07-23T19:25:00Z'
  },
  {
    id: 'pay-3341',
    sessionId: 'sess-3341',
    provider: 'MTN MoMo',
    amount: 5000,
    status: 'completed',
    paymentRef: 'TXN-MOMO-8829471',
    purpose: 'Counselor Consultation Booking',
    createdAt: '2026-07-23T18:05:00Z'
  }
];

export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ success: true, payments: MOCK_PAYMENTS });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch payments';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
