import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import Dashboard from "./Dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  if (!(await isAdmin())) redirect("/admin");
  const [pins, products, posts, collections, heroes, portfolios, categories] = await Promise.all([
    prisma.pin.findMany({
      where: { sku: null },
      orderBy: { createdAt: "desc" },
      take: 60,
      include: { featuredProducts: { select: { id: true } } },
    }),
    prisma.pin.findMany({
      where: { sku: { not: null } },
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { category: { select: { id: true, title: true, slug: true } } },
    }),
    prisma.post.findMany({ orderBy: { createdAt: "desc" }, take: 30 }),
    prisma.collection.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.heroVideo.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.portfolio.findMany({
      orderBy: { createdAt: "desc" },
      include: { items: true, pins: { select: { id: true } } },
      take: 50,
    }),
    prisma.category.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      include: { _count: { select: { pins: true } } },
    }),
  ]);
  return (
    <Dashboard
      initialPins={pins as any}
      initialProducts={products as any}
      initialPosts={posts as any}
      initialCollections={collections as any}
      initialHeroes={heroes as any}
      initialPortfolios={portfolios as any}
      initialCategories={categories as any}
    />
  );
}
