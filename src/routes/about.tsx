import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Mail, Linkedin, Instagram } from "lucide-react";
import { LUMA_URL } from "@/lib/constants";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — ConsciousHoops" },
      {
        name: "description",
        content:
          "The founders behind ConsciousHoops — a curated pick-up basketball community in Boston for the wellness, meditation, and consciousness space.",
      },
      { property: "og:title", content: "About — ConsciousHoops" },
      {
        property: "og:description",
        content: "The founders behind ConsciousHoops.",
      },
    ],
  }),
  component: About,
});

const PLAYFAIR = "'Playfair Display', Georgia, serif";

const BASKETBALL_ICON = "/assets/basketball%20svg.svg";
const MEDITATION_ICON = "/assets/meditation2.svg";

function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type ScatteredIcon = {
  top: number;
  left: number;
  size: number;
  rot: number;
  img: string;
};

// ponytail: positions computed once at module load with a fixed seed; stable across renders.
const SCATTERED_ICONS: ScatteredIcon[] = (() => {
  const rand = mulberry32(1337);
  const cols = 18;
  const rows = 30;
  const items: ScatteredIcon[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (rand() < 0.25) continue;
      const cellW = 100 / cols;
      const cellH = 100 / rows;
      items.push({
        left: c * cellW + cellW / 2 + (rand() - 0.5) * cellW * 0.9,
        top: r * cellH + cellH / 2 + (rand() - 0.5) * cellH * 0.9,
        size: 14 + rand() * 14,
        rot: -30 + rand() * 60,
        img: rand() < 0.5 ? BASKETBALL_ICON : MEDITATION_ICON,
      });
    }
  }
  return items;
})();

function ScatteredIcons() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      {SCATTERED_ICONS.map((it, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            top: `${it.top}%`,
            left: `${it.left}%`,
            width: `${it.size}px`,
            height: `${it.size}px`,
            transform: `translate(-50%, -50%) rotate(${it.rot}deg)`,
            opacity: 0.15,
            backgroundColor: "#6B6B6B",
            maskImage: `url(${it.img})`,
            WebkitMaskImage: `url(${it.img})`,
            maskSize: "contain",
            WebkitMaskSize: "contain",
            maskRepeat: "no-repeat",
            WebkitMaskRepeat: "no-repeat",
            maskPosition: "center",
            WebkitMaskPosition: "center",
          }}
        />
      ))}
    </div>
  );
}

type SocialLink = { kind: "linkedin" | "instagram"; href: string; label: string };

type Founder = {
  photo: string;
  name: string;
  title: string;
  tagline: string;
  email: string;
  socials: SocialLink[];
  website: { label: string; href: string };
};

const FOUNDERS: Founder[] = [
  {
    photo: "/assets/Rohan%20PFP.png",
    name: "Rohan Piple",
    title: "Founder @ ǍSVA",
    tagline: "A performance wellness system to harness the power of self",
    email: "rohan@asva.life",
    socials: [
      {
        kind: "linkedin",
        href: "https://www.linkedin.com/in/rohan-piple-723671122/",
        label: "LinkedIn",
      },
      {
        kind: "instagram",
        href: "https://www.instagram.com/asvalife/",
        label: "ǍSVA Instagram",
      },
    ],
    website: { label: "asva.life", href: "https://asva.life" },
  },
  {
    photo: "/assets/Chiraag%20PFP.png",
    name: "Chiraag Kankariya",
    title: "Founder @ The Conscious Future Society",
    tagline: "A global movement to elevate human consciousness",
    email: "chiraag@theconsciousfuturesociety.com",
    socials: [
      {
        kind: "linkedin",
        href: "https://www.linkedin.com/in/chiraag-kankariya-4202a2102/",
        label: "LinkedIn",
      },
      {
        kind: "instagram",
        href: "https://www.instagram.com/conscioushoopers/",
        label: "ConsciousHoops Instagram",
      },
    ],
    website: {
      label: "theconsciousfuturesociety.com",
      href: "https://theconsciousfuturesociety.com",
    },
  },
];

