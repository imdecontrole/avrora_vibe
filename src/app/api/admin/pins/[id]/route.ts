import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const b = await req.json();

  const data: Record<string, unknown> = {};
  if (typeof b.title === "string") data.title = b.title;
  if (typeof b.productName === "string") data.productName = b.productName || null;
  if (typeof b.description === "string") data.description = b.description || null;
  if (typeof b.productUrl === "string") data.productUrl = b.productUrl || null;
  if ("price" in b) data.price = b.price == null || b.price === "" ? null : Number(b.price);
  if ("collectionId" in b) data.collectionId = b.collectionId || null;
  if ("categoryId" in b) data.categoryId = b.categoryId || null;
  if (typeof b.mediaUrl === "string") data.mediaUrl = b.mediaUrl;
  if (typeof b.mediaType === "string") data.mediaType = b.mediaType;

  if (Array.isArray(b.featuredProductIds)) {
    data.featuredProducts = { set: b.featuredProductIds.map((x: string) => ({ id: x })) };
  }

  const pin = await prisma.pin.update({
    where: { id },
    data,
    include: { featuredProducts: { select: { id: true } } },
  });
  return NextResponse.json({ pin });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.pin.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
