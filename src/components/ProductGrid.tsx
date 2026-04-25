import ProductCard, { type ProductCardData } from "./ProductCard";

export default function ProductGrid({ products }: { products: ProductCardData[] }) {
  if (!products.length) {
    return (
      <div className="py-20 text-center text-muted text-sm">
        Пока товаров нет.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-3 gap-y-6 px-3">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
