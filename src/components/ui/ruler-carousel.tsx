"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Rewind, FastForward } from "lucide-react";

export interface CarouselItem {
  id: number | string;
  title: string;
}

interface InfiniteItem extends CarouselItem {
  originalIndex: number;
}

const createInfiniteItems = (originalItems: CarouselItem[]): InfiniteItem[] => {
  const out: InfiniteItem[] = [];
  for (let i = 0; i < 3; i++) {
    originalItems.forEach((item, index) => {
      out.push({
        ...item,
        id: `${i}-${item.id}`,
        originalIndex: index,
      });
    });
  }
  return out;
};

function RulerLines({
  top = true,
  totalLines = 60,
}: {
  top?: boolean;
  totalLines?: number;
}) {
  const lines = [];
  const lineSpacing = 100 / (totalLines - 1);

  for (let i = 0; i < totalLines; i++) {
    const isFifth = i % 5 === 0;
    const isCenter = i === Math.floor(totalLines / 2);

    let height = "h-2";
    let color = "bg-sand-dark";

    if (isCenter) {
      height = "h-6";
      color = "bg-terra";
    } else if (isFifth) {
      height = "h-3";
      color = "bg-terra";
    }

    lines.push(
      <span
        key={i}
        className={`absolute w-px ${height} ${color} ${top ? "top-0" : "bottom-0"}`}
        style={{ left: `${i * lineSpacing}%` }}
      />,
    );
  }

  return <div className="relative h-6 w-full">{lines}</div>;
}

export function RulerCarousel({
  originalItems,
  className = "",
}: {
  originalItems: CarouselItem[];
  className?: string;
}) {
  const infiniteItems = createInfiniteItems(originalItems);
  const itemsPerSet = originalItems.length;

  const [activeIndex, setActiveIndex] = useState(itemsPerSet);
  const [isResetting, setIsResetting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [slotWidth, setSlotWidth] = useState(400);

  const sectionRef = useRef<HTMLDivElement>(null);
  const trackContainerRef = useRef<HTMLDivElement>(null);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Measure container for responsive slot width
  useEffect(() => {
    const el = trackContainerRef.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      setSlotWidth(Math.max(220, Math.min(w * 0.85, 500)));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const pauseTemporarily = useCallback(() => {
    setIsPaused(true);
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => setIsPaused(false), 5000);
  }, []);

  // Auto-advance
  useEffect(() => {
    if (isPaused || isHovered || isResetting) return;
    const id = setInterval(() => {
      setActiveIndex((p) => p + 1);
    }, 3000);
    return () => clearInterval(id);
  }, [isPaused, isHovered, isResetting]);

  // Infinite jump
  useEffect(() => {
    if (isResetting) return;
    if (activeIndex < itemsPerSet) {
      setIsResetting(true);
      setTimeout(() => {
        setActiveIndex(activeIndex + itemsPerSet);
        setIsResetting(false);
      }, 0);
    } else if (activeIndex >= itemsPerSet * 2) {
      setIsResetting(true);
      setTimeout(() => {
        setActiveIndex(activeIndex - itemsPerSet);
        setIsResetting(false);
      }, 0);
    }
  }, [activeIndex, itemsPerSet, isResetting]);

  // Scoped keyboard nav
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const handler = (e: KeyboardEvent) => {
      if (isResetting) return;
      if (!isHovered && document.activeElement !== el) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        pauseTemporarily();
        setActiveIndex((p) => p - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        pauseTemporarily();
        setActiveIndex((p) => p + 1);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isHovered, isResetting, pauseTemporarily]);

  const handleItemClick = (newIndex: number) => {
    if (isResetting) return;
    const targetOriginalIndex = newIndex % itemsPerSet;
    const possibleIndices = [
      targetOriginalIndex,
      targetOriginalIndex + itemsPerSet,
      targetOriginalIndex + itemsPerSet * 2,
    ];
    let closestIndex = possibleIndices[0];
    let smallestDistance = Math.abs(possibleIndices[0] - activeIndex);
    for (const idx of possibleIndices) {
      const d = Math.abs(idx - activeIndex);
      if (d < smallestDistance) {
        smallestDistance = d;
        closestIndex = idx;
      }
    }
    pauseTemporarily();
    setActiveIndex(closestIndex);
  };

  const handlePrevious = () => {
    if (isResetting) return;
    pauseTemporarily();
    setActiveIndex((p) => p - 1);
  };
  const handleNext = () => {
    if (isResetting) return;
    pauseTemporarily();
    setActiveIndex((p) => p + 1);
  };

  // Center the active item: translate so its slot center sits at container center.
  const targetX = -activeIndex * slotWidth;

  const currentPage = (activeIndex % itemsPerSet) + 1;
  const totalPages = itemsPerSet;

  return (
    <div
      ref={sectionRef}
      tabIndex={0}
      aria-label="Invitee carousel"
      role="region"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      className={`relative w-full rounded-2xl border border-white/10 bg-white/[0.03] py-8 outline-none backdrop-blur-sm focus-visible:ring-2 focus-visible:ring-terra ${className}`}
    >
      <RulerLines top totalLines={60} />

      <div
        ref={trackContainerRef}
        className="relative my-6 overflow-hidden"
        style={{ height: "5.5rem" }}
      >
        {/* Center marker line */}
        <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-sand-dark/60" />

        <motion.div
          className="absolute top-1/2 flex -translate-y-1/2"
          style={{
            left: "50%",
            marginLeft: -slotWidth / 2,
          }}
          animate={{ x: targetX }}
          transition={
            isResetting
              ? { duration: 0 }
              : { type: "spring", stiffness: 220, damping: 28 }
          }
        >
          {infiniteItems.map((item, index) => {
            const isActive = index === activeIndex;
            return (
              <motion.button
                key={item.id}
                type="button"
                onClick={() => handleItemClick(index)}
                className={`flex shrink-0 items-center justify-center whitespace-nowrap px-2 font-display text-lg font-bold uppercase tracking-[-0.02em] sm:text-2xl md:text-4xl ${
                  isActive ? "text-cream" : "text-muted-text hover:text-cream"
                }`}
                animate={{
                  scale: isActive ? 1 : 0.75,
                  opacity: isActive ? 1 : 0.4,
                }}
                transition={
                  isResetting
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 400, damping: 25 }
                }
                style={{ width: slotWidth }}
              >
                {item.title}
              </motion.button>
            );
          })}
        </motion.div>
      </div>

      <RulerLines top={false} totalLines={60} />

      <div className="mt-6 flex items-center justify-center gap-3">
        <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">
          <button
            type="button"
            onClick={handlePrevious}
            aria-label="Previous"
            className="text-terra transition-opacity hover:opacity-70"
          >
            <Rewind className="h-4 w-4" fill="currentColor" />
          </button>
          <div className="flex items-baseline gap-1 text-sm tabular-nums text-muted-text">
            <span className="text-cream">{currentPage}</span>
            <span>/</span>
            <span>{totalPages}</span>
          </div>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next"
            className="text-terra transition-opacity hover:opacity-70"
          >
            <FastForward className="h-4 w-4" fill="currentColor" />
          </button>
        </div>
      </div>

      {/* Accessible & SEO-friendly full list */}
      <ul className="sr-only">
        {originalItems.map((it) => (
          <li key={it.id}>{it.title}</li>
        ))}
      </ul>
    </div>
  );
}
