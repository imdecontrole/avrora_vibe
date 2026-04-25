import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const pins = await prisma.pin.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  return NextResponse.json({ pins });
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const b = await req.json();
  const featuredIds: string[] = Array.isArray(b.featuredProductIds) ? b.featuredProductIds : [];
  const pin = await prisma.pin.create({
    data: {
      title: b.title ?? "Без названия",
      description: b.description ?? null,
      productName: b.productName ?? null,
      productUrl: b.productUrl ?? null,
      price: b.price != null ? Number(b.price) : null,
      mediaType: b.mediaType ?? "image",
      mediaUrl: b.mediaUrl,
      mediaPublicId: b.mediaPublicId ?? null,
      width: b.width ?? null,
      height: b.height ?? null,
      collectionId: b.collectionId || null,
      ...(featuredIds.length
        ? { featuredProducts: { connect: featuredIds.map((id) => ({ id })) } }
        : {}),
    },
    include: { featuredProducts: { select: { id: true } } },
  });
  return NextResponse.json({ pin });
}
