import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const b = await req.json();
  const data: Record<string, unknown> = {};
  if (typeof b.title === "string") data.title = b.title;
  if (typeof b.coverUrl === "string") data.coverUrl = b.coverUrl;
  if (typeof b.coverType === "string") data.coverType = b.coverType;
  if (typeof b.order === "number") data.order = b.order;
  const category = await prisma.category.update({ where: { id }, data });
  return NextResponse.json({ category });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
