import Link from "next/link";
import type { Post } from "@prisma/client";

export type PostTileData = Pick<
  Post,
  "id" | "title" | "mediaUrl" | "mediaType" | "isAd"
>;

export default function PostTile({ post }: { post: PostTileData }) {
  return (
    <Link
      href={`/post/${post.id}`}
      prefetch={false}
      className="block group"
    >
      <div className="tile-media relative overflow-hidden rounded-pin bg-[#f3f3f3] aspect-[3/4]">
        {post.mediaUrl ? (
          post.mediaType === "video" ? (
            <video
              src={post.mediaUrl}
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
              src={post.mediaUrl}
              alt={post.title}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center p-4 bg-gradient-to-br from-[#f1f1f1] to-[#e6e6ff]">
            <div className="text-base font-semibold leading-tight line-clamp-6 text-ink">
              {post.title}
            </div>
          </div>
        )}
        <span
          className={`absolute top-3 left-3 text-[10px] font-bold tracking-wider px-2 py-1 rounded-full shadow-sm ${
            post.isAd ? "bg-ink text-white" : "bg-white/95 text-ink"
          }`}
        >
          {post.isAd ? "РЕКЛАМА" : "POST"}
        </span>
      </div>

      <div className="pt-2 pr-1 pl-0.5 min-h-[28px]">
        <div className="text-[13px] font-medium line-clamp-2">{post.title}</div>
      </div>
    </Link>
  );
}
