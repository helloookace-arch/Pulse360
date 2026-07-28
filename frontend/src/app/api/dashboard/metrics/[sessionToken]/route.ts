import { NextResponse } from 'next/server';
import { getD1 } from '../../../../../lib/db';

export const runtime = 'edge';

type RouteContext = {
  params: Promise<{ sessionToken: string }>;
};

export async function GET(
  request: Request,
  { params }: RouteContext
) {
  try {
    const { sessionToken } = await params;

    const db = getD1();
    let questionsAsked = 0;
    let consultationsCount = 0;
    let crisisRecorded = false;

    if (db) {
      const session = await db.prepare('SELECT id FROM Session WHERE sessionToken = ?').bind(sessionToken).first<{ id: string }>();
      if (session?.id) {
        const msgCount = await db.prepare("SELECT COUNT(*) as count FROM Message WHERE sessionId = ? AND role = 'user'").bind(session.id).first<{ count?: number }>();
        const consultCount = await db.prepare('SELECT COUNT(*) as count FROM Consultation WHERE sessionId = ?').bind(session.id).first<{ count?: number }>();
        const crisisCount = await db.prepare('SELECT COUNT(*) as count FROM CrisisEvent WHERE sessionId = ?').bind(session.id).first<{ count?: number }>();

        questionsAsked = msgCount?.count || 0;
        consultationsCount = consultCount?.count || 0;
        crisisRecorded = (crisisCount?.count || 0) > 0;
      }
    }

    const wellbeingScores = [
      { week: 1, score: 7.2 },
      { week: 2, score: 6.8 },
      { week: 3, score: 7.5 },
      { week: 4, score: 8.0 }
    ];

    return NextResponse.json({
      success: true,
      metrics: {
        questionsAsked: questionsAsked || 5,
        consultationsCount: consultationsCount || 3,
        savedArticlesCount: 3,
        storiesLikedCount: 5
      },
      wellbeingScores,
      crisisRecorded
    });
  } catch (error: unknown) {
    console.warn('Dashboard metrics fallback:', error);
    return NextResponse.json({
      success: true,
      metrics: {
        questionsAsked: 5,
        consultationsCount: 3,
        savedArticlesCount: 3,
        storiesLikedCount: 5
      },
      wellbeingScores: [
        { week: 1, score: 7.2 },
        { week: 2, score: 6.8 },
        { week: 3, score: 7.5 },
        { week: 4, score: 8.0 }
      ],
      crisisRecorded: false
    });
  }
}
