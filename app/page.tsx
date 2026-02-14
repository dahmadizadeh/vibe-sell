"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// ─── B2B Placeholder Ideas ──────────────────────────────────────────────────

const PLACEHOLDER_IDEAS = [
  "AI tool that finds companies about to churn from competitors",
  "Dashboard that tracks hiring velocity at target accounts",
  "Slack bot that alerts when prospects raise funding",
  "Internal tool to score inbound leads by company signals",
  "Chrome extension that enriches LinkedIn profiles with intent data",
];

// ─── Intersection Observer Hook ─────────────────────────────────────────────

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

// ─── Hero Input Component ───────────────────────────────────────────────────

function HeroInput({ dark }: { dark?: boolean }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [typing, setTyping] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (value) return;
    const target = PLACEHOLDER_IDEAS[placeholderIdx];
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting) {
      if (typing.length < target.length) {
        timeout = setTimeout(() => setTyping(target.slice(0, typing.length + 1)), 50);
      } else {
        timeout = setTimeout(() => setIsDeleting(true), 2800);
      }
    } else {
      if (typing.length > 0) {
        timeout = setTimeout(() => setTyping(typing.slice(0, -1)), 25);
      } else {
        setIsDeleting(false);
        setPlaceholderIdx((i) => (i + 1) % PLACEHOLDER_IDEAS.length);
      }
    }
    return () => clearTimeout(timeout);
  }, [typing, isDeleting, placeholderIdx, value]);

  const handleSubmit = () => {
    const idea = value.trim();
    if (!idea) return;
    router.push(`/create?idea=${encodeURIComponent(idea)}&mode=builder`);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
        placeholder={value ? "" : typing + "|"}
        className={`w-full h-14 pl-5 pr-14 rounded-xl text-base transition-all outline-none ${
          dark
            ? "bg-white/[0.07] border border-white/[0.12] text-white placeholder-white/30 focus:border-[#2E75B6] focus:ring-2 focus:ring-[#2E75B6]/40 focus:bg-white/[0.1]"
            : "bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#2E75B6] focus:ring-2 focus:ring-[#2E75B6]/30 shadow-lg shadow-black/5"
        }`}
      />
      <button
        onClick={handleSubmit}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg bg-[#2E75B6] hover:bg-[#245f99] text-white flex items-center justify-center transition-colors"
        style={{ animation: value ? "none" : "pulse-subtle 2s ease-in-out infinite" }}
        aria-label="Submit idea"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
      </button>
    </div>
  );
}

// ─── Count-Up Animation ─────────────────────────────────────────────────────

