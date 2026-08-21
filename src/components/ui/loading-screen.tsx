import { motion } from "framer-motion";
import chLogo from "@/assets/conscioushoops-logo.png.asset.json";

const RING_RADIUS = 92;
const RING_CIRCUM = 2 * Math.PI * RING_RADIUS;

export default function LoadingScreen({ progress }: { progress: number }) {
  const pct = Math.max(0, Math.min(100, Math.round(progress)));

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-8 px-6"
      style={{ backgroundColor: "#faf6ef" }}
      aria-live="polite"
      aria-label={`Loading, ${pct} percent`}
    >
      <img
        src={chLogo.url}
        alt="ConsciousHoops"
        className="h-[112px] w-auto md:h-[134px]"
        style={{ clipPath: "inset(10%)" }}
      />

      <div className="relative flex h-[220px] w-[220px] items-center justify-center">
        {/* Progress ring */}
        <svg
          viewBox="0 0 220 220"
          className="absolute inset-0 h-full w-full -rotate-90"
          aria-hidden="true"
        >
          <circle cx="110" cy="110" r={RING_RADIUS} fill="none" stroke="#D9C9B0" strokeWidth="4" />
          <circle
            cx="110"
            cy="110"
            r={RING_RADIUS}
            fill="none"
            stroke="#E8613A"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={RING_CIRCUM}
            strokeDashoffset={RING_CIRCUM * (1 - pct / 100)}
            style={{ transition: "stroke-dashoffset 0.25s ease" }}
          />
        </svg>

        {/* Spinning basketball */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          className="flex items-center justify-center"
          style={{ width: 140, height: 140 }}
          aria-hidden="true"
        >
          <svg viewBox="0 0 120 120" width="140" height="140">
            <circle cx="60" cy="60" r="52" fill="#E8613A" />
            {/* horizontal seam */}
            <line x1="8" y1="60" x2="112" y2="60" stroke="#2C2A24" strokeWidth="2" fill="none" />
            {/* vertical curved seam (front) */}
            <path d="M 60 8 Q 40 60 60 112" stroke="#2C2A24" strokeWidth="2" fill="none" />
            <path d="M 60 8 Q 80 60 60 112" stroke="#2C2A24" strokeWidth="2" fill="none" />
            {/* side curved seams */}
            <path d="M 8 60 Q 60 40 112 60" stroke="#2C2A24" strokeWidth="2" fill="none" />
            <path d="M 8 60 Q 60 80 112 60" stroke="#2C2A24" strokeWidth="2" fill="none" />
          </svg>
        </motion.div>
      </div>

      <div
        className="font-display text-5xl font-bold tabular-nums text-charcoal md:text-6xl"
        style={{ letterSpacing: "-0.03em" }}
      >
        {pct}%
      </div>
    </motion.div>
  );
}
