import { NextResponse } from 'next/server';
import { getAuthUser } from '../../../../lib/auth';

export const runtime = 'edge';

const MOCK_KNOWLEDGE_BASE = {
  systemPrompt: 'You are Antigravity, a supportive, expert, and non-judgmental health companion for young people in Rwanda. Answer user queries about mental health, stress, and sexual & reproductive health. Be direct, clinically accurate, and safe. If you detect thoughts of self-harm, suicidal planning, or domestic abuse, trigger the emergency guidelines immediately.',
  faqs: [
    { id: 'faq-1', question: 'What is Pulse360?', answer: 'Pulse360 is a confidential, anonymous health companion providing psychological and reproductive health resources to youth in Rwanda.' },
    { id: 'faq-2', question: 'Are my chats private?', answer: 'Yes. Pulse360 does not collect names, phone numbers, or email addresses during anonymous chats. Everything is completely private.' }
  ],
  guidelines: [
    { title: 'WHO Mental Health Guidelines', source: 'World Health Organization (WHO)', status: 'Active Training' },
    { title: 'Rwanda MoH Adolescent Sexual & Reproductive Health Plan', source: 'Ministry of Health (MoH)', status: 'Active Training' }
  ]
};

export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ success: true, knowledgeBase: MOCK_KNOWLEDGE_BASE });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch knowledge base';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin role required' }, { status: 403 });
    }

    const { systemPrompt } = await request.json();
    if (!systemPrompt) {
      return NextResponse.json({ success: false, error: 'System prompt required' }, { status: 400 });
    }

    MOCK_KNOWLEDGE_BASE.systemPrompt = systemPrompt;

    return NextResponse.json({ success: true, message: 'AI Knowledge Base system prompt updated successfully' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update knowledge base';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
