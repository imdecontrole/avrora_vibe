"use client";
import Masonry from "react-masonry-css";
import PinCard, { type PinCardData } from "./PinCard";
import PostTile, { type PostTileData } from "./PostTile";

export type FeedItem =
  | { kind: "pin"; pin: PinCardData }
  | { kind: "post"; post: PostTileData };

// Targets ~262px column width (Pinterest standard).
// Formula: width ≈ 278×cols + 8 (16px gap, 24px masonry x-padding, 80px desktop sidebar)
const breakpointCols = {
  default: 8,
  2200: 7,
  1920: 6,
  1640: 5,
  1360: 4,
  1080: 3,
  820: 2,
};

export default function MasonryGrid({
  pins,
  items,
  cols,
}: {
  pins?: PinCardData[];
  items?: FeedItem[];
  cols?: number | { default: number; [bp: number]: number };
}) {
  const list: FeedItem[] =
    items ?? (pins ?? []).map((p) => ({ kind: "pin" as const, pin: p }));

  if (!list.length) {
    return (
      <div className="py-20 text-center text-muted text-sm">
        Пока ничего нет. Заглянь позже — админ скоро добавит новое.
      </div>
    );
  }

  return (
    <Masonry
      breakpointCols={
        typeof cols === "number"
          ? { default: cols }
          : cols ?? breakpointCols
      }
      className="masonry-grid px-3"
      columnClassName="masonry-col"
    >
      {list.map((it) =>
        it.kind === "pin" ? (
          <PinCard key={`pin-${it.pin.id}`} pin={it.pin} />
        ) : (
          <PostTile key={`post-${it.post.id}`} post={it.post} />
        )
      )}
    </Masonry>
  );
}
