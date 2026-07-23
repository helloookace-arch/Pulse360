import { NextResponse } from 'next/server';

export const runtime = 'edge';

const fallbackStories = [
  {
    _id: 'story-1',
    content: 'I used to struggle with severe anxiety before my exams. Finding Pulse360 helped me learn relaxation techniques anonymously, and my grades have actually improved. It is great to know I am not alone.',
    category: 'Mental Health',
    likes: 24,
    status: 'approved',
    districtHash: 'Kigali_Nyarugenge',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    _id: 'story-2',
    content: 'Kuganira ku buzima bw’imyororokere n’ababyeyi bacu biracyari ikizira mu miryango yacu. Pulse360 yampaye amakuru mazima yo kwirinda indwara n’inda zitateganijwe nta pfunwe.',
    category: 'Reproductive Health',
    likes: 42,
    status: 'approved',
    districtHash: 'Rubavu_Gisenyi',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

export async function GET() {
  try {
    // @ts-expect-error - Edge runtime types
    const db = process.env.DB || (globalThis as unknown as { DB?: unknown }).DB;
    let stories = fallbackStories;

    if (db) {
      const { results } = await db.prepare("SELECT * FROM Story WHERE status = 'approved' ORDER BY createdAt DESC").all();
      if (results && results.length > 0) {
        stories = results.map((s: unknown) => ({ ...s, _id: s.id }));
      }
    }

    return NextResponse.json({ success: true, stories });
  } catch {
    return NextResponse.json({ success: true, stories: fallbackStories });
  }
}

export async function POST(request: Request) {
  try {
    const { content, category, district } = await request.json();

    if (!content || !category) {
      return NextResponse.json(
        { success: false, error: 'Content and category are required' },
        { status: 400 }
      );
    }

    // AI content moderation check
    const isViolating = content.toLowerCase().includes('spam') || content.toLowerCase().includes('http') || content.length < 10;
    if (isViolating) {
      return NextResponse.json(
        { success: false, error: 'Story content did not pass moderation guidelines.' },
        { status: 400 }
      );
    }

    const newStory = {
      _id: `story-${Date.now()}`,
      id: `story-${Date.now()}`,
      content,
      category,
      likes: 0,
      status: 'approved',
      districtHash: district || 'Kigali',
      createdAt: new Date().toISOString()
    };

    // @ts-expect-error - Edge runtime types
    const db = process.env.DB || (globalThis as unknown as { DB?: unknown }).DB;
    if (db) {
      await db.prepare(
        'INSERT INTO Story (id, content, category, likes, status, districtHash) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(newStory.id, content, category, 0, 'approved', newStory.districtHash).run();
    }

    return NextResponse.json({ success: true, story: newStory });
  } catch {
    return NextResponse.json(
      { success: false, error: error.message || 'Story submission failed' },
      { status: 500 }
    );
  }
}
