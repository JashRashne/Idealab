import { useEffect, useRef, useState } from "react";

import api from "../../services/api";

interface Props {
  open: boolean;
  userId: string | null;
  username: string | null;
  sessionId: string;
  onClose: () => void;
}

interface RemoteCursor {
  x: number;
  y: number;
}

const AVATAR_COLORS = ["#3a5bff", "#27c93f", "#e53e3e", "#d69e2e", "#805ad5", "#0891b2"];

function getColor(username: string) {
  let hash = 0;
  for (const c of username) hash = c.charCodeAt(0) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function ChevronLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 2 4 7 9 12" />
    </svg>
  );
}

const TOOLBAR_LABELS = ["B", "I", "U", "H1", "•", "1."];

export const PadViewerModal = ({ open, userId, username, sessionId, onClose }: Props) => {
  const [content,      setContent]      = useState("");
  const [lastUpdated, setLastUpdated]   = useState<Date | null>(null);
  const [remoteCursor, setRemoteCursor] = useState<RemoteCursor | null>(null);
  const cursorFadeRef = useRef<number | null>(null);

  // Load initial content whenever the viewer opens or target user changes
  useEffect(() => {
    if (!open || !userId || !sessionId) { setContent(""); return; }
    setContent("");
    setRemoteCursor(null);
    api
      .get<{ content: string; updated_at?: string }>(`/pads/${sessionId}/${userId}`)
      .then(({ data }) => {
        setContent(data.content ?? "");
        if (data.updated_at) setLastUpdated(new Date(data.updated_at));
      })
      .catch(() => {});
  }, [open, userId, sessionId]);

  // Listen for real-time pad_updated events (broadcasted via WS → window event)
  useEffect(() => {
    if (!open || !userId) return;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ user_id: string; content: string }>).detail;
      if (detail.user_id === userId) {
        setContent(detail.content);
        setLastUpdated(new Date());
      }
    };
    window.addEventListener("idealab:pad-updated", handler);
    return () => window.removeEventListener("idealab:pad-updated", handler);
  }, [open, userId]);

  // Listen for cursor_moved events
  useEffect(() => {
    if (!open || !userId) return;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ user_id: string; x: number; y: number }>).detail;
      if (detail.user_id === userId) {
        setRemoteCursor({ x: detail.x, y: detail.y });
        if (cursorFadeRef.current !== null) window.clearTimeout(cursorFadeRef.current);
        cursorFadeRef.current = window.setTimeout(() => setRemoteCursor(null), 3000);
      }
    };
    window.addEventListener("idealab:cursor-moved", handler);
    return () => window.removeEventListener("idealab:cursor-moved", handler);
  }, [open, userId]);

  if (!open || !userId || !username) return null;

  const color = getColor(username);

  return (
    <>
      <style>{`
        @keyframes padSlideIn {
          from { opacity: 0; transform: translateX(24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .pad-viewer-slide { animation: padSlideIn 0.22s ease forwards; }
        @keyframes cursorFade { from { opacity: 1; } to { opacity: 0; } }

        .pad-viewer-content h2 { font-size: 18px; font-weight: 700; margin: 12px 0 6px; color: #13131A; }
        .pad-viewer-content ul { list-style: disc; padding-left: 22px; margin: 6px 0; }
        .pad-viewer-content ol { list-style: decimal; padding-left: 22px; margin: 6px 0; }
        .pad-viewer-content li { margin: 4px 0; line-height: 1.85; }
        .pad-viewer-content b  { font-weight: 700; }
        .pad-viewer-content i  { font-style: italic; }
        .pad-viewer-content u  { text-decoration: underline; }
        .pad-viewer-content p  { margin: 4px 0; }
      `}</style>

      {/* ── Live cursor overlay (fixed, viewport-relative) ── */}
      {remoteCursor && (
        <div
          style={{
            position: "fixed",
            left: `${remoteCursor.x * 100}%`,
            top: `${remoteCursor.y * 100}%`,
            transform: "translate(-4px, -4px)",
            pointerEvents: "none",
            zIndex: 200,
            transition: "left 0.08s linear, top 0.08s linear",
          }}
        >
          <div style={{
            width: 12, height: 12, borderRadius: "50%", background: color,
            border: "2px solid #fff", boxShadow: "0 1px 6px rgba(0,0,0,0.35)",
          }} />
          <div style={{
            position: "absolute", top: 16, left: 0,
            background: color, color: "#fff", borderRadius: 3,
            padding: "2px 7px", fontSize: 10,
            fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600,
            whiteSpace: "nowrap", boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
          }}>
            {username}
          </div>
        </div>
      )}

      {/* ── Full-screen overlay ── */}
      <div className="fixed inset-0 z-50 flex flex-col pad-viewer-slide" style={{ background: "#f5f5f0" }}>

        {/* TOP BAR */}
        <div
          className="flex items-center justify-between flex-shrink-0"
          style={{ padding: "0 24px", height: 56, borderBottom: "1.5px solid #13131A", background: "#f5f5f0" }}
        >
          <button
            onClick={onClose}
            className="flex items-center font-body text-[#888] hover:text-ink transition-colors duration-150"
            style={{ gap: 6, fontSize: 13, background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            <ChevronLeft />
            Back to My Pad
          </button>

          <div className="flex items-center" style={{ gap: 10 }}>
            <div
              className="flex items-center justify-center font-body font-bold text-white rounded-full flex-shrink-0"
              style={{ width: 32, height: 32, background: color, fontSize: 12, border: "2px solid #13131A" }}
            >
              {username.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center" style={{ gap: 8 }}>
                <p className="font-display font-extrabold" style={{ fontSize: 15, letterSpacing: "-0.01em", lineHeight: 1 }}>
                  {username}'s Brainstorm Pad
                </p>
                <span
                  className="font-body uppercase"
                  style={{
                    fontSize: 9, letterSpacing: "0.12em", padding: "2px 8px",
                    borderRadius: 999, background: "rgba(58,91,255,0.1)",
                    border: "1px solid rgba(58,91,255,0.3)", color: "#3a5bff",
                  }}
                >
                  Live
                </span>
              </div>
              {lastUpdated && (
                <p className="font-body text-[#aaa]" style={{ fontSize: 10, marginTop: 2 }}>
                  Last updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="font-display font-bold uppercase text-ink hover:bg-ink hover:text-[#f5f5f0] transition-all duration-150"
            style={{
              fontSize: 11, letterSpacing: "0.08em", padding: "7px 16px",
              border: "1.5px solid #13131A", borderRadius: 4,
              background: "transparent", cursor: "pointer",
            }}
          >
            Close ×
          </button>
        </div>

        {/* TOOLBAR (disabled - read-only) */}
        <div
          className="flex items-center flex-shrink-0"
          style={{ padding: "6px 24px", borderBottom: "1.5px solid #e5e5e0", background: "#fff", gap: 2 }}
        >
          {TOOLBAR_LABELS.map((label) => (
            <button
              key={label}
              disabled
              className="font-body"
              style={{
                fontSize: 12, padding: "4px 8px", borderRadius: 3,
                border: "none", background: "transparent",
                color: "#ccc", cursor: "not-allowed", minWidth: 28,
              }}
            >
              {label}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <span className="font-body uppercase" style={{ fontSize: 9, letterSpacing: "0.15em", color: "#bbb" }}>
            Viewing {username}'s notes live
          </span>
        </div>

        {/* CONTENT */}
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto" style={{ padding: "36px 48px", background: "#fff" }}>
            {content.replace(/<[^>]*>/g, "").trim() ? (
              <div
                className="pad-viewer-content"
                style={{
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  fontSize: 14,
                  lineHeight: 1.85,
                  color: "#13131A",
                  maxWidth: 720,
                }}
                // content is HTML from contentEditable — same origin, no XSS risk
                dangerouslySetInnerHTML={{ __html: content }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center" style={{ paddingBottom: 80 }}>
                <div
                  style={{
                    width: 52, height: 52, border: "1.5px dashed #ddd", borderRadius: 4,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22, marginBottom: 20,
                  }}
                >
                  📝
                </div>
                <p className="font-display font-extrabold" style={{ fontSize: 18, letterSpacing: "-0.02em", marginBottom: 8 }}>
                  Nothing here yet
                </p>
                <p className="font-body text-[#aaa]" style={{ fontSize: 13, lineHeight: 1.7, maxWidth: 280 }}>
                  {username} hasn't written anything in their brainstorm pad yet.
                </p>
              </div>
            )}
          </div>

          {/* Right info strip */}
          <div
            className="flex-shrink-0 flex flex-col"
            style={{ width: 220, borderLeft: "1.5px solid #13131A", background: "#f5f5f0" }}
          >
            <div style={{ padding: "16px", borderBottom: "1.5px solid #13131A" }}>
              <p className="font-body text-[#888] uppercase" style={{ fontSize: 9, letterSpacing: "0.15em", marginBottom: 10 }}>
                About this pad
              </p>
              <div className="flex items-center" style={{ gap: 10, marginBottom: 16 }}>
                <div
                  className="flex items-center justify-center font-body font-bold text-white rounded-full"
                  style={{ width: 40, height: 40, background: color, fontSize: 14, flexShrink: 0 }}
                >
                  {username.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-display font-bold" style={{ fontSize: 14 }}>{username}</p>
                  <p className="font-body text-[#aaa]" style={{ fontSize: 11, marginTop: 1 }}>Session participant</p>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ padding: "10px 12px", border: "1px solid #e5e5e0", borderRadius: 4, background: "#fff" }}>
                  <p className="font-body text-[#aaa] uppercase" style={{ fontSize: 9, letterSpacing: "0.1em", marginBottom: 3 }}>Last updated</p>
                  <p className="font-body" style={{ fontSize: 12 }}>
                    {lastUpdated
                      ? lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : "—"}
                  </p>
                </div>
                <div style={{ padding: "10px 12px", border: "1px solid #e5e5e0", borderRadius: 4, background: "#fff" }}>
                  <p className="font-body text-[#aaa] uppercase" style={{ fontSize: 9, letterSpacing: "0.1em", marginBottom: 3 }}>Content length</p>
                  <p className="font-body" style={{ fontSize: 12 }}>
                    {content.replace(/<[^>]*>/g, "").trim().length} chars
                  </p>
                </div>
                <div style={{ padding: "10px 12px", border: "1px solid #e5e5e0", borderRadius: 4, background: "#fff" }}>
                  <div className="flex items-center" style={{ gap: 5 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: remoteCursor ? "#27c93f" : "#ddd" }} />
                    <p className="font-body" style={{ fontSize: 12, color: remoteCursor ? "#27c93f" : "#aaa" }}>
                      {remoteCursor ? "Active now" : "Idle"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// interface Props {
//   open: boolean;
//   pad: PadContent | null;
//   onClose: () => void;
// }

// const AVATAR_COLORS = ["#3a5bff", "#27c93f", "#e53e3e", "#d69e2e", "#805ad5", "#0891b2"];

// function getColor(username: string) {
//   let hash = 0;
//   for (const c of username) hash = c.charCodeAt(0) + ((hash << 5) - hash);
//   return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
// }

// function ChevronLeft() {
//   return (
//     <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//       <polyline points="9 2 4 7 9 12" />
//     </svg>
//   );
// }

// const TOOLBAR_LABELS = ["B", "I", "U", "H1", "•", "1."];

// export const PadViewerModal = ({ open, pad, onClose }: Props) => {
//   if (!open || !pad) return null;

//   const color = getColor(pad.username);

//   return (
//     <>
//       <style>{`
//         @keyframes padSlideIn {
//           from { opacity: 0; transform: translateX(24px); }
//           to   { opacity: 1; transform: translateX(0); }
//         }
//         .pad-viewer-slide { animation: padSlideIn 0.22s ease forwards; }

//         .pad-viewer-content h2 { font-size: 18px; font-weight: 700; margin: 12px 0 6px; color: #13131A; }
//         .pad-viewer-content ul { list-style: disc; padding-left: 22px; margin: 6px 0; }
//         .pad-viewer-content ol { list-style: decimal; padding-left: 22px; margin: 6px 0; }
//         .pad-viewer-content li { margin: 4px 0; line-height: 1.85; }
//         .pad-viewer-content b  { font-weight: 700; }
//         .pad-viewer-content i  { font-style: italic; }
//         .pad-viewer-content u  { text-decoration: underline; }
//         .pad-viewer-content p  { margin: 4px 0; }
//       `}</style>

//       {/* Full-screen overlay — same structure as BrainstormPad */}
//       <div
//         className="fixed inset-0 z-50 flex flex-col pad-viewer-slide"
//         style={{ background: "#f5f5f0" }}
//       >

//         {/* ── TOP BAR — mirrors BrainstormPad header ── */}
//         <div
//           className="flex items-center justify-between flex-shrink-0"
//           style={{
//             padding: "0 24px",
//             height: 56,
//             borderBottom: "1.5px solid #13131A",
//             background: "#f5f5f0",
//           }}
//         >
//           {/* Left: back button */}
//           <button
//             onClick={onClose}
//             className="flex items-center font-body text-[#888] hover:text-ink transition-colors duration-150"
//             style={{ gap: 6, fontSize: 13, background: "none", border: "none", cursor: "pointer", padding: 0 }}
//           >
//             <ChevronLeft />
//             Back to My Pad
//           </button>

//           {/* Center: user identity */}
//           <div className="flex items-center" style={{ gap: 10 }}>
//             <div
//               className="flex items-center justify-center font-body font-bold text-white rounded-full flex-shrink-0"
//               style={{ width: 32, height: 32, background: color, fontSize: 12, border: "2px solid #13131A" }}
//             >
//               {pad.username.slice(0, 2).toUpperCase()}
//             </div>
//             <div>
//               <div className="flex items-center" style={{ gap: 8 }}>
//                 <p className="font-display font-extrabold" style={{ fontSize: 15, letterSpacing: "-0.01em", lineHeight: 1 }}>
//                   {pad.username}'s Brainstorm Pad
//                 </p>
//                 <span
//                   className="font-body uppercase"
//                   style={{
//                     fontSize: 9, letterSpacing: "0.12em", padding: "2px 8px",
//                     borderRadius: 999, background: "rgba(58,91,255,0.1)",
//                     border: "1px solid rgba(58,91,255,0.3)", color: "#3a5bff",
//                   }}
//                 >
//                   Read-only
//                 </span>
//               </div>
//               {pad.lastUpdated && (
//                 <p className="font-body text-[#aaa]" style={{ fontSize: 10, marginTop: 2 }}>
//                   Last updated {pad.lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
//                 </p>
//               )}
//             </div>
//           </div>

//           {/* Right: close */}
//           <button
//             onClick={onClose}
//             className="font-display font-bold uppercase text-ink hover:bg-ink hover:text-[#f5f5f0] transition-all duration-150"
//             style={{
//               fontSize: 11, letterSpacing: "0.08em", padding: "7px 16px",
//               border: "1.5px solid #13131A", borderRadius: 4,
//               background: "transparent", cursor: "pointer",
//             }}
//           >
//             Close ×
//           </button>
//         </div>

//         {/* ── TOOLBAR — same as BrainstormPad but all disabled ── */}
//         <div
//           className="flex items-center flex-shrink-0"
//           style={{
//             padding: "6px 24px",
//             borderBottom: "1.5px solid #e5e5e0",
//             background: "#fff",
//             gap: 2,
//           }}
//         >
//           {TOOLBAR_LABELS.map((label) => (
//             <button
//               key={label}
//               disabled
//               className="font-body"
//               style={{
//                 fontSize: 12, padding: "4px 8px", borderRadius: 3,
//                 border: "none", background: "transparent",
//                 color: "#ccc", cursor: "not-allowed", minWidth: 28,
//               }}
//             >
//               {label}
//             </button>
//           ))}
//           <div style={{ flex: 1 }} />
//           <span
//             className="font-body uppercase"
//             style={{ fontSize: 9, letterSpacing: "0.15em", color: "#bbb" }}
//           >
//             Viewing {pad.username}'s notes
//           </span>
//         </div>

//         {/* ── CONTENT — full scrollable area, same as BrainstormPad editor zone ── */}
//         <div
//           className="flex flex-1 overflow-hidden"
//         >
//           {/* Main content area */}
//           <div
//             className="flex-1 overflow-y-auto"
//             style={{ padding: "36px 48px", background: "#fff" }}
//           >
//             {pad.content.trim() ? (
//               <div
//                 className="pad-viewer-content"
//                 style={{
//                   fontFamily: "'IBM Plex Sans', sans-serif",
//                   fontSize: 14,
//                   lineHeight: 1.85,
//                   color: "#13131A",
//                   maxWidth: 720,
//                 }}
//                 dangerouslySetInnerHTML={{ __html: pad.content }}
//               />
//             ) : (
//               <div
//                 className="flex flex-col items-center justify-center h-full text-center"
//                 style={{ paddingBottom: 80 }}
//               >
//                 <div
//                   style={{
//                     width: 52, height: 52,
//                     border: "1.5px dashed #ddd",
//                     borderRadius: 4,
//                     display: "flex", alignItems: "center", justifyContent: "center",
//                     fontSize: 22, marginBottom: 20,
//                   }}
//                 >
//                   📝
//                 </div>
//                 <p className="font-display font-extrabold" style={{ fontSize: 18, letterSpacing: "-0.02em", marginBottom: 8 }}>
//                   Nothing here yet
//                 </p>
//                 <p className="font-body text-[#aaa]" style={{ fontSize: 13, lineHeight: 1.7, maxWidth: 280 }}>
//                   {pad.username} hasn't written anything in their brainstorm pad yet.
//                 </p>
//               </div>
//             )}
//           </div>

//           {/* Right info strip — same width as BrainstormPad sidebar */}
//           <div
//             className="flex-shrink-0 flex flex-col"
//             style={{
//               width: 220,
//               borderLeft: "1.5px solid #13131A",
//               background: "#f5f5f0",
//             }}
//           >
//             <div style={{ padding: "16px", borderBottom: "1.5px solid #13131A" }}>
//               <p className="font-body text-[#888] uppercase" style={{ fontSize: 9, letterSpacing: "0.15em", marginBottom: 10 }}>
//                 About this pad
//               </p>
//               {/* Avatar */}
//               <div className="flex items-center" style={{ gap: 10, marginBottom: 16 }}>
//                 <div
//                   className="flex items-center justify-center font-body font-bold text-white rounded-full"
//                   style={{ width: 40, height: 40, background: color, fontSize: 14, flexShrink: 0 }}
//                 >
//                   {pad.username.slice(0, 2).toUpperCase()}
//                 </div>
//                 <div>
//                   <p className="font-display font-bold" style={{ fontSize: 14 }}>{pad.username}</p>
//                   <p className="font-body text-[#aaa]" style={{ fontSize: 11, marginTop: 1 }}>Session participant</p>
//                 </div>
//               </div>

//               {/* Meta */}
//               <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
//                 <div style={{ padding: "10px 12px", border: "1px solid #e5e5e0", borderRadius: 4, background: "#fff" }}>
//                   <p className="font-body text-[#aaa] uppercase" style={{ fontSize: 9, letterSpacing: "0.1em", marginBottom: 3 }}>Last updated</p>
//                   <p className="font-body" style={{ fontSize: 12 }}>
//                     {pad.lastUpdated
//                       ? pad.lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
//                       : "—"}
//                   </p>
//                 </div>

//                 <div style={{ padding: "10px 12px", border: "1px solid #e5e5e0", borderRadius: 4, background: "#fff" }}>
//                   <p className="font-body text-[#aaa] uppercase" style={{ fontSize: 9, letterSpacing: "0.1em", marginBottom: 3 }}>Content length</p>
//                   <p className="font-body" style={{ fontSize: 12 }}>
//                     {pad.content.replace(/<[^>]*>/g, "").trim().length} characters
//                   </p>
//                 </div>

//                 <div
//                   style={{
//                     padding: "10px 12px",
//                     border: "1px solid rgba(58,91,255,0.2)",
//                     borderRadius: 4,
//                     background: "rgba(58,91,255,0.04)",
//                   }}
//                 >
//                   <p className="font-body text-[#3a5bff] uppercase" style={{ fontSize: 9, letterSpacing: "0.1em", marginBottom: 3 }}>Access</p>
//                   <p className="font-body text-[#3a5bff]" style={{ fontSize: 12 }}>Read-only view</p>
//                 </div>
//               </div>
//             </div>

//             {/* Notice */}
//             <div style={{ padding: "16px" }}>
//               <p className="font-body text-[#bbb]" style={{ fontSize: 11, lineHeight: 1.7 }}>
//                 You can view {pad.username}'s brainstorm notes but cannot edit them. Only {pad.username} can make changes.
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* ── BOTTOM STATUS BAR — mirrors WorkspaceLayout ── */}
//         <div
//           className="flex items-center justify-between flex-shrink-0"
//           style={{
//             padding: "0 24px",
//             height: 28,
//             borderTop: "1.5px solid #13131A",
//             background: "#0a0a0a",
//           }}
//         >
//           <span className="font-body text-white/30" style={{ fontSize: 10 }}>
//             Viewing <span className="text-white/50">{pad.username}</span>'s pad · Read-only
//           </span>
//           <div className="flex items-center" style={{ gap: 6 }}>
//             <span className="font-body text-white/30" style={{ fontSize: 10 }}>AES-256 encrypted</span>
//             <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#27c93f" }} />
//           </div>
//         </div>

//       </div>
//     </>
//   );
// };