import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const collections = await prisma.collection.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ collections });
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const b = await req.json();
  const collection = await prisma.collection.create({
    data: {
      title: b.title ?? "Подборка",
      description: b.description ?? null,
      coverUrl: b.coverUrl ?? null,
    },
  });
  return NextResponse.json({ collection });
}
