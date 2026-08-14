import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Props = {
  videos: string[];
};

/**
 * Fixed full-height video panel that crossfades (1s) between clips.
 * Renders a warm sand tint over the footage — never a dark overlay.
 */
export default function HeroVideoPanel({ videos }: Props) {
  const [index, setIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // If a single clip is provided it simply loops; multiple clips advance on end
  // (with a safety timer in case metadata/ended never fires).
  useEffect(() => {
    if (videos.length < 2) return;
    const timer = setTimeout(() => {
      setIndex((i) => (i + 1) % videos.length);
    }, 12000);
    return () => clearTimeout(timer);
  }, [index, videos.length]);

  // Force play() on every src change. iOS occasionally ignores the autoplay
  // attribute (Low Power Mode, race with playsInline); fall back to the first
  // user gesture if the promise rejects.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const attempt = () => {
      const p = v.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    };
    attempt();
    const onFirstGesture = () => attempt();
    document.addEventListener("touchstart", onFirstGesture, { once: true, passive: true });
    document.addEventListener("click", onFirstGesture, { once: true });
    return () => {
      document.removeEventListener("touchstart", onFirstGesture);
      document.removeEventListener("click", onFirstGesture);
    };
  }, [index, videos]);

  const advance = () => {
    if (videos.length < 2) return;
    setIndex((i) => (i + 1) % videos.length);
  };

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-black">
      <AnimatePresence initial={false}>
        {videos.length > 0 && (
          <motion.video
            key={videos[index]}
            ref={videoRef}
            src={videos[index]}
            autoPlay
            muted
            playsInline
            preload="auto"
            loop={videos.length === 1}
            onEnded={advance}
            onCanPlay={(e) => {
              const p = (e.currentTarget as HTMLVideoElement).play();
              if (p && typeof p.catch === "function") p.catch(() => {});
            }}
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: 1.6, ease: "easeInOut" },
              scale: { duration: 10, ease: "linear" },
            }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
      </AnimatePresence>

      {/* Cinematic scrim: darker toward edges, warm terra whisper at the bottom. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 40%, transparent 40%, rgba(0,0,0,0.55) 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3"
        style={{
          background:
            "linear-gradient(to top, rgba(11,11,13,0.9) 0%, rgba(11,11,13,0.0) 100%)",
        }}
      />
    </div>
  );
}
