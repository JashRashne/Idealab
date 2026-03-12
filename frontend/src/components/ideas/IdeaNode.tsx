import { Handle, Position, type NodeProps } from "reactflow";
import type { Idea } from "../../types";

interface NodeData {
  label: string;
  status: Idea["status"];
  votes: number;
  branch: string;
}

const STATUS_CONFIG: Record<Idea["status"], { color: string; bg: string; border: string; label: string }> = {
  active:      { color: "#3a5bff", bg: "rgba(58,91,255,0.08)",   border: "#3a5bff", label: "Active"      },
  shortlisted: { color: "#27c93f", bg: "rgba(39,201,63,0.08)",   border: "#27c93f", label: "Shortlisted" },
  merged:      { color: "#a855f7", bg: "rgba(168,85,247,0.08)",  border: "#a855f7", label: "Merged"      },
  archived:    { color: "#888",    bg: "rgba(136,136,136,0.06)", border: "#ccc",    label: "Archived"    },
};

export const IdeaNode = ({ data, selected }: NodeProps<NodeData>) => {
  const cfg = STATUS_CONFIG[data.status];

  return (
    <>
      <style>{`
        .idea-node {
          transition: box-shadow 0.15s ease, transform 0.15s ease;
        }
        .idea-node:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(19,19,26,0.12);
        }
        .idea-node.selected {
          box-shadow: 0 0 0 2px #3a5bff, 0 8px 24px rgba(58,91,255,0.2);
        }
      `}</style>

      <Handle
        type="target"
        position={Position.Top}
        style={{ background: cfg.color, border: `2px solid ${cfg.border}`, width: 8, height: 8 }}
      />

      <div
        className={`idea-node${selected ? " selected" : ""}`}
        style={{
          width: 220,
          background: "#fff",
          border: `1.5px solid ${selected ? "#3a5bff" : "#13131A"}`,
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        {/* Status accent bar */}
        <div style={{ height: 3, background: cfg.color, width: "100%" }} />

        <div style={{ padding: "10px 14px 12px" }}>
          {/* Branch + status row */}
          <div className="flex items-center justify-between" style={{ marginBottom: 6, gap: 6 }}>
            <span
              className="font-body truncate"
              style={{ fontSize: 9, letterSpacing: "0.1em", color: "#aaa", textTransform: "uppercase" }}
            >
              {data.branch}
            </span>
            <span
              className="font-body flex-shrink-0"
              style={{
                fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase",
                padding: "2px 6px", borderRadius: 999,
                background: cfg.bg, color: cfg.color,
                border: `1px solid ${cfg.border}`,
              }}
            >
              {cfg.label}
            </span>
          </div>

          {/* Title */}
          <p
            className="font-display font-extrabold"
            style={{
              fontSize: 13, letterSpacing: "-0.01em", lineHeight: 1.3,
              color: data.status === "archived" ? "#aaa" : "#13131A",
              marginBottom: 8,
              display: "-webkit-box", WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical", overflow: "hidden",
            }}
          >
            {data.label}
          </p>

          {/* Votes */}
          <div className="flex items-center" style={{ gap: 5 }}>
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke={cfg.color} strokeWidth="1.5" strokeLinecap="round">
              <polyline points="6 1 9 5 3 5" />
              <line x1="6" y1="1" x2="6" y2="11" />
            </svg>
            <span className="font-body font-semibold" style={{ fontSize: 11, color: cfg.color }}>
              {data.votes}
            </span>
            <span className="font-body text-[#aaa]" style={{ fontSize: 11 }}>
              {data.votes === 1 ? "vote" : "votes"}
            </span>
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: cfg.color, border: `2px solid ${cfg.border}`, width: 8, height: 8 }}
      />
    </>
  );
};