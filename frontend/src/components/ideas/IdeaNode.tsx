import { Handle, Position, type NodeProps } from "reactflow";

import type { Idea } from "../../types";

interface NodeData {
  label: string;
  status: Idea["status"];
  votes: number;
  branch: string;
}

const statusClass: Record<Idea["status"], string> = {
  active: "border-blue-500",
  shortlisted: "border-green-500",
  merged: "border-purple-500",
  archived: "border-gray-500"
};

export const IdeaNode = ({ data }: NodeProps<NodeData>) => {
  return (
    <div className={`min-w-48 rounded-xl border-2 bg-white p-3 shadow ${statusClass[data.status]}`}>
      <Handle type="target" position={Position.Top} />
      <p className="text-sm font-semibold text-ink">{data.label}</p>
      <p className="text-xs text-ink/70">Branch: {data.branch}</p>
      <p className="text-xs text-ink/70">Votes: {data.votes}</p>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};
