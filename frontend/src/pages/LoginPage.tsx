import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// import { Button } from "../components/shared/Button";
import { Input } from "../components/shared/Input";
import { login } from "../services/auth.service";
import { useAuthStore } from "../store/authStore";

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

export const LoginPage = () => {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const submit = async () => {
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    setError("");
    try {
      const user = await login(email, password);
      setUser(user);
      navigate("/sessions");
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes nodeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes livePulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
        .login-panel { animation: nodeIn 0.45s ease forwards; }
        .live-pulse  { animation: livePulse 1.4s infinite; }

        .field-row input:focus {
          outline: none;
          border-color: #3a5bff !important;
          box-shadow: 0 0 0 3px rgba(58,91,255,0.12);
        }
      `}</style>

      {/* ── Full-page layout: left panel (dark) + right panel (form) ── */}
      <div className="min-h-screen grid" style={{ gridTemplateColumns: "1fr 1fr", background: "#f5f5f0" }}>

        {/* ══════ LEFT — dark brand panel ══════ */}
        <div
          className="hidden lg:flex flex-col justify-between relative overflow-hidden"
          style={{ background: "#0a0a0a", padding: "48px" }}
        >
          {/* glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 20% 50%, rgba(58,91,255,0.2) 0%, transparent 60%)" }}
          />

          {/* Logo */}
          <div className="relative z-10 flex items-center" style={{ gap: 12 }}>
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{ width: 36, height: 36, background: "#3a5bff", border: "2px solid rgba(255,255,255,0.2)", borderRadius: 4 }}
            >
              <BranchIcon size={20} />
            </div>
            <div>
              <p className="font-display font-extrabold text-white uppercase" style={{ fontSize: 15, letterSpacing: "0.05em", lineHeight: 1 }}>
                IdeaLab
              </p>
              <p className="font-body text-white/40" style={{ fontSize: 10, marginTop: 2 }}>
                Real-time Collaborative Brainstorming
              </p>
            </div>
          </div>

          {/* Mock session card */}
          <div className="relative z-10 flex-1 flex items-center justify-center py-12">
            <div
              className="w-full overflow-hidden"
              style={{ maxWidth: 380, border: "1.5px solid rgba(255,255,255,0.12)", borderRadius: 8, background: "#111" }}
            >
              {/* topbar */}
              <div
                className="flex items-center"
                style={{ background: "#1a1a1a", padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)", gap: 8 }}
              >
                <div className="flex" style={{ gap: 5 }}>
                  <span className="rounded-full" style={{ width: 8, height: 8, background: "#ff5f57" }} />
                  <span className="rounded-full" style={{ width: 8, height: 8, background: "#ffbd2e" }} />
                  <span className="rounded-full" style={{ width: 8, height: 8, background: "#27c93f" }} />
                </div>
                <span className="font-body text-white/40 truncate" style={{ fontSize: 10, marginLeft: 6 }}>
                  Session: Q3 Strategy
                </span>
                <div className="ml-auto flex items-center" style={{ gap: 5 }}>
                  <span className="live-pulse rounded-full" style={{ width: 6, height: 6, background: "#27c93f" }} />
                  <span className="font-body" style={{ fontSize: 9, color: "#27c93f" }}>Live</span>
                </div>
              </div>

              {/* nodes */}
              <div style={{ padding: "20px 20px 16px" }}>
                <p className="font-body text-white/25 uppercase" style={{ fontSize: 8, letterSpacing: "0.15em", marginBottom: 14 }}>Branch Graph</p>

                <div className="inline-block rounded font-body font-bold" style={{ fontSize: 10, padding: "8px 12px", background: "rgba(58,91,255,0.2)", border: "1px solid rgba(58,91,255,0.5)", color: "#a0b4ff", marginLeft: 0 }}>
                  Product Vision <span style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", fontWeight: 400 }}>▲ 14</span>
                </div>
                <div style={{ width: 2, height: 6, background: "rgba(255,255,255,0.1)", marginLeft: 20 }} />
                <div className="inline-block rounded font-body font-bold" style={{ fontSize: 10, padding: "8px 12px", marginLeft: 16, background: "rgba(180,255,69,0.1)", border: "1px solid rgba(180,255,69,0.4)", color: "#c8ff80" }}>
                  Mobile-first <span style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", fontWeight: 400 }}>▲ 9</span>
                </div>
                <div style={{ width: 2, height: 6, background: "rgba(255,255,255,0.1)", marginLeft: 36 }} />
                <div className="inline-block rounded font-body font-bold" style={{ fontSize: 10, padding: "8px 12px", marginLeft: 32, background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.4)", color: "#d8b4fe" }}>
                  ✦ AI onboarding <span style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", fontWeight: 400 }}>▲ 21</span>
                </div>
              </div>

              {/* participants */}
              <div className="flex items-center" style={{ padding: "10px 20px", borderTop: "1px solid rgba(255,255,255,0.06)", gap: 6 }}>
                {([ ["A","#3a5bff"],["K","#38a169"],["R","#e53e3e"] ] as [string,string][]).map(([l, c]) => (
                  <span key={l} className="flex items-center justify-center font-body font-bold text-white rounded-full" style={{ width: 20, height: 20, background: c, fontSize: 8 }}>{l}</span>
                ))}
                <span className="font-body text-white/30" style={{ fontSize: 9, marginLeft: 4 }}>3 collaborating</span>
              </div>
            </div>
          </div>

          {/* Bottom quote */}
          <div className="relative z-10">
            <p className="font-body text-white/25 uppercase" style={{ fontSize: 9, letterSpacing: "0.15em", marginBottom: 8 }}>Why IdeaLab</p>
            <p className="font-display font-semibold text-white/60" style={{ fontSize: 14, lineHeight: 1.6 }}>
              "The fastest way to go from scattered ideas to a clear decision."
            </p>
          </div>
        </div>

        {/* ══════ RIGHT — login form ══════ */}
        <div className="flex items-center justify-center" style={{ padding: "48px 64px" }}>
          <div className="login-panel w-full" style={{ maxWidth: 420 }}>

            {/* Mobile logo (only shows on small screens) */}
            <div className="flex items-center lg:hidden" style={{ gap: 10, marginBottom: 40 }}>
              <div className="flex items-center justify-center" style={{ width: 30, height: 30, background: "#3a5bff", border: "2px solid #13131A", borderRadius: 4 }}>
                <BranchIcon size={16} />
              </div>
              <p className="font-display font-extrabold uppercase" style={{ fontSize: 14, letterSpacing: "0.05em" }}>IdeaLab</p>
            </div>

            {/* Header */}
            <div style={{ marginBottom: 40 }}>
              <p className="font-body text-[#3a5bff] uppercase flex items-center" style={{ fontSize: 11, letterSpacing: "0.2em", marginBottom: 12, gap: 8 }}>
                <span style={{ width: 24, height: 1.5, background: "#3a5bff", display: "block" }} />
                Welcome back
              </p>
              <h1 className="font-display font-extrabold" style={{ fontSize: "clamp(32px,4vw,48px)", letterSpacing: "-0.03em", lineHeight: 0.95, marginBottom: 12 }}>
                Log back in.
              </h1>
              <p className="font-body text-[#888]" style={{ fontSize: 13, lineHeight: 1.7 }}>
                Your sessions, ideas, and branches are waiting for you.
              </p>
            </div>

            {/* Form */}
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>

              {/* Email field */}
              <div
                className="field-row"
                style={{ border: "1.5px solid #13131A", borderRadius: "4px 4px 0 0", borderBottom: "none", padding: "12px 16px" }}
              >
                <label className="font-body text-[#888] uppercase block" style={{ fontSize: 10, letterSpacing: "0.15em", marginBottom: 6 }}>
                  Email address
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  label=""
                  style={{
                    border: "none", outline: "none", background: "transparent",
                    fontFamily: "inherit", fontSize: 15, width: "100%", padding: 0, color: "#13131A",
                  }}
                />
              </div>

              {/* Password field */}
              <div
                className="field-row"
                style={{ border: "1.5px solid #13131A", borderRadius: "0 0 4px 4px", padding: "12px 16px" }}
              >
                <label className="font-body text-[#888] uppercase block" style={{ fontSize: 10, letterSpacing: "0.15em", marginBottom: 6 }}>
                  Password
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  label=""
                  onKeyDown={(e) => e.key === "Enter" && void submit()}
                  style={{
                    border: "none", outline: "none", background: "transparent",
                    fontFamily: "inherit", fontSize: 15, width: "100%", padding: 0, color: "#13131A",
                  }}
                />
              </div>

              {/* Error */}
              {error && (
                <div
                  className="flex items-center font-body text-[#e53e3e]"
                  style={{ marginTop: 12, fontSize: 12, gap: 6 }}
                >
                  <span style={{ width: 16, height: 16, borderRadius: "50%", background: "rgba(229,62,62,0.1)", border: "1px solid rgba(229,62,62,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, flexShrink: 0 }}>!</span>
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                onClick={() => void submit()}
                disabled={loading}
                className="font-display font-bold uppercase text-white transition-all duration-[180ms] hover:bg-[#0a0a0a] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  marginTop: 16, padding: "16px", fontSize: 14, letterSpacing: "0.08em",
                  background: loading ? "#555" : "#3a5bff",
                  border: `1.5px solid ${loading ? "#555" : "#3a5bff"}`,
                  borderRadius: 4, cursor: loading ? "not-allowed" : "pointer", width: "100%",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                }}
              >
                {loading ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ animation: "spin 0.8s linear infinite" }}>
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                    Signing in…
                  </>
                ) : (
                  <>Continue →</>
                )}
              </button>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>

            {/* Divider */}
            <div className="flex items-center" style={{ margin: "28px 0", gap: 12 }}>
              <div style={{ flex: 1, height: 1, background: "#e5e5e0" }} />
              <span className="font-body text-[#888] uppercase" style={{ fontSize: 10, letterSpacing: "0.15em" }}>or</span>
              <div style={{ flex: 1, height: 1, background: "#e5e5e0" }} />
            </div>

            {/* Register link */}
            <div
              className="flex items-center justify-between"
              style={{ border: "1.5px solid #13131A", borderRadius: 4, padding: "14px 20px" }}
            >
              <div>
                <p className="font-display font-bold" style={{ fontSize: 13 }}>New to IdeaLab?</p>
                <p className="font-body text-[#888]" style={{ fontSize: 11, marginTop: 2 }}>Create a free account in seconds.</p>
              </div>
              <Link
                to="/register"
                className="font-display font-bold uppercase text-ink hover:bg-ink hover:text-[#f5f5f0] transition-all duration-[180ms] flex-shrink-0"
                style={{ fontSize: 12, letterSpacing: "0.08em", padding: "8px 16px", border: "1.5px solid #13131A", borderRadius: 4, textDecoration: "none" }}
              >
                Sign up →
              </Link>
            </div>

            {/* Footer note */}
            <p className="font-body text-[#aaa] text-center" style={{ fontSize: 11, marginTop: 28, lineHeight: 1.6 }}>
              All your ideas are AES-256 encrypted at rest.
            </p>
          </div>
        </div>

      </div>
    </>
  );
};