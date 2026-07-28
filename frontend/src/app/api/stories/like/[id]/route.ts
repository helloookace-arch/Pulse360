import { NextResponse } from "next/server";
import { getD1 } from "../../../../../lib/db";

export const runtime = "edge";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(
  request: Request,
  { params }: RouteContext
) {
  const { id } = await params;
  const db = getD1();

  if (db) {
    await db.prepare("UPDATE Story SET likes = likes + 1 WHERE id = ?").bind(id).run();
    const updated = await db
      .prepare("SELECT likes FROM Story WHERE id = ?")
      .bind(id)
      .first<{ likes?: number }>();
    return NextResponse.json({ success: true, likes: updated?.likes || 1 });
  }

  return NextResponse.json({ success: true, likes: 1 });
}
