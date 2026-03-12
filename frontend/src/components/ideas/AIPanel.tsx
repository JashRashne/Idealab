import { useState } from "react";

import { expandIdea, mergeIdeas, summarizeSession } from "../../services/ai.service";
import { useIdeaStore } from "../../store/ideaStore";
import { Button } from "../shared/Button";
import { Spinner } from "../shared/Spinner";

interface Props {
  sessionId: string;
}

export const AIPanel = ({ sessionId }: Props) => {
  const selectedIdea = useIdeaStore((s) => s.selectedIdea);
  const ideaTree = useIdeaStore((s) => s.ideaTree);
  const addIdea = useIdeaStore((s) => s.addIdea);

  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mergeTarget, setMergeTarget] = useState("");

  const allIdeas = flattenIds(ideaTree);

  const runExpand = async () => {
    if (!selectedIdea) {
      return;
    }
    setLoading(true);
    try {
      const res = await expandIdea(selectedIdea.id);
      setOutput(res.output);
    } finally {
      setLoading(false);
    }
  };

  const runSummary = async () => {
    setLoading(true);
    try {
      const res = await summarizeSession(sessionId);
      setOutput(res.output);
    } finally {
      setLoading(false);
    }
  };

  const runMerge = async () => {
    if (!selectedIdea || !mergeTarget) {
      return;
    }
    setLoading(true);
    try {
      const merged = await mergeIdeas(selectedIdea.id, mergeTarget);
      addIdea(merged);
      setOutput("Merged idea created successfully.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 rounded-xl border border-black/10 bg-sand p-3">
      <h4 className="mb-2 font-semibold text-ink">AI Assistant</h4>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => void runExpand()}>
          Expand Idea
        </Button>
        <Button variant="secondary" onClick={() => void runSummary()}>
          Summarize Session
        </Button>
      </div>
      <div className="mt-2 flex gap-2">
        <select className="flex-1 rounded-lg border border-black/20 px-2 py-1 text-sm" value={mergeTarget} onChange={(e) => setMergeTarget(e.target.value)}>
          <option value="">Select idea to merge with</option>
          {allIdeas
            .filter((idea) => idea.id !== selectedIdea?.id)
            .map((idea) => (
              <option key={idea.id} value={idea.id}>
                {idea.title}
              </option>
            ))}
        </select>
        <Button variant="ghost" onClick={() => void runMerge()}>
          Merge Ideas
        </Button>
      </div>
      <div className="mt-3 rounded-lg bg-white p-2 text-sm text-ink/80">{loading ? <Spinner /> : output || "AI output appears here."}</div>
    </div>
  );
};

const flattenIds = (nodes: { idea: { id: string; title: string }; children: unknown[] }[]) => {
  const result: { id: string; title: string }[] = [];
  const stack = [...nodes] as Array<{ idea: { id: string; title: string }; children: unknown[] }>;

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) {
      continue;
    }
    result.push({ id: current.idea.id, title: current.idea.title });
    const children = current.children as Array<{ idea: { id: string; title: string }; children: unknown[] }>;
    stack.push(...children);
  }

  return result;
};
