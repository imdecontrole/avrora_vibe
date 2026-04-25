type Props = { videoUrl?: string | null; posterUrl?: string | null; title?: string | null };

export default function HeroVideo({ videoUrl, posterUrl, title }: Props) {
  return (
    <section className="px-3 pt-3">
      <div className="relative overflow-hidden rounded-pin bg-[#f3f3f3] aspect-[4/5] md:aspect-[16/9]">
        {videoUrl ? (
          <video
            src={videoUrl}
            poster={posterUrl ?? undefined}
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <div className="w-full h-full grid place-items-center text-muted text-sm">
            Добавь hero-видео в админке
          </div>
        )}
        {title && (
          <div className="absolute inset-x-0 bottom-0 p-4 md:p-6 bg-gradient-to-t from-black/60 to-transparent">
            <h1 className="text-white text-xl md:text-3xl font-semibold drop-shadow-sm">{title}</h1>
          </div>
        )}
      </div>
    </section>
  );
}
