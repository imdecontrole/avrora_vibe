import PinCard, { type PinCardData } from "./PinCard";
import PostTile, { type PostTileData } from "./PostTile";

export type FeedItem =
  | { kind: "pin"; pin: PinCardData }
  | { kind: "post"; post: PostTileData };

export default function MasonryGrid({
  pins,
  items,
}: {
  pins?: PinCardData[];
  items?: FeedItem[];
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
    <div className="masonry px-3">
      {list.map((it) =>
        it.kind === "pin" ? (
          <PinCard key={`pin-${it.pin.id}`} pin={it.pin} />
        ) : (
          <PostTile key={`post-${it.post.id}`} post={it.post} />
        )
      )}
    </div>
  );
}
