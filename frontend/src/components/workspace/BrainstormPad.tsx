import { useState, useRef, useCallback } from "react";

interface PadEntry {
  id: string;
  text: string;
  timestamp: Date;
  pushed: boolean;
}

interface Props {
  currentUserId: string;
  currentUsername: string;
  sessionParticipants: { id: string; username: string }[];
  onPushToWorkspace: (text: string) => void;
  onViewPad: (userId: string, username: string) => void;
  isOwner?: boolean;
}

function PushIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="7" y1="11" x2="7" y2="1" />
      <polyline points="2 5 7 1 12 5" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M1 7s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4z" />
      <circle cx="7" cy="7" r="1.5" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <polyline points="2 4 12 4" />
      <path d="M5 4V2h4v2M4 4l.5 8h5l.5-8" />
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
  onPushToWorkspace,
  onViewPad,
  isOwner = false,
}: Props) => {
  const editorRef   = useRef<HTMLDivElement>(null);
  const [entries, setEntries]         = useState<PadEntry[]>([]);
  const [pushDraft, setPushDraft]     = useState("");
  const [charCount, setCharCount]     = useState(0);
  const [confirmPush, setConfirmPush] = useState(false);
  const [pushSuccess, setPushSuccess] = useState(false);

  const others = sessionParticipants.filter((p) => p.id !== currentUserId);

  const execCmd = (cmd: string, arg?: string) => {
    document.execCommand(cmd, false, arg);
    editorRef.current?.focus();
  };

  const handleEditorInput = useCallback(() => {
    const text = editorRef.current?.innerText ?? "";
    setCharCount(text.length);
    setPushDraft(editorRef.current?.innerHTML ?? "");
  }, []);

  const handlePush = () => {
    const plain = editorRef.current?.innerText?.trim() ?? "";
    if (!plain) return;
    setConfirmPush(true);
  };

  const confirmAndPush = () => {
    const plain = editorRef.current?.innerText?.trim() ?? "";
    if (!plain) return;

    const entry: PadEntry = {
      id: `${Date.now()}`,
      text: plain,
      timestamp: new Date(),
      pushed: true,
    };
    setEntries((p) => [entry, ...p]);
    onPushToWorkspace(plain);
    if (editorRef.current) editorRef.current.innerHTML = "";
    setCharCount(0);
    setPushDraft("");
    setConfirmPush(false);
    setPushSuccess(true);
    setTimeout(() => setPushSuccess(false), 2500);
  };

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
        @keyframes slideIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        .push-success { animation: slideIn 0.3s ease forwards; }
      `}</style>

      <div className="flex h-full overflow-hidden" style={{ background: "#f5f5f0" }}>

        {/* ── MAIN PAD AREA ── */}
        <div className="flex flex-col flex-1 overflow-hidden" style={{ borderRight: "1.5px solid #13131A" }}>

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

            {/* Push to workspace btn */}
            <button
              onClick={handlePush}
              disabled={charCount === 0}
              className="font-display font-bold uppercase text-white flex items-center hover:bg-[#0a0a0a] hover:border-[#0a0a0a] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                fontSize: 11, letterSpacing: "0.08em", padding: "7px 16px",
                background: "#3a5bff", border: "1.5px solid #3a5bff",
                borderRadius: 4, gap: 7, cursor: charCount === 0 ? "not-allowed" : "pointer",
              }}
            >
              <PushIcon /> Push to Workspace
            </button>
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

          {/* Bottom bar: char count + push history */}
          {entries.length > 0 && (
            <div
              className="flex-shrink-0 overflow-y-auto"
              style={{ maxHeight: 180, borderTop: "1.5px solid #13131A", background: "#f5f5f0" }}
            >
              <div style={{ padding: "10px 20px 6px" }}>
                <p className="font-body text-[#888] uppercase" style={{ fontSize: 9, letterSpacing: "0.15em", marginBottom: 8 }}>
                  Pushed to workspace ({entries.length})
                </p>
                {entries.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-start justify-between"
                    style={{ padding: "6px 0", borderBottom: "1px solid #e5e5e0", gap: 12 }}
                  >
                    <p className="font-body text-[#555] flex-1 truncate" style={{ fontSize: 12 }}>
                      ✓ {e.text.slice(0, 80)}{e.text.length > 80 ? "…" : ""}
                    </p>
                    <span className="font-body text-[#aaa] flex-shrink-0" style={{ fontSize: 10 }}>
                      {e.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
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
              View others' brainstorm notes (read-only)
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
                    <p className="font-body text-[#aaa]" style={{ fontSize: 10, marginTop: 1 }}>View pad →</p>
                  </div>
                  <EyeIcon />
                </button>
              ))
            )}
          </div>

          {/* Success toast */}
          {pushSuccess && (
            <div
              className="push-success flex items-center flex-shrink-0"
              style={{ padding: "10px 16px", background: "rgba(39,201,63,0.1)", borderTop: "1.5px solid rgba(39,201,63,0.3)", gap: 8 }}
            >
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#27c93f", flexShrink: 0 }} />
              <span className="font-body" style={{ fontSize: 11, color: "#27c93f" }}>Pushed to workspace!</span>
            </div>
          )}
        </div>
      </div>

      {/* ── PUSH CONFIRM OVERLAY ── */}
      {confirmPush && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: "rgba(10,10,10,0.6)" }}
          onClick={() => setConfirmPush(false)}
        >
          <div
            className="flex flex-col"
            style={{ background: "#f5f5f0", border: "1.5px solid #13131A", borderRadius: 4, padding: 32, maxWidth: 380, width: "100%", margin: 24 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ marginBottom: 20 }}>
              <p className="font-body text-[#3a5bff] uppercase" style={{ fontSize: 10, letterSpacing: "0.2em", marginBottom: 8 }}>Confirm push</p>
              <h3 className="font-display font-extrabold" style={{ fontSize: 22, letterSpacing: "-0.02em", lineHeight: 1, marginBottom: 8 }}>
                Push to workspace?
              </h3>
              <p className="font-body text-[#888]" style={{ fontSize: 13, lineHeight: 1.7 }}>
                This will add your brainstorm note as a new idea in the shared workspace. Everyone in the session will see it.
              </p>
            </div>
            <div
              style={{ padding: 16, border: "1.5px solid #e5e5e0", borderRadius: 4, background: "#fff", marginBottom: 20 }}
            >
              <p className="font-body text-[#555]" style={{ fontSize: 13, lineHeight: 1.7 }}>
                "{editorRef.current?.innerText?.trim().slice(0, 120)}{(editorRef.current?.innerText?.trim().length ?? 0) > 120 ? "…" : ""}"
              </p>
            </div>
            <div className="flex items-center" style={{ gap: 12 }}>
              <button
                onClick={() => setConfirmPush(false)}
                className="font-body text-[#888] hover:text-ink transition-colors"
                style={{ fontSize: 13, background: "none", border: "none", cursor: "pointer", padding: "8px 0" }}
              >
                Cancel
              </button>
              <button
                onClick={confirmAndPush}
                className="font-display font-bold uppercase text-white hover:bg-[#0a0a0a] transition-all duration-150 flex items-center"
                style={{ fontSize: 12, letterSpacing: "0.08em", padding: "10px 24px", background: "#3a5bff", border: "1.5px solid #3a5bff", borderRadius: 4, gap: 8 }}
              >
                <PushIcon /> Confirm Push
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};