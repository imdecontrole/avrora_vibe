"use client";
import Link from "next/link";
import { useState } from "react";
import MoreSheet from "./MoreSheet";

export type PinCardData = {
  id: string;
  title: string;
  productName?: string | null;
  price?: number | null;
  mediaType: string;
  mediaUrl: string;
  width?: number | null;
  height?: number | null;
  liked?: boolean;
  wishlisted?: boolean;
};

export default function PinCard({ pin }: { pin: PinCardData }) {
  const [sheet, setSheet] = useState(false);
  const ratio =
    pin.width && pin.height ? `${pin.width} / ${pin.height}` : "3 / 4";

  return (
    <div className="relative group">
      <Link
        href={`/pin/${pin.id}`}
        prefetch={false}
        className="tile-media block overflow-hidden rounded-pin bg-[#f3f3f3]"
        style={{ aspectRatio: ratio }}
      >
        {pin.mediaType === "video" ? (
          <video
            src={pin.mediaUrl}
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
            src={pin.mediaUrl}
            alt={pin.title}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        )}
      </Link>

      <div className="pt-0.5 pr-9 pl-0.5 relative min-h-[24px]">
        {pin.productName && (
          <div className="text-[13px] font-medium line-clamp-1">{pin.productName}</div>
        )}
        {pin.price != null && (
          <div className="text-[12px] text-muted">{pin.price.toLocaleString("ru-RU")} ₽</div>
        )}
        <button
          aria-label="Ещё"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSheet(true); }}
          className="absolute right-0 -top-0.5 w-8 h-8 grid place-items-center rounded-full hover:bg-[#f1f1f1] text-ink"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="5" cy="12" r="1.8" />
            <circle cx="12" cy="12" r="1.8" />
            <circle cx="19" cy="12" r="1.8" />
          </svg>
        </button>
      </div>

      <MoreSheet
        open={sheet}
        onClose={() => setSheet(false)}
        pinId={pin.id}
        mediaUrl={pin.mediaUrl}
        mediaType={pin.mediaType}
      />
    </div>
  );
}
