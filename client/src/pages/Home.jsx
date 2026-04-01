import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ─── Segment config ────────────────────────────────────────────────────────
const SEGMENTS = [
  {
    value: "10th",
    label: "After 10th",
    emoji: "🎒",
    tagline: "Streams, vocational paths & next steps",
    accent: "from-sky-500/20 to-sky-500/5",
    border: "hover:border-sky-400/50",
    tag: "border-sky-400/30 text-sky-400",
    dot: "bg-sky-400",
  },
  {
    value: "inter_mpc",
    label: "Inter MPC",
    emoji: "🔬",
    tagline: "Engineering, pure sciences & research",
    accent: "from-violet-500/20 to-violet-500/5",
    border: "hover:border-violet-400/50",
    tag: "border-violet-400/30 text-violet-400",
    dot: "bg-violet-400",
  },
  {
    value: "inter_bipc",
    label: "Inter BiPC",
    emoji: "🧬",
    tagline: "Medicine, pharmacy, agriculture & beyond",
    accent: "from-emerald-500/20 to-emerald-500/5",
    border: "hover:border-emerald-400/50",
    tag: "border-emerald-400/30 text-emerald-400",
    dot: "bg-emerald-400",
  },
  {
    value: "degree",
    label: "Degree",
    emoji: "🎓",
    tagline: "Specialisations, PG options & career pivots",
    accent: "from-amber-500/20 to-amber-500/5",
    border: "hover:border-amber-400/50",
    tag: "border-amber-400/30 text-amber-400",
    dot: "bg-amber-400",
  },
  {
    value: "dropout",
    label: "Dropped Out",
    emoji: "🛤️",
    tagline: "Self-taught, entrepreneurship & alternative routes",
    accent: "from-rose-500/20 to-rose-500/5",
    border: "hover:border-rose-400/50",
    tag: "border-rose-400/30 text-rose-400",
    dot: "bg-rose-400",
  },
  {
    value: "working",
    label: "Working",
    emoji: "💼",
    tagline: "Upskilling, switching industries & growth paths",
    accent: "from-cyan-500/20 to-cyan-500/5",
    border: "hover:border-cyan-400/50",
    tag: "border-cyan-400/30 text-cyan-400",
    dot: "bg-cyan-400",
  },
];

// ─── Animated counter ──────────────────────────────────────────────────────
function Counter({ target, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1400;
          const step = 16;
          const steps = duration / step;
          let current = 0;
          const inc = target / steps;
          const timer = setInterval(() => {
            current += inc;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, step);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {count.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

// ─── useInView hook for scroll-triggered fadeUp ────────────────────────────
function useInView(options = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.disconnect();
      }
    }, { threshold: 0.12, ...options });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, inView];
}

