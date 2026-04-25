import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const product = await prisma.pin.findUnique({
    where: { id },
    include: {
      category: true,
      // content-pins that feature this product
      featuredIn: {
        where: { sku: null },
        orderBy: { createdAt: "desc" },
        take: 12,
      },
      // portfolios that include this product
      portfolios: {
        orderBy: { createdAt: "desc" },
        take: 8,
        select: { id: true, title: true, clientName: true, coverUrl: true, coverType: true },
      },
    },
  });
  if (!product) notFound();

  return (
    <article className="max-w-5xl mx-auto px-4 pt-3 pb-10">
      <Link
        href="/catalog"
        className="inline-flex items-center w-10 h-10 -ml-2 rounded-full hover:bg-[#f1f1f1]"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.4" className="ml-2">
          <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>

      <div className="mt-2 grid md:grid-cols-2 gap-6">
        {/* Media */}
        <div className="overflow-hidden rounded-pin bg-[#f3f3f3]">
          {product.mediaType === "video" ? (
            <video src={product.mediaUrl} className="w-full h-auto" autoPlay muted loop playsInline controls />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.mediaUrl} alt={product.title} className="w-full h-auto" />
          )}
        </div>

        {/* Info */}
        <div className="md:sticky md:top-4 md:self-start">
          {product.category && (
            <Link
              href={`/category/${product.category.slug}`}
              className="inline-block text-[11px] uppercase tracking-wider text-muted hover:text-ink"
            >
              {product.category.title}
            </Link>
          )}
          {product.sku && (
            <div className="mt-1 text-[11px] uppercase tracking-wider text-muted">
              артикул · {product.sku}
            </div>
          )}
          <h1 className="mt-2 text-2xl md:text-3xl font-semibold leading-tight">
            {product.productName ?? product.title}
          </h1>
          {product.price != null && (
            <div className="mt-3 text-2xl font-semibold">
              {product.price.toLocaleString("ru-RU")} ₽
            </div>
          )}

          {product.description && (
            <div className="mt-5 text-[15px] leading-relaxed whitespace-pre-wrap text-ink/90">
              {product.description}
            </div>
          )}

          {product.productUrl && (
            <a
              href={product.productUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-6 px-6 py-3 rounded-full bg-ink text-white font-semibold"
            >
              Открыть на сайте
            </a>
          )}
        </div>
      </div>

      {/* Featured-in pins */}
      {product.featuredIn.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold mb-4">Пины с этим товаром</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {product.featuredIn.map((pin) => (
              <Link key={pin.id} href={`/pin/${pin.id}`} prefetch={false} className="block">
                <div className="relative aspect-[3/4] rounded-pin overflow-hidden bg-[#f3f3f3]">
                  {pin.mediaType === "video" ? (
                    <video src={pin.mediaUrl} className="w-full h-full object-cover" muted loop playsInline autoPlay preload="metadata" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={pin.mediaUrl} alt={pin.title} className="w-full h-full object-cover" />
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Portfolios with this product */}
      {product.portfolios.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold mb-4">Портфолио с этим товаром</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {product.portfolios.map((pf) => (
              <Link key={pf.id} href={`/portfolio/${pf.id}`} prefetch={false} className="block">
                <div className="relative aspect-[4/5] rounded-pin overflow-hidden bg-[#f3f3f3]">
                  {pf.coverType === "video" ? (
                    <video src={pf.coverUrl} className="w-full h-full object-cover" muted loop playsInline autoPlay preload="metadata" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={pf.coverUrl} alt={pf.title} className="w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/0" />
                  <div className="absolute left-2 bottom-2 right-2 text-white">
                    {pf.clientName && (
                      <div className="text-[10px] font-semibold tracking-wider uppercase opacity-90">
                        {pf.clientName}
                      </div>
                    )}
                    <div className="text-sm font-semibold leading-tight line-clamp-2">{pf.title}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
