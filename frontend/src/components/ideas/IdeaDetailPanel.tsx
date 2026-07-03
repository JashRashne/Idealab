import { useEffect, useState } from "react";

import { createComment, getComments, reactToComment } from "../../services/comment.service";
import { updateStatus, voteIdea } from "../../services/idea.service";
import { useAuthStore } from "../../store/authStore";
import { useIdeaStore } from "../../store/ideaStore";
import { useSessionStore } from "../../store/sessionStore";
import type { Comment, IdeaStatus, WSMessage } from "../../types";
import { AIPanel } from "./AIPanel";

interface Props {
  sessionId: string;
  sendMessage: (message: WSMessage) => void;
}

const STATUS_CONFIG: Record<IdeaStatus, { color: string; bg: string; border: string; label: string }> = {
  active:      { color: "#3a5bff", bg: "rgba(58,91,255,0.08)",  border: "rgba(58,91,255,0.3)",  label: "Active"      },
  shortlisted: { color: "#27c93f", bg: "rgba(39,201,63,0.08)",  border: "rgba(39,201,63,0.3)",  label: "Shortlisted" },
  merged:      { color: "#a855f7", bg: "rgba(168,85,247,0.08)", border: "rgba(168,85,247,0.3)", label: "Merged"      },
  archived:    { color: "#888",    bg: "rgba(136,136,136,0.06)",border: "#ddd",                 label: "Archived"    },
};

const STATUS_OPTIONS: IdeaStatus[] = ["active", "shortlisted", "archived"];

function VoteIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="6 1 9 5 3 5" />
      <line x1="6" y1="1" x2="6" y2="11" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="13" y1="1" x2="1" y2="7" />
      <line x1="13" y1="1" x2="7" y2="13" />
      <line x1="13" y1="1" x2="6" y2="6" />
    </svg>
  );
}

