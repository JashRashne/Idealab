import { useState } from "react";
import { Link } from "react-router-dom";
import { IdeaBranchGraph } from "../ideas/IdeaBranchGraph";
import { IdeaDetailPanel } from "../ideas/IdeaDetailPanel";
import { ConnectionStatus } from "./ConnectionStatus";
import { ParticipantList } from "./ParticipantList";
import { BrainstormPad } from "./BrainstormPad";
import { FinalDocument } from "./FinalDocument";
import { PadViewerModal } from "./PadViewerModel";
import type { WSMessage } from "../../types";

interface Props {
  sessionTitle: string;
  participants: string[];
  onlineParticipantIds: string[];
  connectionStatus: "connecting" | "connected" | "disconnected";
  sessionId: string;
  sendMessage: (message: WSMessage) => void;
  ideaTree?: unknown;
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

const TABS: { id: Tab; label: string; icon: string; ownerOnly?: boolean }[] = [
  { id: "workspace", label: "Workspace",      icon: "⚡" },
  { id: "pad",       label: "My Brainstorm",  icon: "📝" },
  { id: "final",     label: "Final Document", icon: "📄", ownerOnly: false },
];

// Mock participants for pad sidebar — in real app, pull from session store
const MOCK_PARTICIPANTS = [
  { id: "user_1", username: "Alice" },
  { id: "user_2", username: "Rahul" },
  { id: "user_3", username: "Kim" },
];

// Mock shortlisted ideas — in real app, pull from ideaStore filtered by status === "shortlisted"
const MOCK_SHORTLISTED = [
  {
    id: "sl_1", title: "AI Voice Mode", content: "Combine the voice input and dark mode ideas into a single AI-powered voice interaction system with automatic theme switching.", branch_name: "merged-branch", votes: ["u1","u2","u3","u4","u5"], tags: ["merged","ai","voice"],
  },
  {
    id: "sl_2", title: "Mobile-first Redesign", content: "Redesign the entire dashboard to be mobile-first, with swipeable panels and a bottom navigation bar.", branch_name: "mobile-branch", votes: ["u1","u2","u3"], tags: ["mobile","ux"],
  },
  {
    id: "sl_3", title: "Offline Mode", content: "Allow users to continue working on their ideas offline, with changes syncing once they reconnect.", branch_name: "infrastructure", votes: ["u1","u4"], tags: ["offline","sync"],
  },
];

export const WorkspaceLayout = ({
  sessionTitle,
  participants,
  onlineParticipantIds,
  connectionStatus,
  sessionId,
  sendMessage,
  isOwner = false,
  currentUserId = "current_user",
  currentUsername = "You",
}: Props) => {
  const [activeTab, setActiveTab]           = useState<Tab>("workspace");
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [viewingPad, setViewingPad]         = useState<{ userId: string; username: string } | null>(null);

  // Mock pad content for PadViewerModal — in real app, fetch from API
  const getMockPadContent = (userId: string, username: string) => ({
    userId,
    username,
    content: `<h2>Initial Thoughts</h2><p>Some early brainstorm notes from ${username}. These are rough ideas before pushing to the shared workspace.</p><ul><li>Idea one about user flows</li><li>Something about the onboarding</li><li>Maybe an AI-assisted draft feature?</li></ul>`,
    lastUpdated: new Date(),
  });

  return (
    <>
      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(3px)} to{opacity:1;transform:translateY(0)} }
        .ws-fadein  { animation: fadeIn 0.3s ease forwards; }
        .tab-panel  { animation: fadeIn 0.25s ease forwards; }
      `}</style>

      <div className="ws-fadein flex flex-col" style={{ height: "100vh", background: "#f5f5f0", overflow: "hidden" }}>

        {/* ══════ TOP BAR ══════ */}
        <header
          className="flex items-center justify-between flex-shrink-0"
          style={{ padding: "0 24px", height: 56, borderBottom: "1.5px solid #13131A", background: "#f5f5f0", gap: 16 }}
        >
          {/* Left */}
          <div className="flex items-center" style={{ gap: 0, minWidth: 0 }}>
            <Link
              to="/sessions"
              className="flex items-center font-body text-[#888] hover:text-ink transition-colors duration-150 flex-shrink-0"
              style={{ gap: 4, fontSize: 12, marginRight: 16, textDecoration: "none" }}
            >
              <ChevronLeft /> Sessions
            </Link>
            <div style={{ width: 1, height: 20, background: "#ddd", marginRight: 16, flexShrink: 0 }} />
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{ width: 26, height: 26, background: "#3a5bff", border: "2px solid #13131A", borderRadius: 4, marginRight: 10 }}
            >
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

          {/* Center: participants */}
          <div className="flex-shrink-0 hidden md:block">
            <ParticipantList participants={participants} onlineParticipantIds={onlineParticipantIds} />
          </div>

          {/* Right */}
          <div className="flex items-center flex-shrink-0" style={{ gap: 10 }}>
            {activeTab === "workspace" && (
              <button
                onClick={() => setRightCollapsed((p) => !p)}
                title={rightCollapsed ? "Show detail panel" : "Hide detail panel"}
                className="flex items-center font-body text-[#888] hover:text-ink hover:border-ink transition-all duration-150"
                style={{ gap: 6, fontSize: 11, padding: "5px 12px", border: "1.5px solid #ddd", borderRadius: 4, background: "transparent", cursor: "pointer" }}
              >
                <LayoutIcon />
                <span className="hidden sm:inline">{rightCollapsed ? "Show panel" : "Hide panel"}</span>
              </button>
            )}
            <ConnectionStatus status={connectionStatus} />
          </div>
        </header>

        {/* ══════ TAB BAR ══════ */}
        <div
          className="flex items-center flex-shrink-0"
          style={{ borderBottom: "1.5px solid #13131A", background: "#f5f5f0", padding: "0 24px", gap: 0 }}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center font-body font-semibold transition-all duration-150 relative"
                style={{
                  gap: 7,
                  fontSize: 12,
                  padding: "11px 18px",
                  background: "transparent",
                  border: "none",
                  borderBottom: isActive ? "2px solid #13131A" : "2px solid transparent",
                  cursor: "pointer",
                  color: isActive ? "#13131A" : "#888",
                  marginBottom: -1,
                  letterSpacing: "0.01em",
                }}
              >
                <span style={{ fontSize: 14 }}>{tab.icon}</span>
                {tab.label}
                {tab.id === "final" && isOwner && (
                  <span
                    style={{ fontSize: 9, padding: "1px 6px", borderRadius: 999, background: "rgba(58,91,255,0.1)", color: "#3a5bff", border: "1px solid rgba(58,91,255,0.25)", letterSpacing: "0.1em" }}
                  >
                    OWNER
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ══════ TAB CONTENT ══════ */}
        <div className="flex-1 overflow-hidden">

          {/* ── WORKSPACE TAB ── */}
          {activeTab === "workspace" && (
            <div className="tab-panel flex h-full overflow-hidden">
              {/* Graph */}
              <div
                className="flex flex-col overflow-hidden transition-all duration-300"
                style={{
                  flex: rightCollapsed ? "1 1 100%" : "0 0 62%",
                  borderRight: rightCollapsed ? "none" : "1.5px solid #13131A",
                  background: "#f5f5f0",
                }}
              >
                <div
                  className="flex items-center justify-between flex-shrink-0"
                  style={{ padding: "8px 20px", borderBottom: "1.5px solid #13131A", background: "#f5f5f0" }}
                >
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
                  <IdeaBranchGraph sessionId={sessionId} sendMessage={sendMessage} />
                </div>
              </div>

              {/* Detail panel */}
              {!rightCollapsed && (
                <div className="flex flex-col overflow-hidden" style={{ flex: "0 0 38%", background: "#fff" }}>
                  <div
                    className="flex items-center justify-between flex-shrink-0"
                    style={{ padding: "8px 20px", borderBottom: "1.5px solid #13131A", background: "#fff" }}
                  >
                    <div className="flex items-center" style={{ gap: 8 }}>
                      <span style={{ width: 16, height: 1.5, background: "#13131A", display: "block" }} />
                      <span className="font-body text-ink uppercase" style={{ fontSize: 10, letterSpacing: "0.2em" }}>Idea Detail</span>
                    </div>
                    <button
                      onClick={() => setRightCollapsed(true)}
                      className="font-body text-[#888] hover:text-ink transition-colors"
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: "0 2px" }}
                    >×</button>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <IdeaDetailPanel sessionId={sessionId} sendMessage={sendMessage} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── MY BRAINSTORM PAD TAB ── */}
          {activeTab === "pad" && (
            <div className="tab-panel h-full overflow-hidden">
              <BrainstormPad
                currentUserId={currentUserId}
                currentUsername={currentUsername}
                sessionParticipants={MOCK_PARTICIPANTS}
                onPushToWorkspace={(text) => {
                  // In real app: call createIdea() with text, then switch to workspace tab
                  console.log("Push to workspace:", text);
                  setActiveTab("workspace");
                }}
                onViewPad={(userId, username) => setViewingPad({ userId, username })}
                isOwner={isOwner}
              />
            </div>
          )}

          {/* ── FINAL DOCUMENT TAB ── */}
          {activeTab === "final" && (
            <div className="tab-panel h-full overflow-hidden">
              <FinalDocument
                sessionTitle={sessionTitle}
                shortlistedIdeas={MOCK_SHORTLISTED}
                isOwner={isOwner}
                currentUserId={currentUserId}
              />
            </div>
          )}
        </div>

        {/* ══════ BOTTOM STATUS BAR ══════ */}
        <div
          className="flex items-center justify-between flex-shrink-0"
          style={{ padding: "0 24px", height: 28, borderTop: "1.5px solid #13131A", background: "#0a0a0a" }}
        >
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

      {/* Pad Viewer Modal */}
      <PadViewerModal
        open={viewingPad !== null}
        pad={viewingPad ? getMockPadContent(viewingPad.userId, viewingPad.username) : null}
        onClose={() => setViewingPad(null)}
      />
    </>
  );

};