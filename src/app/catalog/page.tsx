import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductGrid from "@/components/ProductGrid";
import type { ProductCardData } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  const pins = await prisma.pin.findMany({
    where: { sku: { not: null } },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  const products: ProductCardData[] = pins.map((p) => ({
    id: p.id,
    title: p.title,
    productName: p.productName,
    price: p.price,
    sku: p.sku,
    mediaUrl: p.mediaUrl,
    mediaType: p.mediaType,
  }));

  return (
    <div className="max-w-[1440px] mx-auto pb-10">
      <div className="px-4 pt-3 flex items-center gap-2">
        <Link
          href="/"
          className="inline-flex items-center w-10 h-10 -ml-2 rounded-full hover:bg-[#f1f1f1]"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.4" className="ml-2">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
      <h1 className="px-4 pt-2 pb-1 text-2xl md:text-3xl font-semibold">Все товары</h1>
      <div className="px-4 pb-5 text-sm text-muted">{products.length} позиций</div>
      <ProductGrid products={products} />
    </div>
  );
}
