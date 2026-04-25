"use client";
import { useEffect, useRef } from "react";

export default function HlsVideo({
  src,
  className,
  poster,
}: {
  src: string;
  className?: string;
  poster?: string;
}) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    // Safari / iOS — native HLS support.
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      return;
    }

    // Everyone else — dynamically load hls.js.
    let hls: { destroy: () => void } | null = null;
    let cancelled = false;
    (async () => {
      const mod = await import("hls.js");
      const Hls = mod.default;
      if (cancelled || !Hls.isSupported()) return;
      const instance = new Hls({ enableWorker: true });
      instance.loadSource(src);
      instance.attachMedia(video);
      hls = instance;
    })();

    return () => {
      cancelled = true;
      if (hls) hls.destroy();
    };
  }, [src]);

  return (
    <video
      ref={ref}
      className={className}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
    />
  );
}
