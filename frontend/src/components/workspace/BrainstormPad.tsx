import { useState, useRef, useCallback, useEffect } from "react";

import api from "../../services/api";
import type { WSMessage } from "../../types";

interface Props {
  currentUserId: string;
  currentUsername: string;
  sessionParticipants: { id: string; username: string }[];
  onViewPad: (userId: string, username: string) => void;
  isOwner?: boolean;
  sessionId: string;
  sendMessage: (message: WSMessage) => void;
}

function EyeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M1 7s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4z" />
      <circle cx="7" cy="7" r="1.5" />
    </svg>
  );
}

const AVATAR_COLORS = ["#3a5bff","#27c93f","#e53e3e","#d69e2e","#805ad5","#0891b2","#db2777"];

const TOOLBAR_ACTIONS = [
  { label: "B",    title: "Bold",          cmd: "bold",             style: { fontWeight: 800 } },
  { label: "I",    title: "Italic",        cmd: "italic",           style: { fontStyle: "italic" } },
  { label: "U",    title: "Underline",     cmd: "underline",        style: { textDecoration: "underline" } },
  { label: "H1",   title: "Heading",       cmd: "formatBlock",      arg: "H2", style: { fontWeight: 700 } },
  { label: "•",    title: "Bullet list",   cmd: "insertUnorderedList", style: {} },
  { label: "1.",   title: "Numbered list", cmd: "insertOrderedList",   style: {} },
];

