import { NextResponse } from 'next/server';
import { getD1 } from '../../../../lib/db';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { consultationId, amount, phone, provider } = await request.json();

    if (!consultationId || !phone || !provider) {
      return NextResponse.json(
        { success: false, error: 'Missing payment details' },
        { status: 400 }
      );
    }

    const paymentRef = `tx-${provider}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    const db = getD1();
    if (db) {
      const consultation = await db.prepare(
        'SELECT id FROM Consultation WHERE id = ?'
      ).bind(consultationId).first() as { id?: string } | null;

      if (!consultation && !String(consultationId).startsWith('local-')) {
        return NextResponse.json(
          { success: false, error: 'Consultation not found' },
          { status: 404 }
        );
      }

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
        paymentRef,
        amount: amount || 0
      }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Payment failed';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
