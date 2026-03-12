import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/shared/Button";

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible] as const;
}

function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      } ${className}`}
    >
      {children}
    </div>
  );
}

/* ─── Logo SVG ─── */
function BranchIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="white">
      <circle cx="6" cy="10" r="3" />
      <circle cx="14" cy="5" r="2.5" />
      <circle cx="14" cy="15" r="2.5" />
      <line x1="9" y1="10" x2="12" y2="6" stroke="white" strokeWidth="1.5" />
      <line x1="9" y1="10" x2="12" y2="14" stroke="white" strokeWidth="1.5" />
    </svg>
  );
}

/* ─── Marquee ─── */
const MARQUEE_ITEMS = [
  "Real-time Collaboration", "Branch Ideas Like Git", "AI-Powered Expansion",
  "Vote on the Best Ideas", "Merge & Synthesize", "AES-256 Encrypted",
];

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════ */
export const LandingPage = () => {
  const doubled = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

  return (
    <>
      {/* Inject keyframes + exact font classes into head */}
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes nodeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes livePulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
        .node-in { animation: nodeIn 0.5s ease forwards; opacity: 0; }
        .live-pulse { animation: livePulse 1.4s infinite; }
        .marquee-track { animation: marquee 20s linear infinite; }

        /* ── exact border style from HTML ── */
        .border-exact { border: 1.5px solid #13131A; }
        .border-exact-r { border-right: 1.5px solid #13131A; }
        .border-exact-b { border-bottom: 1.5px solid #13131A; }
        .border-exact-t { border-top: 1.5px solid #13131A; }
      `}</style>

      <div className="bg-[#f5f5f0] text-ink overflow-x-hidden min-h-screen">

        {/* ══════════ NAVBAR ══════════ */}
        <nav
          className="sticky top-0 z-50 bg-[#f5f5f0] border-exact-b flex items-center justify-between"
          style={{ padding: "18px 48px", borderBottom: "1.5px solid #13131A" }}
        >
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center rounded flex-shrink-0"
              style={{ width: 36, height: 36, background: "#3a5bff", border: "2px solid #13131A", borderRadius: 4 }}
            >
              <BranchIcon size={20} />
            </div>
            <div>
              <p className="font-display font-extrabold uppercase leading-none" style={{ fontSize: 15, letterSpacing: "0.05em" }}>
                IdeaLab
              </p>
              <p className="font-body text-[10px] text-[#888]" style={{ letterSpacing: "0.02em", marginTop: 2 }}>
                Real-time Collaborative Brainstorming
              </p>
            </div>
          </div>

          {/* Nav links */}
          <div className="flex items-center gap-2">
            {["#how", "#features"].map((href, i) => (
              <a
                key={href}
                href={href}
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
                }}
                className="font-display font-bold uppercase text-ink hover:bg-ink hover:text-[#f5f5f0] transition-all duration-[180ms] cursor-pointer"
                style={{
                  fontSize: 13, letterSpacing: "0.08em", padding: "10px 22px",
                  border: "1.5px solid #13131A", borderRadius: 4, textDecoration: "none",
                  background: "transparent",
                }}
              >
                {i === 0 ? "How it works" : "Features"}
              </a>
            ))}
            <Link
              to="/login"
              className="font-display font-bold uppercase text-ink hover:bg-ink hover:text-[#f5f5f0] transition-all duration-[180ms]"
              style={{
                fontSize: 13, letterSpacing: "0.08em", padding: "10px 22px",
                border: "1.5px solid #13131A", borderRadius: 4, textDecoration: "none",
              }}
            >
              Login
            </Link>
            <Link
              to="/register"
              className="font-display font-bold uppercase text-[#f5f5f0] hover:bg-ink hover:border-ink transition-all duration-[180ms]"
              style={{
                fontSize: 13, letterSpacing: "0.08em", padding: "10px 22px",
                background: "#3a5bff", border: "1.5px solid #3a5bff", borderRadius: 4, textDecoration: "none",
              }}
            >
              Get Started →
            </Link>
          </div>
        </nav>

        {/* ══════════ HERO ══════════ */}
        <section
          className="grid"
          style={{
            gridTemplateColumns: "1fr 1fr",
            minHeight: "calc(100vh - 72px)",
            borderBottom: "1.5px solid #13131A",
          }}
        >
          {/* Left */}
          <div
            className="flex flex-col justify-center"
            style={{ padding: "72px 48px", borderRight: "1.5px solid #13131A" }}
          >
            {/* Eyebrow */}
            <div
              className="font-body text-[#3a5bff] uppercase flex items-center gap-[10px]"
              style={{ fontSize: 11, letterSpacing: "0.2em", marginBottom: 28 }}
            >
              <span style={{ width: 32, height: 1.5, background: "#3a5bff", display: "block", flexShrink: 0 }} />
              Brainstorm. Branch. Build.
            </div>

            {/* Headline */}
            <h1
              className="font-display font-extrabold"
              style={{ fontSize: "clamp(52px, 6vw, 88px)", lineHeight: 0.95, letterSpacing: "-0.03em", marginBottom: 32 }}
            >
              Where Ideas
              <span className="block" style={{ color: "#3a5bff" }}>Branch &amp;</span>
              Collide.
            </h1>

            {/* Subtext */}
            <p
              className="font-body text-[#444]"
              style={{ fontSize: 13, lineHeight: 1.8, maxWidth: 440, marginBottom: 48 }}
            >
              IdeaLab is a real-time collaborative workspace. Multiple people, one canvas — branch ideas, vote on the best, and let AI expand your thinking.
            </p>

            {/* CTA — uses your Button component */}
            <div className="flex items-center flex-wrap" style={{ gap: 12 }}>
              <Link to="/register">
                <Button>Get Started — It's Free</Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary">Login</Button>
              </Link>
            </div>

            {/* Social proof */}
            <div
              className="flex items-center"
              style={{ marginTop: 48, paddingTop: 32, borderTop: "1px solid #ddd", gap: 24 }}
            >
              <div className="flex">
                {(
                  [["A","#3a5bff"],["R","#e53e3e"],["K","#38a169"],["S","#d69e2e"],["M","#805ad5"]] as [string,string][]
                ).map(([l, c], i) => (
                  <span
                    key={l}
                    className="flex items-center justify-center font-display font-bold text-white rounded-full"
                    style={{
                      width: 32, height: 32, background: c, fontSize: 12,
                      border: "2px solid #f5f5f0", marginLeft: i === 0 ? 0 : -8, zIndex: 5 - i, position: "relative",
                    }}
                  >
                    {l}
                  </span>
                ))}
              </div>
              <p className="font-body text-[#888]" style={{ fontSize: 11, lineHeight: 1.6 }}>
                Join 2,400+ teams already using IdeaLab<br />
                No credit card required
              </p>
            </div>
          </div>

          {/* Right — dark preview panel */}
          <div
            className="flex items-center justify-center relative overflow-hidden"
            style={{ background: "#0a0a0a", padding: 48 }}
          >
            {/* radial glow */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse at 30% 40%, rgba(58,91,255,0.25) 0%, transparent 60%)" }}
            />

            {/* Workspace preview card */}
            <div
              className="relative w-full z-10 overflow-hidden"
              style={{ maxWidth: 520, border: "1.5px solid rgba(255,255,255,0.15)", borderRadius: 8, background: "#111" }}
            >
              {/* topbar */}
              <div
                className="flex items-center"
                style={{ background: "#1a1a1a", padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.1)", gap: 10 }}
              >
                <div className="flex" style={{ gap: 6 }}>
                  <span className="rounded-full" style={{ width: 10, height: 10, background: "#ff5f57" }} />
                  <span className="rounded-full" style={{ width: 10, height: 10, background: "#ffbd2e" }} />
                  <span className="rounded-full" style={{ width: 10, height: 10, background: "#27c93f" }} />
                </div>
                <span className="font-body text-white/50" style={{ fontSize: 11, marginLeft: 8 }}>
                  Session: Product Brainstorm
                </span>
                <div className="ml-auto flex items-center" style={{ gap: 6 }}>
                  <span className="live-pulse rounded-full" style={{ width: 7, height: 7, background: "#27c93f" }} />
                  <span className="font-body" style={{ fontSize: 10, color: "#27c93f" }}>Live · 4 connected</span>
                </div>
              </div>

              {/* body */}
              <div className="grid" style={{ padding: 24, gridTemplateColumns: "1fr 1fr", gap: 16, minHeight: 320 }}>
                {/* Branch graph */}
                <div>
                  <p className="font-body text-white/30 uppercase" style={{ fontSize: 9, letterSpacing: "0.15em", marginBottom: 16 }}>
                    Branch Graph
                  </p>
                  {/* Nodes */}
                  <div
                    className="node-in inline-block rounded font-body font-bold"
                    style={{ animationDelay: "0.2s", fontSize: 11, padding: "10px 14px", background: "rgba(58,91,255,0.2)", border: "1px solid rgba(58,91,255,0.6)", color: "#a0b4ff" }}
                  >
                    Mobile App ↗ <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontWeight: 400 }}>▲ 12</span>
                  </div>
                  <div style={{ width: 2, height: 8, background: "rgba(255,255,255,0.1)", marginLeft: 24 }} />
                  <div
                    className="node-in inline-block rounded font-body font-bold"
                    style={{ animationDelay: "0.5s", fontSize: 11, padding: "10px 14px", marginLeft: 20, background: "rgba(180,255,69,0.1)", border: "1px solid rgba(180,255,69,0.5)", color: "#c8ff80" }}
                  >
                    Dark Mode UI <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontWeight: 400 }}>▲ 8</span>
                  </div>
                  <div style={{ width: 2, height: 8, background: "rgba(255,255,255,0.1)", marginLeft: 40 }} />
                  <div
                    className="node-in inline-block rounded font-body font-bold"
                    style={{ animationDelay: "0.8s", fontSize: 11, padding: "10px 14px", marginLeft: 20, background: "rgba(180,255,69,0.1)", border: "1px solid rgba(180,255,69,0.5)", color: "#c8ff80" }}
                  >
                    Voice Input <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontWeight: 400 }}>▲ 5</span>
                  </div>
                  <div style={{ width: 2, height: 8, background: "rgba(255,255,255,0.1)", marginLeft: 56 }} />
                  <div
                    className="node-in inline-block rounded font-body font-bold"
                    style={{ animationDelay: "1.1s", fontSize: 11, padding: "10px 14px", marginLeft: 40, background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.5)", color: "#d8b4fe" }}
                  >
                    ✦ AI Voice Mode <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontWeight: 400 }}>▲ 19</span>
                  </div>
                </div>

                {/* Detail panel */}
                <div style={{ borderLeft: "1px solid rgba(255,255,255,0.08)", paddingLeft: 16 }}>
                  <p className="font-body text-white/30 uppercase" style={{ fontSize: 9, letterSpacing: "0.15em", marginBottom: 12 }}>
                    Selected Idea
                  </p>
                  <p
                    className="node-in font-display font-bold text-white/90"
                    style={{ animationDelay: "0.6s", fontSize: 13, marginBottom: 8 }}
                  >
                    ✦ AI Voice Mode
                  </p>
                  <div
                    className="node-in flex flex-wrap"
                    style={{ animationDelay: "0.8s", gap: 6, marginBottom: 12 }}
                  >
                    <span className="font-body" style={{ fontSize: 9, padding: "3px 8px", borderRadius: 3, background: "rgba(58,91,255,0.2)", color: "#a0b4ff", border: "1px solid rgba(58,91,255,0.3)", letterSpacing: "0.05em" }}>merged</span>
                    <span className="font-body" style={{ fontSize: 9, padding: "3px 8px", borderRadius: 3, background: "rgba(180,255,69,0.1)", color: "#c8ff80", border: "1px solid rgba(180,255,69,0.3)", letterSpacing: "0.05em" }}>shortlisted</span>
                  </div>
                  <div
                    className="node-in flex items-center"
                    style={{ animationDelay: "1s", gap: 8, marginBottom: 12 }}
                  >
                    <button
                      className="font-body cursor-default"
                      style={{ fontSize: 10, padding: "4px 10px", borderRadius: 4, background: "rgba(58,91,255,0.2)", border: "1px solid rgba(58,91,255,0.4)", color: "#a0b4ff" }}
                    >
                      ▲ Vote
                    </button>
                    <span className="font-body text-white/60" style={{ fontSize: 11 }}>19 votes</span>
                  </div>
                  <div
                    className="node-in font-body text-center cursor-default"
                    style={{ animationDelay: "1.2s", fontSize: 10, padding: 8, borderRadius: 4, background: "rgba(180,255,69,0.1)", border: "1px solid rgba(180,255,69,0.3)", color: "#c8ff80", marginTop: 4 }}
                  >
                    ✦ Expand with AI
                  </div>
                </div>
              </div>

              {/* Participants */}
              <div
                className="flex items-center"
                style={{ padding: "12px 24px", borderTop: "1px solid rgba(255,255,255,0.07)", gap: 8 }}
              >
                {([ ["A","#3a5bff"],["K","#38a169"],["S","#d69e2e"],["M","#805ad5"] ] as [string,string][]).map(([l, c]) => (
                  <span
                    key={l}
                    className="flex items-center justify-center font-body font-bold text-white rounded-full"
                    style={{ width: 24, height: 24, background: c, fontSize: 9 }}
                  >
                    {l}
                  </span>
                ))}
                <span className="font-body" style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginLeft: 4 }}>
                  4 collaborating now
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════ MARQUEE ══════════ */}
        <div style={{ borderTop: "1.5px solid #13131A", borderBottom: "1.5px solid #13131A", padding: "16px 0", overflow: "hidden", background: "#3a5bff" }}>
          <div className="marquee-track flex whitespace-nowrap">
            {doubled.map((t, i) => (
              <div key={i} className="font-body font-bold text-white uppercase flex items-center shrink-0" style={{ fontSize: 12, letterSpacing: "0.1em", padding: "0 32px", gap: 16 }}>
                {t}
                <span className="rounded-full inline-block" style={{ width: 6, height: 6, background: "rgba(255,255,255,0.5)" }} />
              </div>
            ))}
          </div>
        </div>

        {/* ══════════ HOW IT WORKS ══════════ */}
        <section id="how" style={{ padding: "100px 48px", borderBottom: "1.5px solid #13131A" }}>
          <Reveal>
            <div style={{ marginBottom: 64 }}>
              <p className="font-body text-[#3a5bff] uppercase" style={{ fontSize: 11, letterSpacing: "0.2em", marginBottom: 12 }}>
                How it works
              </p>
              <h2 className="font-display font-extrabold" style={{ fontSize: "clamp(36px,4vw,56px)", letterSpacing: "-0.03em", lineHeight: 1 }}>
                From idea to<br />outcome — fast.
              </h2>
            </div>
          </Reveal>

          <Reveal>
            <div
              className="grid"
              style={{ gridTemplateColumns: "repeat(4, 1fr)", border: "1.5px solid #13131A", borderRadius: 4, overflow: "hidden" }}
            >
              {[
                { num: "01", icon: "🚀", bg: "#3a5bff",   name: "Create a Session", desc: "Start a brainstorming session in seconds. Invite your team with a link and get everyone in the room." },
                { num: "02", icon: "🌿", bg: "#b4ff45",   name: "Branch & Explore",  desc: "Add ideas and branch off existing ones. Like Git for thoughts — every variation lives on its own node." },
                { num: "03", icon: "✦",  bg: "#a855f7",   name: "Expand with AI",    desc: 'Hit "Expand" on any idea and Llama 3 generates variations, use cases, and implementation paths instantly.' },
                { num: "04", icon: "🏆", bg: "#f59e0b",   name: "Vote & Shortlist",  desc: "Vote up the best ideas. Merge similar ones. Shortlist winners. Turn chaos into clarity together." },
              ].map((s, i) => (
                <div
                  key={i}
                  className="hover:bg-[#f0f0eb] transition-colors duration-200"
                  style={{ padding: "40px 32px", borderRight: i < 3 ? "1.5px solid #13131A" : "none" }}
                >
                  <p className="font-body text-[#888]" style={{ fontSize: 11, letterSpacing: "0.1em", marginBottom: 20 }}>{s.num} —</p>
                  <div
                    className="flex items-center justify-center rounded"
                    style={{ width: 48, height: 48, background: s.bg, borderRadius: 4, marginBottom: 20, fontSize: 22 }}
                  >
                    {s.icon}
                  </div>
                  <p className="font-display font-bold" style={{ fontSize: 18, marginBottom: 12, letterSpacing: "-0.01em" }}>{s.name}</p>
                  <p className="font-body text-[#555]" style={{ fontSize: 11, lineHeight: 1.8 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        {/* ══════════ FEATURES ══════════ */}
        <section
          id="features"
          className="grid"
          style={{ gridTemplateColumns: "1fr 1fr", borderBottom: "1.5px solid #13131A" }}
        >
          {/* Left */}
          <div style={{ padding: "100px 48px", borderRight: "1.5px solid #13131A" }}>
            <p className="font-body text-[#3a5bff] uppercase" style={{ fontSize: 11, letterSpacing: "0.2em", marginBottom: 12 }}>Features</p>
            <h2 className="font-display font-extrabold" style={{ fontSize: "clamp(36px,4vw,56px)", letterSpacing: "-0.03em", lineHeight: 1, marginBottom: 40 }}>
              Built for<br />real teams.
            </h2>
            <Reveal>
              <div style={{ border: "1.5px solid #13131A", borderRadius: 4, overflow: "hidden" }}>
                {[
                  { icon: "⚡", bg: "#3a5bff", name: "Real-time Sync",            desc: "WebSocket-powered. Every idea, vote, and comment appears on everyone's screen within milliseconds. No refresh. No lag." },
                  { icon: "🌿", bg: "#b4ff45", name: "Idea Branching",            desc: "Branch ideas like code. Parent-child relationships visualised as a live node graph. See how ideas evolve over time." },
                  { icon: "✦",  bg: "#a855f7", name: "AI Co-pilot (Llama 3)",    desc: "Expand any idea, summarise your session, or merge two concepts into one. Powered by Groq's ultra-fast inference." },
                  { icon: "🔒", bg: "#0a0a0a", name: "Enterprise-grade Security", desc: "AES-256 encryption at rest. HTTP-only JWT cookies. Zero plaintext stored in MongoDB. Your ideas stay yours." },
                ].map((f, i, arr) => (
                  <div
                    key={i}
                    className="flex items-start hover:bg-[#f0f0eb] transition-colors duration-200 cursor-default"
                    style={{ padding: "24px 28px", borderBottom: i < arr.length - 1 ? "1.5px solid #13131A" : "none", gap: 16 }}
                  >
                    <div
                      className="flex items-center justify-center rounded flex-shrink-0"
                      style={{ width: 36, height: 36, background: f.bg, borderRadius: 4, fontSize: 16, marginTop: 2 }}
                    >
                      {f.icon}
                    </div>
                    <div>
                      <p className="font-display font-bold" style={{ fontSize: 15, marginBottom: 4 }}>{f.name}</p>
                      <p className="font-body text-[#555]" style={{ fontSize: 11, lineHeight: 1.7 }}>{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Right */}
          <div style={{ padding: "100px 48px" }}>
            <p className="font-body text-[#3a5bff] uppercase" style={{ fontSize: 11, letterSpacing: "0.2em", marginBottom: 12 }}>By the numbers</p>
            <h2 className="font-display font-extrabold" style={{ fontSize: "clamp(36px,4vw,56px)", letterSpacing: "-0.03em", lineHeight: 1, marginBottom: 40 }}>
              Ideas that<br />move fast.
            </h2>

            <Reveal>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", border: "1.5px solid #13131A", borderRadius: 4, overflow: "hidden", marginTop: 40 }}>
                {[
                  { num: "<50ms", label: "Sync latency" },
                  { num: "∞",     label: "Branches per session" },
                  { num: "256",   label: "AES encryption bits" },
                  { num: "3s",    label: "AI expansion time" },
                ].map((s, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "32px 28px",
                      borderRight:  i % 2 === 0 ? "1.5px solid #13131A" : "none",
                      borderBottom: i < 2      ? "1.5px solid #13131A" : "none",
                    }}
                  >
                    <p className="font-display font-extrabold" style={{ fontSize: 40, letterSpacing: "-0.03em", color: "#3a5bff", lineHeight: 1, marginBottom: 8 }}>{s.num}</p>
                    <p className="font-body text-[#888] uppercase" style={{ fontSize: 11, letterSpacing: "0.1em" }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal>
              <div style={{ marginTop: 40, padding: 32, border: "1.5px solid #13131A", borderRadius: 4, background: "#f8f8f4" }}>
                <p className="font-body text-[#888] uppercase" style={{ fontSize: 11, letterSpacing: "0.1em", marginBottom: 12 }}>From the team</p>
                <p className="font-display font-semibold" style={{ fontSize: 16, lineHeight: 1.6, letterSpacing: "-0.01em" }}>
                  "IdeaLab exists because great ideas deserve better than a whiteboard photo and a forgotten Notion doc."
                </p>
                <p className="font-body text-[#888]" style={{ fontSize: 11, marginTop: 12 }}>— The IdeaLab Team</p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ══════════ CTA ══════════ */}
        <section
          className="grid items-center"
          style={{ padding: "100px 48px", background: "#0a0a0a", gridTemplateColumns: "1fr 1fr", gap: 64 }}
        >
          <div>
            <h2
              className="font-display font-extrabold text-[#f5f5f0]"
              style={{ fontSize: "clamp(40px,5vw,72px)", letterSpacing: "-0.03em", lineHeight: 0.95, marginBottom: 24 }}
            >
              Start your<br />first{" "}
              <span style={{ color: "#b4ff45" }}>session</span>
              <br />today.
            </h2>
            <p className="font-body text-white/50" style={{ fontSize: 12, lineHeight: 1.8, maxWidth: 400 }}>
              Free to start. No credit card. No bloated setup. Just open a session, invite your team, and watch ideas come alive in real time.
            </p>
          </div>

          <div style={{ border: "1.5px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: 40, background: "#111" }}>
            <h3 className="font-display font-bold text-[#f5f5f0]" style={{ fontSize: 24, marginBottom: 8, letterSpacing: "-0.01em" }}>
              Join IdeaLab →
            </h3>
            <p className="font-body text-white/40" style={{ fontSize: 11, marginBottom: 28, lineHeight: 1.7 }}>
              Set up your workspace in under 60 seconds. Your first session is completely free.
            </p>
            <div className="flex flex-col" style={{ gap: 12 }}>
              <Link to="/register" className="block">
                <Button className="w-full justify-center">Create Free Account</Button>
              </Link>
              <Link to="/login" className="block">
                <Button variant="secondary" className="w-full justify-center">Already have an account? Login</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ══════════ FOOTER ══════════ */}
        <footer
          className="flex items-center justify-between"
          style={{ padding: "32px 48px", borderTop: "1.5px solid #13131A", background: "#f5f5f0" }}
        >
          <div className="flex items-center" style={{ gap: 12 }}>
            <div
              className="flex items-center justify-center"
              style={{ width: 28, height: 28, background: "#3a5bff", border: "2px solid #13131A", borderRadius: 4 }}
            >
              <BranchIcon size={14} />
            </div>
            <span className="font-body text-[#888]" style={{ fontSize: 11 }}>
              © 2026 IdeaLab · All ideas encrypted · Built with ♥
            </span>
          </div>
          <div className="flex" style={{ gap: 24 }}>
            {["Privacy", "Security", "Docs", "GitHub"].map((l) => (
              <a key={l} href="#" className="font-body text-[#888] hover:text-ink transition-colors" style={{ fontSize: 11, textDecoration: "none" }}>
                {l}
              </a>
            ))}
          </div>
        </footer>

      </div>
    </>
  );
};