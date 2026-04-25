import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const portfolios = await prisma.portfolio.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true, pins: { select: { id: true } } },
    take: 100,
  });
  return NextResponse.json({ portfolios });
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const b = await req.json();
  if (!b.title || !b.coverUrl) {
    return NextResponse.json({ error: "title and coverUrl required" }, { status: 400 });
  }
  const items: { mediaUrl: string; mediaType: string }[] = Array.isArray(b.items) ? b.items : [];
  const pinIds: string[] = Array.isArray(b.pinIds) ? b.pinIds : [];

  const portfolio = await prisma.portfolio.create({
    data: {
      title: b.title,
      clientName: b.clientName ?? null,
      description: b.description ?? null,
      coverUrl: b.coverUrl,
      coverType: b.coverType ?? "image",
      items: {
        create: items.map((it, i) => ({
          mediaUrl: it.mediaUrl,
          mediaType: it.mediaType ?? "image",
          order: i,
        })),
      },
      pins: { connect: pinIds.map((id) => ({ id })) },
    },
    include: { items: true, pins: { select: { id: true } } },
  });
  return NextResponse.json({ portfolio });
}
