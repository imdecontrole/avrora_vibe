import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const b = await req.json();

  const data: Record<string, unknown> = {};
  if (typeof b.title === "string") data.title = b.title || null;
  if (typeof b.ctaLabel === "string") data.ctaLabel = b.ctaLabel || null;
  if (typeof b.ctaUrl === "string") data.ctaUrl = b.ctaUrl || null;
  if (typeof b.videoUrl === "string") data.videoUrl = b.videoUrl;
  if (typeof b.mediaType === "string") data.mediaType = b.mediaType;
  if (typeof b.posterUrl === "string") data.posterUrl = b.posterUrl || null;
  if (typeof b.active === "boolean") data.active = b.active;
  if (typeof b.order === "number") data.order = b.order;

  const hero = await prisma.heroVideo.update({ where: { id }, data });
  return NextResponse.json({ hero });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.heroVideo.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
