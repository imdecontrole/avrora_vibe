import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionId } from "@/lib/session";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sessionId = await getSessionId();
  const existing = await prisma.like.findUnique({
    where: { sessionId_pinId: { sessionId, pinId: id } },
  });
  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
    return NextResponse.json({ liked: false });
  }
  await prisma.like.create({ data: { sessionId, pinId: id } });
  return NextResponse.json({ liked: true });
}
