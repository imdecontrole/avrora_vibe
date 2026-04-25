import { prisma } from "@/lib/prisma";
import { readSessionId } from "@/lib/session";
import HeroCarousel, { type HeroSlide } from "@/components/HeroCarousel";
import CollectionRow from "@/components/CollectionRow";
import PortfolioRow from "@/components/PortfolioRow";
import CategoryRow, { type CategoryCardData } from "@/components/CategoryRow";
import MasonryGrid, { type FeedItem } from "@/components/MasonryGrid";
import type { PinCardData } from "@/components/PinCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const sessionId = await readSessionId();

  const [heroes, collections, categoriesRaw, portfolios, posts, pins, liked, saved] = await Promise.all([
    prisma.heroVideo.findMany({
      where: { active: true },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    }),
    prisma.collection.findMany({
      orderBy: { createdAt: "desc" },
      take: 4,
      include: { pins: { take: 8, orderBy: { createdAt: "desc" } } },
    }),
    prisma.category.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      include: { pins: { take: 1, orderBy: { createdAt: "desc" }, select: { mediaUrl: true } } },
    }),
    prisma.portfolio.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, title: true, clientName: true, coverUrl: true, coverType: true },
    }),
    prisma.post.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.pin.findMany({ where: { sku: null }, orderBy: { createdAt: "desc" }, take: 40 }),
    sessionId ? prisma.like.findMany({ where: { sessionId }, select: { pinId: true } }) : [],
    sessionId ? prisma.wishlist.findMany({ where: { sessionId }, select: { pinId: true } }) : [],
  ]);

  const categories: CategoryCardData[] = categoriesRaw
    .filter((c) => c.coverUrl || c.pins.length > 0)
    .map((c) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      coverUrl: c.coverUrl,
      coverType: c.coverType,
      firstPinImage: c.pins[0]?.mediaUrl ?? null,
    }));

  const likedIds = new Set(liked.map((l) => l.pinId));
  const savedIds = new Set(saved.map((w) => w.pinId));

  const cards: PinCardData[] = pins.map((p) => ({
    ...p,
    liked: likedIds.has(p.id),
    wishlisted: savedIds.has(p.id),
  }));

  // Interleave posts into the pin feed: evenly spread, stride ≈ pins/posts, min 3.
  const items: FeedItem[] = [];
  const stride = posts.length ? Math.max(3, Math.ceil((cards.length + posts.length) / posts.length)) : 0;
  let pi = 0;
  let po = 0;
  let i = 0;
  while (pi < cards.length || po < posts.length) {
    const shouldPost = stride > 0 && po < posts.length && (i + 1) % stride === 0;
    if (shouldPost) {
      items.push({ kind: "post", post: posts[po++] });
    } else if (pi < cards.length) {
      items.push({ kind: "pin", pin: cards[pi++] });
    } else if (po < posts.length) {
      items.push({ kind: "post", post: posts[po++] });
    }
    i++;
  }

  return (
    <div className="max-w-[1440px] mx-auto">
      <HeroCarousel
        slides={heroes.map<HeroSlide>((h) => ({
          id: h.id,
          title: h.title,
          mediaUrl: h.videoUrl,
          mediaType: h.mediaType,
          posterUrl: h.posterUrl,
          ctaLabel: h.ctaLabel,
          ctaUrl: h.ctaUrl,
        }))}
      />

      <h1 className="px-3 pt-5 text-[40px] leading-[1.05] tracking-tight font-normal">
        avrora fashion<br />
        <span className="font-medium" style={{ color: "rgba(113, 119, 248, 1)" }}>vibe</span>
      </h1>

      <CategoryRow categories={categories} />

      {collections.map((c) => (
        <CollectionRow key={c.id} collection={c} />
      ))}

      <PortfolioRow portfolios={portfolios} />

      <section className="pt-6">
        <h2 className="px-3 mb-3 text-lg font-semibold">Свежие пины</h2>
        <MasonryGrid items={items} />
      </section>
    </div>
  );
}
