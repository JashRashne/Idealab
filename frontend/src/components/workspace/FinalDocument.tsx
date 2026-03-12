import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { updateStatus } from "../../services/idea.service";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  reactions?: Record<string, string[]>;
}

export interface ShortlistedIdea {
  id: string;
  title: string;
  content: string;
  branch_name: string;
  votes: string[];
  author?: string;
  tags?: string[];
  comments?: Comment[];
  createdAt?: string;
  status?: "shortlisted" | "merged";
}

interface MergedIdea extends ShortlistedIdea {
  mergedAt: Date;
  ownerNote?: string;
}

interface Props {
  sessionTitle: string;
  // Pass ALL ideas with status "shortlisted" OR "merged" for this session.
  // Shortlisted  → selectable in graph
  // Merged       → locked/greyed in graph + shown in right doc panel
  ideas: ShortlistedIdea[];
  isOwner: boolean;
}

// ─── Branch colours ───────────────────────────────────────────────────────────
const COLORS = [
  "#4d9de0", "#e8c547", "#e15554", "#3bb273",
  "#d67ab1", "#f4845f", "#7c77b9", "#4ecdc4",
];

// ─── Icons ────────────────────────────────────────────────────────────────────
const Ico = {
  Check: () => (
    <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1.5 6 4.5 9.5 10.5 2.5" />
    </svg>
  ),
  Lock: () => (
    <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5.5" width="8" height="5.5" rx="1" />
      <path d="M4 5.5V4a2 2 0 0 1 4 0v1.5" />
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
      fontFamily: "'IBM Plex Mono',monospace",
      fontSize: size * 0.40, fontWeight: 700,
      border: `1px solid ${fg}45`, flexShrink: 0,
    }}>
      {initials}
    </span>
  );
}

// ─── Inline Comment Panel ─────────────────────────────────────────────────────
function InlineComments({ idea, color, onClose }: {
  idea: ShortlistedIdea; color: string; onClose: () => void;
}) {
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
    <div style={{ borderTop: `1px solid ${color}30`, borderBottom: `1px solid ${color}30`, background: "#0b0b14", animation: "expandDown .18s ease forwards" }}>
      {/* bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 14px 7px", borderBottom: `1px solid ${color}18` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color, letterSpacing: "0.14em", textTransform: "uppercase" }}>{idea.branch_name}</span>
          <span style={{ fontFamily: "'IBM Plex Sans',sans-serif", fontWeight: 600, fontSize: 11, color: "#bbb", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 130 }}>{idea.title}</span>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#333", padding: "2px 4px", transition: "color .12s" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#aaa")} onMouseLeave={e => (e.currentTarget.style.color = "#333")}>
          <Ico.Remove />
        </button>
      </div>

      {/* list */}
      <div style={{ maxHeight: 180, overflowY: "auto", padding: "10px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
        {list.length === 0
          ? <p style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: "#2e2e42", margin: 0, textAlign: "center", padding: "12px 0" }}>No comments yet</p>
          : list.map(c => (
            <div key={c.id} style={{ display: "flex", gap: 8 }}>
              <Avatar name={c.author} size={20} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", gap: 7, marginBottom: 2 }}>
                  <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: "#666", fontWeight: 600 }}>{c.author}</span>
                  <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: "#252535" }}>
                    {new Date(c.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p style={{ fontFamily: "'IBM Plex Sans',sans-serif", fontSize: 12, color: "#888", lineHeight: 1.6, margin: 0, wordBreak: "break-word" }}>{c.content}</p>
              </div>
            </div>
          ))}
        <div ref={endRef} />
      </div>

      {/* input */}
      <div style={{ padding: "8px 14px 10px", borderTop: `1px solid ${color}18`, display: "flex", gap: 7 }}>
        <input placeholder="Reply…" value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          style={{ flex: 1, fontFamily: "'IBM Plex Sans',sans-serif", fontSize: 12, padding: "6px 10px", background: "#12121c", border: `1px solid ${text ? color + "55" : "#1e1e2e"}`, borderRadius: 3, outline: "none", color: "#ccc", transition: "border .15s" }}
        />
        <button onClick={send} disabled={!text.trim()} style={{
          padding: "6px 12px", borderRadius: 3, border: "none",
          cursor: text.trim() ? "pointer" : "not-allowed",
          background: text.trim() ? color : "#1a1a28",
          color: text.trim() ? "#fff" : "#333",
          fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, fontWeight: 700,
        }}>↵</button>
      </div>
    </div>
  );
}

