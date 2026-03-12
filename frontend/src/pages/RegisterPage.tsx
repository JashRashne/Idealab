import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Input } from "../components/shared/Input";
import { register } from "../services/auth.service";
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

const STEPS = [
  { icon: "🌿", title: "Branch your ideas", desc: "Every thought becomes a node. Fork, merge, explore." },
  { icon: "⚡", title: "Sync in real time",  desc: "Your team sees every update the moment it happens."  },
  { icon: "✦",  title: "AI co-pilot",        desc: "Expand any idea instantly with Llama 3 via Groq."   },
];

export const RegisterPage = () => {
  const navigate  = useNavigate();
  const setUser   = useAuthStore((s) => s.setUser);

  const [username, setUsername] = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const submit = async () => {
    if (!username || !email || !password) { setError("Please fill in all fields."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    setError("");
    try {
      const user = await register(username, email, password);
      setUser(user);
      navigate("/sessions");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes nodeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes livePulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes spin       { to { transform: rotate(360deg); } }

        .register-panel { animation: nodeIn 0.45s ease forwards; }
        .live-pulse      { animation: livePulse 1.4s infinite; }

        .field-block input:focus,
        .field-block input:focus-visible {
          outline: none;
          border-color: #3a5bff !important;
          box-shadow: 0 0 0 3px rgba(58,91,255,0.12);
        }

        /* password strength bar */
        .strength-bar { transition: width 0.35s ease, background 0.35s ease; }
      `}</style>

      <div className="min-h-screen grid" style={{ gridTemplateColumns: "1fr 1fr", background: "#f5f5f0" }}>

        {/* ══════ LEFT — dark brand panel ══════ */}
        <div
          className="hidden lg:flex flex-col justify-between relative overflow-hidden"
          style={{ background: "#0a0a0a", padding: 48 }}
        >
          {/* glow */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 25% 55%, rgba(58,91,255,0.18) 0%, transparent 60%)" }} />

          {/* Logo */}
          <div className="relative z-10 flex items-center" style={{ gap: 12 }}>
            <div className="flex items-center justify-center flex-shrink-0"
              style={{ width: 36, height: 36, background: "#3a5bff", border: "2px solid rgba(255,255,255,0.2)", borderRadius: 4 }}>
              <BranchIcon size={20} />
            </div>
            <div>
              <p className="font-display font-extrabold text-white uppercase" style={{ fontSize: 15, letterSpacing: "0.05em", lineHeight: 1 }}>IdeaLab</p>
              <p className="font-body text-white/40" style={{ fontSize: 10, marginTop: 2 }}>Real-time Collaborative Brainstorming</p>
            </div>
          </div>

          {/* Feature list */}
          <div className="relative z-10 flex-1 flex items-center">
            <div className="w-full" style={{ paddingTop: 48, paddingBottom: 48 }}>
              <p className="font-body text-white/30 uppercase" style={{ fontSize: 10, letterSpacing: "0.2em", marginBottom: 32 }}>
                What you get
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 0, border: "1.5px solid rgba(255,255,255,0.1)", borderRadius: 4, overflow: "hidden" }}>
                {STEPS.map((s, i) => (
                  <div key={i}
                    className="flex items-start"
                    style={{
                      padding: "24px 28px", gap: 16,
                      borderBottom: i < STEPS.length - 1 ? "1.5px solid rgba(255,255,255,0.08)" : "none",
                      background: "rgba(255,255,255,0.02)",
                    }}
                  >
                    <div className="flex items-center justify-center flex-shrink-0"
                      style={{ width: 36, height: 36, background: i === 0 ? "#3a5bff" : i === 1 ? "rgba(180,255,69,0.15)" : "rgba(168,85,247,0.2)", borderRadius: 4, fontSize: 16, border: i === 0 ? "none" : `1px solid ${i === 1 ? "rgba(180,255,69,0.3)" : "rgba(168,85,247,0.3)"}` }}>
                      {s.icon}
                    </div>
                    <div>
                      <p className="font-display font-bold text-white/90" style={{ fontSize: 14, marginBottom: 4 }}>{s.title}</p>
                      <p className="font-body text-white/40" style={{ fontSize: 12, lineHeight: 1.6 }}>{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Live session badge */}
              <div className="flex items-center" style={{ marginTop: 28, gap: 10 }}>
                <div className="flex">
                  {(["#3a5bff","#38a169","#e53e3e","#d69e2e"] as string[]).map((c, i) => (
                    <span key={i} className="rounded-full flex items-center justify-center font-body font-bold text-white"
                      style={{ width: 24, height: 24, background: c, border: "2px solid #0a0a0a", marginLeft: i === 0 ? 0 : -6, fontSize: 9 }}>
                      {["A","K","R","S"][i]}
                    </span>
                  ))}
                </div>
                <div className="flex items-center" style={{ gap: 6 }}>
                  <span className="live-pulse rounded-full" style={{ width: 6, height: 6, background: "#27c93f" }} />
                  <span className="font-body text-white/35" style={{ fontSize: 11 }}>2,400+ teams brainstorming now</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="relative z-10">
            <p className="font-body text-white/20 uppercase" style={{ fontSize: 9, letterSpacing: "0.15em", marginBottom: 8 }}>Free forever</p>
            <p className="font-display font-semibold text-white/50" style={{ fontSize: 14, lineHeight: 1.6 }}>
              "No credit card. No limits on branches.<br />Just ideas, moving fast."
            </p>
          </div>
        </div>

        {/* ══════ RIGHT — register form ══════ */}
        <div className="flex items-center justify-center" style={{ padding: "48px 64px" }}>
          <div className="register-panel w-full" style={{ maxWidth: 420 }}>

            {/* Mobile logo */}
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
                Get started — it's free
              </p>
              <h1 className="font-display font-extrabold" style={{ fontSize: "clamp(32px,4vw,48px)", letterSpacing: "-0.03em", lineHeight: 0.95, marginBottom: 12 }}>
                Create your<br />account.
              </h1>
              <p className="font-body text-[#888]" style={{ fontSize: 13, lineHeight: 1.7 }}>
                Set up your workspace in under 60 seconds.
              </p>
            </div>

            {/* Stacked form fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>

              {/* Username */}
              <div className="field-block" style={{ border: "1.5px solid #13131A", borderRadius: "4px 4px 0 0", borderBottom: "none", padding: "12px 16px" }}>
                <label className="font-body text-[#888] uppercase block" style={{ fontSize: 10, letterSpacing: "0.15em", marginBottom: 6 }}>
                  Username
                </label>
                <Input
                  value={username}
                  label=""
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="yourname"
                  style={{ border: "none", outline: "none", background: "transparent", fontFamily: "inherit", fontSize: 15, width: "100%", padding: 0, color: "#13131A" }}
                />
              </div>

              {/* Email */}
              <div className="field-block" style={{ border: "1.5px solid #13131A", borderBottom: "none", padding: "12px 16px" }}>
                <label className="font-body text-[#888] uppercase block" style={{ fontSize: 10, letterSpacing: "0.15em", marginBottom: 6 }}>
                  Email address
                </label>
                <Input
                  type="email"
                  value={email}
                  label=""
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={{ border: "none", outline: "none", background: "transparent", fontFamily: "inherit", fontSize: 15, width: "100%", padding: 0, color: "#13131A" }}
                />
              </div>

              {/* Password */}
              <div className="field-block" style={{ border: "1.5px solid #13131A", borderRadius: "0 0 4px 4px", padding: "12px 16px" }}>
                <label className="font-body text-[#888] uppercase block" style={{ fontSize: 10, letterSpacing: "0.15em", marginBottom: 6 }}>
                  Password
                </label>
                <Input
                  type="password"
                  value={password}
                  label=""
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="min. 6 characters"
                  onKeyDown={(e) => e.key === "Enter" && void submit()}
                  style={{ border: "none", outline: "none", background: "transparent", fontFamily: "inherit", fontSize: 15, width: "100%", padding: 0, color: "#13131A" }}
                />
                {/* Password strength bar */}
                {password.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ height: 3, background: "#e5e5e0", borderRadius: 2, overflow: "hidden" }}>
                      <div
                        className="strength-bar"
                        style={{
                          height: "100%", borderRadius: 2,
                          width: password.length < 4 ? "25%" : password.length < 6 ? "50%" : password.length < 10 ? "75%" : "100%",
                          background: password.length < 4 ? "#e53e3e" : password.length < 6 ? "#f59e0b" : password.length < 10 ? "#3a5bff" : "#27c93f",
                        }}
                      />
                    </div>
                    <p className="font-body" style={{ fontSize: 10, marginTop: 4, color: password.length < 4 ? "#e53e3e" : password.length < 6 ? "#f59e0b" : password.length < 10 ? "#3a5bff" : "#27c93f" }}>
                      {password.length < 4 ? "Weak" : password.length < 6 ? "Fair" : password.length < 10 ? "Good" : "Strong"}
                    </p>
                  </div>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center font-body text-[#e53e3e]" style={{ marginTop: 12, fontSize: 12, gap: 6 }}>
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
                  marginTop: 16, padding: 16, fontSize: 14, letterSpacing: "0.08em",
                  background: loading ? "#555" : "#3a5bff",
                  border: `1.5px solid ${loading ? "#555" : "#3a5bff"}`,
                  borderRadius: 4, cursor: loading ? "not-allowed" : "pointer", width: "100%",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                }}
              >
                {loading ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                      style={{ animation: "spin 0.8s linear infinite" }}>
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                    Creating account…
                  </>
                ) : (
                  <>Create Account →</>
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center" style={{ margin: "28px 0", gap: 12 }}>
              <div style={{ flex: 1, height: 1, background: "#e5e5e0" }} />
              <span className="font-body text-[#888] uppercase" style={{ fontSize: 10, letterSpacing: "0.15em" }}>or</span>
              <div style={{ flex: 1, height: 1, background: "#e5e5e0" }} />
            </div>

            {/* Login link */}
            <div className="flex items-center justify-between"
              style={{ border: "1.5px solid #13131A", borderRadius: 4, padding: "14px 20px" }}>
              <div>
                <p className="font-display font-bold" style={{ fontSize: 13 }}>Already have an account?</p>
                <p className="font-body text-[#888]" style={{ fontSize: 11, marginTop: 2 }}>Pick up right where you left off.</p>
              </div>
              <Link
                to="/login"
                className="font-display font-bold uppercase text-ink hover:bg-ink hover:text-[#f5f5f0] transition-all duration-[180ms] flex-shrink-0"
                style={{ fontSize: 12, letterSpacing: "0.08em", padding: "8px 16px", border: "1.5px solid #13131A", borderRadius: 4, textDecoration: "none" }}
              >
                Log in →
              </Link>
            </div>

            {/* Footer note */}
            <p className="font-body text-[#aaa] text-center" style={{ fontSize: 11, marginTop: 28, lineHeight: 1.6 }}>
              All your ideas are AES-256 encrypted at rest.<br />No credit card required.
            </p>

          </div>
        </div>

      </div>
    </>
  );
};