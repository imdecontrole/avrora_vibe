import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { readSessionId } from "@/lib/session";
import PinActions from "@/components/PinActions";
import MasonryGrid from "@/components/MasonryGrid";
import type { PinCardData } from "@/components/PinCard";

export const dynamic = "force-dynamic";

export default async function PinPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pin = await prisma.pin.findUnique({ where: { id } });
  if (!pin) notFound();
  if (pin.sku) redirect(`/product/${pin.id}`);

  const sessionId = await readSessionId();

  const [likeCount, liked, saved, comments, related] = await Promise.all([
    prisma.like.count({ where: { pinId: id } }),
    sessionId
      ? prisma.like.findUnique({ where: { sessionId_pinId: { sessionId, pinId: id } } })
      : null,
    sessionId
      ? prisma.wishlist.findUnique({ where: { sessionId_pinId: { sessionId, pinId: id } } })
      : null,
    prisma.comment.findMany({
      where: { pinId: id },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.pin.findMany({
      where: {
        id: { not: id },
        sku: null,
        ...(pin.collectionId ? { collectionId: pin.collectionId } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  ]);

  if (sessionId) {
    prisma.view.create({ data: { sessionId, pinId: id } }).catch(() => {});
  }

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const proto = h.get("x-forwarded-proto") ?? "https";
  const shareUrl = `${proto}://${host}/pin/${id}`;

  const relatedCards: PinCardData[] = related.map((p) => ({ ...p }));

  return (
    <div className="px-2 pt-3 md:px-6 md:pt-6 md:max-w-[1400px] md:mx-auto">
      <div className="md:grid md:grid-cols-[minmax(0,580px)_minmax(0,1fr)] md:gap-8">
        {/* Left column: pin */}
        <div className="flex flex-col">
          {/* Actions on top (desktop) / bottom (mobile) via order */}
          <div className="order-2 md:order-1 md:mb-3 md:flex md:items-center md:gap-1">
            <Link
              href="/feed"
              aria-label="Назад"
              className="hidden md:grid w-11 h-11 place-items-center rounded-full hover:bg-[#f1f1f1] shrink-0"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#111">
                <path d="M16.752,23.994,6.879,14.121a3,3,0,0,1,0-4.242L16.746.012,18.16,1.426,8.293,11.293a1,1,0,0,0,0,1.414l9.873,9.873Z" />
              </svg>
            </Link>
            <div className="md:flex-1 md:min-w-0">
            <PinActions
              pinId={pin.id}
              mediaUrl={pin.mediaUrl}
              mediaType={pin.mediaType}
              initialLiked={!!liked}
              initialSaved={!!saved}
              likeCount={likeCount}
              commentCount={comments.length}
              initialComments={comments as any}
              shareUrl={shareUrl}
            />
            </div>
          </div>

          {/* Image */}
          <div className="order-1 md:order-2 relative overflow-hidden rounded-pin bg-[#f3f3f3]">
            {pin.mediaType === "video" ? (
              <video src={pin.mediaUrl} controls playsInline className="w-full h-auto" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={pin.mediaUrl} alt={pin.title} className="w-full h-auto" />
            )}
            <Link
              href="/feed"
              aria-label="Назад"
              className="md:hidden absolute top-2 left-2 z-10 w-12 h-12 grid place-items-center rounded-2xl bg-white/95 backdrop-blur shadow-md hover:bg-white"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#111">
                <path d="M16.752,23.994,6.879,14.121a3,3,0,0,1,0-4.242L16.746.012,18.16,1.426,8.293,11.293a1,1,0,0,0,0,1.414l9.873,9.873Z" />
              </svg>
            </Link>
          </div>

          {/* Info */}
          <div className="order-3 mt-4">
            <h1 className="text-xl font-semibold">{pin.title}</h1>
            {pin.productName && <div className="mt-1 text-base">{pin.productName}</div>}
            {pin.price != null && (
              <div className="mt-1 text-base font-semibold">
                {pin.price.toLocaleString("ru-RU")} ₽
              </div>
            )}
            {pin.description && (
              <p className="mt-3 text-sm text-muted whitespace-pre-wrap">{pin.description}</p>
            )}
            {pin.productUrl && (
              <a
                href={pin.productUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 px-5 py-2.5 rounded-full bg-ink text-white font-semibold"
              >
                Открыть веб-сайт
              </a>
            )}
          </div>
        </div>

        {/* Right column: related (desktop) */}
        {relatedCards.length > 0 && (
          <aside className="hidden md:block">
            <h2 className="px-3 mb-3 text-base font-semibold">Другие интересные пины</h2>
            <MasonryGrid pins={relatedCards} />
          </aside>
        )}
      </div>

      {/* Related on mobile (below) */}
      {relatedCards.length > 0 && (
        <section className="md:hidden mt-10 -mx-2">
          <h2 className="px-4 mb-3 text-lg font-semibold">Другие интересные пины</h2>
          <MasonryGrid pins={relatedCards} />
        </section>
      )}
    </div>
  );
}