export const BrainstormPad = ({
  currentUserId,
  currentUsername,
  sessionParticipants,
  onViewPad,
  sessionId,
  sendMessage,
}: Props) => {
  const editorRef      = useRef<HTMLDivElement>(null);
  const saveTimerRef   = useRef<number | null>(null);
  const cursorTimerRef = useRef<number | null>(null);
  const [charCount, setCharCount] = useState(0);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");

  const others = sessionParticipants.filter((p) => p.id !== currentUserId);

  // Load saved pad content on mount
  useEffect(() => {
    api
      .get<{ content: string }>(`/pads/${sessionId}/${currentUserId}`)
      .then(({ data }) => {
        if (editorRef.current && data.content) {
          editorRef.current.innerHTML = data.content;
          setCharCount(editorRef.current.innerText.trim().length);
        }
      })
      .catch(() => {});
  }, [sessionId, currentUserId]);

  const execCmd = (cmd: string, arg?: string) => {
    document.execCommand(cmd, false, arg);
    editorRef.current?.focus();
  };

  const debouncedSave = useCallback(() => {
    if (saveTimerRef.current !== null) window.clearTimeout(saveTimerRef.current);
    setSaveState("saving");
    saveTimerRef.current = window.setTimeout(() => {
      const content = editorRef.current?.innerHTML ?? "";
      api
        .put(`/pads/${sessionId}`, { content })
        .then(() => {
          setSaveState("saved");
          window.setTimeout(() => setSaveState("idle"), 1500);
        })
        .catch(() => { setSaveState("idle"); });
    }, 800);
  }, [sessionId]);

  const handleEditorInput = useCallback(() => {
    const text = editorRef.current?.innerText ?? "";
    setCharCount(text.trim().length);
    debouncedSave();
  }, [debouncedSave]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (cursorTimerRef.current !== null) return;
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      sendMessage({ type: "cursor_move", payload: { x, y, username: currentUsername } });
      cursorTimerRef.current = window.setTimeout(() => { cursorTimerRef.current = null; }, 50);
    },
    [sendMessage, currentUsername],
  );

  return (
    <>
      <style>{`
        .pad-editor:empty:before {
          content: attr(data-placeholder);
          color: #aaa;
          pointer-events: none;
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 14px;
        }
        .pad-editor:focus { outline: none; }
        .pad-editor h2 { font-size: 18px; font-weight: 700; margin: 8px 0 4px; }
        .pad-editor ul { list-style: disc; padding-left: 20px; margin: 4px 0; }
        .pad-editor ol { list-style: decimal; padding-left: 20px; margin: 4px 0; }
        .pad-editor li { margin: 2px 0; }
      `}</style>

      <div className="flex h-full overflow-hidden" style={{ background: "#f5f5f0" }}>

        {/* ── MAIN PAD AREA ── */}
        <div className="flex flex-col flex-1 overflow-hidden" style={{ borderRight: "1.5px solid #13131A" }}
          onMouseMove={handleMouseMove}
        >

          {/* Pad header */}
          <div
            className="flex items-center justify-between flex-shrink-0"
            style={{ padding: "12px 20px", borderBottom: "1.5px solid #13131A", background: "#f5f5f0" }}
          >
            <div className="flex items-center" style={{ gap: 10 }}>
              <div
                className="flex items-center justify-center font-body font-bold text-white rounded-full flex-shrink-0"
                style={{ width: 28, height: 28, background: "#3a5bff", fontSize: 11 }}
              >
                {currentUsername.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-display font-bold" style={{ fontSize: 13, lineHeight: 1 }}>
                  {currentUsername}'s Pad
                </p>
                <p className="font-body text-[#888]" style={{ fontSize: 10, marginTop: 1 }}>
                  Private brainstorm area · only you can edit
                </p>
              </div>
            </div>

            {/* Auto-save indicator */}
            <div className="flex items-center" style={{ gap: 6 }}>
              {saveState === "saving" && (
                <span className="font-body text-[#bbb]" style={{ fontSize: 10 }}>Saving…</span>
              )}
              {saveState === "saved" && (
                <span className="font-body text-[#27c93f]" style={{ fontSize: 10 }}>✓ Saved</span>
              )}
            </div>
          </div>

          {/* Toolbar */}
          <div
            className="flex items-center flex-shrink-0"
            style={{ padding: "6px 20px", borderBottom: "1.5px solid #e5e5e0", background: "#fff", gap: 2 }}
          >
            {TOOLBAR_ACTIONS.map((a) => (
              <button
                key={a.label}
                title={a.title}
                onMouseDown={(e) => { e.preventDefault(); execCmd(a.cmd, a.arg); }}
                className="font-body hover:bg-[#f0f0eb] transition-colors duration-100"
                style={{
                  ...a.style,
                  fontSize: 12, padding: "4px 8px", borderRadius: 3,
                  border: "none", background: "transparent", cursor: "pointer",
                  minWidth: 28, color: "#13131A",
                }}
              >
                {a.label}
              </button>
            ))}
            <div style={{ flex: 1 }} />
            <span className="font-body text-[#bbb]" style={{ fontSize: 10 }}>{charCount} chars</span>
          </div>

          {/* Editor */}
          <div className="flex-1 overflow-y-auto" style={{ padding: "24px 28px", background: "#fff" }}>
            <div
              ref={editorRef}
              className="pad-editor"
              contentEditable
              suppressContentEditableWarning
              data-placeholder="Start writing your thoughts here… anything goes. This is your private brainstorm space."
              onInput={handleEditorInput}
              style={{
                minHeight: "100%",
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: 14,
                lineHeight: 1.85,
                color: "#13131A",
                caretColor: "#3a5bff",
              }}
            />
          </div>

          {/* Bottom bar: char count */}
          <div
            className="flex items-center justify-between flex-shrink-0"
            style={{ padding: "6px 20px", borderTop: "1.5px solid #e5e5e0", background: "#f5f5f0" }}
          >
            <span className="font-body text-[#bbb]" style={{ fontSize: 10 }}>{charCount} chars</span>
          </div>
        </div>

        {/* ── SIDEBAR: Other participants' pads ── */}
        <div
          className="flex flex-col flex-shrink-0 overflow-hidden"
          style={{ width: 220, background: "#f5f5f0" }}
        >
          <div style={{ padding: "12px 16px", borderBottom: "1.5px solid #13131A" }}>
            <p className="font-body text-[#888] uppercase" style={{ fontSize: 9, letterSpacing: "0.15em", marginBottom: 2 }}>
              Teammates' Pads
            </p>
            <p className="font-body text-[#bbb]" style={{ fontSize: 10, lineHeight: 1.5 }}>
              View others' live brainstorm notes
            </p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {others.length === 0 ? (
              <div style={{ padding: "20px 16px" }}>
                <p className="font-body text-[#bbb]" style={{ fontSize: 12, lineHeight: 1.6 }}>
                  No other participants in this session yet.
                </p>
              </div>
            ) : (
              others.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => onViewPad(p.id, p.username)}
                  className="w-full flex items-center hover:bg-[#ece9e0] transition-colors duration-150 text-left"
                  style={{ padding: "12px 16px", borderBottom: "1px solid #e5e5e0", gap: 10, background: "transparent", border_bottom: "1px solid #e5e5e0", cursor: "pointer" }}
                >
                  <div
                    className="flex items-center justify-center font-body font-bold text-white rounded-full flex-shrink-0"
                    style={{ width: 26, height: 26, background: AVATAR_COLORS[i % AVATAR_COLORS.length], fontSize: 10 }}
                  >
                    {p.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold truncate" style={{ fontSize: 12 }}>{p.username}</p>
                    <p className="font-body text-[#aaa]" style={{ fontSize: 10, marginTop: 1 }}>View live →</p>
                  </div>
                  <EyeIcon />
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};