// ─── Section wrapper with fadeUp ──────────────────────────────────────────
function FadeUp({ children, delay = 0, className = "" }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={[
        "transition-all duration-700 ease-out",
        "opacity-100 translate-y-0",
        className,
      ].join(" ")}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// ─── Stat item ─────────────────────────────────────────────────────────────
function Stat({ value, suffix, label }) {
  return (
    <div className="text-center px-6">
      <p className="text-3xl sm:text-4xl font-bold text-white tabular-nums">
        <Counter target={value} suffix={suffix} />
      </p>
      <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium tracking-wide uppercase">
        {label}
      </p>
    </div>
  );
}

// ─── Segment card ──────────────────────────────────────────────────────────
function SegmentCard({ seg, onClick, index }) {
  return (
    <FadeUp delay={index * 70}>
      <button
        onClick={() => onClick(seg.value)}
        className={[
          "group w-full text-left rounded-2xl border border-slate-700/60",
          "bg-slate-800/40 hover:bg-gradient-to-br",
          seg.accent,
          seg.border,
          "transition-all duration-300 ease-out",
          "hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02]",
          "p-5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50",
        ].join(" ")}
        aria-label={`Browse ${seg.label} stories`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="text-3xl leading-none select-none">{seg.emoji}</div>
          <span
            className={[
              "text-[10px] font-semibold tracking-widest uppercase border rounded-full px-2 py-0.5 shrink-0",
              seg.tag,
            ].join(" ")}
          >
            Stories
          </span>
        </div>

        <h3 className="mt-3 text-base font-bold text-white group-hover:text-white">
          {seg.label}
        </h3>
        <p className="mt-1 text-xs text-slate-400 group-hover:text-slate-300 leading-relaxed">
          {seg.tagline}
        </p>

        <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-slate-500 group-hover:text-slate-300 transition-colors">
          <span className={`w-1.5 h-1.5 rounded-full ${seg.dot}`} />
          View journeys →
        </div>
      </button>
    </FadeUp>
  );
}

// ─── Home ──────────────────────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSegment = (value) => navigate(`/stories?segment=${value}`);

  return (
    <div className="min-h-screen bg-slate-900 text-white">

      {/* ── Fixed ambient background ──────────────────────────────── */}
      <div
        className="fixed inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 80% 40% at 50% -10%, rgba(245,158,11,0.12) 0%, transparent 70%)",
        }}
      />
      {/* Subtle grid texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.025]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.1) 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative">

        {/* ════════════════════════════════════════════════════════════
            HERO
        ════════════════════════════════════════════════════════════ */}
        <section className="min-h-[88vh] flex flex-col items-center justify-center px-4 sm:px-6 pt-12 pb-20 text-center">

          {/* Eyebrow */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-400/30 bg-amber-400/5 text-amber-400 text-xs font-semibold tracking-widest uppercase mb-8"
            style={{ animation: "fadeUp 0.5s ease both" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Career Intelligence for Indian Youth
          </div>

          {/* Headline */}
          <h1
            className="max-w-4xl mx-auto font-bold leading-[1.08] tracking-tight"
            style={{ animation: "fadeUp 0.6s ease 0.1s both", fontFamily: "'DM Sans', sans-serif" }}
          >
            <span className="block text-4xl sm:text-6xl lg:text-7xl text-white">
              Your path exists.
            </span>
            <span className="block text-4xl sm:text-6xl lg:text-7xl mt-2">
              <span className="text-amber-400">Someone already</span>
              <br className="sm:hidden" />
              <span className="text-white"> walked it.</span>
            </span>
          </h1>

          {/* Sub */}
          <p
            className="mt-6 max-w-xl text-base sm:text-lg text-slate-400 leading-relaxed"
            style={{ animation: "fadeUp 0.6s ease 0.22s both" }}
          >
            Real journeys from 10th grade to the workplace — no gatekeeping, no
            glamour filters. Find the path that fits{" "}
            <em className="text-slate-300 not-italic font-medium">you</em>.
          </p>

          {/* CTA row */}
          <div
            className="mt-10 flex flex-col sm:flex-row items-center gap-3"
            style={{ animation: "fadeUp 0.6s ease 0.34s both" }}
          >
            <Link
              to="/quiz"
              className="group relative inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-amber-400 text-slate-900 text-sm font-bold hover:bg-amber-300 transition-colors duration-200 shadow-lg shadow-amber-400/20 overflow-hidden"
            >
              {/* shimmer */}
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500" />
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0">
                <path d="M8 1l2 5h5l-4 3 1.5 5L8 11l-4.5 3L5 9 1 6h5L8 1z" fill="currentColor" />
              </svg>
              Discover my path
            </Link>

            <Link
              to="/stories"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-slate-600 text-slate-300 text-sm font-medium hover:border-slate-500 hover:text-white hover:bg-slate-800/60 transition-all duration-200"
            >
              Browse all stories
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>

          {/* Social proof strip */}
          <p
            className="mt-8 text-xs text-slate-600"
            style={{ animation: "fadeUp 0.6s ease 0.44s both" }}
          >
            Journeys shared across 10th · Inter MPC · Inter BiPC · Degree · Dropout · Working
          </p>

          {/* Scroll cue */}
          <div
            className="mt-16 flex flex-col items-center gap-2 text-slate-600"
            style={{ animation: "fadeUp 0.6s ease 0.5s both" }}
            aria-hidden="true"
          >
            <span className="text-[10px] tracking-widest uppercase">Explore</span>
            <div className="w-px h-8 bg-gradient-to-b from-slate-600 to-transparent animate-pulse" />
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════
            STATS STRIP
        ════════════════════════════════════════════════════════════ */}
        <section className="border-y border-slate-800 bg-slate-800/30 py-10 px-4">
          <div className="max-w-3xl mx-auto grid grid-cols-3 divide-x divide-slate-700/60">
            <Stat value={2400} suffix="+" label="Journeys shared" />
            <Stat value={6}    suffix=""  label="Life segments" />
            <Stat value={89}   suffix="%"  label="Found clarity" />
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════
            SEGMENT PICKER
        ════════════════════════════════════════════════════════════ */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20">

          <FadeUp>
            <div className="mb-12 text-center">
              <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">
                Where are you right now?
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Pick your current stage
              </h2>
              <p className="mt-3 text-sm text-slate-500 max-w-md mx-auto">
                See real stories from people who stood exactly where you are.
              </p>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SEGMENTS.map((seg, i) => (
              <SegmentCard key={seg.value} seg={seg} onClick={handleSegment} index={i} />
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════
            HOW IT WORKS
        ════════════════════════════════════════════════════════════ */}
        <section className="border-t border-slate-800 py-20 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <FadeUp>
              <div className="text-center mb-14">
                <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">
                  How PathForge works
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">
                  Three steps to clarity
                </h2>
              </div>
            </FadeUp>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                {
                  step: "01",
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                      <circle cx="11" cy="11" r="9" stroke="#f59e0b" strokeWidth="1.5" />
                      <path d="M7 11l3 3 5-5" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ),
                  title: "Take the quiz",
                  desc: "10 behavioural questions surface your analytical, creative, social, practical, and academic strengths.",
                },
                {
                  step: "02",
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                      <path d="M4 17L9 12M13 8l5-5" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
                      <circle cx="11" cy="11" r="3" stroke="#f59e0b" strokeWidth="1.5" />
                    </svg>
                  ),
                  title: "Browse real paths",
                  desc: "Filter by segment and discover journeys ranked by upvotes, saves, and recency — no curated success theatre.",
                },
                {
                  step: "03",
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                      <path d="M11 3v16M5 9l6-6 6 6" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ),
                  title: "Share your story",
                  desc: "Once you're on your way, give back — your journey could be the clarity someone else is searching for.",
                },
              ].map((item, i) => (
                <FadeUp key={item.step} delay={i * 100}>
                  <div className="relative rounded-2xl border border-slate-700/60 bg-slate-800/40 p-6 h-full">
                    {/* step number watermark */}
                    <span className="absolute top-4 right-5 text-5xl font-black text-slate-700/40 leading-none select-none">
                      {item.step}
                    </span>
                    <div className="mb-4">{item.icon}</div>
                    <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════
            QUIZ CTA BANNER
        ════════════════════════════════════════════════════════════ */}
        <section className="px-4 sm:px-6 pb-24">
          <FadeUp>
            <div className="max-w-4xl mx-auto relative overflow-hidden rounded-3xl border border-amber-400/20 bg-gradient-to-br from-amber-400/10 via-slate-800/60 to-slate-900 p-10 sm:p-14 text-center">

              {/* decorative orb */}
              <div
                className="absolute -top-16 -right-16 w-64 h-64 rounded-full blur-3xl pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(245,158,11,0.18) 0%, transparent 70%)" }}
                aria-hidden="true"
              />

              <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-4">
                Free · 3 minutes · No sign-up required
              </p>
              <h2 className="text-2xl sm:text-4xl font-bold text-white leading-tight mb-4">
                Not sure where you're headed?
              </h2>
              <p className="text-slate-400 text-sm sm:text-base max-w-lg mx-auto mb-8 leading-relaxed">
                Our 10-question behavioural quiz maps your natural strengths to real career
                clusters — and matches you with stories from people who share your profile.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to="/quiz"
                  className="group relative inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-amber-400 text-slate-900 text-sm font-bold hover:bg-amber-300 transition-colors duration-200 shadow-xl shadow-amber-400/20 overflow-hidden"
                >
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500" />
                  Start the quiz →
                </Link>

                {!user && (
                  <Link
                    to="/register"
                    className="text-sm text-slate-500 hover:text-slate-300 transition-colors duration-150 underline underline-offset-4 decoration-slate-700"
                  >
                    Or create a free account to save results
                  </Link>
                )}
              </div>
            </div>
          </FadeUp>
        </section>

      </div>
    </div>
  );
}