function About() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-cream text-charcoal">
      <ScatteredIcons />
      <div className="relative z-10 mx-auto w-full max-w-[1040px] px-6 pt-8 pb-24 md:px-12 md:pt-10 md:pb-32">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 border-b-2 border-[#C4613A] pb-[3px] text-[13px] font-semibold uppercase tracking-[0.24em] text-muted-text transition-all duration-200 hover:border-transparent hover:text-charcoal"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <header className="mt-16 text-center md:mt-20">
          <h1
            className="font-bold leading-[1.0] tracking-[-0.01em] text-charcoal"
            style={{ fontFamily: PLAYFAIR, fontSize: "clamp(44px, 7.5vw, 72px)" }}
          >
            The Founders.
          </h1>
          <p className="mt-5 text-base text-muted-text">
            The people behind ConsciousHoops.
          </p>
        </header>

        <section className="mx-auto mt-20 grid max-w-[880px] grid-cols-1 gap-16 md:grid-cols-2 md:gap-12">
          {FOUNDERS.map((f) => (
            <FounderCard key={f.email} founder={f} />
          ))}
        </section>

        <section className="mx-auto mt-28 max-w-[560px] text-center md:mt-32">
          <h2
            className="font-bold leading-tight tracking-[-0.01em] text-charcoal"
            style={{ fontFamily: PLAYFAIR, fontSize: "clamp(32px, 5vw, 48px)" }}
          >
            What is{" "}
            <span style={{ color: "#2C2A24" }}>Conscious</span>
            <span style={{ color: "#C4613A", fontStyle: "italic" }}>Hoops</span>?
          </h2>
          <p
            className="mt-8 text-[18px] leading-relaxed"
            style={{ color: "#2C2A24" }}
          >
            A high-level pickup basketball community built on nervous system regulation.
            Strengthening athletes, everyday performers, and everyone in between through
            mind, body, and emotional balance. Helping players harness the power of self,
            improving wellness and performance on and off the court.
          </p>
        </section>
      </div>

      <AboutFooter />
    </div>
  );
}

function FounderCard({ founder }: { founder: Founder }) {
  const { photo, name, title, tagline, email, socials, website } = founder;
  return (
    <div className="flex flex-col items-center text-center">
      <div
        className="h-[168px] w-[168px] overflow-hidden rounded-full"
        style={{ border: "3px solid var(--terra)" }}
      >
        <img src={photo} alt={name} className="h-full w-full object-cover" />
      </div>
      <h3
        className="mt-6 font-bold text-charcoal"
        style={{ fontFamily: PLAYFAIR, fontSize: "26px" }}
      >
        {name}
      </h3>
      <p className="mt-1.5 text-[17px] italic text-muted-text">{title}</p>
      <p className="mt-3 max-w-[336px] text-[17px] leading-relaxed text-muted-text">
        {tagline}
      </p>

      <div className="mt-5 flex items-center justify-center gap-4 text-terra">
        <a
          href={`mailto:${email}`}
          aria-label={`Email ${name}`}
          title={email}
          className="transition-opacity hover:opacity-70"
        >
          <Mail className="h-[22px] w-[22px]" />
        </a>
        {socials.map((s) => (
          <a
            key={s.href}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={s.label}
            className="transition-opacity hover:opacity-70"
          >
            {s.kind === "linkedin" ? (
              <Linkedin className="h-[22px] w-[22px]" />
            ) : (
              <Instagram className="h-[22px] w-[22px]" />
            )}
          </a>
        ))}
      </div>

      <a
        href={website.href}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 text-[16px] text-muted-text underline decoration-muted-text/40 underline-offset-4 transition-colors hover:text-charcoal"
      >
        {website.label}
      </a>
    </div>
  );
}

function AboutFooter() {
  return (
    <section
      className="relative z-10 w-full overflow-hidden bg-charcoal px-6 pt-20 text-center md:px-12"
      style={{ paddingBottom: "calc(8rem + env(safe-area-inset-bottom))" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-terra/60 to-transparent"
      />
      <a
        href={LUMA_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-terra inline-flex items-center gap-2 rounded-full bg-terra px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.15em] text-cream hover:bg-terra-light"
      >
        Register now <ArrowRight className="h-4 w-4" />
      </a>
      <p className="mt-10 text-[10px] uppercase tracking-[0.28em] text-muted-text">
        © 2026 ConsciousHoops · Boston, MA
      </p>
    </section>
  );
}
