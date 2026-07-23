import { NextResponse } from 'next/server';
import { getAuthUser } from '../../../../lib/auth';

export const runtime = 'edge';

const MOCK_CHAT_LOGS = [
  {
    id: 'chat-1',
    sessionId: 'sess-8812',
    userMessage: 'I feel extremely stressed about my national exams tomorrow. I cannot sleep.',
    aiResponse: 'It is completely normal to feel nervous before exam day. Try taking a few slow, deep breaths. Breathe in for 4 seconds, hold for 4, and release for 4. Remember, you have prepared for this, and your worth is not defined by a single exam. How can I help you relax right now?',
    confidence: 0.94,
    feedbackRating: 5,
    crisisTriggered: false,
    category: 'Anxiety / Stress',
    createdAt: '2026-07-23T20:08:00Z'
  },
  {
    id: 'chat-2',
    sessionId: 'sess-4412',
    userMessage: 'Sometimes I feel like giving up on life. I have no one to talk to about my problems.',
    aiResponse: 'I hear how painful things feel, but please know that you are not alone and there is support available. I want to connect you to someone who can help. You can call the national helpline 114 for free, anonymous counseling, or we can check the clinic finder for local youth centers. Would you like me to show you the hotlines?',
    confidence: 0.98,
    feedbackRating: 4,
    crisisTriggered: true,
    category: 'Suicidal Ideation',
    createdAt: '2026-07-23T19:54:00Z'
  },
  {
    id: 'chat-3',
    sessionId: 'sess-9921',
    userMessage: 'Where can I get confidential contraceptives in Nyarugenge?',
    aiResponse: 'You can access confidential reproductive health services and family planning at the Kigali Youth Friendly Center on KN 3 Rd. Let me locate it on the map for you. Would you like their phone number or directions?',
    confidence: 0.91,
    feedbackRating: 5,
    crisisTriggered: false,
    category: 'Reproductive Health',
    createdAt: '2026-07-23T19:40:00Z'
  },
  {
    id: 'chat-4',
    sessionId: 'sess-3341',
    userMessage: 'I think my partner is sharing my private pictures online without my consent.',
    aiResponse: 'This is a serious matter and a violation of your privacy. You can contact legal and counseling counselors for guidance. Would you like me to provide contacts for youth legal services or mental health professionals?',
    confidence: 0.88,
    feedbackRating: 3,
    crisisTriggered: true,
    category: 'Abuse / Harassment',
    createdAt: '2026-07-23T18:12:00Z'
  }
];

export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ success: true, chatLogs: MOCK_CHAT_LOGS });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch chat logs';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
