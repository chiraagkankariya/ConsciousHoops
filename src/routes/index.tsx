import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import chLogo from "@/assets/conscioushoops-logo.png.asset.json";
import chLogoTransparent from "@/assets/conscioushoops-logo-transparent.png.asset.json";
import asvaLogo from "@/assets/asva-logo.png.asset.json";
import WireframeBasketball from "@/components/ui/wireframe-basketball";
import { RulerCarousel, type CarouselItem } from "@/components/ui/ruler-carousel";
import EventMasonry, { type GalleryPhoto } from "@/components/ui/event-masonry";
import HeroVideoPanel from "@/components/ui/hero-video-panel";
import EchoText from "@/components/ui/echo-text";
import LoadingScreen from "@/components/ui/loading-screen";
import { HERO_VIDEOS } from "@/lib/hero-videos";
import p1 from "@/assets/IMG_2995.jpg.asset.json";
import p2 from "@/assets/IMG_3005.jpg.asset.json";
import p3 from "@/assets/IMG_3007.jpg.asset.json";
import p4 from "@/assets/IMG_3008.jpg.asset.json";
import p5 from "@/assets/IMG_3031.jpg.asset.json";
import p6 from "@/assets/IMG_3043.jpg.asset.json";
import p7 from "@/assets/IMG_3025.jpg.asset.json";
import p8 from "@/assets/IMG_3059.jpg.asset.json";
import p9 from "@/assets/IMG_3090.jpg.asset.json";
import p10 from "@/assets/IMG_3099.jpg.asset.json";
import p11 from "@/assets/IMG_2997.jpg.asset.json";
import p12 from "@/assets/IMG_3006.jpg.asset.json";
import p13 from "@/assets/IMG_3011.jpg.asset.json";
import p14 from "@/assets/IMG_3052.jpg.asset.json";
import p15 from "@/assets/IMG_3061.jpg.asset.json";
import p16 from "@/assets/IMG_3106.jpg.asset.json";
import p17 from "@/assets/IMG_3080.jpg.asset.json";
import p18 from "@/assets/IMG_3079.jpg.asset.json";

const LUMA_URL = "https://luma.com/m3lwxeg8";

const EVENT_PHOTOS: GalleryPhoto[] = [
  { src: p3.url, alt: "Players contest a jump shot during the first ConsciousHoops run" },
  { src: p4.url, alt: "A player rises for a mid-range jumper with a defender closing out" },
  { src: p5.url, alt: "A ball handler drives past a defender during pick-up play" },
  { src: p6.url, alt: "Players setting up a possession on the wing" },
  { src: p7.url, alt: "A shooter follows through as the ball floats toward the rim" },
  { src: p8.url, alt: "A player lines up a jump shot in a half-court set" },
  { src: p9.url, alt: "Players sitting courtside in a group meditation after the run" },
  { src: p1.url, alt: "A player smiling with a basketball and a sports drink" },
  { src: p2.url, alt: "Two players holding drinks and basketball shoes after the session" },
  { src: p10.url, alt: "A player posing playfully with a basketball on the court" },
  { src: p11.url, alt: "A hand holding a Halfday iced tea can with the gym court in the background" },
  { src: p12.url, alt: "A player in a headband dribbling up the empty court" },
  { src: p13.url, alt: "A shooter releasing over a contesting defender under the banners" },
  { src: p14.url, alt: "A player pushing the ball in transition down the court" },
  { src: p15.url, alt: "Two players smiling with Local Weather sports drinks after the run" },
  { src: p16.url, alt: "Two players sitting against the gym wall with sports drinks" },
  { src: p17.url, alt: "A full-court five-on-five possession during the session" },
  { src: p18.url, alt: "A player finishing a fast-break layup at the rim" },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ConsciousHoops — Wellness Pick-up Basketball in Boston" },
      {
        name: "description",
        content:
          "A monthly pick-up basketball community in Boston for people in the wellness, meditation, and consciousness space. Competition meets mindfulness. Let's hoop!",
      },
      { property: "og:title", content: "ConsciousHoops — Where the court meets the mind" },
      {
        property: "og:description",
        content:
          "Monthly pick-up runs in Boston for founders, researchers, therapists, and meditators who love basketball.",
      },
    ],
  }),
  component: Index,
});

const INVITEE_ROLES: CarouselItem[] = [
  { id: 1, title: "Founders" },
  { id: 2, title: "Researchers" },
  { id: 3, title: "Meditators" },
  { id: 4, title: "Professors" },
  { id: 5, title: "Therapists" },
  { id: 6, title: "Students" },
  { id: 7, title: "Wellness Practitioners" },
  { id: 8, title: "Curious Minds" },
];

