import { NextResponse } from "next/server";
import { getD1 } from "../../../../lib/db";

export const runtime = "edge";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: Request,
  { params }: RouteContext
) {
  const { id } = await params;
  const db = getD1();

  if (db) {
    const article = await db
      .prepare("SELECT * FROM Article WHERE id = ?")
      .bind(id)
      .first<Record<string, unknown>>();

    if (article) {
      return NextResponse.json({
        success: true,
        article: {
          ...article,
          _id: article.id,
          tags:
            typeof article.tags === "string"
              ? JSON.parse(article.tags)
              : article.tags,
        },
      });
    }
  }

  return NextResponse.json(
    { success: false, error: "Article not found" },
    { status: 404 }
  );
}
