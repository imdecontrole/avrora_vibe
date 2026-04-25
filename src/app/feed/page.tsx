import { prisma } from "@/lib/prisma";
import { readSessionId } from "@/lib/session";
import MasonryGrid from "@/components/MasonryGrid";
import type { PinCardData } from "@/components/PinCard";

export const dynamic = "force-dynamic";

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ collection?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const sessionId = await readSessionId();

  const pins = await prisma.pin.findMany({
    where: {
      sku: null,
      ...(sp.collection ? { collectionId: sp.collection } : {}),
      ...(sp.q
        ? {
            OR: [
              { title: { contains: sp.q, mode: "insensitive" } },
              { productName: { contains: sp.q, mode: "insensitive" } },
              { description: { contains: sp.q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 120,
  });

  const [liked, saved] = await Promise.all([
    sessionId ? prisma.like.findMany({ where: { sessionId }, select: { pinId: true } }) : [],
    sessionId ? prisma.wishlist.findMany({ where: { sessionId }, select: { pinId: true } }) : [],
  ]);
  const likedIds = new Set(liked.map((l) => l.pinId));
  const savedIds = new Set(saved.map((w) => w.pinId));

  const cards: PinCardData[] = pins.map((p) => ({
    ...p,
    liked: likedIds.has(p.id),
    wishlisted: savedIds.has(p.id),
  }));

  return (
    <div className="max-w-[1440px] mx-auto">
      <div className="pt-3">
        <MasonryGrid pins={cards} />
      </div>
    </div>
  );
}