function Index() {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [videos, setVideos] = useState<string[]>(HERO_VIDEOS);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
    scrollRef.current?.scrollTo(0, 0);
  }, []);

  // Preload the first hero video with byte-level progress. Once done, swap in a
  // blob URL so the video element plays instantly. Fail-open after 20s so a slow
  // connection can't strand the visitor on the loader.
  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;
    const controller = new AbortController();
    let objectUrl: string | null = null;
    const fallbackTimer = setTimeout(() => {
      if (!cancelled) setIsLoading(false);
    }, 20000);

    (async () => {
      try {
        const res = await fetch(HERO_VIDEOS[0], { signal: controller.signal });
        if (!res.ok || !res.body) throw new Error("bad response");
        const total = Number(res.headers.get("Content-Length") || 0);
        const reader = res.body.getReader();
        const chunks: Uint8Array[] = [];
        let received = 0;
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (cancelled) return;
          chunks.push(value);
          received += value.length;
          if (total > 0) setProgress(Math.round((received / total) * 100));
        }
        if (cancelled) return;
        const blob = new Blob(chunks as BlobPart[], {
          type: res.headers.get("Content-Type") || "video/mp4",
        });
        objectUrl = URL.createObjectURL(blob);
        setVideos((prev) => [objectUrl!, ...prev.slice(1)]);
        setProgress(100);
        setTimeout(() => {
          if (!cancelled) setIsLoading(false);
        }, 350);
      } catch {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(fallbackTimer);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, []);

  return (
    <div className="grain min-h-screen overflow-x-hidden bg-ink text-cream">
      <AnimatePresence>
        {isLoading && <LoadingScreen key="loader" progress={progress} />}
      </AnimatePresence>
      {/* Left: fixed looping video panel (desktop only) */}
      <div className="video-panel hidden md:block">
        <HeroVideoPanel videos={videos} />
      </div>

      {/* Right: independently scrolling content */}
      <motion.div
        ref={scrollRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="content-panel flex flex-col items-center md:h-screen md:overflow-y-auto"
      >
        {/* Mobile hero video — fullbleed at top so the cinematic feel carries on phones. */}
        <div className="relative h-[55vh] w-full overflow-hidden md:hidden">
          <HeroVideoPanel videos={videos} />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-ink" />
        </div>

        <div className="w-full max-w-[560px] text-center">
          <Nav />
          <main className="w-full px-6 pb-0 md:px-12">
            <Hero scrollRef={scrollRef} />
            <FadeIn>
              <SessionFacts />
            </FadeIn>
            <FadeIn>
              <WhosInvited />
            </FadeIn>
            <FadeIn>
              <FirstRun />
            </FadeIn>
            <FadeIn>
              <Ethos />
            </FadeIn>
            <FadeIn>
              <Partners />
            </FadeIn>
            <FadeIn>
              <Sponsorship />
            </FadeIn>
          </main>
        </div>
        <div className="mt-10 w-full px-6 md:px-12">
          <EventMasonry photos={EVENT_PHOTOS} />
        </div>
        <FooterCTA />
      </motion.div>
    </div>
  );
}

function FadeIn({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2, margin: "0px 0px -80px 0px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function Nav() {
  return (
    <nav className="mx-auto flex max-w-2xl items-center justify-center px-6 py-6 md:px-12">
      <a
        href="#top"
        style={{ backgroundColor: "#faf6ef" }}
        className="inline-flex items-center rounded-lg p-0.5 shadow-[0_8px_28px_-12px_rgba(0,0,0,0.55)] ring-1 ring-black/5 transition-transform hover:-translate-y-[1px]"
      >
        <img
          src={chLogo.url}
          alt="ConsciousHoops"
          className="h-16 w-auto md:h-24"
          style={{ clipPath: "inset(10%)" }}
        />
      </a>
    </nav>
  );
}

function RegisterButton({ className, children }: { className?: string; children?: ReactNode }) {
  return (
    <a
      href={LUMA_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "btn-terra inline-flex items-center gap-2 rounded-full bg-terra px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.15em] text-cream hover:bg-terra-light",
        className
      )}
    >
      {children ?? "Register now"} <ArrowRight className="h-4 w-4" />
    </a>
  );
}

function Hero({ scrollRef }: { scrollRef: React.RefObject<HTMLDivElement | null> }) {
  const { scrollY } = useScroll({ container: scrollRef });
  const y = useTransform(scrollY, [0, 400], [0, -60]);

  return (
    <section id="top" className="pt-2 text-center">
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="font-sans text-[11px] uppercase tracking-[0.28em] text-muted-text"
      >
        Boston · New York City
      </motion.p>

      <motion.h1
        style={{ y, fontSize: "clamp(30px, 7.2vw, 84px)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="mt-4 flex flex-col items-center gap-2 font-display font-bold uppercase leading-[0.95] tracking-[-0.03em] text-cream"
      >
        <EchoText
          text="Where the court"
          color="#F2EEE6"
          tint={false}
          fontSize="inherit"
          fontWeight="inherit"
          direction="right"
          echoes={10}
          offset={28}
          duration={900}
          blur={2}
          fade={0.72}
        />
        <span className="flex items-baseline justify-center gap-[0.28em]">
          <EchoText
            text="meets"
            color="#F2EEE6"
            tint={false}
            fontSize="inherit"
            fontWeight="inherit"
            direction="right"
            echoes={10}
            offset={28}
            duration={900}
            blur={2}
            fade={0.72}
          />
          <EchoText
            text="the mind."
            color="#E8613A"
            tint="#FF8A66"
            fontSize="inherit"
            fontWeight="inherit"
            direction="right"
            echoes={12}
            offset={32}
            duration={1000}
            blur={3}
            fade={0.72}
          />
        </span>
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        className="mt-8 flex justify-center"
      >
        <WireframeBasketball size={260} />
      </motion.div>

      <p className="mx-auto mt-14 max-w-md text-base leading-relaxed text-muted-text">
        A pick-up basketball community for the wellness, meditation, and consciousness space.
      </p>

      <div className="mt-8">
        <RegisterButton />
      </div>
    </section>
  );
}

function SessionFacts() {
  const stats = [
    { value: "1×", label: "Per month" },
    { value: "10AM – 12PM", label: "Saturday" },
    { value: "Limited", label: "Players per run" },
  ];

  return (
    <section className="mt-24 -mx-6 md:-mx-16">
      <div className="flex flex-row items-start justify-between gap-3 border-y border-white/10 py-8 md:gap-8">
        {stats.map((s) => (
          <div key={s.label} className="flex-1 text-center">
            <div
              className="whitespace-nowrap font-display font-bold leading-none text-cream"
              style={{ fontSize: "clamp(15px, 3.6vw, 45px)", letterSpacing: "-0.03em" }}
            >
              {s.value}
            </div>
            <div className="mt-3 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-text md:text-[13px] md:tracking-[0.18em]">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function WhosInvited() {
  return (
    <section className="mt-24">
      <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-muted-text">
        Built for —
      </p>
      <div className="mt-6">
        <RulerCarousel originalItems={INVITEE_ROLES} />
      </div>
    </section>
  );
}

function FirstRun() {
  return (
    <section className="mt-24">
      <p
        className="font-display font-medium leading-[1.05] tracking-[-0.02em] text-cream"
        style={{ fontSize: "clamp(28px, 4.2vw, 40px)" }}
      >
        Limited players. Two hours of run. One meditation together.
      </p>
      <p className="mt-5 text-[11px] uppercase tracking-[0.24em] text-muted-text">
        Next session — September 26, 2026 · New York City
      </p>
    </section>
  );
}

function Ethos() {
  return (
    <section className="mt-24">
      <div
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-left backdrop-blur-sm"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -left-6 -top-8 select-none font-display text-[140px] font-bold leading-none text-terra opacity-20"
        >
          "
        </div>
        <p className="font-display text-xl font-medium leading-relaxed text-cream md:text-2xl">
          Keep it competitive. Keep it clean. The game gets intense — we just ask that you leave the
          toxicity at the door.
        </p>
        <footer className="mt-6 text-[11px] uppercase tracking-[0.24em] text-muted-text">
          — The ConsciousHoops ethos
        </footer>
      </div>
    </section>
  );
}

function Partners() {
  return (
    <section className="pt-14 pb-2 text-center">
      <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-text">
        In partnership with
      </p>
      <a
        href="https://asva.life/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Ašva"
        className="mt-2 inline-flex items-center justify-center transition-opacity hover:opacity-80"
      >
        <img
          src={asvaLogo.url}
          alt="Ašva"
          className="h-[200px] w-auto max-w-[85vw] object-contain md:h-[300px] md:max-w-none"
        />
      </a>
    </section>
  );
}

function Sponsorship() {
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [topic, setTopic] = useState("");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const reason = String(fd.get("reason") || "").trim();
    const message = String(fd.get("message") || "").trim();

    if (!name || !email || !reason || !message) {
      setError("Please fill out all fields.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please add a valid email.");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("https://formspree.io/f/moealznr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          reason,
          message,
          _subject: "New ConsciousHoops inquiry",
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean };
      if (!res.ok || data.ok !== true) {
        throw new Error("Formspree error");
      }
      setSubmitting(false);
      setDone(true);
    } catch {
      setSubmitting(false);
      setError("Something went wrong. Try emailing us directly at [your email].");
    }
  };

  const fieldClass =
    "w-full border-0 border-b border-white/15 bg-transparent px-0 py-3 text-left text-cream placeholder:text-muted-text focus:border-terra focus:outline-none transition-colors";

  return (
    <section className="mt-4 text-left">
      <h2
        className="font-display font-bold uppercase leading-[0.95] tracking-[-0.02em] text-cream"
        style={{ fontSize: "clamp(32px, 5vw, 52px)" }}
      >
        Interested in<br />sponsoring?
      </h2>
      <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-text">
        ConsciousHoops brings together founders, researchers, practitioners, and thought
        leaders in the wellness and consciousness space — all in one gym, once a month. If your
        brand resonates with mindfulness, community, or healthy living, we'd love to talk.
      </p>
      <p className="mt-4 max-w-lg text-sm italic text-muted-text">
        We're early. That means you get in at the ground floor with a tight-knit, high-intent
        community.
      </p>

      <div className="mt-10 w-full">
        <AnimatePresence mode="wait">
          {done ? (
            <SponsorshipSuccess key="success" />
          ) : (
            <motion.form
              key="form"
              onSubmit={onSubmit}
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex w-full flex-col gap-5"
            >
              <input type="hidden" name="_subject" value="New ConsciousHoops inquiry" />
              <input name="name" placeholder="Your name" maxLength={80} className={fieldClass} />
              <input
                name="email"
                type="email"
                placeholder="Email address"
                maxLength={120}
                className={fieldClass}
              />
              <select
                name="reason"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className={cn(fieldClass, topic ? "text-cream" : "text-muted-text")}
                style={{ colorScheme: "dark" }}
              >
                <option value="" disabled>
                  What are you reaching out about?
                </option>
                <option value="Sponsorship inquiry">Sponsorship inquiry</option>
                <option value="Joining the waitlist">Joining the waitlist</option>
                <option value="General question">General question</option>
              </select>
              <textarea
                name="message"
                rows={4}
                placeholder="Tell us a bit more..."
                maxLength={2000}
                className={fieldClass}
              />
              <button
                type="submit"
                disabled={submitting}
                className="btn-terra mt-2 w-full rounded-full bg-terra px-6 py-3.5 text-center text-sm font-semibold uppercase tracking-[0.15em] text-cream hover:bg-terra-light disabled:opacity-60"
              >
                {submitting ? "Sending..." : "Send it →"}
              </button>
              {error && (
                <p className="text-sm text-terra-light">
                  {error}
                </p>
              )}
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function SponsorshipSuccess() {
  const fullText = "Thanks! We'll be in touch soon.";
  const [typed, setTyped] = useState("");
  const [showSecondary, setShowSecondary] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        i += 1;
        setTyped(fullText.slice(0, i));
        if (i >= fullText.length) {
          clearInterval(interval);
          setTimeout(() => setShowSecondary(true), 200);
        }
      }, 40);
    }, 500);
    return () => clearTimeout(startTimer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="flex min-h-[420px] w-full flex-col items-center justify-center text-center"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{ backgroundColor: "#faf6ef" }}
        className="inline-flex items-center justify-center rounded-2xl px-6 py-5 shadow-[0_16px_50px_-20px_rgba(0,0,0,0.7)] ring-1 ring-black/5"
      >
        <img
          src={chLogoTransparent.url}
          alt="ConsciousHoops"
          style={{ width: 284 }}
          className="h-auto"
        />
      </motion.div>
      <p
        className="mt-6 font-display text-xl font-medium text-cream"
        style={{ minHeight: "1.5em" }}
      >
        {typed}
        <span className="text-terra">{typed.length < fullText.length ? "|" : ""}</span>
      </p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: showSecondary ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        className="mt-3 text-[11px] uppercase tracking-[0.24em] text-muted-text"
      >
        We'll reach out before the next session.
      </motion.p>
    </motion.div>
  );
}

function FooterCTA() {
  return (
    <section
      className="relative mt-24 w-full overflow-hidden bg-ink-2 px-6 pt-20 text-center md:px-12"
      style={{ paddingBottom: "calc(8rem + env(safe-area-inset-bottom))" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-terra/60 to-transparent"
      />
      <p className="font-display text-3xl font-bold uppercase tracking-[-0.02em] text-cream md:text-4xl">
        Let's Hoop.
      </p>
      <div className="mt-8">
        <RegisterButton />
      </div>
      <p className="mt-10 text-[10px] uppercase tracking-[0.28em] text-muted-text">
        © 2026 ConsciousHoops · Boston, MA
      </p>
    </section>
  );
}
