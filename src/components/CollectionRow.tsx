import Link from "next/link";
import type { Collection, Pin } from "@prisma/client";

type Col = Collection & { pins: Pin[] };

export default function CollectionRow({ collection }: { collection: Col }) {
  return (
    <section className="px-3 pt-6">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-lg font-semibold">{collection.title}</h2>
        <Link href={`/feed?collection=${collection.id}`} className="text-sm text-muted">
          Все
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-3 px-3">
        {collection.pins.slice(0, 8).map((p) => (
          <Link
            key={p.id}
            href={`/pin/${p.id}`}
            className="relative shrink-0 w-40 aspect-[3/4] rounded-pin overflow-hidden bg-[#f3f3f3]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.mediaUrl} alt={p.title} className="w-full h-full object-cover" />
          </Link>
        ))}
      </div>
    </section>
  );
}
