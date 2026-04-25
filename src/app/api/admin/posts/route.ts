import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const posts = await prisma.post.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return NextResponse.json({ posts });
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const b = await req.json();
  const post = await prisma.post.create({
    data: {
      title: b.title ?? "Без названия",
      body: b.body ?? null,
      mediaUrl: b.mediaUrl ?? null,
      mediaType: b.mediaType ?? null,
      bodyMediaUrl: b.bodyMediaUrl ?? null,
      bodyMediaType: b.bodyMediaType ?? null,
      ctaLabel: b.ctaLabel ?? null,
      ctaUrl: b.ctaUrl ?? null,
      isAd: !!b.isAd,
    },
  });
  return NextResponse.json({ post });
}
