import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { consultationId, phone, provider } = await request.json();

    if (!consultationId || !phone || !provider) {
      return NextResponse.json(
        { success: false, error: 'Missing payment details' },
        { status: 400 }
      );
    }

    const paymentRef = `tx-${provider}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    // @ts-expect-error - Edge runtime types
    const db = process.env.DB || (globalThis as unknown as { DB?: unknown }).DB;
    if (db) {
      await db.prepare(
        'UPDATE Consultation SET status = ?, paymentRef = ? WHERE id = ?'
      ).bind('confirmed', paymentRef, consultationId).run();
    }

    return NextResponse.json({
      success: true,
      message: 'Payment completed successfully (Simulated)',
      consultation: {
        id: consultationId,
        status: 'confirmed',
        paymentRef
      }
    });
  } catch {
    return NextResponse.json(
      { success: false, error: error.message || 'Payment failed' },
      { status: 500 }
    );
  }
}
