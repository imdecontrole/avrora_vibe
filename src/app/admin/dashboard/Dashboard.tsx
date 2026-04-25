"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Pin = {
  id: string; title: string; productName: string | null; price: number | null;
  mediaType: string; mediaUrl: string; collectionId: string | null;
  featuredProducts?: { id: string }[];
};
type Product = {
  id: string; title: string; productName: string | null; price: number | null;
  sku: string | null; description: string | null; productUrl: string | null;
  mediaType: string; mediaUrl: string;
  categoryId: string | null;
  category?: { id: string; title: string; slug: string } | null;
};
type Post = {
  id: string; title: string; body: string | null; mediaUrl: string | null;
  mediaType: string | null; bodyMediaUrl: string | null; bodyMediaType: string | null;
  ctaLabel: string | null; ctaUrl: string | null; isAd: boolean;
};
type Collection = { id: string; title: string; description: string | null; coverUrl: string | null };
type Hero = {
  id: string; title: string | null; videoUrl: string; posterUrl: string | null;
  mediaType: string; ctaLabel: string | null; ctaUrl: string | null;
  order: number; active: boolean;
};
type PortfolioItem = { id: string; mediaUrl: string; mediaType: string; order: number };
type Portfolio = {
  id: string; title: string; clientName: string | null; description: string | null;
  coverUrl: string; coverType: string;
  items: PortfolioItem[]; pins: { id: string }[];
};
type Category = {
  id: string; title: string; slug: string;
  coverUrl: string | null; coverType: string; order: number;
  _count: { pins: number };
};

type Tab = "pin" | "product" | "post" | "portfolio" | "category" | "collection" | "hero" | "comment";