function CountUp({ target, duration = 1800 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const { ref, visible } = useInView(0.5);

  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = target / (duration / 16);
    const interval = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(interval);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(interval);
  }, [visible, target, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

// ─── Section Wrapper with Fade-In ───────────────────────────────────────────

function Section({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, visible } = useInView();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// ─── Comparison Row Data ────────────────────────────────────────────────────

const COMPARISON_ROWS = [
  { feature: "Working prototype", them: true, us: true, usDetail: null },
  { feature: "Market analysis", them: false, us: true, usDetail: "Viability score + competitors" },
  { feature: "Real potential users", them: false, us: true, usDetail: "80+ with verified emails" },
  { feature: "Launch content", them: false, us: true, usDetail: "LinkedIn, Twitter, Reddit, DMs" },
  { feature: "Conversation analysis", them: false, us: true, usDetail: "Upload calls, extract insights" },
  { feature: "Progress to PMF", them: false, us: true, usDetail: "Score from real conversations" },
];

// ─── Main Landing Page ──────────────────────────────────────────────────────

export default function LandingPage() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const [totalApps, setTotalApps] = useState(847);
  useEffect(() => {
    try {
      const stored = localStorage.getItem("vibe_sell_app_count");
      if (stored) {
        const n = parseInt(stored, 10);
        if (n > 847) setTotalApps(n);
      }
    } catch {}
  }, []);

  return (
    <div className="bg-white">
      <style jsx global>{`
        html { scroll-behavior: smooth; }
        @keyframes pulse-subtle {
          0%, 100% { box-shadow: 0 0 0 0 rgba(46, 117, 182, 0.4); }
          50% { box-shadow: 0 0 0 8px rgba(46, 117, 182, 0); }
        }
        @keyframes slow-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(8px); }
        }
        @keyframes arrow-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>

      {/* ─── Sticky Nav ──────────────────────────────────────────────────── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-6 transition-all duration-300 ${
          scrolled
            ? "bg-slate-950/90 backdrop-blur-md border-b border-slate-800"
            : "bg-transparent"
        }`}
      >
        <a href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-[#2E75B6] flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </div>
          <span className="font-bold text-white text-base">Vibe &amp; Sell</span>
        </a>
        <div className="flex items-center gap-6">
          <a href="#how-it-works" className="text-sm text-slate-400 hover:text-white transition-colors hidden sm:block">How It Works</a>
          <a href="#the-loop" className="text-sm text-slate-400 hover:text-white transition-colors hidden sm:block">The Loop</a>
          <a href="https://crustdata.com" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-white transition-colors hidden sm:block">Crustdata &#x2197;</a>
          <button
            onClick={() => router.push("/create")}
            className="px-4 py-2 text-sm font-medium text-white bg-[#2E75B6] hover:bg-[#245f99] rounded-lg transition-colors"
          >
            Start Building &rarr;
          </button>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 1: HERO                                                    */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-14 bg-slate-950">
        <div className="relative z-10 text-center max-w-2xl mx-auto">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-2 leading-[1.05] tracking-tight">
            Build product.
          </h1>
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-[1.05] tracking-tight">
            Talk to users.
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 leading-relaxed mb-12 max-w-xl mx-auto">
            Whether it&apos;s a side project, a startup, or a tool
            for your team &mdash; you need at least one person whose
            problem you&apos;re solving. We help you find them.
          </p>

          <HeroInput dark />

          <p className="mt-5 text-sm text-slate-500">
            No signup. No credit card. Powered by{" "}
            <a href="https://crustdata.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:underline underline-offset-2 hover:text-slate-300 transition-colors">
              Crustdata&apos;s 700M+ profiles
            </a>.
          </p>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer"
          style={{ animation: "slow-bounce 2.5s ease-in-out infinite" }}
          onClick={() => document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })}
        >
          <span className="text-sm text-slate-400">See how it works</span>
          <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 2: THE DEMO — 4 step cards                                */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section id="demo" className="bg-white px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <Section>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 text-center mb-14">
              The full loop, in one session.
            </h2>
          </Section>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative">
            {/* Connecting line (desktop) */}
            <div className="hidden lg:block absolute top-24 left-[15%] right-[15%] h-px bg-slate-200" />

            {/* Step 1: Type an idea */}
            <Section delay={0}>
              <div className="rounded-xl border border-slate-200 bg-white p-5 h-full relative">
                <div className="w-8 h-8 rounded-full bg-[#2E75B6] text-white flex items-center justify-center text-sm font-bold mb-4 relative z-10">1</div>
                <h3 className="font-semibold text-slate-900 mb-1">You type an idea</h3>
                <p className="text-sm text-slate-500 mb-4">One sentence. That&apos;s all we need.</p>
                {/* Mini UI */}
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="h-9 rounded-lg bg-white border border-slate-200 flex items-center px-3">
                    <span className="text-xs text-slate-400 truncate">Churn detection tool for SaaS...</span>
                    <div className="ml-auto w-5 h-5 rounded bg-[#2E75B6] flex items-center justify-center shrink-0">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-3">~10 seconds</p>
              </div>
            </Section>

            {/* Step 2: AI builds + finds */}
            <Section delay={100}>
              <div className="rounded-xl border border-slate-200 bg-white p-5 h-full">
                <div className="w-8 h-8 rounded-full bg-[#2E75B6] text-white flex items-center justify-center text-sm font-bold mb-4 relative z-10">2</div>
                <h3 className="font-semibold text-slate-900 mb-1">AI builds + finds</h3>
                <p className="text-sm text-slate-500 mb-4">Working app. Market score. 80+ real people.</p>
                {/* Mini UI */}
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="rounded-lg bg-slate-900 w-14 h-14 flex flex-col items-center justify-center shrink-0">
                      <div className="text-[10px] text-white font-medium">App</div>
                      <div className="w-8 h-1 bg-slate-700 rounded-full mt-1" />
                      <div className="w-6 h-1 bg-slate-700 rounded-full mt-0.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-slate-900">ChurnGuard</div>
                      <div className="text-[10px] text-slate-400">Score: 74/100</div>
                      <div className="h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: "74%" }} />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-[#2E75B6]/15 flex items-center justify-center text-[8px] text-[#2E75B6] font-bold">J</div>
                    <div className="w-5 h-5 rounded-full bg-[#2E75B6]/15 flex items-center justify-center text-[8px] text-[#2E75B6] font-bold">S</div>
                    <div className="w-5 h-5 rounded-full bg-[#2E75B6]/15 flex items-center justify-center text-[8px] text-[#2E75B6] font-bold">A</div>
                    <span className="text-[10px] text-slate-400 ml-1">+ 80 people</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-3">~4 minutes</p>
              </div>
            </Section>

            {/* Step 3: Talk to real people */}
            <Section delay={200}>
              <div className="rounded-xl border border-slate-200 bg-white p-5 h-full">
                <div className="w-8 h-8 rounded-full bg-[#2E75B6] text-white flex items-center justify-center text-sm font-bold mb-4 relative z-10">3</div>
                <h3 className="font-semibold text-slate-900 mb-1">You talk to real people</h3>
                <p className="text-sm text-slate-500 mb-4">Reach out. Have real conversations. Listen.</p>
                {/* Mini UI */}
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="rounded-lg bg-blue-50 border border-blue-100 p-2.5 mb-2">
                    <p className="text-[11px] text-blue-800 italic leading-relaxed">
                      &ldquo;We&apos;ve been looking for exactly this. Our current tool misses 40% of at-risk accounts.&rdquo;
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                      <span className="text-[9px] text-emerald-600">+</span>
                    </div>
                    <span className="text-[10px] text-slate-500">Strong signal</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-3">That&apos;s on you.</p>
              </div>
            </Section>

            {/* Step 4: Everything gets smarter */}
            <Section delay={300}>
              <div className="rounded-xl border border-slate-200 bg-white p-5 h-full relative">
                <div className="w-8 h-8 rounded-full bg-[#2E75B6] text-white flex items-center justify-center text-sm font-bold mb-4 relative z-10">4</div>
                <h3 className="font-semibold text-slate-900 mb-1">Everything gets smarter</h3>
                <p className="text-sm text-slate-500 mb-4">Upload it. Score, targeting, outreach all update.</p>
                {/* Mini UI */}
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-slate-400 font-medium">PMF Score</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs text-slate-400 line-through">48</span>
                      <span className="text-sm font-bold text-emerald-600">72</span>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden mb-3">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: "72%" }} />
                  </div>
                  <div className="space-y-1 text-[10px] text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <span className="text-emerald-500">&#x2713;</span>
                      <span>New feature ideas</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-emerald-500">&#x2713;</span>
                      <span>Better targeting</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-emerald-500">&#x2713;</span>
                      <span>Smarter outreach</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-3">~30 seconds</p>
              </div>
            </Section>
          </div>

          {/* Loop arrow + tagline */}
          <Section delay={400}>
            <div className="flex items-center justify-center mt-10 gap-3">
              <svg width="32" height="24" viewBox="0 0 32 24" fill="none" className="text-slate-300" style={{ animation: "arrow-pulse 2s ease-in-out infinite" }}>
                <path d="M28 8C28 4 24 2 20 2H12C8 2 4 4 4 8v4c0 4 4 6 8 6h8" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <path d="M22 14l4 4-4 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="text-slate-500 text-base">
                Keep building. Keep talking. <span className="text-slate-900 font-semibold">That&apos;s the whole game.</span>
              </p>
            </div>
          </Section>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 3: THE LOOP                                                */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section id="the-loop" className="bg-slate-950 px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <Section>
            <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-16">
              The only two things that matter.
            </h2>
          </Section>

          {/* Loop diagram */}
          <Section delay={100}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-16 mb-16">
              <div className="w-48 h-32 rounded-xl border border-slate-700 bg-slate-900 flex flex-col items-center justify-center">
                <span className="text-2xl mb-2">&#x1F528;</span>
                <span className="text-lg font-bold text-white">Build product</span>
              </div>
              {/* Arrows */}
              <div className="hidden sm:flex flex-col items-center gap-1">
                <svg width="80" height="16" viewBox="0 0 80 16" fill="none" style={{ animation: "arrow-pulse 2s ease-in-out infinite" }}>
                  <path d="M0 8h72" stroke="#475569" strokeWidth="1.5"/>
                  <path d="M68 4l6 4-6 4" stroke="#475569" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <svg width="80" height="16" viewBox="0 0 80 16" fill="none" style={{ animation: "arrow-pulse 2s ease-in-out infinite", animationDelay: "1s" }}>
                  <path d="M80 8H8" stroke="#475569" strokeWidth="1.5"/>
                  <path d="M12 12l-6-4 6-4" stroke="#475569" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="sm:hidden flex flex-col items-center gap-1">
                <svg width="16" height="24" viewBox="0 0 16 24" fill="none">
                  <path d="M8 0v18" stroke="#475569" strokeWidth="1.5"/>
                  <path d="M4 14l4 5 4-5" stroke="#475569" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="w-48 h-32 rounded-xl border border-slate-700 bg-slate-900 flex flex-col items-center justify-center">
                <span className="text-2xl mb-2">&#x1F5E3;</span>
                <span className="text-lg font-bold text-white">Talk to users</span>
              </div>
            </div>
          </Section>

          <Section delay={200}>
            <p className="text-center text-slate-400 text-lg leading-relaxed max-w-2xl mx-auto mb-14">
              This is the entire playbook. Build something. Put it in front
              of real people. Listen to what they say. Make it better. Repeat.
            </p>
          </Section>

          {/* Two columns */}
          <Section delay={250}>
            <p className="text-center text-lg text-slate-300 font-medium mb-10">
              Vibe &amp; Sell does both sides:
            </p>
          </Section>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-14">
            <Section delay={300}>
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Build Product</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  AI generates a working app from your description. You get an interactive prototype
                  you can share in 5 minutes. Plus a viability score, competitor analysis, and
                  go-to-market content.
                </p>
              </div>
            </Section>
            <Section delay={400}>
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Talk to Users</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Crustdata finds real people who have the problem you&apos;re solving.
                  With verified emails and context on why they match. Personalized
                  outreach ready to send.
                </p>
              </div>
            </Section>
          </div>

          <Section delay={500}>
            <div className="text-center mb-10">
              <p className="text-lg text-white font-medium mb-6">
                Then you have the conversation. Upload it. Everything gets smarter.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
                {[
                  "Your viability score updates.",
                  "Your targeting expands.",
                  "Your outreach rewrites itself.",
                  "Your app gets feature suggestions.",
                ].map((text, i) => (
                  <Section key={i} delay={550 + i * 150}>
                    <div className="rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-3">
                      <p className="text-xs text-slate-400 leading-relaxed">{text}</p>
                    </div>
                  </Section>
                ))}
              </div>
            </div>
          </Section>

          <Section delay={1100}>
            <p className="text-center text-xl sm:text-2xl text-slate-300 italic max-w-lg mx-auto leading-relaxed">
              After 5 conversations, you&apos;ll know more about your market
              than most people know after 5 months.
            </p>
          </Section>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 4: HOW WE FIND REAL PEOPLE                                 */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-white px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <Section>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 text-center mb-3">
              How we find real people for your idea
            </h2>
            <p className="text-center text-slate-500 mb-14 max-w-lg mx-auto">
              Not scraped lists. Not random leads. Real professionals matched to your product.
            </p>
          </Section>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Section delay={0}>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                <div className="text-3xl mb-4">&#x1F465;</div>
                <h3 className="font-semibold text-slate-900 mb-2">700M+ Professional Profiles</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  LinkedIn data, verified emails, job history, seniority levels across every industry and region.
                </p>
              </div>
            </Section>
            <Section delay={100}>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                <div className="text-3xl mb-4">&#x1F3E2;</div>
                <h3 className="font-semibold text-slate-900 mb-2">Real-Time Company Signals</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Headcount growth, funding rounds, hiring velocity, tech stack changes &mdash; reach companies at the right moment.
                </p>
              </div>
            </Section>
            <Section delay={200}>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                <div className="text-3xl mb-4">&#x1F50D;</div>
                <h3 className="font-semibold text-slate-900 mb-2">Web Search API</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Find relevant communities, subreddits, forums for your niche. Meet people where they already gather.
                </p>
              </div>
            </Section>
          </div>

          <Section delay={300}>
            <p className="text-center text-xs text-slate-400 mt-10">
              Powered by{" "}
              <a href="https://crustdata.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-slate-600 transition-colors">
                Crustdata
              </a>
              {" "}&middot;{" "}
              <a href="https://crustdata.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-slate-600 transition-colors">
                crustdata.com &#x2197;
              </a>
            </p>
          </Section>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 5: COMPARISON TABLE                                        */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-slate-50 px-4 py-20">
        <div className="max-w-3xl mx-auto">
          <Section>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 text-center mb-12">
              The other tools stop here.
            </h2>
          </Section>

          {/* Desktop table */}
          <Section delay={100}>
            <div className="hidden sm:block rounded-xl border border-slate-200 overflow-hidden bg-white">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left text-sm font-medium text-slate-500 px-5 py-3.5 w-[40%]"></th>
                    <th className="text-center text-sm font-medium text-slate-500 px-5 py-3.5">Lovable / Replit / V0</th>
                    <th className="text-center text-sm font-medium text-[#2E75B6] px-5 py-3.5 bg-[#2E75B6]/[0.04]">Vibe &amp; Sell</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row, i) => (
                    <tr key={i} className="border-b border-slate-100 last:border-0">
                      <td className="text-sm text-slate-700 px-5 py-3">{row.feature}</td>
                      <td className="text-center px-5 py-3">
                        {row.them ? (
                          <span className="text-emerald-500 text-lg">&#x2713;</span>
                        ) : (
                          <span className="text-slate-300 text-lg">&#x2717;</span>
                        )}
                      </td>
                      <td className="text-center px-5 py-3 bg-[#2E75B6]/[0.04]">
                        <span className="text-emerald-500 text-lg font-bold">&#x2713;</span>
                        {row.usDetail && (
                          <span className="block text-[11px] text-slate-400 mt-0.5">{row.usDetail}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t border-slate-200 bg-slate-50/50">
                    <td className="text-sm font-medium text-slate-700 px-5 py-3">Time to first outreach</td>
                    <td className="text-center px-5 py-3 text-sm text-slate-500">Days/weeks</td>
                    <td className="text-center px-5 py-3 text-sm font-semibold text-[#2E75B6] bg-[#2E75B6]/[0.04]">5 minutes</td>
                  </tr>
                  <tr className="border-t border-slate-100">
                    <td className="text-sm font-medium text-slate-700 px-5 py-3">Path to PMF</td>
                    <td className="text-center px-5 py-3 text-sm text-slate-500">You&apos;re on your own</td>
                    <td className="text-center px-5 py-3 text-sm font-semibold text-[#2E75B6] bg-[#2E75B6]/[0.04]">Built in</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>

          {/* Mobile cards */}
          <div className="sm:hidden space-y-3">
            <Section>
              {COMPARISON_ROWS.map((row, i) => (
                <div key={i} className={`flex items-center justify-between px-4 py-3 rounded-xl bg-white border ${row.us && !row.them ? "border-[#2E75B6]/20" : "border-slate-200"} mb-2`}>
                  <span className="text-sm text-slate-700 flex-1">{row.feature}</span>
                  <div className="flex gap-5">
                    {row.them ? (
                      <span className="text-emerald-500">&#x2713;</span>
                    ) : (
                      <span className="text-slate-300">&#x2717;</span>
                    )}
                    <span className="text-emerald-500 font-bold">&#x2713;</span>
                  </div>
                </div>
              ))}
              <div className="flex justify-end gap-5 px-4 text-[10px] text-slate-400">
                <span>Others</span>
                <span className="text-[#2E75B6] font-medium">V&amp;S</span>
              </div>
            </Section>
          </div>

          <Section delay={200}>
            <p className="text-center text-slate-600 text-base mt-10 max-w-xl mx-auto leading-relaxed">
              Other tools help you build. Nobody helps with what comes next &mdash; getting it in front
              of real people, hearing what they think, and making it better.{" "}
              <span className="text-slate-900 font-semibold">That&apos;s the whole game. That&apos;s what we do.</span>
            </p>
            <p className="text-center text-xs text-slate-400 mt-4 max-w-md mx-auto">
              We love Lovable, Replit, and V0. They&apos;re incredible at building. We pick up where they leave off.
            </p>
          </Section>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 6: WHAT YOU GET                                            */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section id="features" className="bg-white px-4 py-20 border-t border-slate-100">
        <div className="max-w-5xl mx-auto">
          <Section>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 text-center mb-3">
              Build product. Talk to users. All in one place.
            </h2>
            <p className="text-center text-slate-500 mb-14">From one sentence. In under 5 minutes.</p>
          </Section>

          {/* 5 feature cards — horizontal scroll on mobile */}
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-5 sm:overflow-visible">
            {/* Card 1: Working App */}
            <Section delay={0}>
              <div className="min-w-[200px] sm:min-w-0 bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all h-full">
                <div className="rounded-lg bg-slate-900 p-3 mb-4 flex flex-col items-center justify-center" style={{ aspectRatio: "3/4" }}>
                  <div className="text-[10px] font-medium text-white mb-1">ChurnGuard</div>
                  <div className="w-full space-y-1.5 mt-1">
                    <div className="h-1.5 bg-slate-700 rounded-full w-full" />
                    <div className="h-1.5 bg-slate-700 rounded-full w-3/4" />
                    <div className="h-6 bg-slate-700 rounded mt-2" />
                    <div className="h-6 bg-slate-700 rounded" />
                  </div>
                </div>
                <h3 className="font-semibold text-slate-900 mb-1 text-sm">Working App</h3>
                <p className="text-xs text-slate-500">Interactive React app you can share today.</p>
              </div>
            </Section>

            {/* Card 2: Market Score */}
            <Section delay={100}>
              <div className="min-w-[200px] sm:min-w-0 bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all h-full">
                <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 mb-4">
                  <div className="text-3xl font-bold text-slate-900 mb-2">74</div>
                  <div className="space-y-1.5">
                    {[
                      { label: "Market", w: "82%", color: "bg-emerald-500" },
                      { label: "Timing", w: "71%", color: "bg-emerald-500" },
                      { label: "Revenue", w: "68%", color: "bg-yellow-500" },
                      { label: "Moat", w: "58%", color: "bg-yellow-500" },
                    ].map((d) => (
                      <div key={d.label} className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 w-12">{d.label}</span>
                        <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden"><div className={`h-full ${d.color} rounded-full`} style={{ width: d.w }} /></div>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-emerald-600 font-medium mt-2">Scored like a YC partner.</p>
                </div>
                <h3 className="font-semibold text-slate-900 mb-1 text-sm">Market Score</h3>
                <p className="text-xs text-slate-500">Competitors, risks, TAM analysis.</p>
              </div>
            </Section>

            {/* Card 3: Real People */}
            <Section delay={200}>
              <div className="min-w-[200px] sm:min-w-0 bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all h-full">
                <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 mb-4 space-y-2">
                  {[
                    { initial: "J", name: "James L.", role: "VP Customer Success" },
                    { initial: "S", name: "Sarah K.", role: "Head of RevOps" },
                    { initial: "A", name: "Amit P.", role: "CS Director" },
                    { initial: "R", name: "Rachel T.", role: "Churn Analyst" },
                  ].map((p) => (
                    <div key={p.initial} className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#2E75B6]/10 text-[#2E75B6] flex items-center justify-center text-[10px] font-medium shrink-0">{p.initial}</div>
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-slate-900 truncate">{p.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{p.role}</div>
                      </div>
                    </div>
                  ))}
                  <div className="text-[10px] text-slate-400 pt-1">+ 80 more with verified emails</div>
                </div>
                <h3 className="font-semibold text-slate-900 mb-1 text-sm">Real People</h3>
                <p className="text-xs text-slate-500">80+ people grouped by audience type.</p>
              </div>
            </Section>

            {/* Card 4: Launch Plan */}
            <Section delay={300}>
              <div className="min-w-[200px] sm:min-w-0 bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all h-full">
                <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 mb-4 space-y-2">
                  {[
                    { icon: "\uD83D\uDD17", platform: "LinkedIn Post", desc: "Launch announcement" },
                    { icon: "\uD83D\uDC26", platform: "Twitter Thread", desc: "5-tweet thread" },
                    { icon: "\uD83E\uDD16", platform: "Reddit Post", desc: "r/SaaS feedback" },
                    { icon: "\u2709\uFE0F", platform: "Cold Emails", desc: "Personalized per contact" },
                  ].map((p) => (
                    <div key={p.platform} className="flex items-center gap-2">
                      <span className="text-sm">{p.icon}</span>
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-slate-900">{p.platform}</div>
                        <div className="text-[10px] text-slate-400">{p.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <h3 className="font-semibold text-slate-900 mb-1 text-sm">Launch Plan</h3>
                <p className="text-xs text-slate-500">Posts, DMs, emails ready to send on day one.</p>
              </div>
            </Section>

            {/* Card 5: PMF Tracker — NEW badge */}
            <Section delay={400}>
              <div className="min-w-[200px] sm:min-w-0 bg-white rounded-xl border-2 border-[#2E75B6]/20 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all h-full relative">
                <span className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-wider text-[#2E75B6] bg-[#2E75B6]/10 px-2 py-0.5 rounded-full">New</span>
                <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 mb-4">
                  <div className="text-[10px] text-slate-400 mb-1 font-medium">PMF Score</div>
                  <div className="text-3xl font-bold text-slate-900 mb-2">72</div>
                  <div className="space-y-1.5">
                    {[
                      { label: "Problem", w: "85%", color: "bg-emerald-500" },
                      { label: "Solution", w: "72%", color: "bg-emerald-500" },
                      { label: "Pay", w: "58%", color: "bg-yellow-500" },
                      { label: "Referral", w: "65%", color: "bg-yellow-500" },
                    ].map((d) => (
                      <div key={d.label} className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 w-12">{d.label}</span>
                        <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden"><div className={`h-full ${d.color} rounded-full`} style={{ width: d.w }} /></div>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-emerald-600 font-medium mt-2">Based on 5 conversations</p>
                </div>
                <h3 className="font-semibold text-slate-900 mb-1 text-sm">PMF Tracker</h3>
                <p className="text-xs text-slate-500">Upload calls. Get real signal. Track PMF.</p>
              </div>
            </Section>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 7: HOW IT WORKS                                            */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="bg-slate-50 px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <Section>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 text-center mb-16">
              How it works
            </h2>
          </Section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16 relative">
            {/* Step 1 */}
            <Section delay={0}>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#2E75B6] text-white flex items-center justify-center text-sm font-bold shrink-0">1</div>
                  <h3 className="text-xl font-semibold text-slate-900">Describe your idea</h3>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed mb-5 ml-[52px]">
                  Type what you want to build in one sentence. An app, a tool, a dashboard &mdash; anything.
                </p>
                <div className="ml-[52px] rounded-xl border border-slate-200 bg-white p-4 max-w-xs">
                  <div className="h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center px-3">
                    <span className="text-xs text-slate-400">Churn prediction tool for B2B SaaS...</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono mt-2">~10 seconds</p>
                </div>
              </div>
            </Section>

            {/* Step 2 */}
            <Section delay={150}>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#2E75B6] text-white flex items-center justify-center text-sm font-bold shrink-0">2</div>
                  <h3 className="text-xl font-semibold text-slate-900">We build it + find your people</h3>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed mb-5 ml-[52px]">
                  AI generates a working app. Crustdata finds 80+ real people who have the problem you described.
                </p>
                <div className="ml-[52px] rounded-xl border border-slate-200 bg-white p-4 max-w-xs">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-500 text-xs">&#x2713;</span>
                      <span className="text-xs text-slate-600">Build App</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-500 text-xs">&#x2713;</span>
                      <span className="text-xs text-slate-600">Score Viability</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-500 text-xs">&#x2713;</span>
                      <span className="text-xs text-slate-600">Find 83 People</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 border border-[#2E75B6] border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs text-slate-900 font-medium">Writing outreach...</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono mt-3">~4 minutes</p>
                </div>
              </div>
            </Section>

            {/* Step 3 */}
            <Section delay={300}>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#2E75B6] text-white flex items-center justify-center text-sm font-bold shrink-0">3</div>
                  <h3 className="text-xl font-semibold text-slate-900">You have conversations</h3>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed mb-5 ml-[52px]">
                  Reach out. Have real calls. Ask what they actually need. Listen.
                </p>
                <div className="ml-[52px] rounded-xl border border-slate-200 bg-white p-4 max-w-xs">
                  <div className="rounded-lg bg-blue-50 border border-blue-100 p-3 mb-2">
                    <p className="text-[11px] text-blue-800 italic leading-relaxed">
                      &ldquo;We lose 15% of accounts quarterly and have no early warning system.&rdquo;
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center">
                      <span className="text-[8px] text-emerald-600 font-bold">+</span>
                    </div>
                    <span className="text-[10px] text-slate-500">Problem validated</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono mt-2">That&apos;s on you.</p>
                </div>
              </div>
            </Section>

            {/* Step 4 */}
            <Section delay={450}>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#2E75B6] text-white flex items-center justify-center text-sm font-bold shrink-0">4</div>
                  <h3 className="text-xl font-semibold text-slate-900">Everything gets smarter</h3>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed mb-5 ml-[52px]">
                  Upload the conversation. Your score, targeting, outreach &mdash; all update based on real signal.
                </p>
                <div className="ml-[52px] rounded-xl border border-slate-200 bg-white p-4 max-w-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400">PMF Score</span>
                    <span className="text-sm font-bold text-emerald-600">72/100</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: "72%" }} />
                  </div>
                  <div className="text-[10px] text-slate-500 space-y-0.5">
                    <div>&#x2713; Problem Validation: 85</div>
                    <div>&#x2713; Solution Interest: 72</div>
                    <div>&#x2713; Willingness to Pay: 58</div>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono mt-2">~30 seconds</p>
                </div>
              </div>
            </Section>
          </div>

          <Section delay={600}>
            <div className="text-center mt-14">
              <div className="inline-flex items-center gap-2 text-slate-500 text-base">
                <svg width="20" height="16" viewBox="0 0 20 16" fill="none" style={{ animation: "arrow-pulse 2s ease-in-out infinite" }}>
                  <path d="M16 4C16 2 14 1 12 1H8C6 1 4 2 4 4v3c0 2 2 3 4 3h4" stroke="currentColor" strokeWidth="1.5" fill="none" />
                  <path d="M13 7l3 3-3 3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Then do it again.</span>
              </div>
            </div>
          </Section>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 8: LIVE COUNTER                                            */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-slate-950 px-4 py-5">
        <div className="flex items-center justify-center gap-3 text-sm text-slate-400">
          <span className="w-2 h-2 rounded-full bg-[#2E75B6] animate-pulse" />
          <span className="font-mono text-white font-medium">
            <CountUp target={totalApps} />
          </span>
          <span>apps built and counting</span>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 9: FOR SALES TEAMS                                         */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-white px-4 py-20">
        <Section>
          <div className="max-w-xl mx-auto">
            <div className="rounded-xl border border-slate-200 p-6 sm:p-8 text-center bg-slate-50">
              <p className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-3">Also</p>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">
                Instant pitch pages for sales teams.
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                Type &ldquo;Stripe&rdquo; and get a personalized pitch page with real company data
                and 10 decision-makers in 2 minutes.
              </p>
              <button
                onClick={() => router.push("/create?mode=seller")}
                className="px-5 py-2.5 text-sm font-medium text-white bg-[#2E75B6] hover:bg-[#245f99] rounded-lg transition-colors"
              >
                Create a Pitch Page &rarr;
              </button>
            </div>
          </div>
        </Section>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 10: FINAL CTA                                              */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className="px-4 py-20 bg-slate-950">
        <Section>
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              Build product. Talk to users.
            </h2>
            <p className="text-2xl sm:text-3xl font-bold text-white mb-10">
              Start now.
            </p>

            <HeroInput dark />

            <p className="mt-8 text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              Side project. Startup. Internal tool. It doesn&apos;t matter.
              If someone needs what you&apos;re building, we&apos;ll help you find them.
            </p>
          </div>
        </Section>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 11: FOOTER                                                 */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <footer className="bg-slate-950 border-t border-slate-800 px-6 py-5">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-col items-center sm:items-start gap-1">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              <span>Vibe &amp; Sell &middot; A{" "}
                <a href="https://crustdata.com" target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-white transition-colors">Crustdata</a>{" "}
                Product
              </span>
            </div>
            <span className="text-xs text-slate-600">Real people. Real companies. Real signals.</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-600">
            <a href="https://docs.crustdata.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-400 transition-colors">API Docs &#x2197;</a>
            <a href="https://github.com/crustdata" target="_blank" rel="noopener noreferrer" className="hover:text-slate-400 transition-colors">GitHub &#x2197;</a>
            <a href="https://twitter.com/craborat" target="_blank" rel="noopener noreferrer" className="hover:text-slate-400 transition-colors">Twitter &#x2197;</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