// ─── Git Graph SVG paths ──────────────────────────────────────────────────────
interface GraphRow { idea: ShortlistedIdea; branchIdx: number; rowIdx: number; }

function buildGraphPaths(
  rows: GraphRow[], LANE: number, ROW: number, PAD_L: number, PAD_T: number
) {
  const laneX = (b: number) => PAD_L + b * LANE + LANE / 2;
  const rowY  = (r: number) => PAD_T + r * ROW + ROW / 2;

  const paths: { d: string; color: string; dashed?: boolean }[] = [];
  const dots:  { cx: number; cy: number; color: string; idea: ShortlistedIdea; branchIdx: number }[] = [];

  const byBranch = new Map<number, GraphRow[]>();
  rows.forEach(r => {
    if (!byBranch.has(r.branchIdx)) byBranch.set(r.branchIdx, []);
    byBranch.get(r.branchIdx)!.push(r);
  });

  byBranch.forEach((bRows, bIdx) => {
    const color    = COLORS[bIdx % COLORS.length];
    const firstRow = bRows[0].rowIdx;
    const lastRow  = bRows[bRows.length - 1].rowIdx;

    if (bIdx === 0) {
      // main lane — straight vertical for the full height
      paths.push({ d: `M ${laneX(0)} ${PAD_T} L ${laneX(0)} ${PAD_T + rows.length * ROW}`, color });
    } else {
      const x0 = laneX(0), xB = laneX(bIdx);
      const yBranchOff = rowY(firstRow) - ROW * 0.5;
      const yFirst     = rowY(firstRow);
      const yLast      = rowY(lastRow);
      const yMergeBack = rowY(lastRow) + ROW * 0.5;

      // curve off from main
      paths.push({ d: `M ${x0} ${yBranchOff} C ${x0} ${yFirst - 4}, ${xB} ${yFirst - 4}, ${xB} ${yFirst}`, color });
      // straight down the branch lane
      if (lastRow > firstRow) paths.push({ d: `M ${xB} ${yFirst} L ${xB} ${yLast}`, color });
      // dashed curve back to main
      paths.push({ d: `M ${xB} ${yLast} C ${xB} ${yMergeBack + 4}, ${x0} ${yMergeBack + 4}, ${x0} ${yMergeBack}`, color, dashed: true });
    }

    bRows.forEach(r => dots.push({ cx: laneX(bIdx), cy: rowY(r.rowIdx), color, idea: r.idea, branchIdx: bIdx }));
  });

  return { paths, dots, laneX, rowY };
}