export default function Dashboard(props: {
  initialPins: Pin[]; initialProducts: Product[]; initialPosts: Post[]; initialCollections: Collection[];
  initialHeroes: Hero[]; initialPortfolios: Portfolio[]; initialCategories: Category[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("pin");
  const [pins, setPins] = useState(props.initialPins);
  const [products, setProducts] = useState(props.initialProducts);
  const [posts, setPosts] = useState(props.initialPosts);
  const [collections, setCollections] = useState(props.initialCollections);
  const [heroes, setHeroes] = useState(props.initialHeroes);
  const [portfolios, setPortfolios] = useState(props.initialPortfolios);
  const [categories, setCategories] = useState(props.initialCategories);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="min-h-dvh bg-[#fafafa]">
      <header className="sticky top-0 z-20 bg-white border-b border-line">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="font-semibold">Avrora · Админка</div>
          <button onClick={logout} className="text-sm text-muted hover:text-ink">Выйти</button>
        </div>
        <nav className="max-w-5xl mx-auto px-4 pb-3 flex gap-2 text-sm">
          {(["pin","product","post","portfolio","category","collection","hero","comment"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-full font-medium ${
                tab === t ? "bg-ink text-white" : "bg-[#f1f1f1]"
              }`}
            >
              {labelFor(t)}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-8">
        {tab === "pin" && (
          <PinSection
            pins={pins}
            products={products}
            collections={collections}
            onCreate={(p) => setPins([p, ...pins])}
            onDelete={(id) => setPins(pins.filter((x) => x.id !== id))}
          />
        )}
        {tab === "product" && (
          <ProductSection
            products={products}
            categories={categories}
            onUpdate={(p) => setProducts(products.map((x) => x.id === p.id ? { ...x, ...p } : x))}
            onDelete={(id) => setProducts(products.filter((x) => x.id !== id))}
          />
        )}
        {tab === "post" && (
          <PostSection
            posts={posts}
            onCreate={(p) => setPosts([p, ...posts])}
            onDelete={(id) => setPosts(posts.filter((x) => x.id !== id))}
          />
        )}
        {tab === "category" && (
          <CategorySection
            categories={categories}
            onUpdate={(c) => setCategories(categories.map((x) => x.id === c.id ? { ...x, ...c } : x))}
            onDelete={(id) => setCategories(categories.filter((x) => x.id !== id))}
          />
        )}
        {tab === "portfolio" && (
          <PortfolioSection
            portfolios={portfolios}
            pins={pins}
            onCreate={(p) => setPortfolios([p, ...portfolios])}
            onDelete={(id) => setPortfolios(portfolios.filter((x) => x.id !== id))}
          />
        )}
        {tab === "collection" && (
          <CollectionSection
            collections={collections}
            onCreate={(c) => setCollections([c, ...collections])}
            onDelete={(id) => setCollections(collections.filter((x) => x.id !== id))}
          />
        )}
        {tab === "comment" && <CommentSection />}
        {tab === "hero" && (
          <HeroSection
            heroes={heroes}
            onCreate={(h) => setHeroes([...heroes, h])}
            onUpdate={(h) => setHeroes(heroes.map((x) => x.id === h.id ? { ...x, ...h } : x))}
            onDelete={(id) => setHeroes(heroes.filter((x) => x.id !== id))}
          />
        )}
      </main>
    </div>
  );
}

function labelFor(t: Tab) {
  return t === "pin" ? "Пины"
    : t === "product" ? "Товары"
    : t === "post" ? "Посты"
    : t === "portfolio" ? "Портфолио"
    : t === "category" ? "Категории"
    : t === "collection" ? "Подборки"
    : t === "comment" ? "Комментарии"
    : "Главный баннер";
}

// ----------- UPLOAD HOOK -----------
async function uploadToCloudinary(file: File, resourceType: "image" | "video") {
  const signRes = await fetch("/api/admin/upload-sign", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ folder: "avrora" }),
  });
  if (!signRes.ok) throw new Error("sign failed");
  const { timestamp, signature, apiKey, cloudName, folder } = await signRes.json();

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", apiKey);
  form.append("timestamp", String(timestamp));
  form.append("signature", signature);
  form.append("folder", folder);

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;
  const res = await fetch(url, { method: "POST", body: form });
  if (!res.ok) throw new Error("upload failed");
  const data = await res.json();
  return {
    secure_url: data.secure_url as string,
    public_id: data.public_id as string,
    width: data.width as number,
    height: data.height as number,
  };
}

// ----------- PINS -----------
function PinSection({
  pins, products, collections, onCreate, onDelete,
}: {
  pins: Pin[]; products: Product[]; collections: Collection[];
  onCreate: (p: Pin) => void; onDelete: (id: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    title: "", productName: "", price: "", productUrl: "", description: "",
    collectionId: "", mediaType: "image" as "image" | "video",
    mediaUrl: "", mediaPublicId: "", width: 0, height: 0,
  });
  const [featuredProductIds, setFeaturedProductIds] = useState<string[]>([]);
  const [productQuery, setProductQuery] = useState("");
  const filteredProducts = products.filter((p) => {
    if (!productQuery) return true;
    const q = productQuery.toLowerCase();
    return (
      (p.sku ?? "").toLowerCase().includes(q) ||
      (p.productName ?? p.title ?? "").toLowerCase().includes(q)
    );
  });

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setBusy(true);
    try {
      const type: "image" | "video" = f.type.startsWith("video") ? "video" : "image";
      const up = await uploadToCloudinary(f, type);
      setForm((s) => ({
        ...s,
        mediaType: type,
        mediaUrl: up.secure_url,
        mediaPublicId: up.public_id,
        width: up.width,
        height: up.height,
      }));
    } finally {
      setBusy(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.mediaUrl) { alert("Загрузи файл"); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/pins", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: form.price ? Number(form.price) : null,
          collectionId: form.collectionId || null,
          featuredProductIds,
        }),
      });
      const { pin } = await res.json();
      onCreate(pin);
      setForm({ title: "", productName: "", price: "", productUrl: "", description: "",
        collectionId: "", mediaType: "image", mediaUrl: "", mediaPublicId: "", width: 0, height: 0 });
      setFeaturedProductIds([]);
    } finally { setBusy(false); }
  }

  async function del(id: string) {
    if (!confirm("Удалить пин?")) return;
    await fetch(`/api/admin/pins/${id}`, { method: "DELETE" });
    onDelete(id);
  }

  return (
    <section className="space-y-6">
      <CsvImportCard />
      <form onSubmit={submit} className="grid md:grid-cols-2 gap-4 p-4 rounded-2xl bg-white border border-line">
        <h2 className="md:col-span-2 text-lg font-semibold">Новый пин</h2>
        <div className="md:col-span-2">
          <label className="block text-sm mb-1 text-muted">Файл (фото или видео)</label>
          <input type="file" accept="image/*,video/*" onChange={onFile} disabled={busy} />
          {form.mediaUrl && (
            <div className="mt-2 w-40 aspect-[3/4] rounded-lg overflow-hidden bg-[#f3f3f3]">
              {form.mediaType === "video" ? (
                <video src={form.mediaUrl} muted className="w-full h-full object-cover" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.mediaUrl} alt="" className="w-full h-full object-cover" />
              )}
            </div>
          )}
        </div>
        <Input label="Название пина" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required />
        <Input label="Название товара" value={form.productName} onChange={(v) => setForm({ ...form, productName: v })} />
        <Input label="Цена (₽)" value={form.price} onChange={(v) => setForm({ ...form, price: v })} />
        <Input label="Ссылка на товар" value={form.productUrl} onChange={(v) => setForm({ ...form, productUrl: v })} />
        <div className="md:col-span-2">
          <label className="block text-sm mb-1 text-muted">Описание</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3} className="w-full px-3 py-2 rounded-lg bg-[#f1f1f1] outline-none" />
        </div>
        <div>
          <label className="block text-sm mb-1 text-muted">Подборка</label>
          <select value={form.collectionId} onChange={(e) => setForm({ ...form, collectionId: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-[#f1f1f1] outline-none">
            <option value="">Без подборки</option>
            {collections.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm mb-1 text-muted">
            Товары на этом пине (выбрано: {featuredProductIds.length})
          </label>
          <input
            value={productQuery}
            onChange={(e) => setProductQuery(e.target.value)}
            placeholder="Поиск по артикулу или названию"
            className="w-full px-3 py-2 rounded-lg bg-[#f1f1f1] outline-none text-sm mb-2"
          />
          <div className="max-h-64 overflow-y-auto grid grid-cols-2 md:grid-cols-4 gap-2 p-2 rounded-lg bg-[#fafafa] border border-line">
            {filteredProducts.map((p) => {
              const active = featuredProductIds.includes(p.id);
              return (
                <button
                  type="button"
                  key={p.id}
                  onClick={() =>
                    setFeaturedProductIds((s) =>
                      s.includes(p.id) ? s.filter((x) => x !== p.id) : [...s, p.id]
                    )
                  }
                  className={`text-left rounded-lg overflow-hidden border ${active ? "border-ink ring-2 ring-ink" : "border-line"} bg-white`}
                >
                  <div className="aspect-square bg-[#f3f3f3]">
                    {p.mediaType === "video" ? (
                      <video src={p.mediaUrl} muted className="w-full h-full object-cover" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.mediaUrl} alt={p.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="p-2 text-xs">
                    {p.sku && <div className="text-[10px] uppercase tracking-wide text-muted">{p.sku}</div>}
                    <div className="font-medium line-clamp-1">{p.productName ?? p.title}</div>
                    {p.price != null && <div className="text-muted">{p.price} ₽</div>}
                  </div>
                </button>
              );
            })}
            {products.length === 0 && (
              <div className="col-span-full text-sm text-muted p-2">
                Пока нет товаров. Импортируй каталог CSV выше или на вкладке «Товары».
              </div>
            )}
          </div>
        </div>
        <div className="md:col-span-2">
          <button disabled={busy} className="px-5 py-2.5 rounded-full bg-ink text-white font-semibold disabled:opacity-50">
            {busy ? "..." : "Добавить пин"}
          </button>
        </div>
      </form>

      <div>
        <h2 className="text-lg font-semibold mb-3">Существующие пины ({pins.length})</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {pins.map((p) => (
            <div key={p.id} className="relative rounded-xl overflow-hidden bg-white border border-line">
              <div className="aspect-[3/4] bg-[#f3f3f3]">
                {p.mediaType === "video" ? (
                  <video src={p.mediaUrl} muted className="w-full h-full object-cover" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.mediaUrl} alt={p.title} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="p-2 text-xs">
                <div className="font-medium line-clamp-1">{p.title}</div>
                {p.price != null && <div className="text-muted">{p.price} ₽</div>}
              </div>
              <button onClick={() => del(p.id)}
                className="absolute top-2 right-2 bg-white/90 rounded-full px-2 py-1 text-xs">
                Удалить
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ----------- PRODUCTS -----------
function ProductSection({
  products, categories, onUpdate, onDelete,
}: {
  products: Product[]; categories: Category[];
  onUpdate: (p: Partial<Product> & { id: string }) => void;
  onDelete: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [catFilter, setCatFilter] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const filtered = products.filter((p) => {
    if (catFilter && p.categoryId !== catFilter) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      (p.sku ?? "").toLowerCase().includes(q) ||
      (p.productName ?? p.title ?? "").toLowerCase().includes(q)
    );
  });

  async function del(id: string) {
    if (!confirm("Удалить товар? Связи с пинами и портфолио тоже удалятся.")) return;
    await fetch(`/api/admin/pins/${id}`, { method: "DELETE" });
    onDelete(id);
  }

  return (
    <section className="space-y-4">
      <div className="p-4 rounded-2xl bg-white border border-line">
        <h2 className="text-lg font-semibold">Товары каталога</h2>
        <p className="text-sm text-muted mt-1">
          Товары импортируются из CSV (вкладка «Пины» → «Импорт каталога»).
          Здесь можно отредактировать цену/описание/категорию и обновить обложку.
        </p>
        <div className="mt-3 grid md:grid-cols-2 gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по артикулу или названию"
            className="px-3 py-2 rounded-lg bg-[#f1f1f1] outline-none text-sm"
          />
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[#f1f1f1] outline-none text-sm"
          >
            <option value="">Все категории ({products.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {filtered.map((p) => (
          <ProductCardEdit
            key={p.id}
            product={p}
            categories={categories}
            isEditing={editingId === p.id}
            onEdit={() => setEditingId(p.id)}
            onCancel={() => setEditingId(null)}
            onSaved={(upd) => { onUpdate(upd); setEditingId(null); }}
            onDelete={() => del(p.id)}
          />
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="p-6 text-center text-sm text-muted rounded-2xl bg-white border border-line">
          Ничего не найдено.
        </div>
      )}
    </section>
  );
}

function ProductCardEdit({
  product, categories, isEditing, onEdit, onCancel, onSaved, onDelete,
}: {
  product: Product; categories: Category[]; isEditing: boolean;
  onEdit: () => void; onCancel: () => void;
  onSaved: (p: Partial<Product> & { id: string }) => void;
  onDelete: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    productName: product.productName ?? "",
    price: product.price?.toString() ?? "",
    description: product.description ?? "",
    productUrl: product.productUrl ?? "",
    categoryId: product.categoryId ?? "",
    mediaUrl: product.mediaUrl,
    mediaType: product.mediaType,
  });

  async function onCover(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    setBusy(true);
    try {
      const type: "image" | "video" = f.type.startsWith("video") ? "video" : "image";
      const up = await uploadToCloudinary(f, type);
      setForm((s) => ({ ...s, mediaUrl: up.secure_url, mediaType: type }));
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  async function save() {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/pins/${product.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          productName: form.productName,
          price: form.price,
          description: form.description,
          productUrl: form.productUrl,
          categoryId: form.categoryId || null,
          mediaUrl: form.mediaUrl,
          mediaType: form.mediaType,
        }),
      });
      const { pin } = await res.json();
      onSaved(pin);
    } finally { setBusy(false); }
  }

  return (
    <div className="rounded-xl overflow-hidden bg-white border border-line flex flex-col">
      <div className="relative aspect-square bg-[#f3f3f3]">
        {form.mediaType === "video" ? (
          <video src={form.mediaUrl} muted className="w-full h-full object-cover" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={form.mediaUrl} alt={product.title} className="w-full h-full object-cover" />
        )}
        {isEditing && (
          <label className="absolute bottom-2 right-2 bg-white/90 rounded-full px-3 py-1 text-xs font-medium cursor-pointer">
            {busy ? "..." : "обложка"}
            <input type="file" accept="image/*,video/*" onChange={onCover} className="hidden" disabled={busy} />
          </label>
        )}
      </div>
      <div className="p-2 text-xs flex-1 flex flex-col gap-1">
        {product.sku && <div className="text-[10px] uppercase tracking-wide text-muted">{product.sku}</div>}
        {isEditing ? (
          <>
            <input
              value={form.productName}
              onChange={(e) => setForm({ ...form, productName: e.target.value })}
              placeholder="Название"
              className="px-2 py-1 rounded bg-[#f1f1f1] outline-none"
            />
            <input
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="Цена ₽"
              className="px-2 py-1 rounded bg-[#f1f1f1] outline-none"
            />
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="px-2 py-1 rounded bg-[#f1f1f1] outline-none"
            >
              <option value="">Без категории</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder="Описание"
              className="px-2 py-1 rounded bg-[#f1f1f1] outline-none resize-none"
            />
            <input
              value={form.productUrl}
              onChange={(e) => setForm({ ...form, productUrl: e.target.value })}
              placeholder="Ссылка"
              className="px-2 py-1 rounded bg-[#f1f1f1] outline-none"
            />
            <div className="mt-auto flex gap-1 pt-1">
              <button onClick={save} disabled={busy}
                className="flex-1 px-2 py-1 rounded-full bg-ink text-white font-semibold disabled:opacity-50">
                {busy ? "..." : "Сохранить"}
              </button>
              <button onClick={onCancel} disabled={busy}
                className="px-2 py-1 rounded-full bg-[#f1f1f1]">Отмена</button>
            </div>
          </>
        ) : (
          <>
            <div className="font-medium line-clamp-2 min-h-[2.2em]">
              {product.productName ?? product.title}
            </div>
            {product.price != null && <div className="font-semibold">{product.price} ₽</div>}
            {product.category && <div className="text-[10px] text-muted">{product.category.title}</div>}
            <div className="mt-auto flex gap-1 pt-1">
              <button onClick={onEdit} className="flex-1 px-2 py-1 rounded-full bg-[#f1f1f1]">Править</button>
              <button onClick={onDelete} className="px-2 py-1 rounded-full text-red-600">×</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ----------- POSTS -----------
function PostSection({ posts, onCreate, onDelete }: { posts: Post[]; onCreate: (p: Post) => void; onDelete: (id: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    title: "", body: "", mediaUrl: "", mediaType: "" as "" | "image" | "video",
    bodyMediaUrl: "", bodyMediaType: "" as "" | "image" | "video",
    ctaLabel: "", ctaUrl: "", isAd: false,
  });

  async function onCoverFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    setBusy(true);
    try {
      const type: "image" | "video" = f.type.startsWith("video") ? "video" : "image";
      const up = await uploadToCloudinary(f, type);
      setForm((s) => ({ ...s, mediaUrl: up.secure_url, mediaType: type }));
    } finally { setBusy(false); }
  }

  async function onBodyFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    setBusy(true);
    try {
      const type: "image" | "video" = f.type.startsWith("video") ? "video" : "image";
      const up = await uploadToCloudinary(f, type);
      setForm((s) => ({ ...s, bodyMediaUrl: up.secure_url, bodyMediaType: type }));
    } finally { setBusy(false); }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/admin/posts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const { post } = await res.json();
      onCreate(post);
      setForm({ title: "", body: "", mediaUrl: "", mediaType: "", bodyMediaUrl: "", bodyMediaType: "", ctaLabel: "", ctaUrl: "", isAd: false });
    } finally { setBusy(false); }
  }

  async function del(id: string) {
    if (!confirm("Удалить пост?")) return;
    await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
    onDelete(id);
  }

  return (
    <section className="space-y-6">
      <form onSubmit={submit} className="grid md:grid-cols-2 gap-4 p-4 rounded-2xl bg-white border border-line">
        <h2 className="md:col-span-2 text-lg font-semibold">Новый пост / реклама</h2>
        <Input label="Заголовок" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required />
        <div>
          <label className="block text-sm mb-1 text-muted">Обложка — фото или видео (необязательно)</label>
          <input type="file" accept="image/*,video/*" onChange={onCoverFile} disabled={busy} />
          {form.mediaUrl && (
            <div className="mt-2 w-40 aspect-[16/9] rounded-lg overflow-hidden bg-[#f3f3f3]">
              {form.mediaType === "video" ? (
                <video src={form.mediaUrl} muted className="w-full h-full object-cover" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.mediaUrl} alt="" className="w-full h-full object-cover" />
              )}
            </div>
          )}
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm mb-1 text-muted">Текст</label>
          <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })}
            rows={4} className="w-full px-3 py-2 rounded-lg bg-[#f1f1f1] outline-none" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm mb-1 text-muted">Медиа в теле поста — фото или видео (необязательно)</label>
          <input type="file" accept="image/*,video/*" onChange={onBodyFile} disabled={busy} />
          {form.bodyMediaUrl && (
            <div className="mt-2 w-40 aspect-[16/9] rounded-lg overflow-hidden bg-[#f3f3f3]">
              {form.bodyMediaType === "video" ? (
                <video src={form.bodyMediaUrl} muted className="w-full h-full object-cover" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.bodyMediaUrl} alt="" className="w-full h-full object-cover" />
              )}
            </div>
          )}
        </div>
        <Input label="CTA — текст кнопки" value={form.ctaLabel} onChange={(v) => setForm({ ...form, ctaLabel: v })} />
        <Input label="CTA — ссылка" value={form.ctaUrl} onChange={(v) => setForm({ ...form, ctaUrl: v })} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isAd} onChange={(e) => setForm({ ...form, isAd: e.target.checked })} />
          Отметить как «Реклама»
        </label>
        <div className="md:col-span-2">
          <button disabled={busy} className="px-5 py-2.5 rounded-full bg-ink text-white font-semibold disabled:opacity-50">
            {busy ? "..." : "Опубликовать"}
          </button>
        </div>
      </form>

      <div className="space-y-2">
        {posts.map((p) => (
          <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-white border border-line">
            <div>
              <div className="font-medium">{p.title} {p.isAd && <span className="text-xs text-muted">· реклама</span>}</div>
              {p.body && <div className="text-sm text-muted line-clamp-1">{p.body}</div>}
            </div>
            <button onClick={() => del(p.id)} className="text-sm text-red-600">Удалить</button>
          </div>
        ))}
      </div>
    </section>
  );
}

// ----------- PORTFOLIO -----------
function PortfolioSection({
  portfolios, pins, onCreate, onDelete,
}: {
  portfolios: Portfolio[]; pins: Pin[];
  onCreate: (p: Portfolio) => void; onDelete: (id: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    title: "", clientName: "", description: "",
    coverUrl: "", coverType: "image" as "image" | "video",
  });
  const [items, setItems] = useState<{ mediaUrl: string; mediaType: "image" | "video" }[]>([]);
  const [pinIds, setPinIds] = useState<string[]>([]);

  async function onCover(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    setBusy(true);
    try {
      const type: "image" | "video" = f.type.startsWith("video") ? "video" : "image";
      const up = await uploadToCloudinary(f, type);
      setForm((s) => ({ ...s, coverUrl: up.secure_url, coverType: type }));
    } finally { setBusy(false); }
  }

  async function onAddItem(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setBusy(true);
    try {
      for (const f of files) {
        const type: "image" | "video" = f.type.startsWith("video") ? "video" : "image";
        const up = await uploadToCloudinary(f, type);
        setItems((s) => [...s, { mediaUrl: up.secure_url, mediaType: type }]);
      }
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  function togglePin(id: string) {
    setPinIds((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.coverUrl) { alert("Загрузи обложку"); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/portfolios", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, items, pinIds }),
      });
      const { portfolio } = await res.json();
      onCreate(portfolio);
      setForm({ title: "", clientName: "", description: "", coverUrl: "", coverType: "image" });
      setItems([]);
      setPinIds([]);
    } finally { setBusy(false); }
  }

  async function del(id: string) {
    if (!confirm("Удалить портфолио?")) return;
    await fetch(`/api/admin/portfolios/${id}`, { method: "DELETE" });
    onDelete(id);
  }

  return (
    <section className="space-y-6">
      <form onSubmit={submit} className="grid md:grid-cols-2 gap-4 p-4 rounded-2xl bg-white border border-line">
        <h2 className="md:col-span-2 text-lg font-semibold">Новое портфолио</h2>

        <Input label="Название проекта" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required />
        <Input label="Клиент / компания" value={form.clientName} onChange={(v) => setForm({ ...form, clientName: v })} />

        <div className="md:col-span-2">
          <label className="block text-sm mb-1 text-muted">Описание (что и для кого отшили)</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3} className="w-full px-3 py-2 rounded-lg bg-[#f1f1f1] outline-none" />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm mb-1 text-muted">Обложка (фото или видео)</label>
          <input type="file" accept="image/*,video/*" onChange={onCover} disabled={busy} />
          {form.coverUrl && (
            <div className="mt-2 w-40 aspect-[4/5] rounded-lg overflow-hidden bg-[#f3f3f3]">
              {form.coverType === "video" ? (
                <video src={form.coverUrl} muted className="w-full h-full object-cover" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.coverUrl} alt="" className="w-full h-full object-cover" />
              )}
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm mb-1 text-muted">Галерея — фото/видео внутри портфолио (можно несколько)</label>
          <input type="file" accept="image/*,video/*" multiple onChange={onAddItem} disabled={busy} />
          {items.length > 0 && (
            <div className="mt-2 grid grid-cols-4 md:grid-cols-6 gap-2">
              {items.map((it, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-[#f3f3f3]">
                  {it.mediaType === "video" ? (
                    <video src={it.mediaUrl} muted className="w-full h-full object-cover" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={it.mediaUrl} alt="" className="w-full h-full object-cover" />
                  )}
                  <button type="button" onClick={() => setItems(items.filter((_, i) => i !== idx))}
                    className="absolute top-1 right-1 bg-white/90 rounded-full px-2 text-xs">×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm mb-1 text-muted">
            Связанные артикулы из каталога (выбрано: {pinIds.length})
          </label>
          <div className="max-h-64 overflow-y-auto grid grid-cols-2 md:grid-cols-4 gap-2 p-2 rounded-lg bg-[#fafafa] border border-line">
            {pins.map((p) => {
              const active = pinIds.includes(p.id);
              return (
                <button type="button" key={p.id} onClick={() => togglePin(p.id)}
                  className={`text-left rounded-lg overflow-hidden border ${active ? "border-ink ring-2 ring-ink" : "border-line"} bg-white`}>
                  <div className="aspect-[3/4] bg-[#f3f3f3]">
                    {p.mediaType === "video" ? (
                      <video src={p.mediaUrl} muted className="w-full h-full object-cover" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.mediaUrl} alt={p.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="p-2 text-xs">
                    <div className="font-medium line-clamp-1">{p.title}</div>
                    {p.price != null && <div className="text-muted">{p.price} ₽</div>}
                  </div>
                </button>
              );
            })}
            {pins.length === 0 && <div className="col-span-full text-sm text-muted p-2">Пока нет пинов — сначала добавь их во вкладке «Пины».</div>}
          </div>
        </div>

        <div className="md:col-span-2">
          <button disabled={busy} className="px-5 py-2.5 rounded-full bg-ink text-white font-semibold disabled:opacity-50">
            {busy ? "..." : "Опубликовать портфолио"}
          </button>
        </div>
      </form>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold mb-3">Существующие портфолио ({portfolios.length})</h2>
        {portfolios.map((p) => (
          <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-white border border-line">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-14 h-14 shrink-0 rounded-lg overflow-hidden bg-[#f3f3f3]">
                {p.coverType === "video" ? (
                  <video src={p.coverUrl} muted className="w-full h-full object-cover" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.coverUrl} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="min-w-0">
                <div className="font-medium truncate">{p.title}</div>
                <div className="text-xs text-muted truncate">
                  {p.clientName ? `${p.clientName} · ` : ""}{p.items.length} медиа · {p.pins.length} артикулов
                </div>
              </div>
            </div>
            <button onClick={() => del(p.id)} className="text-sm text-red-600 shrink-0 ml-3">Удалить</button>
          </div>
        ))}
      </div>
    </section>
  );
}

// ----------- COLLECTIONS -----------
function CollectionSection({ collections, onCreate, onDelete }: { collections: Collection[]; onCreate: (c: Collection) => void; onDelete: (id: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", coverUrl: "" });

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    setBusy(true);
    try {
      const up = await uploadToCloudinary(f, "image");
      setForm((s) => ({ ...s, coverUrl: up.secure_url }));
    } finally { setBusy(false); }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/admin/collections", {
        method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form),
      });
      const { collection } = await res.json();
      onCreate(collection);
      setForm({ title: "", description: "", coverUrl: "" });
    } finally { setBusy(false); }
  }

  async function del(id: string) {
    if (!confirm("Удалить подборку? Пины останутся.")) return;
    await fetch(`/api/admin/collections/${id}`, { method: "DELETE" });
    onDelete(id);
  }

  return (
    <section className="space-y-6">
      <form onSubmit={submit} className="grid md:grid-cols-2 gap-4 p-4 rounded-2xl bg-white border border-line">
        <h2 className="md:col-span-2 text-lg font-semibold">Новая подборка</h2>
        <Input label="Название" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required />
        <div>
          <label className="block text-sm mb-1 text-muted">Обложка (необязательно)</label>
          <input type="file" accept="image/*" onChange={onFile} disabled={busy} />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm mb-1 text-muted">Описание</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2} className="w-full px-3 py-2 rounded-lg bg-[#f1f1f1] outline-none" />
        </div>
        <div className="md:col-span-2">
          <button disabled={busy} className="px-5 py-2.5 rounded-full bg-ink text-white font-semibold disabled:opacity-50">
            {busy ? "..." : "Создать"}
          </button>
        </div>
      </form>
      <ul className="space-y-2">
        {collections.map((c) => (
          <li key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-white border border-line">
            <div>{c.title} <span className="text-xs text-muted">{c.description}</span></div>
            <button onClick={() => del(c.id)} className="text-sm text-red-600">Удалить</button>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ----------- HERO -----------
function HeroSection({
  heroes, onCreate, onUpdate, onDelete,
}: {
  heroes: Hero[];
  onCreate: (h: Hero) => void;
  onUpdate: (h: Partial<Hero> & { id: string }) => void;
  onDelete: (id: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    videoUrl: "",
    mediaType: "" as "" | "image" | "video",
  });

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    setBusy(true);
    try {
      const type: "image" | "video" = f.type.startsWith("video") ? "video" : "image";
      const up = await uploadToCloudinary(f, type);
      setForm({ videoUrl: up.secure_url, mediaType: type });
    } finally { setBusy(false); }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.videoUrl || !form.mediaType) { alert("Загрузите фото или видео"); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/hero", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const { hero } = await res.json();
      onCreate(hero);
      setForm({ videoUrl: "", mediaType: "" });
    } finally { setBusy(false); }
  }

  async function toggleActive(h: Hero) {
    const res = await fetch(`/api/admin/hero/${h.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ active: !h.active }),
    });
    const { hero } = await res.json();
    onUpdate(hero);
  }

  async function setOrder(h: Hero, order: number) {
    const res = await fetch(`/api/admin/hero/${h.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ order }),
    });
    const { hero } = await res.json();
    onUpdate(hero);
  }

  async function del(id: string) {
    if (!confirm("Удалить слайд?")) return;
    await fetch(`/api/admin/hero/${id}`, { method: "DELETE" });
    onDelete(id);
  }

  return (
    <section className="space-y-6">
      <form onSubmit={submit} className="grid md:grid-cols-2 gap-4 p-4 rounded-2xl bg-white border border-line">
        <h2 className="md:col-span-2 text-lg font-semibold">Новый слайд</h2>
        <p className="md:col-span-2 text-sm text-muted -mt-2">
          Слайды листаются как истории: фото держится 5 сек, видео — до конца. Несколько слайдов могут быть активны одновременно.
        </p>
        <div className="md:col-span-2">
          <label className="block text-sm mb-1 text-muted">Медиа — фото или видео</label>
          <input type="file" accept="image/*,video/*" onChange={onFile} disabled={busy} />
          {form.videoUrl && (
            <div className="mt-2 w-40 aspect-[4/5] rounded-lg overflow-hidden bg-[#f3f3f3]">
              {form.mediaType === "video" ? (
                <video src={form.videoUrl} muted className="w-full h-full object-cover" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.videoUrl} alt="" className="w-full h-full object-cover" />
              )}
            </div>
          )}
        </div>
        <div className="md:col-span-2">
          <button disabled={busy} className="px-5 py-2.5 rounded-full bg-ink text-white font-semibold disabled:opacity-50">
            {busy ? "..." : "Добавить слайд"}
          </button>
        </div>
      </form>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Слайды ({heroes.length})</h2>
        {heroes.length === 0 && (
          <div className="p-6 text-center text-sm text-muted rounded-2xl bg-white border border-line">
            Пока нет слайдов. Добавь первый выше.
          </div>
        )}
        {heroes.map((h) => (
          <div key={h.id} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-line">
            <div className="w-16 h-20 shrink-0 rounded-lg overflow-hidden bg-[#f3f3f3]">
              {h.mediaType === "video" ? (
                <video src={h.videoUrl} muted className="w-full h-full object-cover" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={h.videoUrl} alt="" className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">
                {h.mediaType === "video" ? "Видео" : "Фото"}
              </div>
              <div className="mt-1 flex items-center gap-3">
                <label className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={h.active}
                    onChange={() => toggleActive(h)}
                  />
                  показывать
                </label>
                <label className="flex items-center gap-1 text-xs text-muted">
                  порядок
                  <input
                    type="number"
                    defaultValue={h.order}
                    onBlur={(e) => {
                      const n = parseInt(e.target.value, 10);
                      if (!Number.isNaN(n) && n !== h.order) setOrder(h, n);
                    }}
                    className="w-14 px-2 py-1 rounded bg-[#f1f1f1]"
                  />
                </label>
              </div>
            </div>
            <button onClick={() => del(h.id)} className="text-sm text-red-600 shrink-0">Удалить</button>
          </div>
        ))}
      </div>
    </section>
  );
}

// ----------- CSV IMPORT -----------
function CsvImportCard() {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<null | {
    total: number; created: number; updated: number; skipped: number; categories: number; errors: string[];
  }>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const input = (e.currentTarget.elements.namedItem("file") as HTMLInputElement);
    const file = input?.files?.[0];
    if (!file) return;
    setBusy(true);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/import-csv", { method: "POST", body: fd });
      const data = await res.json();
      setResult(data);
      router.refresh();
    } catch (err) {
      alert("Не получилось: " + String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="p-4 rounded-2xl bg-white border border-line">
      <h2 className="text-lg font-semibold">Импорт каталога из CSV</h2>
      <p className="text-sm text-muted mt-1">
        Загрузи CSV из Tilda. Каждая строка превратится в пин: фото зальётся в Cloudinary,
        категория создастся автоматически. Повторный импорт обновит цену/описание по SKU (дублей не будет).
      </p>
      <div className="mt-3 flex items-center gap-3">
        <input type="file" name="file" accept=".csv,text/csv" required disabled={busy} />
        <button disabled={busy} className="px-4 py-2 rounded-full bg-ink text-white font-semibold disabled:opacity-50">
          {busy ? "Импортирую..." : "Импортировать"}
        </button>
      </div>
      {busy && (
        <div className="mt-3 text-sm text-muted">
          Обычно это занимает 1-2 сек на товар (картинки грузятся в Cloudinary). Не закрывай страницу.
        </div>
      )}
      {result && (
        <div className="mt-3 text-sm space-y-1">
          <div>
            Всего строк: <b>{result.total}</b> · создано: <b>{result.created}</b> ·
            обновлено: <b>{result.updated}</b> · пропущено: <b>{result.skipped}</b> ·
            категорий: <b>{result.categories}</b>
          </div>
          {result.errors?.length > 0 && (
            <details className="text-xs text-red-600">
              <summary>Ошибки ({result.errors.length})</summary>
              <ul className="list-disc pl-5">
                {result.errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </details>
          )}
        </div>
      )}
    </form>
  );
}

function SeedCoversButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<null | { applied: { slug: string; name: string; status: string }[] }>(null);
  async function run() {
    if (!confirm("Загрузить стандартные обложки категорий AVRORA? Перезапишет текущие.")) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/seed-category-covers", { method: "POST" });
      const data = await res.json();
      setResult(data);
      router.refresh();
    } finally { setBusy(false); }
  }
  return (
    <div className="mt-3">
      <button
        onClick={run}
        disabled={busy}
        className="px-4 py-2 rounded-full bg-ink text-white text-sm font-semibold disabled:opacity-50"
      >
        {busy ? "Загружаю..." : "Применить стандартные обложки AVRORA"}
      </button>
      {result && (
        <ul className="mt-3 text-xs space-y-0.5">
          {result.applied.map((r) => (
            <li key={r.slug} className={r.status === "ok" ? "text-green-700" : "text-red-600"}>
              {r.name}: {r.status}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ----------- CATEGORIES -----------
function CategorySection({
  categories, onUpdate, onDelete,
}: {
  categories: Category[];
  onUpdate: (c: Partial<Category> & { id: string }) => void;
  onDelete: (id: string) => void;
}) {
  const [busyId, setBusyId] = useState<string | null>(null);

  async function onCover(e: React.ChangeEvent<HTMLInputElement>, cat: Category) {
    const f = e.target.files?.[0]; if (!f) return;
    setBusyId(cat.id);
    try {
      const type: "image" | "video" = f.type.startsWith("video") ? "video" : "image";
      const up = await uploadToCloudinary(f, type);
      const res = await fetch(`/api/admin/categories/${cat.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ coverUrl: up.secure_url, coverType: type }),
      });
      const { category } = await res.json();
      onUpdate(category);
    } finally {
      setBusyId(null);
      e.target.value = "";
    }
  }

  async function setOrder(cat: Category, order: number) {
    const res = await fetch(`/api/admin/categories/${cat.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ order }),
    });
    const { category } = await res.json();
    onUpdate(category);
  }

  async function del(id: string) {
    if (!confirm("Удалить категорию? Пины останутся (отвяжутся от категории).")) return;
    await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    onDelete(id);
  }

  return (
    <section className="space-y-4">
      <div className="p-4 rounded-2xl bg-white border border-line">
        <h2 className="text-lg font-semibold">Категории</h2>
        <p className="text-sm text-muted mt-1">
          Категории создаются автоматически при импорте CSV. Здесь можно задать обложку
          (она покажется на главной в ленте «AF drop») и порядок.
        </p>
        <SeedCoversButton />
      </div>
      {categories.length === 0 && (
        <div className="p-6 text-center text-sm text-muted rounded-2xl bg-white border border-line">
          Пока категорий нет. Импортируй CSV во вкладке «Пины» — категории появятся автоматически.
        </div>
      )}
      <div className="grid md:grid-cols-2 gap-3">
        {categories.map((c) => (
          <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-line">
            <label className="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-[#f3f3f3] cursor-pointer relative">
              {c.coverUrl ? (
                c.coverType === "video" ? (
                  <video src={c.coverUrl} muted className="w-full h-full object-cover" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.coverUrl} alt="" className="w-full h-full object-cover" />
                )
              ) : (
                <div className="w-full h-full grid place-items-center text-[10px] text-muted text-center px-1">
                  загрузить обложку
                </div>
              )}
              <input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => onCover(e, c)}
                className="hidden"
                disabled={busyId === c.id}
              />
              {busyId === c.id && (
                <div className="absolute inset-0 bg-white/70 grid place-items-center text-xs">…</div>
              )}
            </label>
            <div className="min-w-0 flex-1">
              <div className="font-medium truncate">{c.title}</div>
              <div className="text-xs text-muted">
                /{c.slug} · {c._count?.pins ?? 0} пинов
              </div>
              <div className="mt-1 flex items-center gap-2">
                <label className="text-xs text-muted">порядок</label>
                <input
                  type="number"
                  defaultValue={c.order}
                  onBlur={(e) => {
                    const n = parseInt(e.target.value, 10);
                    if (!Number.isNaN(n) && n !== c.order) setOrder(c, n);
                  }}
                  className="w-16 px-2 py-1 rounded bg-[#f1f1f1] text-sm"
                />
              </div>
            </div>
            <button onClick={() => del(c.id)} className="text-sm text-red-600 shrink-0">Удалить</button>
          </div>
        ))}
      </div>
    </section>
  );
}

// ----------- COMMENTS MODERATION -----------
type AdminComment = {
  id: string;
  body: string;
  createdAt: string;
  pin: { id: string; title: string; mediaUrl: string; mediaType: string } | null;
};

function CommentSection() {
  const [items, setItems] = useState<AdminComment[] | null>(null);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetch("/api/admin/comments")
      .then((r) => r.json())
      .then((d) => setItems(d.comments ?? []))
      .catch(() => setItems([]));
  }, []);

  async function del(id: string) {
    if (!confirm("Удалить комментарий?")) return;
    await fetch(`/api/admin/comments/${id}`, { method: "DELETE" });
    setItems((s) => (s ?? []).filter((x) => x.id !== id));
  }

  if (items === null) {
    return <div className="p-6 text-center text-sm text-muted">Загружаю комментарии…</div>;
  }

  const filtered = filter
    ? items.filter((c) => c.body.toLowerCase().includes(filter.toLowerCase()))
    : items;

  return (
    <section className="space-y-4">
      <div className="p-4 rounded-2xl bg-white border border-line">
        <h2 className="text-lg font-semibold">Комментарии</h2>
        <p className="text-sm text-muted mt-1">
          Последние 200 комментариев со всех пинов. Удаление безвозвратно.
        </p>
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Поиск по тексту (мат, спам, и т. п.)"
          className="mt-3 w-full px-3 py-2 rounded-lg bg-[#f1f1f1] outline-none text-sm"
        />
      </div>
      {filtered.length === 0 && (
        <div className="p-6 text-center text-sm text-muted rounded-2xl bg-white border border-line">
          {items.length === 0 ? "Пока комментариев нет." : "Ничего не найдено."}
        </div>
      )}
      <div className="space-y-2">
        {filtered.map((c) => (
          <div key={c.id} className="flex items-start gap-3 p-3 rounded-xl bg-white border border-line">
            {c.pin && (
              <a
                href={`/pin/${c.pin.id}`}
                target="_blank"
                rel="noreferrer"
                className="w-12 h-16 shrink-0 rounded-lg overflow-hidden bg-[#f3f3f3] block"
                title={c.pin.title}
              >
                {c.pin.mediaType === "video" ? (
                  <video src={c.pin.mediaUrl} muted className="w-full h-full object-cover" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.pin.mediaUrl} alt={c.pin.title} className="w-full h-full object-cover" />
                )}
              </a>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm whitespace-pre-wrap break-words">{c.body}</div>
              <div className="text-xs text-muted mt-1">
                {new Date(c.createdAt).toLocaleString("ru-RU")}
                {c.pin && <> · <span className="truncate">{c.pin.title}</span></>}
              </div>
            </div>
            <button onClick={() => del(c.id)} className="text-sm text-red-600 shrink-0">
              Удалить
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function Input({ label, value, onChange, required }: { label: string; value: string; onChange: (v: string) => void; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm mb-1 text-muted">{label}</label>
      <input value={value} required={required} onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-[#f1f1f1] outline-none" />
    </div>
  );
}
