import Link from "next/link";
import HlsVideo from "./HlsVideo";

export type CategoryCardData = {
  id: string;
  title: string;
  slug: string;
  coverUrl: string | null;
  coverType: string;
  firstPinImage?: string | null;
};

const ALL_PRODUCTS_HLS = "https://kinescope.io/00906ee0-8bc2-446b-b914-b8a72d75e4c1/master.m3u8?lang=und";

export default function CategoryRow({ categories }: { categories: CategoryCardData[] }) {
  if (!categories.length) return null;
  return (
    <section className="pt-4">
      <h2 className="px-3 mb-3 text-lg font-semibold">AF drop</h2>
      <div className="no-scrollbar overflow-x-auto">
        <div className="flex gap-3 px-3 pb-1">
          {/* Первая карточка — все товары */}
          <Link
            href="/catalog"
            prefetch={false}
            className="shrink-0 w-[42vw] max-w-[180px] md:w-[180px]"
          >
            <div className="relative aspect-square rounded-pin overflow-hidden bg-black">
              <HlsVideo src={ALL_PRODUCTS_HLS} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-black/0" />
              <div className="absolute left-2 bottom-2 right-2 text-white">
                <div className="text-[13px] font-semibold leading-tight uppercase tracking-wide">
                  Все товары
                </div>
              </div>
            </div>
          </Link>

          {categories.map((c) => {
            const img = c.coverUrl ?? c.firstPinImage ?? null;
            return (
              <Link
                key={c.id}
                href={`/category/${c.slug}`}
                prefetch={false}
                className="shrink-0 w-[42vw] max-w-[180px] md:w-[180px]"
              >
                <div className="relative aspect-square rounded-pin overflow-hidden bg-[#f3f3f3]">
                  {img ? (
                    c.coverType === "video" && c.coverUrl ? (
                      <video
                        src={img}
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
                        src={img}
                        alt={c.title}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    )
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#f1f1f1] to-[#e6e6ff]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/0" />
                  <div className="absolute left-2 bottom-2 right-2 text-white">
                    <div className="text-[13px] font-semibold leading-tight line-clamp-2 uppercase tracking-wide">
                      {c.title}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
