import dagre from "dagre";
import { useMemo, useState } from "react";
import ReactFlow, { Controls, MiniMap, type Edge, type Node, type NodeTypes } from "reactflow";
import "reactflow/dist/style.css";

import { useIdeas } from "../../hooks/useIdeas";
import { useIdeaStore } from "../../store/ideaStore";
import type { IdeaNode as IdeaNodeType, WSMessage } from "../../types";
import { Button } from "../shared/Button";
import { CreateIdeaModal } from "./CreateIdeaModal";
import { IdeaNode } from "./IdeaNode";

interface Props {
  sessionId: string;
  sendMessage: (message: WSMessage) => void;
}

const nodeTypes: NodeTypes = { ideaNode: IdeaNode };

const buildGraph = (tree: IdeaNodeType[]): { nodes: Node[]; edges: Edge[] } => {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: "TB", nodesep: 40, ranksep: 80 });
  g.setDefaultEdgeLabel(() => ({}));

  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const stack = [...tree];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) {
      continue;
    }

    const node: Node = {
      id: current.idea.id,
      type: "ideaNode",
      data: {
        label: current.idea.title,
        status: current.idea.status,
        votes: current.idea.votes.length,
        branch: current.idea.branch_name
      },
      position: { x: 0, y: 0 }
    };

    nodes.push(node);
    g.setNode(node.id, { width: 220, height: 100 });

    for (const child of current.children) {
      edges.push({ id: `${current.idea.id}-${child.idea.id}`, source: current.idea.id, target: child.idea.id });
      g.setEdge(current.idea.id, child.idea.id);
      stack.push(child);
    }
  }

  dagre.layout(g);
  const laidOutNodes = nodes.map((node) => {
    const position = g.node(node.id);
    return { ...node, position: { x: position.x - 110, y: position.y - 50 } };
  });

  return { nodes: laidOutNodes, edges };
};

export const IdeaBranchGraph = ({ sessionId, sendMessage }: Props) => {
  const [open, setOpen] = useState(false);
  const setSelectedIdea = useIdeaStore((s) => s.setSelectedIdea);
  const tree = useIdeaStore((s) => s.ideaTree);
  const { createIdea } = useIdeas(sessionId);

  const graph = useMemo(() => buildGraph(tree), [tree]);

  return (
    <div className="relative h-full w-full">
      <div className="absolute right-4 top-4 z-10">
        <Button onClick={() => setOpen(true)}>+ New Idea</Button>
      </div>
      <ReactFlow
        nodes={graph.nodes}
        edges={graph.edges}
        nodeTypes={nodeTypes}
        fitView
        onNodeClick={(_, node) => {
          const match = findIdeaById(tree, node.id);
          if (match) {
            setSelectedIdea(match.idea);
          }
        }}
      >
        <MiniMap />
        <Controls />
      </ReactFlow>

      <CreateIdeaModal
        open={open}
        onClose={() => setOpen(false)}
        sessionId={sessionId}
        ideaTree={tree}
        onSubmit={async (payload) => {
          await createIdea(payload);
        }}
        sendMessage={sendMessage}
      />
    </div>
  );
};

const findIdeaById = (nodes: IdeaNodeType[], ideaId: string): IdeaNodeType | null => {
  const stack = [...nodes];
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) {
      continue;
    }
    if (current.idea.id === ideaId) {
      return current;
    }
    stack.push(...current.children);
  }
  return null;
};
