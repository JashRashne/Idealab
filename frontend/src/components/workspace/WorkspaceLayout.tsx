import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { IdeaBranchGraph } from "../ideas/IdeaBranchGraph";
import { IdeaDetailPanel } from "../ideas/IdeaDetailPanel";
import { ConnectionStatus } from "./ConnectionStatus";
import { ParticipantList } from "./ParticipantList";
import { BrainstormPad } from "./BrainstormPad";
import { FinalDocument } from "./FinalDocument";
import { PadViewerModal } from "./PadViewerModel";
import { useIdeaStore } from "../../store/ideaStore";
import { flattenTree } from "../../services/idea.service";
import api from "../../services/api";
import type { WSMessage } from "../../types";

interface Props {
  sessionTitle: string;
  sessionStatus?: "active" | "closed";
  participants: string[];
  onlineParticipantIds: string[];
  connectionStatus: "connecting" | "connected" | "disconnected";
  sessionId: string;
  sendMessage: (message: WSMessage) => void;
  isOwner?: boolean;
  currentUserId?: string;
  currentUsername?: string;
}

type Tab = "workspace" | "pad" | "final";

function BranchIcon({ size = 16 }: { size?: number }) {
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

function ChevronLeft() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 2 4 7 9 12" />
    </svg>
  );
}

function LayoutIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="1" y="1" width="12" height="12" rx="1" />
      <line x1="1" y1="5" x2="13" y2="5" />
      <line x1="8" y1="5" x2="8" y2="13" />
    </svg>
  );
}

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "workspace", label: "Workspace",      icon: "⚡" },
  { id: "pad",       label: "My Brainstorm",  icon: "📝" },
  { id: "final",     label: "Final Document", icon: "📄" },
];

const MOCK_PARTICIPANTS = [
  { id: "user_1", username: "Alice" },
  { id: "user_2", username: "Rahul" },
  { id: "user_3", username: "Kim" },
];

