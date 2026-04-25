"use client";

import { useEffect, useRef, useState } from "react";

export type HeroSlide = {
  id: string;
  title: string | null;
  mediaUrl: string;
  mediaType: string; // "image" | "video"
  posterUrl: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
};

const IMAGE_DURATION_MS = 5000;

export default function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0); // 0..1 for current slide
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const touchStartX = useRef<number | null>(null);

  const total = slides.length;
  const current = slides[index];

  function next() {
    setIndex((i) => (i + 1) % total);
    setProgress(0);
  }
  function prev() {
    setIndex((i) => (i - 1 + total) % total);
    setProgress(0);
  }

  // Drive progress: for image — timer; for video — playback position.
  useEffect(() => {
    if (!current) return;
    setProgress(0);

    if (current.mediaType === "video") {
      // Progress is tracked via `onTimeUpdate` + advance on `onEnded`.
      return;
    }

    // Image: 5s timed progress.
    startRef.current = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - startRef.current) / IMAGE_DURATION_MS);
      setProgress(p);
      if (p >= 1) {
        next();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, total]);

  // Restart video from start when we switch to a video slide.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    try {
      v.currentTime = 0;
      v.play().catch(() => {});
    } catch {}
  }, [index]);

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 40) return;
    if (dx < 0) next();
    else prev();
  }

  // Tap zones (desktop-friendly): left 1/3 prev, right 2/3 next.
  function onClickZone(e: React.MouseEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement;
    // Don't hijack clicks on the CTA link.
    if (target.closest("a")) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width / 3) prev();
    else next();
  }

  if (!current) {
    return (
      <section className="px-3 pt-3">
        <div className="relative overflow-hidden rounded-pin bg-[#f3f3f3] aspect-[4/5] md:aspect-[16/9] grid place-items-center text-muted text-sm">
          Добавь слайды в админке → «Главный баннер»
        </div>
      </section>
    );
  }

  return (
    <section className="px-3 pt-3 select-none">
      <div
        className="relative overflow-hidden rounded-pin bg-[#f3f3f3] aspect-[4/5] md:aspect-[16/9]"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onClick={onClickZone}
      >
        {current.mediaType === "video" ? (
          <video
            ref={videoRef}
            key={current.id}
            src={current.mediaUrl}
            poster={current.posterUrl ?? undefined}
            className="w-full h-full object-cover"
            autoPlay
            muted
            playsInline
            onTimeUpdate={(e) => {
              const v = e.currentTarget;
              if (v.duration > 0) setProgress(v.currentTime / v.duration);
            }}
            onEnded={next}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={current.id}
            src={current.mediaUrl}
            alt={current.title ?? ""}
            className="w-full h-full object-cover"
          />
        )}

        {/* Dots */}
        {slides.length > 1 && (
          <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5 z-10">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Слайд ${i + 1}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIndex(i);
                  setProgress(0);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index ? "w-5 bg-white" : "w-1.5 bg-white/55"
                }`}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
