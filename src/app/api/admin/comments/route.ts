import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const comments = await prisma.comment.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      pin: { select: { id: true, title: true, mediaUrl: true, mediaType: true } },
    },
  });
  return NextResponse.json({ comments });
}
