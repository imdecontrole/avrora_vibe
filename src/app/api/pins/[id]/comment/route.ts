import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionId } from "@/lib/session";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sessionId = await getSessionId();
  const { body } = await req.json().catch(() => ({ body: "" }));
  const text = String(body ?? "").trim();
  if (!text) return NextResponse.json({ error: "empty" }, { status: 400 });
  if (text.length > 1000) return NextResponse.json({ error: "too long" }, { status: 400 });
  const comment = await prisma.comment.create({
    data: { sessionId, pinId: id, body: text },
  });
  return NextResponse.json({ comment });
}