export const WorkspaceLayout = ({
  sessionTitle,
  sessionStatus = "active",
  participants,
  onlineParticipantIds,
  connectionStatus,
  sessionId,
  sendMessage,
  isOwner = true,
  currentUserId = "current_user",
  currentUsername = "You",
}: Props) => {
  const [activeTab,      setActiveTab]      = useState<Tab>("workspace");
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [viewingPad,     setViewingPad]     = useState<{ userId: string; username: string } | null>(null);
  const [sessionParticipants, setSessionParticipants] = useState<{ id: string; username: string }[]>(MOCK_PARTICIPANTS);

  useEffect(() => {
    if (!sessionId) return;
    api
      .get<{ id: string; username: string }[]>(`/sessions/${sessionId}/participants`)
      .then(({ data }) => { if (data.length > 0) setSessionParticipants(data); })
      .catch(() => {});
  }, [sessionId]);

  const ideaTree = useIdeaStore((s) => s.ideaTree);

  // Pass BOTH shortlisted + merged ideas to FinalDocument.
  // - shortlisted → selectable in graph, not yet in doc
  // - merged      → locked/greyed in graph, already in doc
  const finalDocIdeas = useMemo(() =>
    flattenTree(ideaTree)
      .filter((idea) =>
        idea.session_id === sessionId &&
        (idea.status === "shortlisted" || idea.status === "merged")
      )
      .map((idea) => ({
        id:          idea.id,
        title:       idea.title,
        content:     idea.content,
        branch_name: idea.branch_name,
        votes:       idea.votes,
        author:      idea.created_by,
        tags:        idea.tags,
        createdAt:   idea.created_at,
        status:      idea.status as "shortlisted" | "merged",
      })),
    [ideaTree, sessionId]
  );

  // Badge count = only shortlisted (not yet merged)
  const shortlistedCount = useMemo(
    () => finalDocIdeas.filter(i => i.status === "shortlisted").length,
    [finalDocIdeas]
  );

  return (
    <>
      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(3px)} to{opacity:1;transform:translateY(0)} }
        .ws-fadein { animation: fadeIn 0.3s ease forwards; }
        .tab-panel  { animation: fadeIn 0.25s ease forwards; }
      `}</style>

      <div className="ws-fadein flex flex-col" style={{ height: "100vh", background: "#f5f5f0", overflow: "hidden" }}>

        {/* ══ TOP BAR ══ */}
        <header className="flex items-center justify-between flex-shrink-0"
          style={{ padding: "0 24px", height: 56, borderBottom: "1.5px solid #13131A", background: "#f5f5f0", gap: 16 }}>
          <div className="flex items-center" style={{ gap: 0, minWidth: 0 }}>
            <Link to="/sessions"
              className="flex items-center font-body text-[#888] hover:text-ink transition-colors duration-150 flex-shrink-0"
              style={{ gap: 4, fontSize: 12, marginRight: 16, textDecoration: "none" }}>
              <ChevronLeft /> Sessions
            </Link>
            <div style={{ width: 1, height: 20, background: "#ddd", marginRight: 16, flexShrink: 0 }} />
            <div className="flex items-center justify-center flex-shrink-0"
              style={{ width: 26, height: 26, background: "#3a5bff", border: "2px solid #13131A", borderRadius: 4, marginRight: 10 }}>
              <BranchIcon size={14} />
            </div>
            <div className="min-w-0">
              <p className="font-body text-[#888] uppercase" style={{ fontSize: 9, letterSpacing: "0.15em", lineHeight: 1, marginBottom: 2 }}>
                Session {isOwner && <span style={{ color: "#3a5bff" }}>· Owner</span>}
              </p>
              <h1 className="font-display font-extrabold truncate" style={{ fontSize: 15, letterSpacing: "-0.01em", lineHeight: 1 }}>
                {sessionTitle}
              </h1>
            </div>
          </div>

          <div className="flex-shrink-0 hidden md:block">
            <ParticipantList participants={participants} onlineParticipantIds={onlineParticipantIds} />
          </div>

          <div className="flex items-center flex-shrink-0" style={{ gap: 10 }}>
            {activeTab === "workspace" && (
              <button onClick={() => setRightCollapsed((p) => !p)}
                className="flex items-center font-body text-[#888] hover:text-ink hover:border-ink transition-all duration-150"
                style={{ gap: 6, fontSize: 11, padding: "5px 12px", border: "1.5px solid #ddd", borderRadius: 4, background: "transparent", cursor: "pointer" }}>
                <LayoutIcon />
                <span className="hidden sm:inline">{rightCollapsed ? "Show panel" : "Hide panel"}</span>
              </button>
            )}
            <ConnectionStatus status={connectionStatus} />
          </div>
        </header>

        {/* ══ TAB BAR ══ */}
        <div className="flex items-center flex-shrink-0"
          style={{ borderBottom: "1.5px solid #13131A", background: "#f5f5f0", padding: "0 24px" }}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="flex items-center font-body font-semibold transition-all duration-150"
                style={{
                  gap: 7, fontSize: 12, padding: "11px 18px",
                  background: "transparent", border: "none",
                  borderBottom: isActive ? "2px solid #13131A" : "2px solid transparent",
                  cursor: "pointer",
                  color: isActive ? "#13131A" : "#888",
                  marginBottom: -1, letterSpacing: "0.01em",
                }}>
                <span style={{ fontSize: 14 }}>{tab.icon}</span>
                {tab.label}

                {/* Badge: shortlisted ideas waiting to be merged */}
                {tab.id === "final" && shortlistedCount > 0 && (
                  <span style={{
                    fontSize: 9, padding: "1px 6px", borderRadius: 999,
                    background: "rgba(39,201,63,0.12)", color: "#27c93f",
                    border: "1px solid rgba(39,201,63,0.3)", letterSpacing: "0.1em",
                  }}>
                    {shortlistedCount}
                  </span>
                )}

                {/* Owner badge when no shortlisted ideas yet */}
                {tab.id === "final" && isOwner && shortlistedCount === 0 && (
                  <span style={{
                    fontSize: 9, padding: "1px 6px", borderRadius: 999,
                    background: "rgba(58,91,255,0.1)", color: "#3a5bff",
                    border: "1px solid rgba(58,91,255,0.25)", letterSpacing: "0.1em",
                  }}>
                    OWNER
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ══ TAB CONTENT ══ */}
        <div className="flex-1 overflow-hidden">

          {/* WORKSPACE */}
          {activeTab === "workspace" && (
            <div className="tab-panel flex h-full overflow-hidden">
              <div className="flex flex-col overflow-hidden transition-all duration-300"
                style={{ flex: rightCollapsed ? "1 1 100%" : "0 0 62%", borderRight: rightCollapsed ? "none" : "1.5px solid #13131A", background: "#f5f5f0" }}>
                <div className="flex items-center justify-between flex-shrink-0"
                  style={{ padding: "8px 20px", borderBottom: "1.5px solid #13131A", background: "#f5f5f0" }}>
                  <div className="flex items-center" style={{ gap: 8 }}>
                    <span style={{ width: 16, height: 1.5, background: "#3a5bff", display: "block" }} />
                    <span className="font-body text-[#3a5bff] uppercase" style={{ fontSize: 10, letterSpacing: "0.2em" }}>Branch Graph</span>
                  </div>
                  <div className="flex items-center" style={{ gap: 10 }}>
                    {[
                      { color: "#3a5bff", label: "Active"      },
                      { color: "#27c93f", label: "Shortlisted" },
                      { color: "#a855f7", label: "Merged"      },
                      { color: "#888",    label: "Archived"    },
                    ].map((l) => (
                      <div key={l.label} className="flex items-center" style={{ gap: 4 }}>
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: l.color }} />
                        <span className="font-body text-[#888]" style={{ fontSize: 10 }}>{l.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex-1 overflow-hidden">
                  <IdeaBranchGraph sessionId={sessionId} />
                </div>
              </div>

              {!rightCollapsed && (
                <div className="flex flex-col overflow-hidden" style={{ flex: "0 0 38%", background: "#fff" }}>
                  <div className="flex items-center justify-between flex-shrink-0"
                    style={{ padding: "8px 20px", borderBottom: "1.5px solid #13131A", background: "#fff" }}>
                    <div className="flex items-center" style={{ gap: 8 }}>
                      <span style={{ width: 16, height: 1.5, background: "#13131A", display: "block" }} />
                      <span className="font-body text-ink uppercase" style={{ fontSize: 10, letterSpacing: "0.2em" }}>Idea Detail</span>
                    </div>
                    <button onClick={() => setRightCollapsed(true)}
                      className="font-body text-[#888] hover:text-ink transition-colors"
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: "0 2px" }}>
                      ×
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <IdeaDetailPanel sessionId={sessionId} sendMessage={sendMessage} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MY BRAINSTORM PAD */}
          {activeTab === "pad" && (
            <div className="tab-panel h-full overflow-hidden">
              <BrainstormPad
                currentUserId={currentUserId}
                currentUsername={currentUsername}
                sessionParticipants={sessionParticipants}
                onViewPad={(userId, username) => setViewingPad({ userId, username })}
                isOwner={isOwner}
                sessionId={sessionId}
                sendMessage={sendMessage}
              />
            </div>
          )}

          {/* FINAL DOCUMENT */}
          {activeTab === "final" && (
            <div className="tab-panel h-full overflow-hidden">
              <FinalDocument
                sessionTitle={sessionTitle}
                ideas={finalDocIdeas}
                isOwner={isOwner && sessionStatus === "active"}
              />
            </div>
          )}
        </div>

        {/* ══ BOTTOM STATUS BAR ══ */}
        <div className="flex items-center justify-between flex-shrink-0"
          style={{ padding: "0 24px", height: 28, borderTop: "1.5px solid #13131A", background: "#0a0a0a" }}>
          <div className="flex items-center" style={{ gap: 16 }}>
            <span className="font-body text-white/30" style={{ fontSize: 10 }}>
              Session ID: <span className="text-white/50">{sessionId}</span>
            </span>
            <span className="font-body text-white/20" style={{ fontSize: 10 }}>·</span>
            <span className="font-body text-white/30" style={{ fontSize: 10 }}>
              {participants.length} participant{participants.length !== 1 ? "s" : ""}
            </span>
            <span className="font-body text-white/20" style={{ fontSize: 10 }}>·</span>
            <span className="font-body text-white/30" style={{ fontSize: 10, textTransform: "capitalize" }}>
              {activeTab === "workspace" ? "⚡ Workspace" : activeTab === "pad" ? "📝 My Pad" : "📄 Final Document"}
            </span>
          </div>
          <div className="flex items-center" style={{ gap: 6 }}>
            <span className="font-body text-white/30" style={{ fontSize: 10 }}>AES-256 encrypted</span>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#27c93f" }} />
          </div>
        </div>
      </div>

      <PadViewerModal
        open={viewingPad !== null}
        userId={viewingPad?.userId ?? null}
        username={viewingPad?.username ?? null}
        sessionId={sessionId}
        onClose={() => setViewingPad(null)}
      />
    </>
  );
};