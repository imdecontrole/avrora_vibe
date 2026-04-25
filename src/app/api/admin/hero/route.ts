import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const heroes = await prisma.heroVideo.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json({ heroes });
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const b = await req.json();
  if (!b.videoUrl) {
    return NextResponse.json({ error: "mediaUrl required" }, { status: 400 });
  }
  // Put new slide at the end of the order.
  const last = await prisma.heroVideo.findFirst({ orderBy: { order: "desc" } });
  const nextOrder = (last?.order ?? -1) + 1;
  const hero = await prisma.heroVideo.create({
    data: {
      title: b.title || null,
      videoUrl: b.videoUrl,
      posterUrl: b.posterUrl || null,
      mediaType: b.mediaType ?? "video",
      ctaLabel: b.ctaLabel || null,
      ctaUrl: b.ctaUrl || null,
      order: nextOrder,
      active: true,
    },
  });
  return NextResponse.json({ hero });
}
