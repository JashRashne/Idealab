import { useState, useMemo, useRef, useEffect, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  reactions?: Record<string, string[]>;
}

interface ShortlistedIdea {
  id: string;
  title: string;
  content: string;
  branch_name: string;
  votes: string[];
  author?: string;
  tags?: string[];
  comments?: Comment[];
  createdAt?: string;
}

interface MergedIdea extends ShortlistedIdea {
  mergedAt: Date;
  ownerNote?: string;
}

interface Props {
  sessionTitle: string;
  shortlistedIdeas: ShortlistedIdea[];
  isOwner: boolean;
  currentUserId: string;
}

// ─── Branch colours ───────────────────────────────────────────────────────────
const COLORS = [
  "#4d9de0", "#e8c547", "#e15554", "#3bb273",
  "#d67ab1", "#f4845f", "#7c77b9", "#4ecdc4",
];

// ─── Mini icons ───────────────────────────────────────────────────────────────
const Ico = {
  Check: () => (
    <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1.5 6 4.5 9.5 10.5 2.5" />
    </svg>
  ),
  Lock: () => (
    <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5.5" width="8" height="5.5" rx="1" /><path d="M4 5.5V4a2 2 0 0 1 4 0v1.5" />
    </svg>
  ),
  Merge: () => (
    <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <circle cx="3" cy="3" r="1.8" /><circle cx="3" cy="11" r="1.8" /><circle cx="11" cy="7" r="1.8" />
      <path d="M4.8 3.6 Q8 3.6 9.2 7" /><path d="M4.8 10.4 Q8 10.4 9.2 7" />
    </svg>
  ),
  Download: () => (
    <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <line x1="7" y1="1" x2="7" y2="9" /><polyline points="3 6 7 10 11 6" /><line x1="1" y1="13" x2="13" y2="13" />
    </svg>
  ),
  Remove: () => (
    <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <line x1="1.5" y1="1.5" x2="10.5" y2="10.5" /><line x1="10.5" y1="1.5" x2="1.5" y2="10.5" />
    </svg>
  ),
  Comment: () => (
    <svg width="10" height="10" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 2h10a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H5l-3 2V3a1 1 0 0 1 1-1z" />
    </svg>
  ),
  Vote: () => (
    <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="2 8.5 6 3.5 10 8.5" />
    </svg>
  ),
};

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ name, size = 18, color }: { name: string; size?: number; color?: string }) {
  const initials = name.split(/[\s_-]/).map(w => w[0]?.toUpperCase() ?? "").slice(0, 2).join("");
  const hue = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  const bg = color ? `${color}22` : `hsl(${hue},40%,20%)`;
  const fg = color ?? `hsl(${hue},60%,65%)`;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: size, height: size, borderRadius: "50%",
      background: bg, color: fg,
      fontFamily: "'IBM Plex Mono',monospace", fontSize: size * 0.40, fontWeight: 700,
      border: `1px solid ${fg}45`, flexShrink: 0, letterSpacing: "-0.02em",
    }}>{initials}</span>
  );
}

