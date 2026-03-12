import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { CreateSessionModal } from "../components/session/CreateSessionModal";
import { JoinSessionModal } from "../components/session/JoinSessionModal";
import { SessionCard } from "../components/session/SessionCard";
import { endSession, getSessions, joinSession } from "../services/session.service";
import { useAuthStore } from "../store/authStore";
import { useSessionStore } from "../store/sessionStore";
import type { Session } from "../types";

function BranchIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="currentColor">
      <circle cx="6" cy="10" r="3" />
      <circle cx="14" cy="5" r="2.5" />
      <circle cx="14" cy="15" r="2.5" />
      <line x1="9" y1="10" x2="12" y2="6" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <line x1="9" y1="10" x2="12" y2="14" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="7" y1="1" x2="7" y2="13" />
      <line x1="1" y1="7" x2="13" y2="7" />
    </svg>
  );
}

/* ── Empty state ── */
function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center"
      style={{ border: "1.5px dashed #13131A", borderRadius: 4, padding: "80px 48px", gridColumn: "1 / -1" }}
    >
      <div
        className="flex items-center justify-center text-[#3a5bff]"
        style={{ width: 56, height: 56, border: "1.5px solid #3a5bff", borderRadius: 4, marginBottom: 24, background: "rgba(58,91,255,0.06)" }}
      >
        <BranchIcon size={24} />
      </div>
      <p className="font-display font-extrabold" style={{ fontSize: 22, letterSpacing: "-0.02em", marginBottom: 8 }}>
        No sessions yet
      </p>
      <p className="font-body text-[#888]" style={{ fontSize: 13, lineHeight: 1.7, maxWidth: 320, marginBottom: 28 }}>
        Create your first brainstorming session and invite your team to start branching ideas in real time.
      </p>
      <button
        onClick={onNew}
        className="font-display font-bold uppercase text-white hover:bg-[#0a0a0a] transition-all duration-[180ms] flex items-center"
        style={{ fontSize: 13, letterSpacing: "0.08em", padding: "12px 24px", background: "#3a5bff", border: "1.5px solid #3a5bff", borderRadius: 4, gap: 8 }}
      >
        <PlusIcon /> New Session
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
export const SessionListPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [joinOpen,  setJoinOpen]  = useState(false);
  const [loading,   setLoading]   = useState(true);
  const navigate = useNavigate();

  const user        = useAuthStore((s) => s.user);
  const sessions    = useSessionStore((s) => s.sessions);
  const setSessions = useSessionStore((s) => s.setSessions);
  const addSession  = useSessionStore((s) => s.addSession);

  const isOngoing = (s: Session) => {
    const anyS = s as unknown as { status?: string; is_active?: boolean };
    if (typeof anyS.is_active === "boolean") return anyS.is_active;
    return (s.status ?? "active") === "active";
  };

  const ongoingSessions = sessions.filter(isOngoing);
  const endedSessions   = sessions.filter((s) => !isOngoing(s));

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getSessions();
      setSessions(data);
      setLoading(false);
    };
    void load();
  }, [setSessions]);

  const onJoin = async (id: string) => {
    const joined  = await joinSession(id);
    const updated = sessions.map((s) => (s.id === joined.id ? joined : s));
    setSessions(updated);
  };

  const onEnd = async (id: string) => {
    const closed = await endSession(id);
    const updated = sessions.map((s) => (s.id === closed.id ? closed : s));
    setSessions(updated);
  };

  const onJoinedFromModal = (session: Session) => {
    // ensure it's in the list
    const exists = sessions.some((s) => s.id === session.id);
    if (!exists) addSession(session);
    navigate(`/sessions/${session.id}`);
  };

  const onCreated = (session: Session) => {
    addSession(session);
    navigate(`/sessions/${session.id}`);
  };

  return (
    <>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .page-in { animation: fadeUp 0.4s ease forwards; }

        @keyframes shimmer {
          0%   { background-position: -600px 0; }
          100% { background-position:  600px 0; }
        }
        .skeleton {
          background: linear-gradient(90deg, #ece9e0 25%, #e2dfd6 50%, #ece9e0 75%);
          background-size: 600px 100%;
          animation: shimmer 1.4s infinite;
          border-radius: 4px;
        }
      `}</style>

      <div className="page-in min-h-screen bg-[#f5f5f0]">

        {/* ── Top bar ── */}
        <div
          className="sticky top-0 z-40 bg-[#f5f5f0] flex items-center justify-between"
          style={{ padding: "18px 48px", borderBottom: "1.5px solid #13131A" }}
        >
          {/* Left: title + count */}
          <div>
            <div className="flex items-center" style={{ gap: 8, marginBottom: 2 }}>
              <p className="font-body text-[#3a5bff] uppercase" style={{ fontSize: 11, letterSpacing: "0.2em" }}>
                Sessions
              </p>
              {!loading && (
                <span
                  className="font-body text-[#888]"
                  style={{ fontSize: 11, padding: "1px 8px", border: "1.5px solid #13131A", borderRadius: 999 }}
                >
                  {sessions.length}
                </span>
              )}
            </div>
            <h1 className="font-display font-extrabold" style={{ fontSize: "clamp(22px,3vw,32px)", letterSpacing: "-0.03em", lineHeight: 1 }}>
              Your Sessions
            </h1>
          </div>

          {/* Right: user + new session */}
          <div className="flex items-center" style={{ gap: 12 }}>
            {user && (
              <div className="hidden sm:flex items-center" style={{ gap: 8 }}>
                <div
                  className="flex items-center justify-center font-display font-bold text-white rounded-full"
                  style={{ width: 32, height: 32, background: "#3a5bff", fontSize: 13, flexShrink: 0 }}
                >
                  {user.username?.[0]?.toUpperCase() ?? "U"}
                </div>
                <div>
                  <p className="font-display font-bold" style={{ fontSize: 13, lineHeight: 1 }}>{user.username}</p>
                  <p className="font-body text-[#888]" style={{ fontSize: 10, marginTop: 1 }}>{user.email}</p>
                </div>
              </div>
            )}

            {user && <div style={{ width: 1, height: 32, background: "#e0ddd5" }} />}

            <button
              onClick={() => setJoinOpen(true)}
              className="font-display font-bold uppercase text-ink hover:bg-ink hover:text-[#f5f5f0] transition-all duration-[180ms] flex items-center"
              style={{ fontSize: 12, letterSpacing: "0.08em", padding: "10px 18px", border: "1.5px solid #13131A", borderRadius: 4, gap: 8, background: "transparent" }}
            >
              Join Session
            </button>

            <button
              onClick={() => setModalOpen(true)}
              className="font-display font-bold uppercase text-white hover:bg-[#0a0a0a] hover:border-[#0a0a0a] transition-all duration-[180ms] flex items-center"
              style={{ fontSize: 13, letterSpacing: "0.08em", padding: "10px 20px", background: "#3a5bff", border: "1.5px solid #3a5bff", borderRadius: 4, gap: 8 }}
            >
              <PlusIcon /> New Session
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ padding: "40px 48px" }}>

          {/* Stats row */}
          {!loading && sessions.length > 0 && (
            <div
              className="grid"
              style={{ gridTemplateColumns: "repeat(3,1fr)", border: "1.5px solid #13131A", borderRadius: 4, overflow: "hidden", marginBottom: 40 }}
            >
              {[
                {
                  num: ongoingSessions.length,
                  label: "Ongoing Sessions",
                  sub: "currently running",
                },
                {
                  num: sessions.reduce((acc, s) => acc + (s.participant_ids?.length ?? 0), 0),
                  label: "Total Participants",
                  sub: "collaborating right now",
                },
                {
                  num: sessions.filter((s) => user && s.participant_ids?.includes(user.id)).length,
                  label: "Joined by You",
                  sub: "sessions you're part of",
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  style={{
                    padding: "24px 32px",
                    borderRight: i < 2 ? "1.5px solid #13131A" : "none",
                  }}
                >
                  <p className="font-display font-extrabold" style={{ fontSize: 36, letterSpacing: "-0.03em", color: "#3a5bff", lineHeight: 1, marginBottom: 4 }}>
                    {stat.num}
                  </p>
                  <p className="font-display font-bold" style={{ fontSize: 13, marginBottom: 2 }}>{stat.label}</p>
                  <p className="font-body text-[#888]" style={{ fontSize: 11 }}>{stat.sub}</p>
                </div>
              ))}
            </div>
          )}

          {/* Section label */}
          {!loading && sessions.length > 0 && (
            <div className="flex items-center" style={{ marginBottom: 20, gap: 12 }}>
              <span className="font-body text-[#888] uppercase" style={{ fontSize: 10, letterSpacing: "0.2em" }}>Ongoing</span>
              <div style={{ flex: 1, height: 1, background: "#e0ddd5" }} />
            </div>
          )}

          {/* Grid */}
          <div className="grid gap-0" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>

            {/* Skeleton loaders */}
            {loading && Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                style={{ border: "1.5px solid #13131A", borderRadius: 4, padding: 28, margin: "0 -1px -1px 0" }}
              >
                <div className="skeleton" style={{ height: 14, width: "60%", marginBottom: 12 }} />
                <div className="skeleton" style={{ height: 10, width: "85%", marginBottom: 6 }} />
                <div className="skeleton" style={{ height: 10, width: "70%", marginBottom: 24 }} />
                <div style={{ display: "flex", gap: 8 }}>
                  <div className="skeleton" style={{ height: 32, width: 80 }} />
                  <div className="skeleton" style={{ height: 32, width: 80 }} />
                </div>
              </div>
            ))}

            {/* Empty state */}
            {!loading && sessions.length === 0 && (
              <EmptyState onNew={() => setModalOpen(true)} />
            )}

            {/* Session cards — Ongoing */}
            {!loading && ongoingSessions.map((session, i) => (
              <div
                key={session.id}
                style={{
                  border: "1.5px solid #13131A",
                  borderRadius: 0,
                  marginRight: -1,
                  marginBottom: -1,
                  // Round corners on extremes
                  borderTopLeftRadius:     i === 0 ? 4 : 0,
                  borderTopRightRadius:    ongoingSessions.length <= 3 && i === Math.min(2, ongoingSessions.length - 1) ? 4 : 0,
                  borderBottomLeftRadius:  0,
                  borderBottomRightRadius: 0,
                  overflow: "hidden",
                  transition: "background 0.18s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f0eb")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <SessionCard
                  session={session}
                  isParticipant={Boolean(user && (session.participant_ids ?? []).includes(user.id))}
                  onJoin={onJoin}
                  isOwner={Boolean(user && session.owner_id === user.id)}
                  onEnd={onEnd}
                />
              </div>
            ))}
          </div>

          {/* Ended section */}
          {!loading && endedSessions.length > 0 && (
            <>
              <div className="flex items-center" style={{ marginTop: 34, marginBottom: 20, gap: 12 }}>
                <span className="font-body text-[#888] uppercase" style={{ fontSize: 10, letterSpacing: "0.2em" }}>Ended</span>
                <div style={{ flex: 1, height: 1, background: "#e0ddd5" }} />
              </div>

              <div className="grid gap-0" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
                {endedSessions.map((session, i) => (
                  <div
                    key={session.id}
                    style={{
                      border: "1.5px solid #13131A",
                      borderRadius: 0,
                      marginRight: -1,
                      marginBottom: -1,
                      borderTopLeftRadius: i === 0 ? 4 : 0,
                      borderTopRightRadius: endedSessions.length <= 3 && i === Math.min(2, endedSessions.length - 1) ? 4 : 0,
                      overflow: "hidden",
                      transition: "background 0.18s",
                      opacity: 0.9,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f0eb")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <SessionCard
                      session={session}
                      isParticipant={Boolean(user && (session.participant_ids ?? []).includes(user.id))}
                      onJoin={onJoin}
                      isOwner={Boolean(user && session.owner_id === user.id)}
                    />
                  </div>
                ))}
              </div>
            </>
          )}

          {/* New session CTA — only shown when sessions exist */}
          {!loading && sessions.length > 0 && (
            <div
              className="flex items-center justify-between"
              style={{ marginTop: 40, border: "1.5px solid #13131A", borderRadius: 4, padding: "20px 28px" }}
            >
              <div>
                <p className="font-display font-bold" style={{ fontSize: 15 }}>Start a new brainstorm</p>
                <p className="font-body text-[#888]" style={{ fontSize: 12, marginTop: 2 }}>
                  Create a session, invite your team, and branch ideas in real time.
                </p>
              </div>
              <button
                onClick={() => setModalOpen(true)}
                className="font-display font-bold uppercase text-ink hover:bg-ink hover:text-[#f5f5f0] transition-all duration-[180ms] flex items-center flex-shrink-0"
                style={{ fontSize: 12, letterSpacing: "0.08em", padding: "10px 20px", border: "1.5px solid #13131A", borderRadius: 4, gap: 8, background: "transparent" }}
              >
                <PlusIcon /> New Session
              </button>
            </div>
          )}
        </div>
      </div>

      <CreateSessionModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={onCreated} />
      <JoinSessionModal open={joinOpen} onClose={() => setJoinOpen(false)} onJoined={onJoinedFromModal} />
    </>
  );
};