// ─── Branch Graph Panel ───────────────────────────────────────────────────────
function BranchGraph({ ideas, selectedIds, mergedIds, isOwner, onToggle }: {
  ideas: ShortlistedIdea[];       // shortlisted + merged combined
  selectedIds: Set<string>;       // currently checked by owner
  mergedIds: Set<string>;         // already merged into doc (locked)
  isOwner: boolean;
  onToggle: (id: string) => void;
}) {
  const [openComment, setOpenComment] = useState<string | null>(null);
  const [hovered,     setHovered]     = useState<string | null>(null);

  const branchOrder = useMemo(() => {
    const seen: string[] = [];
    ideas.forEach(i => { if (!seen.includes(i.branch_name)) seen.push(i.branch_name); });
    return seen;
  }, [ideas]);

  // Round-robin interleave across branches
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

  const LANE = 18, ROW = 54, PAD_L = 14, PAD_T = 12;
  const svgW = PAD_L + branchOrder.length * LANE + 4;
  const svgH = PAD_T + rows.length * ROW + PAD_T;

  const { paths, dots } = useMemo(
    () => buildGraphPaths(rows, LANE, ROW, PAD_L, PAD_T),
    [rows]
  );

  if (ideas.length === 0) {
    return (
      <div style={{ padding: "40px 20px", textAlign: "center" }}>
        <p style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: "#2e2e3e", lineHeight: 1.8 }}>
          No shortlisted ideas yet.<br />Mark ideas as shortlisted in the workspace.
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
            }}>
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: color }} />
              {name}
            </span>
          );
        })}
      </div>

      {/* Graph + rows */}
      <div style={{ position: "relative" }}>
        {/* SVG */}
        <svg width={svgW} height={svgH}
          style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none", zIndex: 1, overflow: "visible" }}>
          <defs>
            {COLORS.map((_, i) => (
              <filter key={i} id={`glow${i}`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            ))}
          </defs>

          {/* Lines */}
          {paths.map((p, i) => (
            <path key={i} d={p.d} stroke={p.color} strokeWidth="1.5" fill="none"
              strokeOpacity={p.dashed ? 0.2 : 0.4}
              strokeDasharray={p.dashed ? "3 4" : undefined}
            />
          ))}

          {/* Dots */}
          {dots.map(({ cx, cy, color, idea, branchIdx }) => {
            const isLocked  = mergedIds.has(idea.id);   // already merged → locked grey
            const isSel     = selectedIds.has(idea.id); // selected by owner
            const isHov     = hovered === idea.id;
            const active    = isSel || isHov;

            return (
              <g key={idea.id}>
                {/* glow for active */}
                {active && !isLocked && (
                  <circle cx={cx} cy={cy} r={9} fill={color} fillOpacity="0.12" filter={`url(#glow${branchIdx % COLORS.length})`} />
                )}
                {/* outer ring */}
                <circle cx={cx} cy={cy} r={6} fill="none"
                  stroke={isLocked ? "#333" : color}
                  strokeWidth="1.2"
                  strokeOpacity={isLocked ? 0.4 : active ? 0.85 : 0.35}
                />
                {/* fill */}
                <circle cx={cx} cy={cy} r={4}
                  fill={isLocked ? "#1a1a1a" : isSel ? `${color}cc` : "#0d0d14"}
                  stroke={isLocked ? "#2a2a2a" : color}
                  strokeWidth="1.5"
                  strokeOpacity={isLocked ? 0.5 : 1}
                />
                {/* lock mark inside dot when merged */}
                {isLocked && (
                  <rect x={cx - 1.5} y={cy - 0.5} width={3} height={2.5} rx="0.5"
                    fill="#333" />
                )}
                {/* check mark when selected */}
                {isSel && !isLocked && (
                  <polyline
                    points={`${cx - 2},${cy} ${cx},${cy + 2} ${cx + 3},${cy - 2}`}
                    fill="none" stroke="#fff" strokeWidth="1.2"
                    strokeLinecap="round" strokeLinejoin="round"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Rows */}
        <div style={{ paddingTop: PAD_T }}>
          {rows.map(({ idea, branchIdx }) => {
            const color     = COLORS[branchIdx % COLORS.length];
            const isLocked  = mergedIds.has(idea.id);
            const isSel     = selectedIds.has(idea.id);
            const isHov     = hovered === idea.id;
            const isComment = openComment === idea.id;

            return (
              <div key={idea.id}>
                {/* Row */}
                <div
                  onMouseEnter={() => setHovered(idea.id)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => {
                    // Locked ideas cannot be toggled
                    if (isLocked || !isOwner) return;
                    onToggle(idea.id);
                  }}
                  style={{
                    height: ROW, paddingLeft: svgW + 8, paddingRight: 10,
                    display: "flex", alignItems: "center",
                    // locked = very dimmed; selected = branch tint; hover = subtle light tint
                    background: isLocked
                      ? "rgba(255,255,255,0.25)"
                      : isSel
                      ? `${color}16`
                      : isHov ? "#ecece4" : "transparent",
                    borderBottom: "none",
                    cursor: isLocked ? "default" : isOwner ? "pointer" : "default",
                    transition: "background .1s",
                    position: "relative",
                    opacity: isLocked ? 0.45 : 1,   // greyed out when locked
                  }}
                >
                  {/* left accent bar — only for selected */}
                  {isSel && !isLocked && (
                    <span style={{ position: "absolute", left: svgW + 1, top: 7, bottom: 7, width: 2, borderRadius: 2, background: color }} />
                  )}

                  {/* checkbox / lock indicator */}
                  {isOwner && (
                    <span style={{
                      width: 14, height: 14, borderRadius: 2, flexShrink: 0, marginRight: 7,
                      border: `1.5px solid ${isLocked ? "#2a2a2a" : isSel ? color : "#222232"}`,
                      background: isLocked ? "#1a1a1a" : isSel ? `${color}22` : "transparent",
                      color: isLocked ? "#333" : color,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all .12s",
                    }}>
                      {isLocked ? <Ico.Lock /> : isSel ? <Ico.Check /> : null}
                    </span>
                  )}

                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Title + author */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                      <p style={{
                        fontFamily: "'IBM Plex Sans',sans-serif", fontWeight: 600, fontSize: 12,
                        color: isLocked ? "#333" : isSel ? "#e2e2e2" : isHov ? "#c0c0c0" : "#888",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        margin: 0, flex: 1, minWidth: 0, transition: "color .1s",
                      }}>
                        {idea.title}
                        {isLocked && (
                          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: "#333", marginLeft: 7, letterSpacing: "0.1em" }}>
                            MERGED
                          </span>
                        )}
                      </p>
                      {idea.author && !isLocked && (
                        <span style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                          <Avatar name={idea.author} size={14} color={color} />
                          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: "#3e3e52", whiteSpace: "nowrap" }}>
                            {idea.author}
                          </span>
                        </span>
                      )}
                    </div>

                    {/* Meta */}
                    {!isLocked && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{
                          fontFamily: "'IBM Plex Mono',monospace", fontSize: 9,
                          padding: "1px 5px", borderRadius: 2,
                          background: `${color}14`, border: `1px solid ${color}28`,
                          color, letterSpacing: "0.04em", flexShrink: 0,
                        }}>
                          {idea.branch_name}
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 2, fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: "#333348" }}>
                          <Ico.Vote /> {idea.votes.length}
                        </span>
                        <button
                          onClick={e => { e.stopPropagation(); setOpenComment(openComment === idea.id ? null : idea.id); }}
                          style={{
                            display: "flex", alignItems: "center", gap: 3,
                            fontFamily: "'IBM Plex Mono',monospace", fontSize: 10,
                            color: isComment ? color : "#333348",
                            background: "none", border: "none", cursor: "pointer", padding: 0, transition: "color .12s",
                          }}
                          onMouseEnter={e => (e.currentTarget.style.color = color)}
                          onMouseLeave={e => (e.currentTarget.style.color = isComment ? color : "#333348")}
                        >
                          <Ico.Comment />
                          <span>{(idea.comments ?? []).length}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Inline comments */}
                {isComment && !isLocked && (
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

// ─── Main FinalDocument ───────────────────────────────────────────────────────
export const FinalDocument = ({ sessionTitle, ideas, isOwner }: Props) => {
  const [selectedIds,  setSelectedIds]  = useState<Set<string>>(new Set());
  const [mergedIdeas,  setMergedIdeas]  = useState<MergedIdea[]>([]);
  const [noteMap,      setNoteMap]      = useState<Record<string, string>>({});
  const [editingNote,  setEditingNote]  = useState<string | null>(null);
  const [docTitle,     setDocTitle]     = useState(`${sessionTitle} — Final Document`);
  const [editingTitle, setEditingTitle] = useState(false);
  const [exported,     setExported]     = useState(false);
  const [merging,      setMerging]      = useState(false);
  const [justMerged,   setJustMerged]   = useState<Set<string>>(new Set());

  const seededIdsRef = useRef<Set<string>>(new Set());

  const mergeUniqueIdeas = useCallback((prev: MergedIdea[], next: MergedIdea[]) => {
    const byId = new Map<string, MergedIdea>();
    for (const idea of prev) byId.set(idea.id, idea);
    for (const idea of next) byId.set(idea.id, idea);
    return Array.from(byId.values());
  }, []);
  // Split incoming ideas by status
  const shortlistedIdeas = useMemo(() => ideas.filter(i => i.status !== "merged"), [ideas]);
  const alreadyMerged    = useMemo(() => ideas.filter(i => i.status === "merged"),  [ideas]);

  // Seed the doc panel with ideas already merged (e.g. after remount / page refresh)
  useEffect(() => {
    if (alreadyMerged.length === 0) return;
    setMergedIdeas(prev => {
      const existingIds = new Set(prev.map(m => m.id));
      const additions = alreadyMerged
        .filter(i => !existingIds.has(i.id) && !seededIdsRef.current.has(i.id))
        .map(i => ({ ...i, mergedAt: new Date(), ownerNote: "" }));
      if (additions.length === 0) return prev;
      // Mark these as seeded so future prop updates don't re-add them
      additions.forEach(i => seededIdsRef.current.add(i.id));
      return mergeUniqueIdeas(prev, additions);
    });
  }, [alreadyMerged, mergeUniqueIdeas]);

  const branchOrder = useMemo(() => {
    const seen: string[] = [];
    ideas.forEach(i => { if (!seen.includes(i.branch_name)) seen.push(i.branch_name); });
    return seen;
  }, [ideas]);

  // All ideas shown in graph = shortlisted (selectable) + merged (locked+greyed)
  const graphIdeas = useMemo(() => ideas, [ideas]);

  // IDs that are locked in the graph
  const mergedIds = useMemo(() => new Set(mergedIdeas.map(m => m.id)), [mergedIdeas]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }, []);

  // ── MERGE: update status to "merged" → lock in graph → add to doc ────────────
  const handleMerge = async () => {
    if (merging) return;
    const candidates = shortlistedIdeas.filter(
      i => selectedIds.has(i.id) && !mergedIds.has(i.id)
    );
    if (!candidates.length) return;

    setMerging(true);
    try {
      // Calls backend; falls back to local store automatically if backend is down
      await Promise.all(candidates.map(i => updateStatus(i.id, "merged")));

      const toAdd: MergedIdea[] = candidates.map(i => ({
        ...i,
        status:     "merged" as const,
        mergedAt:   new Date(),
        ownerNote:  noteMap[i.id] ?? "",
      }));

      setJustMerged(new Set(toAdd.map(i => i.id)));
      setTimeout(() => setJustMerged(new Set()), 1400);

      setMergedIdeas((prev) => mergeUniqueIdeas(prev, toAdd));
      setSelectedIds(new Set());
    } finally {
      setMerging(false);
    }
  };

  // ── REMOVE from doc → revert status back to "shortlisted" ────────────────────
  const removeFromDoc = async (id: string) => {
    try { await updateStatus(id, "shortlisted"); } catch { /* local fallback handled inside */ }
    setMergedIdeas(p => p.filter(m => m.id !== id));
  };

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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;700&family=IBM+Plex+Sans:wght@400;600;700;800&display=swap');
        @keyframes ideaIn     { from{opacity:0;transform:translateY(7px)} to{opacity:1;transform:translateY(0)} }
        @keyframes expandDown { from{opacity:0;max-height:0} to{opacity:1;max-height:400px} }
        @keyframes lockPulse  { 0%{transform:scale(1)} 50%{transform:scale(1.04)} 100%{transform:scale(1)} }
        .idea-row             { animation: ideaIn .22s ease forwards; }
        .just-merged          { animation: lockPulse .5s ease; }
        ::-webkit-scrollbar   { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1e1e2e; border-radius: 2px; }
      `}</style>

      <div style={{ display: "flex", height: "100%", overflow: "hidden", fontFamily: "'IBM Plex Sans',sans-serif" }}>

        {/* ════ LEFT: Branch Graph ════ */}
        <div style={{
          width: 310, flexShrink: 0,
          display: "flex", flexDirection: "column",
          // Keep the graph panel on a light background to match the rest of the app
          background: "#f5f5f0",
          borderRight: "1px solid #e0e0da",
          overflow: "hidden",
        }}>
          {/* Header */}
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
                {shortlistedIdeas.length} shortlisted
              </span>
            </div>
            <p style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: "#252535", margin: 0 }}>
              {isOwner ? "click to select · click ◉ for comments" : "read-only"}
            </p>
          </div>

          {/* Merge button */}
          {isOwner && selectedIds.size > 0 && (
            <div style={{ padding: "7px 11px", borderBottom: "1px solid #141420", background: "rgba(58,91,255,0.04)", flexShrink: 0 }}>
              <button
                onClick={handleMerge}
                disabled={merging}
                style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "9px 0",
                  background: merging ? "#1a1a2a" : "#3a5bff",
                  border: `1px solid ${merging ? "#252540" : "#3a5bff"}`,
                  borderRadius: 3, cursor: merging ? "not-allowed" : "pointer",
                  fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, fontWeight: 700,
                  color: merging ? "#444" : "#fff", letterSpacing: "0.08em", textTransform: "uppercase",
                  boxShadow: merging ? "none" : "0 0 20px rgba(58,91,255,0.35)",
                  transition: "all .15s",
                }}
              >
                <Ico.Merge />
                {merging ? "Merging…" : `Merge ${selectedIds.size} into Document`}
              </button>
            </div>
          )}

          {/* Graph scroll */}
          <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
            <BranchGraph
              ideas={graphIdeas}
              selectedIds={selectedIds}
              mergedIds={mergedIds}
              isOwner={isOwner}
              onToggle={toggleSelect}
            />
          </div>
        </div>

        {/* ════ RIGHT: Document ════ */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#f6f6f1", overflow: "hidden" }}>

          {/* Top bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 26px", borderBottom: "1.5px solid #111", background: "#fff", flexShrink: 0 }}>
            <div style={{ flex: 1, minWidth: 0, marginRight: 16 }}>
              {editingTitle && isOwner ? (
                <input autoFocus value={docTitle}
                  onChange={e => setDocTitle(e.target.value)}
                  onBlur={() => setEditingTitle(false)}
                  onKeyDown={e => e.key === "Enter" && setEditingTitle(false)}
                  style={{ fontFamily: "'IBM Plex Sans',sans-serif", fontWeight: 700, fontSize: 16, width: "100%", background: "transparent", border: "none", outline: "none", borderBottom: "1.5px solid #3a5bff", color: "#0d0d14", letterSpacing: "-0.02em" }}
                />
              ) : (
                <h2 onClick={() => isOwner && setEditingTitle(true)} title={isOwner ? "Click to rename" : ""}
                  style={{ fontFamily: "'IBM Plex Sans',sans-serif", fontWeight: 700, fontSize: 16, letterSpacing: "-0.02em", lineHeight: 1, margin: 0, color: "#0d0d14", cursor: isOwner ? "text" : "default", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {docTitle}
                  {isOwner && <span style={{ fontSize: 10, color: "#ddd", marginLeft: 6 }}>✎</span>}
                </h2>
              )}
              <p style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: "#bbb", margin: "4px 0 0" }}>
                {mergedIdeas.length} idea{mergedIdeas.length !== 1 ? "s" : ""} in document
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

          {/* Body */}
          <div style={{ flex: 1, overflowY: "auto", padding: "32px 44px" }}>
            {mergedIdeas.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", paddingBottom: 60, textAlign: "center" }}>
                <div style={{ width: 46, height: 46, border: "1.5px solid #e0e0da", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18, fontSize: 20 }}>📄</div>
                <p style={{ fontFamily: "'IBM Plex Sans',sans-serif", fontWeight: 800, fontSize: 19, letterSpacing: "-0.02em", marginBottom: 8, color: "#111" }}>
                  Document is empty
                </p>
                <p style={{ fontFamily: "'IBM Plex Sans',sans-serif", fontSize: 13, color: "#aaa", lineHeight: 1.75, maxWidth: 290, margin: 0 }}>
                  {isOwner
                    ? "Select shortlisted ideas from the graph on the left, then click \"Merge into Document\"."
                    : "The owner hasn't merged any ideas into the document yet."}
                </p>
              </div>
            ) : (
              <div style={{ maxWidth: 680 }}>
                {/* Heading */}
                <div style={{ marginBottom: 36, paddingBottom: 22, borderBottom: "1.5px solid #111" }}>
                  <p style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: "#bbb", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8 }}>
                    Final Output · {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                  <h1 style={{ fontFamily: "'IBM Plex Sans',sans-serif", fontWeight: 800, fontSize: 28, letterSpacing: "-0.03em", lineHeight: 1, marginBottom: 7, color: "#0d0d14" }}>
                    {docTitle}
                  </h1>
                  <p style={{ fontFamily: "'IBM Plex Sans',sans-serif", fontSize: 13, color: "#999", margin: 0 }}>
                    {mergedIdeas.length} idea{mergedIdeas.length !== 1 ? "s" : ""} · "{sessionTitle}"
                  </p>
                </div>

                {mergedIdeas.map((idea, i) => {
                  const bIdx  = branchOrder.indexOf(idea.branch_name);
                  const color = COLORS[bIdx % COLORS.length] ?? "#4d9de0";
                  const isNew = justMerged.has(idea.id);

                  return (
                    <div
                      key={idea.id}
                      className={`idea-row${isNew ? " just-merged" : ""}`}
                      style={{ marginBottom: 40, paddingBottom: 40 }}
                    >
                      {/* Idea header */}
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14, marginBottom: 12 }}>
                        <div style={{ display: "flex", gap: 12 }}>
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
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#ccc"; (e.currentTarget as HTMLElement).style.borderColor = "#e0e0da"; }}>
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
                            <textarea autoFocus placeholder="Add a note…"
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