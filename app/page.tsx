"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// ─── Placeholder Ideas ────────────────────────────────────────────────────────

const PLACEHOLDER_IDEAS = [
  "Dating app for Farsi speakers in NYC",
  "AI tutor for high school chemistry",
  "Expense tracker for freelance designers",
  "Apartment finder for dog owners in Brooklyn",
];

// ─── Intersection Observer Hook ───────────────────────────────────────────────

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

// ─── Hero Input Component ─────────────────────────────────────────────────────

function HeroInput({ dark }: { dark?: boolean }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [typing, setTyping] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (value) return; // Don't animate if user is typing
    const target = PLACEHOLDER_IDEAS[placeholderIdx];
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting) {
      if (typing.length < target.length) {
        timeout = setTimeout(() => setTyping(target.slice(0, typing.length + 1)), 60);
      } else {
        timeout = setTimeout(() => setIsDeleting(true), 2200);
      }
    } else {
      if (typing.length > 0) {
        timeout = setTimeout(() => setTyping(typing.slice(0, -1)), 30);
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
    <div className="relative w-full max-w-xl mx-auto">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
        placeholder={value ? "" : typing + "|"}
        className={`w-full h-14 pl-5 pr-14 rounded-xl text-base transition-all outline-none ${
          dark
            ? "bg-white/10 border border-white/20 text-white placeholder-white/40 focus:border-[#2E75B6] focus:ring-2 focus:ring-[#2E75B6]/40"
            : "bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#2E75B6] focus:ring-2 focus:ring-[#2E75B6]/30 shadow-lg shadow-black/5"
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

// ─── Count-Up Animation ───────────────────────────────────────────────────────

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

// ─── Section Wrapper with Fade-In ─────────────────────────────────────────────

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

// ─── Comparison Table ─────────────────────────────────────────────────────────

const COMPETITORS = [
  { name: "Lovable", build: true, customers: false },
  { name: "Replit", build: true, customers: false },
  { name: "V0", build: true, customers: false },
  { name: "Cursor", build: true, customers: false },
  { name: "Claude Code", build: true, customers: false },
  { name: "Vibe & Sell", build: true, customers: true },
];

// ─── Main Landing Page ────────────────────────────────────────────────────────

export default function LandingPage() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Live counter from localStorage
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
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes slow-bounce {
          0%, 100% { transform: translateY(0) translateX(-50%); }
          50% { transform: translateY(8px) translateX(-50%); }
        }
      `}</style>

      {/* ─── Sticky Nav ──────────────────────────────────────────────────────── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-6 transition-all duration-300 ${
          scrolled
            ? "bg-slate-950/80 backdrop-blur-xl border-b border-white/10"
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
          <a href="#features" className="text-sm text-slate-400 hover:text-white transition-colors hidden sm:block">Features</a>
          <a href="#how-it-works" className="text-sm text-slate-400 hover:text-white transition-colors hidden sm:block">How It Works</a>
          <a href="https://crustdata.com" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-white transition-colors hidden sm:block">Crustdata &nearr;</a>
          <button
            onClick={() => router.push("/create")}
            className="px-4 py-2 text-sm font-medium text-white bg-[#2E75B6] hover:bg-[#245f99] rounded-lg transition-colors"
          >
            Launch Your Idea &rarr;
          </button>
        </div>
      </nav>

      {/* ─── SECTION 1: HERO ─────────────────────────────────────────────────── */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-14"
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #0f172a 100%)",
          backgroundSize: "200% 200%",
          animation: "gradient-shift 15s ease infinite",
        }}
      >
        {/* Subtle grain overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")", backgroundRepeat: "repeat" }} />

        <div className="relative z-10 text-center max-w-2xl mx-auto">
          <h1
            className="text-6xl sm:text-7xl md:text-8xl font-bold mb-3 bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #818cf8 100%)" }}
          >
            5 minutes.
          </h1>
          <p className="text-2xl sm:text-3xl font-semibold text-white mb-6">
            From idea to first customer.
          </p>
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed mb-10 max-w-lg mx-auto">
            Vibe &amp; Sell builds your app, analyzes your market,
            finds real people who need it, and writes your
            outreach &mdash; before your coffee gets cold.
          </p>

          <HeroInput dark />

          <p className="mt-4 text-sm text-slate-500">
            No signup. No credit card. Powered by{" "}
            <a href="https://crustdata.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 underline underline-offset-2 hover:text-white transition-colors">
              Crustdata&apos;s 700M+ professional profiles
            </a>.
          </p>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-8 left-1/2 flex flex-col items-center gap-2 cursor-pointer"
          style={{ animation: "slow-bounce 2.5s ease-in-out infinite" }}
          onClick={() => document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })}
        >
          <span className="text-xs text-slate-500">See how it works</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><path d="m6 9 6 6 6-6"/></svg>
        </div>
      </section>

      {/* ─── SECTION 2: THE DEMO ─────────────────────────────────────────────── */}
      <section id="demo" className="bg-slate-950 px-4 pb-20 pt-4">
        <Section>
          <div className="max-w-4xl mx-auto" style={{ perspective: "1200px" }}>
            <div
              className="rounded-xl border border-slate-700/50 bg-slate-900 overflow-hidden shadow-2xl shadow-black/50"
              style={{ transform: "rotateX(2deg)" }}
            >
              {/* Browser Chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700/50 bg-slate-800/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                </div>
                <div className="flex-1 ml-3">
                  <div className="bg-slate-700/50 rounded-md px-3 py-1 text-xs text-slate-400 max-w-sm">
                    vibesell.app/project/farsi-connect
                  </div>
                </div>
              </div>

              {/* App Content Mockup */}
              <div className="p-4 sm:p-6">
                {/* Tab bar */}
                <div className="flex gap-1 mb-5 border-b border-slate-700/30">
                  <div className="px-3 py-2 text-xs font-medium text-[#2E75B6] border-b-2 border-[#2E75B6]">Your App</div>
                  <div className="px-3 py-2 text-xs font-medium text-slate-500">People to Reach</div>
                  <div className="px-3 py-2 text-xs font-medium text-slate-500">Go-to-Market</div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* App Preview */}
                  <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-3">
                    <div className="text-center mb-3">
                      <div className="text-2xl mb-1">&#x1F496;</div>
                      <div className="text-sm font-semibold text-white">FarsiMatch</div>
                      <div className="text-[10px] text-slate-400">Find your Farsi-speaking match</div>
                    </div>
                    {/* Mock profile card */}
                    <div className="rounded-lg bg-slate-700/40 p-2.5 mb-2">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500" />
                        <div>
                          <div className="text-xs font-medium text-white">Sara, 28</div>
                          <div className="text-[10px] text-slate-400">Upper East Side</div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <div className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">Farsi</div>
                        <div className="text-[10px] px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300">Art</div>
                        <div className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">NYC</div>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-center">
                      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 text-xs">&times;</div>
                      <div className="w-8 h-8 rounded-full bg-pink-500/80 flex items-center justify-center text-white text-xs">&#x2764;</div>
                    </div>
                  </div>

                  {/* Viability Score */}
                  <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-3">
                    <div className="text-xs text-slate-400 mb-2 font-medium">Market Score</div>
                    <div className="text-3xl font-bold text-white mb-3">74<span className="text-base text-slate-500">/100</span></div>
                    <div className="space-y-2">
                      {[
                        { label: "Market", score: 82, color: "#10B981" },
                        { label: "Timing", score: 71, color: "#10B981" },
                        { label: "Revenue", score: 68, color: "#EAB308" },
                        { label: "Moat", score: 58, color: "#EAB308" },
                        { label: "Feasibility", score: 79, color: "#10B981" },
                      ].map((d) => (
                        <div key={d.label} className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 w-14">{d.label}</span>
                          <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${d.score}%`, backgroundColor: d.color }} />
                          </div>
                          <span className="text-[10px] text-slate-400 w-5 text-right">{d.score}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 text-[10px] text-emerald-400 font-medium">Promising niche with low competition</div>
                  </div>

                  {/* People */}
                  <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-3">
                    <div className="text-xs text-slate-400 mb-2 font-medium">People to Reach</div>
                    <div className="space-y-2.5">
                      {[
                        { name: "Maryam K.", role: "Community Lead", company: "Persian Cultural Center", tag: "Champion" },
                        { name: "Ali R.", role: "Ex-Hinge PM", company: "Dating Advisor", tag: "Advisor" },
                        { name: "Sara T.", role: "Angel Investor", company: "NYC Tech", tag: "Investor" },
                      ].map((p) => (
                        <div key={p.name} className="flex items-start gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#2E75B6]/30 flex items-center justify-center text-[9px] text-[#60a5fa] font-medium shrink-0 mt-0.5">
                            {p.name.charAt(0)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-medium text-white">{p.name}</div>
                            <div className="text-[10px] text-slate-400 truncate">{p.role} @ {p.company}</div>
                          </div>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#2E75B6]/20 text-[#60a5fa] shrink-0">{p.tag}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-700/30">
                      <div className="text-[10px] text-slate-400 mb-1">+ 97 more contacts</div>
                      <div className="flex gap-1">
                        <div className="text-[10px] px-2 py-1 rounded bg-[#2E75B6] text-white font-medium">Write Email</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Email Preview */}
                <div className="mt-4 rounded-lg border border-slate-700/50 bg-slate-800/50 p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] text-slate-500">To: maryam@persianculture.org</span>
                    <span className="text-[10px] text-slate-500">Subject: Quick question about FarsiMatch</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Hey Maryam, I noticed you run the Persian Cultural Center&apos;s community events in NYC.
                    I&apos;m building FarsiMatch &mdash; a dating app specifically for Farsi speakers &mdash; and I&apos;d love
                    your perspective on what this community actually needs...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Section>

        <Section delay={200}>
          <p className="text-center text-sm sm:text-base text-slate-400 mt-8 max-w-xl mx-auto">
            This took <span className="text-white font-semibold font-mono">4 minutes and 12 seconds</span>.
            Every person is real. Every email is ready to send.
          </p>
        </Section>
      </section>

      {/* ─── SECTION 3: THE PROBLEM ──────────────────────────────────────────── */}
      <section className="bg-white px-4 py-20">
        <Section>
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-10">
              The other tools stop here &darr;
            </h2>

            {/* Desktop table */}
            <div className="hidden sm:block rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left text-sm font-medium text-slate-500 px-5 py-3 w-1/3"></th>
                    <th className="text-center text-sm font-medium text-slate-500 px-5 py-3">Build an app</th>
                    <th className="text-center text-sm font-medium text-slate-500 px-5 py-3">Get customers</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPETITORS.map((c) => {
                    const isUs = c.name === "Vibe & Sell";
                    return (
                      <tr
                        key={c.name}
                        className={`border-b border-slate-100 last:border-0 ${isUs ? "bg-[#2E75B6]/5" : ""}`}
                      >
                        <td className={`px-5 py-3 text-sm ${isUs ? "font-bold text-[#2E75B6]" : "text-slate-700"}`}>
                          {isUs && <span className="mr-1">&#x26A1;</span>}
                          {c.name}
                        </td>
                        <td className="px-5 py-3 text-center text-lg">
                          <span className="text-emerald-500">&#x2713;</span>
                        </td>
                        <td className="px-5 py-3 text-center text-lg">
                          {c.customers ? (
                            <span className="text-emerald-500 font-bold">&#x2713;</span>
                          ) : (
                            <span className="text-slate-300">&#x2717;</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden space-y-2">
              {COMPETITORS.map((c) => {
                const isUs = c.name === "Vibe & Sell";
                return (
                  <div key={c.name} className={`flex items-center justify-between px-4 py-3 rounded-xl ${isUs ? "bg-[#2E75B6]/5 border border-[#2E75B6]/20" : "bg-slate-50"}`}>
                    <span className={`text-sm ${isUs ? "font-bold text-[#2E75B6]" : "text-slate-700"}`}>
                      {isUs && "&#x26A1; "}{c.name}
                    </span>
                    <div className="flex gap-6">
                      <span className="text-emerald-500">&#x2713;</span>
                      {c.customers ? (
                        <span className="text-emerald-500 font-bold">&#x2713;</span>
                      ) : (
                        <span className="text-slate-300">&#x2717;</span>
                      )}
                    </div>
                  </div>
                );
              })}
              <div className="flex justify-end gap-6 px-4 text-[10px] text-slate-400 -mt-1">
                <span>Build</span>
                <span>Customers</span>
              </div>
            </div>

            <p className="text-center text-slate-500 text-base mt-8 max-w-md mx-auto">
              Building is solved. The hard part is what comes after.{" "}
              <span className="text-slate-900 font-semibold">That&apos;s where we start.</span>
            </p>
            <p className="text-center text-xs text-slate-400 mt-3 max-w-lg mx-auto">
              Vibe &amp; Sell searches{" "}
              <a href="https://crustdata.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-slate-600 transition-colors">
                Crustdata&apos;s database of 700M+ professionals
              </a>{" "}
              to find people who actually need what you&apos;re building &mdash; not random contacts, but the right ones.
            </p>
          </div>
        </Section>
      </section>

      {/* ─── SECTION 4: WHAT YOU GET ─────────────────────────────────────────── */}
      <section id="features" className="bg-slate-50 px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <Section>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-3">
              Everything you need to go from idea to traction.
            </h2>
            <p className="text-center text-slate-500 mb-12">From one sentence. In under 5 minutes.</p>
          </Section>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Working App */}
            <Section delay={0}>
              <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all h-full">
                <div className="rounded-lg bg-slate-900 p-3 mb-4 aspect-[3/4] flex flex-col items-center justify-center">
                  <div className="text-3xl mb-1">&#x1F4F1;</div>
                  <div className="text-xs font-medium text-white mb-1">FarsiMatch</div>
                  <div className="w-full space-y-1.5 mt-2">
                    <div className="h-1.5 bg-slate-700 rounded-full w-full" />
                    <div className="h-1.5 bg-slate-700 rounded-full w-3/4" />
                    <div className="flex gap-1 mt-2 justify-center">
                      <div className="w-5 h-5 rounded-full bg-slate-700" />
                      <div className="w-5 h-5 rounded-full bg-pink-500/60" />
                    </div>
                  </div>
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">Working App</h3>
                <p className="text-sm text-slate-500">Interactive React app you can share today</p>
              </div>
            </Section>

            {/* Card 2: Market Score */}
            <Section delay={100}>
              <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all h-full">
                <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 mb-4">
                  <div className="text-4xl font-bold text-slate-900 mb-2">74</div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 w-12">Market</span>
                      <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width: "82%" }} /></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 w-12">Timing</span>
                      <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width: "71%" }} /></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 w-12">Revenue</span>
                      <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-yellow-500 rounded-full" style={{ width: "68%" }} /></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 w-12">Moat</span>
                      <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-yellow-500 rounded-full" style={{ width: "58%" }} /></div>
                    </div>
                  </div>
                  <p className="text-[10px] text-emerald-600 font-medium mt-2">Promising niche with low competition</p>
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">Market Score</h3>
                <p className="text-sm text-slate-500">Competitors, risks, TAM analysis</p>
              </div>
            </Section>

            {/* Card 3: Real People */}
            <Section delay={200}>
              <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all h-full">
                <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 mb-4 space-y-2">
                  {[
                    { initial: "M", name: "Maryam K.", role: "Community Lead" },
                    { initial: "A", name: "Ali R.", role: "Ex-Hinge PM" },
                    { initial: "S", name: "Sara T.", role: "Angel Investor" },
                    { initial: "D", name: "Dariush M.", role: "Podcast Host" },
                  ].map((p) => (
                    <div key={p.initial} className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#2E75B6]/10 text-[#2E75B6] flex items-center justify-center text-[10px] font-medium shrink-0">{p.initial}</div>
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-slate-900 truncate">{p.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{p.role}</div>
                      </div>
                    </div>
                  ))}
                  <div className="text-[10px] text-slate-400 pt-1">+ 96 more with verified emails</div>
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">Real People</h3>
                <p className="text-sm text-slate-500">With verified emails from 700M+ profiles</p>
              </div>
            </Section>

            {/* Card 4: Launch Plan */}
            <Section delay={300}>
              <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all h-full">
                <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 mb-4 space-y-2">
                  {[
                    { icon: "\uD83D\uDD17", platform: "LinkedIn Post", desc: "Launch announcement" },
                    { icon: "\uD83D\uDC26", platform: "Twitter Thread", desc: "5-tweet thread" },
                    { icon: "\uD83E\uDD16", platform: "Reddit Post", desc: "r/startups feedback" },
                    { icon: "\u2709\uFE0F", platform: "Cold DM", desc: "Direct outreach" },
                  ].map((p) => (
                    <div key={p.platform} className="flex items-center gap-2">
                      <span className="text-sm">{p.icon}</span>
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-slate-900">{p.platform}</div>
                        <div className="text-[10px] text-slate-400">{p.desc}</div>
                      </div>
                    </div>
                  ))}
                  <div className="text-[10px] text-slate-400 pt-1">+ personalized emails per audience</div>
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">Launch Plan</h3>
                <p className="text-sm text-slate-500">Personalized per audience group</p>
              </div>
            </Section>
          </div>
        </div>
      </section>

      {/* ─── SECTION 4.5: HOW WE FIND REAL PEOPLE ──────────────────────────── */}
      <section className="bg-white px-4 py-20 border-t border-slate-100">
        <div className="max-w-4xl mx-auto">
          <Section>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-3">
              How we find real people
            </h2>
            <p className="text-center text-slate-500 mb-12 max-w-lg mx-auto">
              Not scraped lists. Not random leads. Real professionals matched to your product, powered by{" "}
              <a href="https://crustdata.com" target="_blank" rel="noopener noreferrer" className="text-[#2E75B6] underline underline-offset-2 hover:text-[#245f99] transition-colors">
                Crustdata
              </a>.
            </p>
          </Section>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Section delay={0}>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
                <div className="text-3xl mb-3">&#x1F465;</div>
                <h3 className="font-semibold text-slate-900 mb-2">700M+ Professional Profiles</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Names, titles, companies, seniority levels, and verified business emails across every industry and region.
                </p>
              </div>
            </Section>

            <Section delay={100}>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
                <div className="text-3xl mb-3">&#x1F4C8;</div>
                <h3 className="font-semibold text-slate-900 mb-2">Real-Time Company Signals</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Headcount growth, funding rounds, job openings, and tech stack changes &mdash; so you reach companies at the right moment.
                </p>
              </div>
            </Section>

            <Section delay={200}>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
                <div className="text-3xl mb-3">&#x1F50D;</div>
                <h3 className="font-semibold text-slate-900 mb-2">Smart Filtering</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  AI builds the perfect search query from your app&apos;s value proposition &mdash; matching industry, role, seniority, and company size.
                </p>
              </div>
            </Section>
          </div>

          <Section delay={300}>
            <p className="text-center text-xs text-slate-400 mt-8">
              Powered by{" "}
              <a href="https://crustdata.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-slate-600 transition-colors">
                Crustdata
              </a>{" "}
              &mdash; the data layer behind top GTM teams.
            </p>
          </Section>
        </div>
      </section>

      {/* ─── SECTION 5: HOW IT WORKS ─────────────────────────────────────────── */}
      <section id="how-it-works" className="bg-slate-50 px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <Section>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-14">
              How it works
            </h2>
          </Section>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line (desktop only) */}
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px bg-slate-200" />

            {/* Step 1 */}
            <Section delay={0}>
              <div className="text-center">
                <div className="w-10 h-10 rounded-full bg-[#2E75B6] text-white flex items-center justify-center text-sm font-bold mx-auto mb-4 relative z-10">1</div>
                <h3 className="font-semibold text-slate-900 mb-2">Describe</h3>
                <p className="text-sm text-slate-500 mb-5">
                  Type what you want to build in one sentence.
                </p>
                {/* Mini input mockup */}
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 mx-auto max-w-[220px]">
                  <div className="h-8 rounded bg-white border border-slate-200 flex items-center px-2">
                    <span className="text-[10px] text-slate-400">Dating app for Farsi speakers...</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-3">~10 seconds</p>
              </div>
            </Section>

            {/* Step 2 */}
            <Section delay={150}>
              <div className="text-center">
                <div className="w-10 h-10 rounded-full bg-[#2E75B6] text-white flex items-center justify-center text-sm font-bold mx-auto mb-4 relative z-10">2</div>
                <h3 className="font-semibold text-slate-900 mb-2">Watch</h3>
                <p className="text-sm text-slate-500 mb-5">
                  AI builds a working app, scores your market, and finds who needs it.
                </p>
                {/* Mini loading mockup */}
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 mx-auto max-w-[220px]">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-500 text-xs">&#x2713;</span>
                      <span className="text-[10px] text-slate-600">Build App</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-500 text-xs">&#x2713;</span>
                      <span className="text-[10px] text-slate-600">Analyze Viability</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 border border-[#2E75B6] border-t-transparent rounded-full animate-spin" />
                      <span className="text-[10px] text-slate-900 font-medium">Finding customers...</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full border border-slate-300" />
                      <span className="text-[10px] text-slate-400">Go-to-Market Plan</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-3">~4 minutes</p>
              </div>
            </Section>

            {/* Step 3 */}
            <Section delay={300}>
              <div className="text-center">
                <div className="w-10 h-10 rounded-full bg-[#2E75B6] text-white flex items-center justify-center text-sm font-bold mx-auto mb-4 relative z-10">3</div>
                <h3 className="font-semibold text-slate-900 mb-2">Reach out</h3>
                <p className="text-sm text-slate-500 mb-5">
                  Get real people who need it &mdash; with emails ready to send.
                </p>
                {/* Mini results mockup */}
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 mx-auto max-w-[220px]">
                  <div className="space-y-1.5">
                    {["Maryam K.", "Ali R.", "Sara T."].map((name) => (
                      <div key={name} className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-600">{name}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#2E75B6]/10 text-[#2E75B6]">Send</span>
                      </div>
                    ))}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-2">+ 97 more contacts</div>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-3">~30 seconds</p>
              </div>
            </Section>
          </div>
        </div>
      </section>

      {/* ─── SECTION 6: LIVE COUNTER ─────────────────────────────────────────── */}
      <section className="bg-slate-950 px-4 py-5">
        <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
          <span className="w-2 h-2 rounded-full bg-[#2E75B6] animate-pulse" />
          <span className="font-mono text-white font-medium">
            <CountUp target={totalApps} />
          </span>
          <span>apps built and counting</span>
        </div>
      </section>

      {/* ─── SECTION 7: FOR SALES TEAMS ──────────────────────────────────────── */}
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

      {/* ─── SECTION 8: FINAL CTA ────────────────────────────────────────────── */}
      <section
        className="px-4 py-20"
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)" }}
      >
        <Section>
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8">
              Your next idea is 5 minutes from its first customers.
            </h2>

            <HeroInput dark />

            <div className="flex items-center justify-center gap-4 mt-6 text-xs text-slate-500">
              <span>No signup</span>
              <span className="w-1 h-1 rounded-full bg-slate-700" />
              <span>No credit card</span>
              <span className="w-1 h-1 rounded-full bg-slate-700" />
              <span>Built on 700M+ professional profiles</span>
            </div>
          </div>
        </Section>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="bg-slate-950 px-6 py-5">
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
            <a href="https://crustdata.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-400 transition-colors">Crustdata</a>
            <a href="https://docs.crustdata.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-400 transition-colors">API Docs</a>
            <a href="https://github.com/crustdata" target="_blank" rel="noopener noreferrer" className="hover:text-slate-400 transition-colors">GitHub</a>
            <a href="https://twitter.com/craborat" target="_blank" rel="noopener noreferrer" className="hover:text-slate-400 transition-colors">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
