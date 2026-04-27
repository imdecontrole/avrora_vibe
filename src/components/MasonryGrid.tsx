"use client";
import Masonry from "react-masonry-css";
import PinCard, { type PinCardData } from "./PinCard";
import PostTile, { type PostTileData } from "./PostTile";

export type FeedItem =
  | { kind: "pin"; pin: PinCardData }
  | { kind: "post"; post: PostTileData };

// Fixed 262px column width (+16px gap = 278px per slot). Max 5 cols (как у Pinterest).
// Breakpoint = cols × 278 + 200 (sidebar 80px + symmetric right gutter 80px + buffer 40px).
// react-masonry-css picks the SMALLEST key >= window.innerWidth.
const breakpointCols = {
  default: 5,
  1590: 4,
  1312: 3,
  1034: 2,
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