export const IdeaDetailPanel = ({ sessionId, sendMessage }: Props) => {
  const idea       = useIdeaStore((s) => s.selectedIdea);
  const updateIdea = useIdeaStore((s) => s.updateIdea);
  const user       = useAuthStore((s) => s.user);
  const session    = useSessionStore((s) => s.currentSession);

  const [comments,     setComments]     = useState<Comment[]>([]);
  const [commentText,  setCommentText]  = useState("");
  const [votePulse,    setVotePulse]    = useState(false);
  const [sendingComment, setSendingComment] = useState(false);
  const [showShortlistConfirm, setShowShortlistConfirm] = useState(false);
  const [statusError, setStatusError] = useState("");

  useEffect(() => {
    if (!idea) return;
    void getComments(idea.id).then(setComments);
  }, [idea]);

  useEffect(() => {
    const reload = () => {
      if (idea) void getComments(idea.id).then(setComments);
    };
    window.addEventListener("idealab:comment-added", reload);
    return () => window.removeEventListener("idealab:comment-added", reload);
  }, [idea]);

  if (!idea) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center" style={{ padding: "40px 24px" }}>
        <div
          style={{
            width: 52, height: 52,
            border: "1.5px dashed #ddd", borderRadius: 4,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, marginBottom: 16,
          }}
        >
          💡
        </div>
        <p className="font-display font-extrabold" style={{ fontSize: 16, letterSpacing: "-0.02em", marginBottom: 6 }}>
          No idea selected
        </p>
        <p className="font-body text-[#aaa]" style={{ fontSize: 12, lineHeight: 1.7, maxWidth: 220 }}>
          Click any node in the branch graph to inspect and collaborate on an idea.
        </p>
      </div>
    );
  }

  const cfg = STATUS_CONFIG[idea.status];
  const participantCount = session?.participant_ids?.length ?? 0;
  const isReadOnly = session?.status === "closed";
  const isIdeaOwner = Boolean(user && idea.created_by === user.id);
  const isSessionOwner = Boolean(user && session?.owner_id === user.id);
  const canShortlist = isIdeaOwner || isSessionOwner;

  const applyStatus = async (status: IdeaStatus) => {
    try {
      const updated = await updateStatus(idea.id, status);
      updateIdea(updated);
    } catch {
      setStatusError("Unable to change status. You may not have permission for this action.");
    }
  };

  const setStatus = async (status: IdeaStatus) => {
    if (isReadOnly) return;
    setStatusError("");

    if (status === "shortlisted") {
      if (!canShortlist) {
        setStatusError("Only the idea owner or session owner can shortlist this idea.");
        return;
      }

      const voteCount = idea.votes.length;
      if (participantCount > 0 && voteCount * 2 <= participantCount) {
        setShowShortlistConfirm(true);
        return;
      }
    }

    await applyStatus(status);
  };

  const onVote = async () => {
    if (isReadOnly) return;
    const updated = await voteIdea(idea.id);
    updateIdea(updated);
    setVotePulse(true);
    setTimeout(() => setVotePulse(false), 600);
  };

  const onComment = async () => {
    if (isReadOnly) return;
    if (!commentText.trim()) return;
    setSendingComment(true);
    try {
      await createComment(idea.id, commentText.trim());
      setCommentText("");
      const refreshed = await getComments(idea.id);
      setComments(refreshed);
    } finally {
      setSendingComment(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes votePop { 0%{transform:scale(1)} 40%{transform:scale(1.18)} 100%{transform:scale(1)} }
        .vote-pop { animation: votePop 0.5s ease; }
        @keyframes commentIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .comment-in { animation: commentIn 0.25s ease forwards; }
        .ci-status-select {
          appearance: none; -webkit-appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23888' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 10px center;
          padding-right: 28px !important;
        }
      `}</style>

      <div className="flex flex-col h-full overflow-hidden">

        {/* ── Idea header ── */}
        <div
          style={{
            padding: "20px 20px 16px",
            borderBottom: "1.5px solid #e5e5e0",
            background: "#fff",
            flexShrink: 0,
          }}
        >
          {/* Status accent + branch */}
          <div className="flex items-center justify-between" style={{ marginBottom: 10, gap: 8 }}>
            <span
              className="font-body uppercase truncate"
              style={{ fontSize: 9, letterSpacing: "0.15em", color: "#aaa" }}
            >
              {idea.branch_name}
            </span>
            <span
              className="font-body flex-shrink-0"
              style={{
                fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase",
                padding: "3px 9px", borderRadius: 999,
                background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
              }}
            >
              {cfg.label}
            </span>
          </div>

          {/* Title */}
          <h3
            className="font-display font-extrabold"
            style={{ fontSize: 20, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 10 }}
          >
            {idea.title}
          </h3>

          {/* Content */}
          {idea.content && (
            <p className="font-body" style={{ fontSize: 13, lineHeight: 1.75, color: "#555", marginBottom: 12 }}>
              {idea.content}
            </p>
          )}

          {/* Tags */}
          {idea.tags.length > 0 && (
            <div className="flex flex-wrap" style={{ gap: 5, marginBottom: 14 }}>
              {idea.tags.map((tag) => (
                <span
                  key={tag}
                  className="font-body"
                  style={{ fontSize: 10, padding: "2px 8px", borderRadius: 3, background: "rgba(58,91,255,0.08)", color: "#3a5bff", border: "1px solid rgba(58,91,255,0.2)" }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Actions row */}
          <div className="flex items-center" style={{ gap: 10 }}>
            {/* Vote button */}
            <button
              onClick={() => void onVote()}
              disabled={isReadOnly}
              className={`flex items-center font-display font-bold transition-all duration-150 hover:bg-[#f0f0eb]${votePulse ? " vote-pop" : ""}`}
              style={{
                gap: 7, padding: "7px 14px",
                border: "1.5px solid #13131A", borderRadius: 4,
                background: "transparent", cursor: isReadOnly ? "not-allowed" : "pointer",
                opacity: isReadOnly ? 0.5 : 1,
                fontSize: 12, letterSpacing: "0.04em",
              }}
            >
              <span style={{ color: "#3a5bff" }}><VoteIcon /></span>
              <span style={{ color: "#3a5bff", fontWeight: 800 }}>{idea.votes.length}</span>
              <span style={{ color: "#555" }}>Vote</span>
            </button>

            {/* Status select */}
            <select
              className="ci-status-select font-body flex-1"
              disabled={isReadOnly}
              style={{
                fontSize: 12, padding: "7px 10px",
                border: `1.5px solid ${cfg.border}`,
                borderRadius: 4, background: cfg.bg,
                color: cfg.color, cursor: isReadOnly ? "not-allowed" : "pointer", outline: "none",
                opacity: isReadOnly ? 0.6 : 1,
              }}
              value={idea.status}
              onChange={(e) => void setStatus(e.target.value as IdeaStatus)}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s} style={{ background: "#fff", color: "#13131A" }}>
                  {STATUS_CONFIG[s].label}
                </option>
              ))}
            </select>
          </div>
          {statusError && (
            <p className="font-body" style={{ marginTop: 8, fontSize: 11, color: "#e53e3e" }}>
              {statusError}
            </p>
          )}
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto" style={{ padding: "0 20px 20px" }}>

          {/* AI Panel */}
          {!isReadOnly && <AIPanel sessionId={sessionId} />}

          {/* Comments section */}
          <div style={{ marginTop: 24, borderTop: "1.5px solid #e5e5e0", paddingTop: 20 }}>
            <div className="flex items-center" style={{ gap: 8, marginBottom: 14 }}>
              <span style={{ width: 16, height: 1.5, background: "#13131A", display: "block" }} />
              <p className="font-body text-ink uppercase" style={{ fontSize: 10, letterSpacing: "0.2em" }}>
                Comments
              </p>
              {comments.length > 0 && (
                <span
                  className="font-body"
                  style={{ fontSize: 10, padding: "1px 7px", border: "1px solid #ddd", borderRadius: 999, color: "#888" }}
                >
                  {comments.length}
                </span>
              )}
            </div>

            {/* Comment list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
              {comments.length === 0 ? (
                <p className="font-body text-[#ccc]" style={{ fontSize: 12 }}>No comments yet. Be the first.</p>
              ) : (
                comments.map((comment) => {
                  const reactions = comment.reactions || [];
                  const groups: Record<string, { count: number; userIds: string[] }> = {};
                  for (const r of reactions) {
                    if (!groups[r.emoji]) {
                      groups[r.emoji] = { count: 0, userIds: [] };
                    }
                    groups[r.emoji].count += 1;
                    groups[r.emoji].userIds.push(r.user_id);
                  }
                  const reactionGroups = Object.entries(groups).map(([emoji, data]) => ({
                    emoji,
                    count: data.count,
                    hasReacted: data.userIds.includes(user?.id ?? ""),
                  }));

                  const handleReactionClick = async (emoji: string) => {
                    if (isReadOnly) return;
                    try {
                      await reactToComment(comment.id, emoji);
                      const refreshed = await getComments(idea.id);
                      setComments(refreshed);
                    } catch (err) {
                      console.error("Failed to toggle reaction", err);
                    }
                  };

                  return (
                    <div
                      key={comment.id}
                      className="comment-in"
                      style={{
                        padding: "10px 14px",
                        background: "#f5f5f0",
                        border: "1px solid #e5e5e0",
                        borderRadius: 4,
                      }}
                    >
                      <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                        <span className="font-body font-bold text-ink/90" style={{ fontSize: 11 }}>
                          {comment.author?.username || comment.author_id.slice(0, 8)}
                        </span>
                        <span className="font-body text-ink/40" style={{ fontSize: 9 }}>
                          {comment.created_at
                            ? new Date(comment.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                            : ""}
                        </span>
                      </div>
                      <p className="font-body" style={{ fontSize: 13, lineHeight: 1.65, color: "#333", marginBottom: 8 }}>
                        {comment.content}
                      </p>
                      <div className="flex items-center flex-wrap" style={{ gap: 6 }}>
                        {reactionGroups.map(({ emoji, count, hasReacted }) => (
                          <button
                            key={emoji}
                            onClick={() => void handleReactionClick(emoji)}
                            disabled={isReadOnly}
                            className="flex items-center"
                            style={{
                              gap: 4,
                              padding: "2px 8px",
                              borderRadius: 999,
                              fontSize: 10,
                              background: hasReacted ? "rgba(58,91,255,0.08)" : "#fff",
                              color: hasReacted ? "#3a5bff" : "#555",
                              border: `1px solid ${hasReacted ? "rgba(58,91,255,0.25)" : "#ddd"}`,
                              cursor: isReadOnly ? "not-allowed" : "pointer",
                              transition: "all 0.15s ease",
                            }}
                          >
                            <span>{emoji}</span>
                            <span className="font-bold">{count}</span>
                          </button>
                        ))}
                        {!isReadOnly && (
                          <div className="relative group" style={{ display: "inline-block" }}>
                            <button
                              className="flex items-center justify-center font-body hover:bg-black/5"
                              style={{
                                width: 20,
                                height: 20,
                                borderRadius: "50%",
                                border: "1px solid #ddd",
                                background: "#fff",
                                fontSize: 10,
                                color: "#888",
                                cursor: "pointer",
                              }}
                            >
                              +
                            </button>
                            <div
                              className="absolute bottom-full left-0 mb-1 hidden group-hover:flex items-center bg-white border border-black/10 p-1 rounded-lg shadow-lg"
                              style={{ gap: 4, zIndex: 10 }}
                            >
                              {["👍", "❤️", "💡", "🚀", "🔥"].map((emoji) => (
                                <button
                                  key={emoji}
                                  onClick={() => void handleReactionClick(emoji)}
                                  className="hover:scale-125 transition-transform duration-100 p-1"
                                  style={{
                                    background: "none",
                                    border: "none",
                                    fontSize: 13,
                                    cursor: "pointer",
                                    lineHeight: 1,
                                  }}
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Comment input */}
            <div
              style={{
                display: "flex", border: "1.5px solid #13131A",
                borderRadius: 4, overflow: "hidden",
              }}
            >
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && void onComment()}
                placeholder="Add a comment…"
                disabled={isReadOnly}
                className="flex-1 font-body"
                style={{
                  fontSize: 13, padding: "10px 14px",
                  border: "none", outline: "none",
                  background: isReadOnly ? "#f5f5f0" : "#fff", color: "#13131A",
                }}
              />
              <button
                onClick={() => void onComment()}
                disabled={isReadOnly || !commentText.trim() || sendingComment}
                className="flex items-center font-display font-bold uppercase text-white hover:bg-[#0a0a0a] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  padding: "0 16px", fontSize: 11, letterSpacing: "0.08em",
                  background: "#13131A", border: "none", cursor: "pointer", gap: 6,
                }}
              >
                <SendIcon />
                Send
              </button>
            </div>
          </div>
        </div>
      </div>

      {showShortlistConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1200,
          }}
        >
          <div style={{ width: 420, background: "#fff", border: "1.5px solid #13131A", borderRadius: 4, padding: 20 }}>
            <p className="font-display font-extrabold" style={{ fontSize: 18, marginBottom: 8 }}>
              Shortlist with low vote support?
            </p>
            <p className="font-body" style={{ fontSize: 13, color: "#555", lineHeight: 1.65, marginBottom: 16 }}>
              This idea has {idea.votes.length} vote{idea.votes.length !== 1 ? "s" : ""} out of {participantCount} participants
              (50% or below). Are you sure you want to shortlist it?
            </p>
            <div className="flex items-center justify-end" style={{ gap: 8 }}>
              <button
                onClick={() => setShowShortlistConfirm(false)}
                className="font-body"
                style={{ padding: "8px 12px", border: "1.5px solid #ddd", borderRadius: 4, background: "#fff", cursor: "pointer", fontSize: 12 }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowShortlistConfirm(false);
                  void applyStatus("shortlisted");
                }}
                className="font-display font-bold uppercase text-white"
                style={{ padding: "8px 14px", border: "1.5px solid #3a5bff", borderRadius: 4, background: "#3a5bff", cursor: "pointer", fontSize: 11, letterSpacing: "0.08em" }}
              >
                Yes, shortlist
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};