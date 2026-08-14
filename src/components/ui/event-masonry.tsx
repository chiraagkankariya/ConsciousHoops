import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Masonry from "react-masonry-css";

export type GalleryPhoto = {
  src: string;
  alt?: string;
};

const breakpointColumns = {
  default: 3,
  1024: 2,
  640: 1,
};

export default function EventMasonry({ photos }: { photos: GalleryPhoto[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  const close = useCallback(() => {
    setOpenIndex(null);
    triggerRef.current?.focus();
  }, []);

  const next = useCallback(
    () => setOpenIndex((i) => (i === null ? i : (i + 1) % photos.length)),
    [photos.length]
  );
  const prev = useCallback(
    () => setOpenIndex((i) => (i === null ? i : (i - 1 + photos.length) % photos.length)),
    [photos.length]
  );

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      } else if (e.key === "ArrowRight") {
        next();
      } else if (e.key === "ArrowLeft") {
        prev();
      } else if (e.key === "Tab") {
        const nodes = dialogRef.current?.querySelectorAll<HTMLElement>("button");
        if (!nodes || nodes.length === 0) return;
        const list = Array.from(nodes);
        const first = list[0]!;
        const last = list[list.length - 1]!;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    const t = setTimeout(() => {
      dialogRef.current?.querySelector<HTMLElement>("button")?.focus();
    }, 50);
    return () => {
      document.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [openIndex, close, next, prev]);

  const current = openIndex === null ? null : photos[openIndex];

  return (
    <>
      <Masonry
        breakpointCols={breakpointColumns}
        className="flex w-auto -ml-3"
        columnClassName="pl-3 bg-clip-padding"
      >
        {photos.map((photo, i) => (
          <button
            key={photo.src}
            type="button"
            onClick={(e) => {
              triggerRef.current = e.currentTarget;
              setOpenIndex(i);
            }}
            className="mb-3 block w-full cursor-pointer overflow-hidden rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-terra"
          >
            <img
              src={photo.src}
              alt={photo.alt || `ConsciousHoops first session - photo ${i + 1}`}
              loading="lazy"
              className="block w-full rounded-lg transition duration-200 ease-out hover:scale-[1.02] hover:brightness-105"
            />
          </button>
        ))}
      </Masonry>

      <AnimatePresence>
        {current && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.85)" }}
            onClick={close}
            role="dialog"
            aria-modal="true"
            aria-label="Event photo viewer"
          >
            <div ref={dialogRef} className="contents">
              <button
                type="button"
                aria-label="Close"
                onClick={(e) => {
                  e.stopPropagation();
                  close();
                }}
                className="absolute right-4 top-4 rounded-full p-2 text-cream transition-opacity hover:opacity-70"
              >
                <X className="h-7 w-7" />
              </button>
              <button
                type="button"
                aria-label="Previous photo"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                className="absolute left-3 rounded-full p-2 text-cream transition-opacity hover:opacity-70 md:left-6"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <img
                src={current.src}
                alt={current.alt || `ConsciousHoops first session - photo ${(openIndex ?? 0) + 1}`}
                onClick={(e) => e.stopPropagation()}
                className="max-h-[88vh] max-w-[88vw] rounded-lg object-contain"
              />
              <button
                type="button"
                aria-label="Next photo"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                className="absolute right-3 rounded-full p-2 text-cream transition-opacity hover:opacity-70 md:right-6"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