// ─── Inline Comment Panel (appears below the clicked row) ────────────────────
function InlineComments({
  idea, color, onClose,
}: { idea: ShortlistedIdea; color: string; onClose: () => void }) {
  const [text, setText] = useState("");
  const [list, setList] = useState<Comment[]>(idea.comments ?? []);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [list.length]);

  const send = () => {
    if (!text.trim()) return;
    setList(p => [...p, { id: String(Date.now()), author: "You", content: text.trim(), createdAt: new Date().toISOString() }]);
    setText("");
  };

  return (
    <div style={{
      borderTop: `1px solid ${color}30`,
      borderBottom: `1px solid ${color}30`,
      background: "#0b0b14",
      animation: "expandDown .18s ease forwards",
    }}>
      {/* idea quick-info bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 14px 7px", borderBottom: `1px solid ${color}18` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0 }} />
          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color, letterSpacing: "0.14em", textTransform: "uppercase" }}>{idea.branch_name}</span>
          <span style={{ fontFamily: "'IBM Plex Sans',sans-serif", fontWeight: 600, fontSize: 11, color: "#bbb", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 130 }}>{idea.title}</span>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#333", padding: "2px 4px", lineHeight: 1, transition: "color .12s" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#aaa")} onMouseLeave={e => (e.currentTarget.style.color = "#333")}>
          <Ico.Remove />
        </button>
      </div>

      {/* comments list */}
      <div style={{ maxHeight: 180, overflowY: "auto", padding: "10px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
        {list.length === 0 ? (
          <p style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: "#2e2e42", margin: 0, textAlign: "center", padding: "12px 0" }}>No comments yet</p>
        ) : list.map(c => (
          <div key={c.id} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <Avatar name={c.author} size={20} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 7, marginBottom: 2 }}>
                <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: "#666", fontWeight: 600 }}>{c.author}</span>
                <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: "#252535" }}>
                  {new Date(c.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <p style={{ fontFamily: "'IBM Plex Sans',sans-serif", fontSize: 12, color: "#888", lineHeight: 1.6, margin: 0, wordBreak: "break-word" }}>{c.content}</p>
              {c.reactions && Object.keys(c.reactions).length > 0 && (
                <div style={{ display: "flex", gap: 4, marginTop: 5, flexWrap: "wrap" }}>
                  {Object.entries(c.reactions).map(([emoji, users]) => (
                    <span key={emoji} style={{ fontSize: 11, padding: "1px 6px", borderRadius: 99, background: "#15151f", border: "1px solid #25253a", color: "#666", cursor: "pointer", fontFamily: "'IBM Plex Mono',monospace" }}>
                      {emoji} {users.length}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* input */}
      <div style={{ padding: "8px 14px 10px", borderTop: `1px solid ${color}18`, display: "flex", gap: 7 }}>
        <input
          placeholder="Reply…"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          style={{
            flex: 1, fontFamily: "'IBM Plex Sans',sans-serif", fontSize: 12,
            padding: "6px 10px", background: "#12121c",
            border: `1px solid ${text ? color + "55" : "#1e1e2e"}`,
            borderRadius: 3, outline: "none", color: "#ccc", transition: "border .15s",
          }}
        />
        <button onClick={send} disabled={!text.trim()} style={{
          padding: "6px 12px", borderRadius: 3, border: "none",
          cursor: text.trim() ? "pointer" : "not-allowed",
          background: text.trim() ? color : "#1a1a28",
          color: text.trim() ? "#fff" : "#333",
          fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, fontWeight: 700,
          transition: "all .15s",
        }}>↵</button>
      </div>
    </div>
  );
}

// ─── Git Graph SVG builder ────────────────────────────────────────────────────
// Returns SVG path data for the full graph
interface GraphRow {
  idea: ShortlistedIdea;
  branchIdx: number;
  rowIdx: number;
}

function buildGraphPaths(rows: GraphRow[], branchOrder: string[], LANE: number, ROW: number, PAD_L: number, PAD_T: number) {
  // For each branch, track its active lane and draw bezier curves when it
  // "appears" (branch-off from lane 0) and "ends" (merges back).
  // Simple model: lane 0 is always the oldest/main branch.
  // Other branches curve FROM lane 0 at their first commit, then straight down,
  // then curve BACK to lane 0 after their last commit.

  const laneX = (bIdx: number) => PAD_L + bIdx * LANE + LANE / 2;
  const rowY  = (rIdx: number) => PAD_T + rIdx * ROW + ROW / 2;

  const paths: { d: string; color: string; dashed?: boolean }[] = [];
  const dots: { cx: number; cy: number; color: string; idea: ShortlistedIdea; branchIdx: number }[] = [];

  // group rows by branch
  const byBranch = new Map<number, GraphRow[]>();
  rows.forEach(r => {
    if (!byBranch.has(r.branchIdx)) byBranch.set(r.branchIdx, []);
    byBranch.get(r.branchIdx)!.push(r);
  });

  // Draw paths per branch
  byBranch.forEach((bRows, bIdx) => {
    const color = COLORS[bIdx % COLORS.length];
    const firstRow = bRows[0].rowIdx;
    const lastRow  = bRows[bRows.length - 1].rowIdx;

    if (bIdx === 0) {
      // Main branch — straight vertical through all rows
      const x = laneX(0);
      paths.push({ d: `M ${x} ${PAD_T} L ${x} ${PAD_T + rows.length * ROW}`, color, });
    } else {
      // Branch-off: bezier from lane 0 at row (firstRow-0.5) to this lane at firstRow
      const x0 = laneX(0);
      const xB = laneX(bIdx);
      const yBranch = rowY(firstRow) - ROW * 0.5;   // midpoint above first commit
      const yFirst  = rowY(firstRow);
      const yLast   = rowY(lastRow);
      const yMerge  = rowY(lastRow) + ROW * 0.5;     // midpoint below last commit

      // branch-off curve
      paths.push({
        d: `M ${x0} ${yBranch} C ${x0} ${yFirst - 4}, ${xB} ${yFirst - 4}, ${xB} ${yFirst}`,
        color,
      });

      // straight segment between first and last commit on this branch
      if (lastRow > firstRow) {
        paths.push({ d: `M ${xB} ${yFirst} L ${xB} ${yLast}`, color });
      }

      // merge-back curve (dashed to show it rejoins main)
      paths.push({
        d: `M ${xB} ${yLast} C ${xB} ${yMerge + 4}, ${x0} ${yMerge + 4}, ${x0} ${yMerge}`,
        color,
        dashed: true,
      });
    }

    // Dots
    bRows.forEach(r => {
      dots.push({ cx: laneX(bIdx), cy: rowY(r.rowIdx), color, idea: r.idea, branchIdx: bIdx });
    });
  });

  return { paths, dots, laneX, rowY };
}

// ─── Branch Graph Panel ───────────────────────────────────────────────────────
function BranchGraph({ ideas, selectedIds, mergedIds, isOwner, onToggle }: {
  ideas: ShortlistedIdea[];
  selectedIds: Set<string>;
  mergedIds: Set<string>;
  isOwner: boolean;
  onToggle: (id: string) => void;
}) {
  const [openComment, setOpenComment] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  const branchOrder = useMemo(() => {
    const seen: string[] = [];
    ideas.forEach(i => { if (!seen.includes(i.branch_name)) seen.push(i.branch_name); });
    return seen;
  }, [ideas]);

  // Build rows: round-robin interleave
  const rows: GraphRow[] = useMemo(() => {
    const queues = new Map<string, ShortlistedIdea[]>();
    branchOrder.forEach(b => queues.set(b, []));
    ideas.forEach(i => queues.get(i.branch_name)!.push(i));
    const result: GraphRow[] = [];
    let rowIdx = 0, anyLeft = true;
    while (anyLeft) {
      anyLeft = false;
      branchOrder.forEach((b, bIdx) => {
        const q = queues.get(b)!;
        if (q.length > 0) { result.push({ idea: q.shift()!, branchIdx: bIdx, rowIdx: rowIdx++ }); anyLeft = true; }
      });
    }
    return result;
  }, [ideas, branchOrder]);

  // Layout
  const LANE = 18, ROW = 54, PAD_L = 14, PAD_T = 12;
  const svgW = PAD_L + branchOrder.length * LANE + 4;
  const svgH = PAD_T + rows.length * ROW + PAD_T;

  const { paths, dots, rowY } = useMemo(
    () => buildGraphPaths(rows, branchOrder, LANE, ROW, PAD_L, PAD_T),
    [rows, branchOrder]
  );

  if (ideas.length === 0) {
    return (
      <div style={{ padding: "40px 20px", textAlign: "center" }}>
        <p style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: "#2e2e3e", lineHeight: 1.8 }}>
          No shortlisted ideas yet.<br />Mark ideas in the workspace.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Branch legend */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, padding: "7px 12px 6px", borderBottom: "1px solid #141420" }}>
        {branchOrder.map((name, bIdx) => {
          const color = COLORS[bIdx % COLORS.length];
          return (
            <span key={name} style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              fontFamily: "'IBM Plex Mono',monospace", fontSize: 9,
              padding: "2px 6px", borderRadius: 2,
              background: `${color}10`, border: `1px solid ${color}30`, color,
              letterSpacing: "0.05em",
            }}>
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: color }} />
              {name}
            </span>
          );
        })}
      </div>

      {/* Graph + rows */}
      <div style={{ position: "relative" }}>
        {/* SVG behind rows */}
        <svg
          width={svgW} height={svgH}
          style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none", zIndex: 1, overflow: "visible" }}
        >
          <defs>
            {COLORS.map((c, i) => (
              <filter key={i} id={`glow${i}`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            ))}
          </defs>

          {/* Branch curves */}
          {paths.map((p, i) => (
            <path key={i} d={p.d} stroke={p.color} strokeWidth="1.5" fill="none"
              strokeOpacity={p.dashed ? 0.25 : 0.45}
              strokeDasharray={p.dashed ? "3 4" : undefined}
            />
          ))}

          {/* Commit dots */}
          {dots.map(({ cx, cy, color, idea, branchIdx }) => {
            const isMerged  = mergedIds.has(idea.id);
            const isSel     = selectedIds.has(idea.id);
            const isHov     = hovered === idea.id;
            const active    = isSel || isMerged || isHov;
            const colorIdx  = branchIdx % COLORS.length;
            return (
              <g key={idea.id}>
                {active && (
                  <circle cx={cx} cy={cy} r={9} fill={color} fillOpacity="0.1" filter={`url(#glow${colorIdx})`} />
                )}
                {/* outer ring */}
                <circle cx={cx} cy={cy} r={6} fill="none"
                  stroke={color} strokeWidth="1.2" strokeOpacity={active ? 0.8 : 0.3}
                />
                {/* fill */}
                <circle cx={cx} cy={cy} r={4}
                  fill={isMerged ? color : isSel ? `${color}cc` : "#0d0d14"}
                  stroke={color} strokeWidth="1.5"
                />
                {/* lock icon for merged */}
                {isMerged && (
                  <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle"
                    fontSize="5" fill="#0d0d14" fontWeight="bold">🔒</text>
                )}
                {/* check for selected */}
                {isSel && !isMerged && (
                  <polyline points={`${cx - 2},${cy} ${cx},${cy + 2} ${cx + 3},${cy - 2}`}
                    fill="none" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Text rows — interleaved with optional inline comment panel */}
        <div style={{ paddingTop: PAD_T }}>
          {rows.map(({ idea, branchIdx, rowIdx }) => {
            const color     = COLORS[branchIdx % COLORS.length];
            const isMerged  = mergedIds.has(idea.id);
            const isSel     = selectedIds.has(idea.id);
            const isHov     = hovered === idea.id;
            const isComment = openComment === idea.id;

            return (
              <div key={idea.id}>
                {/* Main row */}
                <div
                  onMouseEnter={() => setHovered(idea.id)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => {
                    if (isMerged) return; // locked — can't deselect
                    if (isOwner) onToggle(idea.id);
                  }}
                  style={{
                    height: ROW,
                    paddingLeft: svgW + 8,
                    paddingRight: 10,
                    display: "flex", alignItems: "center",
                    background: isMerged
                      ? `${color}0d`
                      : isSel
                      ? `${color}16`
                      : isHov ? "#111120" : "transparent",
                    borderBottom: isComment ? "none" : "1px solid #0f0f1c",
                    cursor: isMerged ? "default" : isOwner ? "pointer" : "default",
                    transition: "background .1s",
                    position: "relative",
                  }}
                >
                  {/* left accent bar */}
                  {(isSel || isMerged) && (
                    <span style={{
                      position: "absolute", left: svgW + 1,
                      top: 7, bottom: 7, width: 2, borderRadius: 2, background: color,
                      opacity: isMerged ? 0.5 : 1,
                    }} />
                  )}

                  {/* checkbox / lock */}
                  {isOwner && (
                    <span style={{
                      width: 14, height: 14, borderRadius: 2, flexShrink: 0, marginRight: 7,
                      border: `1.5px solid ${isMerged ? color + "60" : isSel ? color : "#222232"}`,
                      background: isMerged ? `${color}15` : isSel ? `${color}22` : "transparent",
                      color: isMerged ? `${color}80` : color,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all .12s",
                    }}>
                      {isMerged ? <Ico.Lock /> : isSel ? <Ico.Check /> : null}
                    </span>
                  )}

                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* title + author */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                      <p style={{
                        fontFamily: "'IBM Plex Sans',sans-serif", fontWeight: 600, fontSize: 12,
                        color: isMerged ? `${color}90` : isSel ? "#e2e2e2" : isHov ? "#c0c0c0" : "#888",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        margin: 0, flex: 1, minWidth: 0, transition: "color .1s",
                        textDecoration: isMerged ? "none" : "none",
                      }}>
                        {idea.title}
                        {isMerged && <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: `${color}70`, marginLeft: 6, letterSpacing: "0.1em" }}>LOCKED</span>}
                      </p>
                      {idea.author && (
                        <span style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                          <Avatar name={idea.author} size={14} color={color} />
                          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: "#3e3e52", whiteSpace: "nowrap" }}>
                            {idea.author}
                          </span>
                        </span>
                      )}
                    </div>

                    {/* meta: branch · votes · comments */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{
                        fontFamily: "'IBM Plex Mono',monospace", fontSize: 9,
                        padding: "1px 5px", borderRadius: 2,
                        background: `${color}14`, border: `1px solid ${color}28`, color,
                        letterSpacing: "0.04em", flexShrink: 0,
                      }}>
                        {idea.branch_name}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: 2, fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: "#333348" }}>
                        <Ico.Vote /> {idea.votes.length}
                      </span>
                      {/* comment toggle */}
                      <button
                        onClick={e => { e.stopPropagation(); setOpenComment(openComment === idea.id ? null : idea.id); }}
                        style={{
                          display: "flex", alignItems: "center", gap: 3,
                          fontFamily: "'IBM Plex Mono',monospace", fontSize: 10,
                          color: isComment ? color : "#333348",
                          background: "none", border: "none", cursor: "pointer", padding: 0,
                          transition: "color .12s",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.color = color)}
                        onMouseLeave={e => (e.currentTarget.style.color = isComment ? color : "#333348")}
                      >
                        <Ico.Comment />
                        <span>{(idea.comments ?? []).length}</span>
                      </button>
                      {isMerged && (
                        <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: `${color}70`, letterSpacing: "0.06em" }}>
                          ✓ in doc
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Inline comment panel */}
                {isComment && (
                  <InlineComments idea={idea} color={color} onClose={() => setOpenComment(null)} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export const FinalDocument = ({ sessionTitle, shortlistedIdeas, isOwner, currentUserId }: Props) => {
  const [mergedIdeas,  setMergedIdeas]  = useState<MergedIdea[]>([]);
  const [selectedIds,  setSelectedIds]  = useState<Set<string>>(new Set());
  const [noteMap,      setNoteMap]      = useState<Record<string, string>>({});
  const [editingNote,  setEditingNote]  = useState<string | null>(null);
  const [docTitle,     setDocTitle]     = useState(`${sessionTitle} — Final Document`);
  const [editingTitle, setEditingTitle] = useState(false);
  const [exported,     setExported]     = useState(false);
  const [justMerged,   setJustMerged]   = useState<Set<string>>(new Set());

  const branchOrder = useMemo(() => {
    const seen: string[] = [];
    shortlistedIdeas.forEach(i => { if (!seen.includes(i.branch_name)) seen.push(i.branch_name); });
    return seen;
  }, [shortlistedIdeas]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }, []);

  // Merge: locks them in graph + adds to doc
  const handleMerge = () => {
    const toAdd = shortlistedIdeas
      .filter(i => selectedIds.has(i.id) && !mergedIdeas.find(m => m.id === i.id))
      .map(i => ({ ...i, mergedAt: new Date(), ownerNote: noteMap[i.id] ?? "" }));
    if (!toAdd.length) return;
    // Flash animation set
    setJustMerged(new Set(toAdd.map(i => i.id)));
    setTimeout(() => setJustMerged(new Set()), 1200);
    setMergedIdeas(p => [...p, ...toAdd]);
    setSelectedIds(new Set());
  };

  const removeFromDoc = (id: string) => setMergedIdeas(p => p.filter(m => m.id !== id));

  const handleExport = () => {
    const lines: string[] = [`# ${docTitle}`, `Generated: ${new Date().toLocaleDateString()}`, "", "---", ""];
    mergedIdeas.forEach((idea, i) => {
      lines.push(`## ${i + 1}. ${idea.title}`, `**Branch:** ${idea.branch_name}  |  **Author:** ${idea.author ?? "—"}  |  **Votes:** ${idea.votes.length}`);
      if (idea.tags?.length) lines.push(`**Tags:** ${idea.tags.join(", ")}`);
      lines.push("", idea.content);
      if (idea.ownerNote) lines.push("", `> **Owner's note:** ${idea.ownerNote}`);
      lines.push("", "---", "");
    });
    const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${docTitle.replace(/\s+/g, "_")}.md`; a.click();
    URL.revokeObjectURL(url);
    setExported(true); setTimeout(() => setExported(false), 3000);
  };

  const mergedIds = useMemo(() => new Set(mergedIdeas.map(m => m.id)), [mergedIdeas]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;700&family=IBM+Plex+Sans:wght@400;600;700;800&display=swap');
        @keyframes ideaIn   { from{opacity:0;transform:translateY(7px)} to{opacity:1;transform:translateY(0)} }
        @keyframes expandDown { from{opacity:0;max-height:0} to{opacity:1;max-height:400px} }
        @keyframes lockPulse { 0%{transform:scale(1)} 40%{transform:scale(1.18)} 100%{transform:scale(1)} }
        .idea-row { animation: ideaIn .22s ease forwards; }
        .just-merged { animation: lockPulse .5s ease; }
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1e1e2e; border-radius: 2px; }
      `}</style>

      <div style={{ display: "flex", height: "100%", overflow: "hidden", fontFamily: "'IBM Plex Sans',sans-serif" }}>

        {/* ── LEFT: Branch Graph ── */}
        <div style={{
          width: 310, flexShrink: 0,
          display: "flex", flexDirection: "column",
          background: "#0d0d14",
          borderRight: "1px solid #161622",
          overflow: "hidden",
        }}>
          {/* panel header */}
          <div style={{ padding: "10px 14px 8px", borderBottom: "1px solid #141420", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2 }}>
              <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="#4a6a8a" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="4" cy="3" r="1.5" /><circle cx="4" cy="11" r="1.5" /><circle cx="10" cy="5" r="1.5" />
                <line x1="4" y1="4.5" x2="4" y2="9.5" /><path d="M4 4.5 Q4 5 10 5" />
              </svg>
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: "#3a5a72", letterSpacing: "0.2em", textTransform: "uppercase" }}>GRAPH</span>
              <span style={{
                fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, padding: "1px 5px", borderRadius: 2,
                background: "rgba(77,157,224,0.07)", border: "1px solid rgba(77,157,224,0.2)", color: "#4d9de0",
              }}>
                {shortlistedIdeas.length}
              </span>
            </div>
            <p style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: "#252535", margin: 0 }}>
              {isOwner ? "click to select · ◉ for comments" : "shortlisted · read-only"}
            </p>
          </div>

          {/* Merge to doc button */}
          {isOwner && selectedIds.size > 0 && (
            <div style={{ padding: "7px 11px", borderBottom: "1px solid #141420", background: "rgba(58,91,255,0.04)", flexShrink: 0 }}>
              <button onClick={handleMerge} style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                padding: "8px 0", background: "#3a5bff", border: "none", borderRadius: 3,
                cursor: "pointer", fontFamily: "'IBM Plex Mono',monospace", fontSize: 10,
                fontWeight: 700, color: "#fff", letterSpacing: "0.08em", textTransform: "uppercase",
                boxShadow: "0 0 16px rgba(58,91,255,0.3)",
                transition: "box-shadow .15s",
              }}>
                <Ico.Merge /> Merge {selectedIds.size} into Document
              </button>
            </div>
          )}

          {/* scrollable graph */}
          <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
            <BranchGraph
              ideas={shortlistedIdeas}
              selectedIds={selectedIds}
              mergedIds={mergedIds}
              isOwner={isOwner}
              onToggle={toggleSelect}
            />
          </div>
        </div>

        {/* ── RIGHT: Final Document ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#f6f6f1", overflow: "hidden" }}>

          {/* top bar */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "11px 26px", borderBottom: "1.5px solid #111",
            background: "#fff", flexShrink: 0,
          }}>
            <div style={{ flex: 1, minWidth: 0, marginRight: 16 }}>
              {editingTitle && isOwner ? (
                <input autoFocus value={docTitle}
                  onChange={e => setDocTitle(e.target.value)}
                  onBlur={() => setEditingTitle(false)}
                  onKeyDown={e => e.key === "Enter" && setEditingTitle(false)}
                  style={{
                    fontFamily: "'IBM Plex Sans',sans-serif", fontWeight: 700, fontSize: 16,
                    width: "100%", background: "transparent", border: "none", outline: "none",
                    borderBottom: "1.5px solid #3a5bff", color: "#0d0d14", letterSpacing: "-0.02em",
                  }}
                />
              ) : (
                <h2 onClick={() => isOwner && setEditingTitle(true)} title={isOwner ? "Click to rename" : ""}
                  style={{
                    fontFamily: "'IBM Plex Sans',sans-serif", fontWeight: 700, fontSize: 16,
                    letterSpacing: "-0.02em", lineHeight: 1, margin: 0, color: "#0d0d14",
                    cursor: isOwner ? "text" : "default",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>
                  {docTitle}
                  {isOwner && <span style={{ fontSize: 10, color: "#ddd", marginLeft: 6 }}>✎</span>}
                </h2>
              )}
              <p style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: "#bbb", margin: "4px 0 0" }}>
                {mergedIdeas.length} idea{mergedIdeas.length !== 1 ? "s" : ""} merged
                {!isOwner && " · read-only"}
              </p>
            </div>
            {mergedIdeas.length > 0 && (
              <button onClick={handleExport} style={{
                display: "flex", alignItems: "center", gap: 6, padding: "6px 14px",
                fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, fontWeight: 700,
                letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer",
                background: exported ? "#3bb273" : "transparent",
                border: `1.5px solid ${exported ? "#3bb273" : "#111"}`,
                color: exported ? "#fff" : "#111", borderRadius: 3, transition: "all .18s",
              }}>
                <Ico.Download /> {exported ? "Exported!" : "Export .md"}
              </button>
            )}
          </div>

          {/* document body */}
          <div style={{ flex: 1, overflowY: "auto", padding: "32px 44px" }}>
            {mergedIdeas.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", paddingBottom: 60, textAlign: "center" }}>
                <div style={{ width: 46, height: 46, border: "1.5px solid #e0e0da", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18, fontSize: 20 }}>📄</div>
                <p style={{ fontFamily: "'IBM Plex Sans',sans-serif", fontWeight: 800, fontSize: 19, letterSpacing: "-0.02em", marginBottom: 8, color: "#111" }}>Document is empty</p>
                <p style={{ fontFamily: "'IBM Plex Sans',sans-serif", fontSize: 13, color: "#aaa", lineHeight: 1.75, maxWidth: 290, margin: 0 }}>
                  {isOwner
                    ? "Select commits in the branch graph, then click \"Merge into Document\"."
                    : "The owner hasn't merged any ideas yet."}
                </p>
              </div>
            ) : (
              <div style={{ maxWidth: 680 }}>
                {/* heading */}
                <div style={{ marginBottom: 36, paddingBottom: 22, borderBottom: "1.5px solid #111" }}>
                  <p style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: "#bbb", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8 }}>
                    Final Output · {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                  <h1 style={{ fontFamily: "'IBM Plex Sans',sans-serif", fontWeight: 800, fontSize: 28, letterSpacing: "-0.03em", lineHeight: 1, marginBottom: 7, color: "#0d0d14" }}>
                    {docTitle}
                  </h1>
                  <p style={{ fontFamily: "'IBM Plex Sans',sans-serif", fontSize: 13, color: "#999", margin: 0 }}>
                    {mergedIdeas.length} idea{mergedIdeas.length !== 1 ? "s" : ""} merged · "{sessionTitle}"
                  </p>
                </div>

                {mergedIdeas.map((idea, i) => {
                  const bIdx  = branchOrder.indexOf(idea.branch_name);
                  const color = COLORS[bIdx % COLORS.length] ?? "#4d9de0";
                  const isNew = justMerged.has(idea.id);

                  return (
                    <div key={idea.id}
                      className={`idea-row${isNew ? " just-merged" : ""}`}
                      style={{ marginBottom: 40, paddingBottom: 40, borderBottom: i < mergedIdeas.length - 1 ? "1px solid #e8e8e2" : "none" }}
                    >
                      {/* header */}
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14, marginBottom: 12 }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, color, paddingTop: 3, flexShrink: 0 }}>
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <div>
                            <h3 style={{ fontFamily: "'IBM Plex Sans',sans-serif", fontWeight: 800, fontSize: 19, letterSpacing: "-0.02em", marginBottom: 7, color: "#0d0d14" }}>
                              {idea.title}
                            </h3>
                            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 7 }}>
                              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, padding: "2px 7px", borderRadius: 2, background: `${color}12`, border: `1px solid ${color}30`, color }}>
                                {idea.branch_name}
                              </span>
                              {idea.author && (
                                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                  <Avatar name={idea.author} size={15} color={color} />
                                  <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: "#999" }}>{idea.author}</span>
                                </span>
                              )}
                              <span style={{ display: "flex", alignItems: "center", gap: 3, fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: "#bbb" }}>
                                <Ico.Vote /> {idea.votes.length}
                              </span>
                              <span style={{ display: "flex", alignItems: "center", gap: 3, fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: "#bbb" }}>
                                <Ico.Comment /> {(idea.comments ?? []).length}
                              </span>
                              {idea.tags?.map(tag => (
                                <span key={tag} style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, padding: "2px 7px", borderRadius: 2, background: "rgba(58,91,255,0.07)", color: "#3a5bff", border: "1px solid rgba(58,91,255,0.2)" }}>
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        {isOwner && (
                          <button onClick={() => removeFromDoc(idea.id)}
                            style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, border: "1.5px solid #e0e0da", borderRadius: 3, background: "transparent", cursor: "pointer", color: "#ccc", flexShrink: 0, marginTop: 2, transition: "all .15s" }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#e53e3e"; (e.currentTarget as HTMLElement).style.borderColor = "#e53e3e"; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#ccc"; (e.currentTarget as HTMLElement).style.borderColor = "#e0e0da"; }}
                          >
                            <Ico.Remove /> Remove
                          </button>
                        )}
                      </div>

                      <p style={{ fontFamily: "'IBM Plex Sans',sans-serif", fontSize: 14, lineHeight: 1.85, color: "#333", marginBottom: 14 }}>
                        {idea.content}
                      </p>

                      {idea.ownerNote && (
                        <div style={{ padding: "11px 14px", background: `${color}07`, border: `1.5px solid ${color}20`, borderRadius: 3, marginBottom: 8 }}>
                          <p style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: "#999", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 3 }}>Owner's note</p>
                          <p style={{ fontFamily: "'IBM Plex Sans',sans-serif", fontSize: 13, color, lineHeight: 1.6, margin: 0 }}>{idea.ownerNote}</p>
                        </div>
                      )}

                      {isOwner && (
                        editingNote === idea.id ? (
                          <div style={{ marginTop: 6 }}>
                            <textarea autoFocus placeholder="Add a note about this idea…"
                              value={noteMap[idea.id] ?? idea.ownerNote ?? ""}
                              onChange={e => setNoteMap(p => ({ ...p, [idea.id]: e.target.value }))}
                              rows={2}
                              style={{ width: "100%", fontFamily: "'IBM Plex Sans',sans-serif", fontSize: 13, padding: "9px 12px", border: `1.5px solid ${color}`, borderRadius: 3, outline: "none", resize: "none", lineHeight: 1.6, background: "#fff", boxSizing: "border-box" }}
                            />
                            <div style={{ display: "flex", gap: 7, marginTop: 5 }}>
                              <button onClick={() => { setMergedIdeas(p => p.map(m => m.id === idea.id ? { ...m, ownerNote: noteMap[idea.id] ?? m.ownerNote } : m)); setEditingNote(null); }}
                                style={{ fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", padding: "5px 13px", background: color, border: `1.5px solid ${color}`, borderRadius: 3, cursor: "pointer", color: "#fff" }}>
                                Save
                              </button>
                              <button onClick={() => setEditingNote(null)}
                                style={{ fontFamily: "'IBM Plex Sans',sans-serif", fontSize: 12, background: "none", border: "none", cursor: "pointer", color: "#aaa" }}>
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => setEditingNote(idea.id)}
                            style={{ fontFamily: "'IBM Plex Sans',sans-serif", fontSize: 11, background: "none", border: "none", cursor: "pointer", padding: 0, marginTop: 2, color: "#ccc", transition: "color .15s" }}
                            onMouseEnter={e => (e.currentTarget.style.color = color)}
                            onMouseLeave={e => (e.currentTarget.style.color = "#ccc")}
                          >
                            {idea.ownerNote ? "✎ Edit note" : "+ Add owner note"}
                          </button>
                        )
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};