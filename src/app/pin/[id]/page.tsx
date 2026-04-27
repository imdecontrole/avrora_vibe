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
      take: 80,
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
  // Split related: half on the right of the pin, half directly below it.
  const half = Math.ceil(relatedCards.length / 2);
  const sideRelated = relatedCards.slice(0, half);
  const belowRelated = relatedCards.slice(half);

  return (
    <div className="px-2 pt-3 md:px-6 md:pt-6 md:w-[1096px] md:max-w-full md:mx-auto">
      <div className="md:grid md:grid-cols-[540px_540px] md:gap-4 md:justify-center">
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
          <div className="order-1 md:order-2 relative overflow-hidden rounded-pin md:rounded-t-2xl md:rounded-b-none md:border md:border-b-0 md:border-line bg-[#f3f3f3]">
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
          <div className="order-3 mt-4 md:mt-0 md:p-4 md:rounded-b-2xl md:border md:border-t-0 md:border-line md:bg-white">
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

          {/* More related directly below the pin (desktop, 2 cols) */}
          {belowRelated.length > 0 && (
            <div className="order-4 hidden md:block mt-4">
              <MasonryGrid pins={belowRelated} cols={2} />
            </div>
          )}
        </div>

        {/* Right column: related (desktop) */}
        {relatedCards.length > 0 && (
          <aside className="hidden md:block">
            <MasonryGrid pins={sideRelated} cols={2} />
          </aside>
        )}
      </div>

      {/* Related on mobile (below) */}
      {relatedCards.length > 0 && (
        <section className="md:hidden mt-10 -mx-2">
          <MasonryGrid pins={relatedCards} />
        </section>
      )}

    </div>
  );
}
