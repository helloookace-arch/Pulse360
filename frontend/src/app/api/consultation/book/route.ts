import { NextResponse } from 'next/server';
import { getD1 } from '../../../../lib/db';

export const runtime = 'edge';

const COUNSELOR_DIRECTORY: Record<string, { name: string; role: string }> = {
  'dr-mugisha': { name: 'Dr. Mugisha Jean', role: 'Mental Health Therapist' },
  'nurse-kamanzi': { name: 'Nurse Kamanzi Marie', role: 'Sexual & Reproductive Health Specialist' },
  'dr-uwera': { name: 'Dr. Uwera Aline', role: 'General Wellness & Stress Coach' }
};

function buildMeetingDetails(consultationId: string) {
  const roomId = `meet-${consultationId.slice(-8)}`;
  return {
    roomId,
    meetingUrl: `https://telehealth.pulse360.rw/room/${roomId}`
  };
}

export async function POST(request: Request) {
  try {
    const { sessionToken, counselorId, slotTime } = await request.json();

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: 'Session token required' },
        { status: 400 }
      );
    }

    const parsedSlotTime = slotTime ? new Date(slotTime) : new Date(Date.now() + 86400000);
    if (Number.isNaN(parsedSlotTime.getTime())) {
      return NextResponse.json(
        { success: false, error: 'Invalid consultation slot time' },
        { status: 400 }
      );
    }

    if (parsedSlotTime.getTime() < Date.now()) {
      return NextResponse.json(
        { success: false, error: 'Consultation slots must be scheduled for the present or future' },
        { status: 400 }
      );
    }

    const consultationId = `consult-${crypto.randomUUID()}`;
    const selectedCounselorId = counselorId || 'dr-mugisha';
    const counselor = COUNSELOR_DIRECTORY[selectedCounselorId] || COUNSELOR_DIRECTORY['dr-mugisha'];
    const meeting = buildMeetingDetails(consultationId);
    const consultation = {
      id: consultationId,
      counselorId: selectedCounselorId,
      counselorName: counselor.name,
      counselorRole: counselor.role,
      slotTime: parsedSlotTime.toISOString(),
      status: 'pending',
      roomId: meeting.roomId,
      meetingUrl: meeting.meetingUrl
    };

    const db = getD1();
    if (db) {
      const session = await db.prepare('SELECT id FROM Session WHERE sessionToken = ?').bind(sessionToken).first() as { id?: string } | null;
      let sessionId = session?.id;

      if (!sessionId) {
        sessionId = `sess-${crypto.randomUUID()}`;
        await db.prepare(
          'INSERT INTO Session (id, sessionToken, lastActive) VALUES (?, ?, CURRENT_TIMESTAMP)'
        ).bind(sessionId, sessionToken).run();
      } else {
        await db.prepare('UPDATE Session SET lastActive = CURRENT_TIMESTAMP WHERE id = ?').bind(sessionId).run();
      }

      await db.prepare(
        'INSERT INTO Consultation (id, sessionId, counselorId, slotTime, status) VALUES (?, ?, ?, ?, ?)'
      ).bind(consultationId, sessionId, consultation.counselorId, consultation.slotTime, consultation.status).run();
    }

    return NextResponse.json({ success: true, consultation });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Booking failed';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
