import dagre from "dagre";
import { useMemo, useState } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  type Edge,
  type Node,
  type NodeTypes,
} from "reactflow";
import "reactflow/dist/style.css";

import { useIdeas } from "../../hooks/useIdeas";
import { useIdeaStore } from "../../store/ideaStore";
import { useSessionStore } from "../../store/sessionStore";
import type { IdeaNode as IdeaNodeType } from "../../types";
import { CreateIdeaModal } from "./CreateIdeaModal";
import { IdeaNode } from "./IdeaNode";

interface Props {
  sessionId: string;
}

const nodeTypes: NodeTypes = { ideaNode: IdeaNode };

const buildGraph = (tree: IdeaNodeType[]): { nodes: Node[]; edges: Edge[] } => {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: "TB", nodesep: 50, ranksep: 90 });
  g.setDefaultEdgeLabel(() => ({}));

  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const stack = [...tree];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;

    const node: Node = {
      id: current.idea.id,
      type: "ideaNode",
      data: {
        label:  current.idea.title,
        status: current.idea.status,
        votes:  current.idea.votes.length,
        branch: current.idea.branch_name,
      },
      position: { x: 0, y: 0 },
    };

    nodes.push(node);
    g.setNode(node.id, { width: 220, height: 100 });

    for (const child of current.children) {
      edges.push({
        id:     `${current.idea.id}-${child.idea.id}`,
        source: current.idea.id,
        target: child.idea.id,
        style:  { stroke: "#13131A", strokeWidth: 1.5 },
        type:   "smoothstep",
      });
      g.setEdge(current.idea.id, child.idea.id);
      stack.push(child);
    }
  }

  dagre.layout(g);
  const laidOutNodes = nodes.map((node) => {
    const pos = g.node(node.id);
    return { ...node, position: { x: pos.x - 110, y: pos.y - 50 } };
  });

  return { nodes: laidOutNodes, edges };
};

export const IdeaBranchGraph = ({ sessionId }: Props) => {
  const [open, setOpen]   = useState(false);
  const setSelectedIdea   = useIdeaStore((s) => s.setSelectedIdea);
  const tree              = useIdeaStore((s) => s.ideaTree);
  const currentSession    = useSessionStore((s) => s.currentSession);
  const isReadOnly        = currentSession?.status === "closed";
  const { createIdea }    = useIdeas(sessionId);
  const graph             = useMemo(() => buildGraph(tree), [tree]);
  const totalIdeas        = graph.nodes.length;

  return (
    <>
      <style>{`
        /* Override ReactFlow defaults to match site style */
        .react-flow__controls {
          border: 1.5px solid #13131A !important;
          border-radius: 4px !important;
          overflow: hidden;
          box-shadow: none !important;
        }
        .react-flow__controls-button {
          border-bottom: 1px solid #e5e5e0 !important;
          background: #fff !important;
        }
        .react-flow__controls-button:hover {
          background: #f0f0eb !important;
        }
        .react-flow__controls-button svg { fill: #13131A !important; }
        .react-flow__minimap {
          border: 1.5px solid #13131A !important;
          border-radius: 4px !important;
          overflow: hidden;
        }
        .react-flow__attribution { display: none; }
        .react-flow__edge-path { stroke: #13131A; stroke-width: 1.5; }
      `}</style>

      <div className="relative h-full w-full" style={{ background: "#f5f5f0" }}>

        {/* ── Top-right action bar ── */}
        <div
          className="absolute z-10 flex items-center"
          style={{ top: 16, right: 16, gap: 10 }}
        >
          {/* Idea count pill */}
          <div
            className="flex items-center font-body"
            style={{
              gap: 6, padding: "5px 12px",
              border: "1.5px solid #13131A", borderRadius: 4,
              background: "#f5f5f0", fontSize: 11,
            }}
          >
            <span
              style={{ width: 7, height: 7, borderRadius: "50%", background: "#3a5bff", flexShrink: 0 }}
            />
            <span className="font-semibold" style={{ color: "#13131A" }}>{totalIdeas}</span>
            <span style={{ color: "#888" }}>idea{totalIdeas !== 1 ? "s" : ""}</span>
          </div>

          {/* New Idea button */}
          <button
            onClick={() => { if (!isReadOnly) setOpen(true); }}
            disabled={isReadOnly}
            className="font-display font-bold uppercase text-white flex items-center hover:bg-[#0a0a0a] hover:border-[#0a0a0a] transition-all duration-150"
            style={{
              fontSize: 12, letterSpacing: "0.08em", padding: "7px 16px",
              background: isReadOnly ? "#bbb" : "#3a5bff",
              border: `1.5px solid ${isReadOnly ? "#bbb" : "#3a5bff"}`,
              borderRadius: 4, gap: 7, cursor: isReadOnly ? "not-allowed" : "pointer",
            }}
          >
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="6" y1="1" x2="6" y2="11" />
              <line x1="1" y1="6" x2="11" y2="6" />
            </svg>
            {isReadOnly ? "Read Only" : "New Idea"}
          </button>
        </div>

        {/* ── Empty state ── */}
        {totalIdeas === 0 && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
            style={{ zIndex: 5 }}
          >
            <div
              style={{
                width: 56, height: 56,
                border: "1.5px dashed #ccc", borderRadius: 4,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 24, marginBottom: 16,
              }}
            >
              💡
            </div>
            <p className="font-display font-extrabold" style={{ fontSize: 18, letterSpacing: "-0.02em", marginBottom: 6 }}>
              No ideas yet
            </p>
            <p className="font-body text-[#aaa]" style={{ fontSize: 13 }}>
              Click "New Idea" to start branching.
            </p>
          </div>
        )}

        {/* ── React Flow ── */}
        <ReactFlow
          nodes={graph.nodes}
          edges={graph.edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          proOptions={{ hideAttribution: true }}
          onNodeClick={(_, node) => {
            const match = findIdeaById(tree, node.id);
            if (match) setSelectedIdea(match.idea);
          }}
          style={{ background: "#f5f5f0" }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="#ddd"
          />
          <Controls position="bottom-left" />
          <MiniMap
            nodeColor={(node) => {
              const status = (node.data as { status: string }).status;
              return status === "active" ? "#3a5bff"
                : status === "shortlisted" ? "#27c93f"
                : status === "merged" ? "#a855f7"
                : "#ccc";
            }}
            maskColor="rgba(245,245,240,0.85)"
            style={{ background: "#fff" }}
          />
        </ReactFlow>

        {/* ── Create Idea Modal ── */}
        <CreateIdeaModal
          open={open}
          onClose={() => setOpen(false)}
          sessionId={sessionId}
          ideaTree={tree}
          onSubmit={createIdea}
        />
      </div>
    </>
  );
};

const findIdeaById = (nodes: IdeaNodeType[], ideaId: string): IdeaNodeType | null => {
  const stack = [...nodes];
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;
    if (current.idea.id === ideaId) return current;
    stack.push(...current.children);
  }
  return null;
};