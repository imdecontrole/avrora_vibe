import Link from "next/link";

export type PortfolioCardData = {
  id: string;
  title: string;
  clientName: string | null;
  coverUrl: string;
  coverType: string;
};

export default function PortfolioRow({ portfolios }: { portfolios: PortfolioCardData[] }) {
  if (!portfolios.length) return null;
  return (
    <section className="pt-6">
      <h2 className="px-3 mb-3 text-lg font-semibold">Портфолио</h2>
      <div className="no-scrollbar overflow-x-auto">
        <div className="flex gap-3 px-3 pb-1">
          {portfolios.map((p) => (
            <Link
              key={p.id}
              href={`/portfolio/${p.id}`}
              prefetch={false}
              className="shrink-0 w-[72vw] max-w-[320px] md:w-[300px]"
            >
              <div className="relative aspect-[4/5] rounded-pin overflow-hidden bg-[#f3f3f3]">
                {p.coverType === "video" ? (
                  <video
                    src={p.coverUrl}
                    className="w-full h-full object-cover"
                    muted
                    loop
                    playsInline
                    autoPlay
                    preload="metadata"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.coverUrl}
                    alt={p.title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/0" />
                <div className="absolute left-3 bottom-3 right-3 text-white">
                  {p.clientName && (
                    <div className="text-[11px] font-semibold tracking-wider uppercase opacity-90">
                      {p.clientName}
                    </div>
                  )}
                  <div className="text-lg font-semibold leading-tight line-clamp-2">
                    {p.title}
                  </div>
                </div>
                <span className="absolute top-3 left-3 text-[10px] font-bold tracking-wider px-2 py-1 rounded-full bg-white/95 text-ink shadow-sm">
                  ПОРТФОЛИО
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
