import Link from "next/link";

export type ProductCardData = {
  id: string;
  title: string;
  productName?: string | null;
  price?: number | null;
  sku?: string | null;
  mediaUrl: string;
  mediaType: string;
};

export default function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <Link
      href={`/product/${product.id}`}
      prefetch={false}
      className="block group"
    >
      <div className="relative aspect-square overflow-hidden rounded-xl bg-[#f3f3f3]">
        {product.mediaType === "video" ? (
          <video
            src={product.mediaUrl}
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
            src={product.mediaUrl}
            alt={product.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        )}
      </div>
      <div className="pt-2 pb-1 px-0.5">
        <div className="text-[12px] text-muted uppercase tracking-wide">
          {product.sku ?? "\u00A0"}
        </div>
        <div className="text-[13px] leading-tight line-clamp-2 min-h-[2.2em]">
          {product.productName ?? product.title}
        </div>
        {product.price != null && (
          <div className="mt-1 text-[14px] font-semibold">
            {product.price.toLocaleString("ru-RU")} ₽
          </div>
        )}
      </div>
    </Link>
  );
}
