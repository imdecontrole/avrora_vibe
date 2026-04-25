import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) notFound();

  return (
    <article className="max-w-2xl mx-auto px-4 pt-3">
      <Link
        href="/"
        className="inline-flex items-center w-10 h-10 -ml-2 rounded-full hover:bg-[#f1f1f1]"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.4" className="ml-2">
          <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>

      {/* Cover */}
      {post.mediaUrl && (
        <div className="relative mt-2 overflow-hidden rounded-pin bg-[#f3f3f3]">
          {post.mediaType === "video" ? (
            <video
              src={post.mediaUrl}
              className="w-full h-auto"
              autoPlay muted loop playsInline controls
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.mediaUrl} alt={post.title} className="w-full h-auto" />
          )}
          <span
            className={`absolute top-3 left-3 text-[10px] font-bold tracking-wider px-2 py-1 rounded-full shadow-sm ${
              post.isAd ? "bg-ink text-white" : "bg-white/95 text-ink"
            }`}
          >
            {post.isAd ? "РЕКЛАМА" : "POST"}
          </span>
        </div>
      )}

      <header className="mt-5">
        {!post.mediaUrl && (
          <span className={`inline-block text-[10px] font-bold tracking-wider px-2 py-1 rounded-full mb-3 ${
            post.isAd ? "bg-ink text-white" : "bg-[#f1f1f1] text-ink"
          }`}>
            {post.isAd ? "РЕКЛАМА" : "POST"}
          </span>
        )}
        <h1 className="text-2xl md:text-3xl font-semibold leading-tight">{post.title}</h1>
        <div className="mt-2 text-sm text-muted">
          {new Date(post.createdAt).toLocaleDateString("ru-RU", {
            day: "numeric", month: "long", year: "numeric",
          })}
        </div>
      </header>

      {post.body && (
        <div className="mt-5 text-[15px] leading-relaxed whitespace-pre-wrap">
          {post.body}
        </div>
      )}

      {post.bodyMediaUrl && (
        <div className="mt-6 overflow-hidden rounded-pin bg-[#f3f3f3]">
          {post.bodyMediaType === "video" ? (
            <video
              src={post.bodyMediaUrl}
              className="w-full h-auto"
              controls playsInline preload="metadata"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.bodyMediaUrl} alt="" className="w-full h-auto" />
          )}
        </div>
      )}

      {post.ctaUrl && post.ctaLabel && (
        <a
          href={post.ctaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-6 px-5 py-2.5 rounded-full bg-ink text-white font-semibold"
        >
          {post.ctaLabel}
        </a>
      )}
    </article>
  );
}
