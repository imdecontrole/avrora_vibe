import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PortfolioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const portfolio = await prisma.portfolio.findUnique({
    where: { id },
    include: {
      items: { orderBy: { order: "asc" } },
      pins: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!portfolio) notFound();

  return (
    <article className="max-w-3xl mx-auto px-4 pt-3">
      <Link
        href="/"
        className="inline-flex items-center w-10 h-10 -ml-2 rounded-full hover:bg-[#f1f1f1]"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.4" className="ml-2">
          <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>

      {/* Cover */}
      <div className="relative mt-2 overflow-hidden rounded-pin bg-[#f3f3f3] aspect-[4/5]">
        {portfolio.coverType === "video" ? (
          <video
            src={portfolio.coverUrl}
            className="w-full h-full object-cover"
            autoPlay muted loop playsInline
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={portfolio.coverUrl} alt={portfolio.title} className="w-full h-full object-cover" />
        )}
        <span className="absolute top-3 left-3 text-[10px] font-bold tracking-wider px-2 py-1 rounded-full bg-white/95 text-ink shadow-sm">
          ПОРТФОЛИО
        </span>
      </div>

      <header className="mt-5">
        {portfolio.clientName && (
          <div className="text-xs font-semibold tracking-wider uppercase text-muted">
            {portfolio.clientName}
          </div>
        )}
        <h1 className="mt-1 text-2xl md:text-3xl font-semibold leading-tight">{portfolio.title}</h1>
        <div className="mt-2 text-sm text-muted">
          {new Date(portfolio.createdAt).toLocaleDateString("ru-RU", {
            day: "numeric", month: "long", year: "numeric",
          })}
        </div>
      </header>

      {portfolio.description && (
        <div className="mt-5 text-[15px] leading-relaxed whitespace-pre-wrap">
          {portfolio.description}
        </div>
      )}

      {/* Gallery */}
      {portfolio.items.length > 0 && (
        <div className="mt-6 space-y-3">
          {portfolio.items.map((it) => (
            <div key={it.id} className="overflow-hidden rounded-pin bg-[#f3f3f3]">
              {it.mediaType === "video" ? (
                <video src={it.mediaUrl} className="w-full h-auto" controls playsInline preload="metadata" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={it.mediaUrl} alt="" className="w-full h-auto" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Linked pins (articles) */}
      {portfolio.pins.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold mb-3">Артикулы из этого проекта</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {portfolio.pins.map((pin) => (
              <Link
                key={pin.id}
                href={`/pin/${pin.id}`}
                prefetch={false}
                className="block"
              >
                <div className="relative aspect-[3/4] rounded-pin overflow-hidden bg-[#f3f3f3]">
                  {pin.mediaType === "video" ? (
                    <video src={pin.mediaUrl} className="w-full h-full object-cover" muted loop playsInline autoPlay preload="metadata" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={pin.mediaUrl} alt={pin.title} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="pt-2">
                  {pin.productName && (
                    <div className="text-[13px] font-medium line-clamp-1">{pin.productName}</div>
                  )}
                  {pin.price != null && (
                    <div className="text-[12px] text-muted">{pin.price.toLocaleString("ru-RU")} ₽</div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
