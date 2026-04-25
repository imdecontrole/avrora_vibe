import Link from "next/link";
import type { Post } from "@prisma/client";

export default function PostCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/post/${post.id}`}
      prefetch={false}
      className="block mx-3 mt-6 rounded-pin overflow-hidden bg-white border border-line active:opacity-90"
    >
      {post.mediaUrl && (
        <div className="relative aspect-[16/9] bg-[#f3f3f3]">
          {post.mediaType === "video" ? (
            <video
              src={post.mediaUrl}
              className="w-full h-full object-cover"
              autoPlay muted loop playsInline preload="metadata"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.mediaUrl} alt={post.title} className="w-full h-full object-cover" />
          )}
          <Badge isAd={post.isAd} />
        </div>
      )}
      <div className="p-4 flex items-center justify-between gap-3">
        <h3 className="font-semibold line-clamp-2">{post.title}</h3>
        {!post.mediaUrl && <Badge isAd={post.isAd} inline />}
        <span className="shrink-0 text-sm text-muted">Читать →</span>
      </div>
    </Link>
  );
}

function Badge({ isAd, inline }: { isAd: boolean; inline?: boolean }) {
  const label = isAd ? "РЕКЛАМА" : "POST";
  const base = "text-[10px] font-bold tracking-wider px-2 py-1 rounded-full";
  const color = isAd
    ? "bg-ink text-white"
    : "bg-white/95 text-ink";
  if (inline) return <span className={`${base} ${isAd ? "bg-ink text-white" : "bg-[#f1f1f1] text-ink"}`}>{label}</span>;
  return <span className={`absolute top-3 left-3 ${base} ${color} shadow-sm`}>{label}</span>;
}
