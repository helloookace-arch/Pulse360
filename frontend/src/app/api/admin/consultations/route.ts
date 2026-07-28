import { NextResponse } from 'next/server';
import { getAuthUser } from '../../../../lib/auth';
import { getD1 } from '../../../../lib/db';

export const runtime = 'edge';

const COUNSELOR_DIRECTORY: Record<string, { name: string; role: string }> = {
  'dr-mugisha': { name: 'Dr. Mugisha Jean', role: 'Mental Health Therapist' },
  'nurse-kamanzi': { name: 'Nurse Kamanzi Marie', role: 'Sexual & Reproductive Health Specialist' },
  'dr-uwera': { name: 'Dr. Uwera Aline', role: 'General Wellness & Stress Coach' }
};

const VALID_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'] as const;

function buildMeetingDetails(consultationId: string) {
  const roomId = `meet-${consultationId.slice(-8)}`;
  return {
    roomId,
    meetingUrl: `https://telehealth.pulse360.rw/room/${roomId}`
  };
}

export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const db = getD1();
    if (!db) {
      return NextResponse.json({ success: true, consultations: [] });
    }

    const { results } = await db.prepare(`
      SELECT
        c.id,
        c.sessionId,
        c.counselorId,
        c.slotTime,
        c.status,
        c.paymentRef,
        c.createdAt,
        s.sessionToken,
        s.district,
        s.lastActive
      FROM Consultation c
      LEFT JOIN Session s ON s.id = c.sessionId
      ORDER BY c.slotTime DESC, c.createdAt DESC
    `).all<Record<string, unknown>>();

    const consultations = (results || []).map((row) => {
      const counselorId = String(row.counselorId || 'dr-mugisha');
      const counselor = COUNSELOR_DIRECTORY[counselorId] || COUNSELOR_DIRECTORY['dr-mugisha'];
      const meeting = buildMeetingDetails(String(row.id));

      return {
        id: row.id,
        sessionId: row.sessionId,
        sessionToken: row.sessionToken || '',
        district: row.district || 'Kigali',
        lastActive: row.lastActive || row.createdAt,
        counselorId,
        counselorName: counselor.name,
        counselorRole: counselor.role,
        slotTime: row.slotTime,
        status: row.status || 'pending',
        paymentRef: row.paymentRef || null,
        roomId: meeting.roomId,
        meetingUrl: meeting.meetingUrl,
        createdAt: row.createdAt
      };
    });

    return NextResponse.json({ success: true, consultations });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch consultations';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'Consultation ID and status are required' },
        { status: 400 }
      );
    }

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid consultation status' },
        { status: 400 }
      );
    }

    const db = getD1();
    if (!db) {
      return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });
    }

    await db.prepare(
      'UPDATE Consultation SET status = ? WHERE id = ?'
    ).bind(status, id).run();

    return NextResponse.json({ success: true, consultation: { id, status } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update consultation';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
