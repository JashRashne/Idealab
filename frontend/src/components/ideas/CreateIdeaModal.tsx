import { useMemo, useState } from "react";

import type { IdeaCreate, IdeaNode, WSMessage } from "../../types";
import { Button } from "../shared/Button";
import { Input } from "../shared/Input";
import { Modal } from "../shared/Modal";

interface Props {
  open: boolean;
  onClose: () => void;
  sessionId: string;
  ideaTree: IdeaNode[];
  onSubmit: (payload: IdeaCreate) => Promise<void>;
  sendMessage: (message: WSMessage) => void;
}

const flattenIdeas = (nodes: IdeaNode[]): { id: string; title: string }[] => {
  const result: { id: string; title: string }[] = [];
  const stack = [...nodes];
  while (stack.length > 0) {
    const node = stack.pop();
    if (!node) {
      continue;
    }
    result.push({ id: node.idea.id, title: node.idea.title });
    stack.push(...node.children);
  }
  return result;
};

export const CreateIdeaModal = ({ open, onClose, sessionId, ideaTree, onSubmit, sendMessage }: Props) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [branchName, setBranchName] = useState("main");
  const [parentIdeaId, setParentIdeaId] = useState("");
  const [tags, setTags] = useState("");

  const options = useMemo(() => flattenIdeas(ideaTree), [ideaTree]);

  const submit = async () => {
    if (!title.trim() || !branchName.trim()) {
      return;
    }

    const payload: IdeaCreate = {
      session_id: sessionId,
      title: title.trim(),
      content: content.trim(),
      branch_name: branchName.trim(),
      parent_idea_id: parentIdeaId || null,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean)
    };

    await onSubmit(payload);
    sendMessage({ type: "new_idea", payload: payload as unknown as Record<string, unknown> });
    onClose();
    setTitle("");
    setContent("");
    setBranchName("main");
    setParentIdeaId("");
    setTags("");
  };

  return (
    <Modal open={open} onClose={onClose} title="Create Idea">
      <div className="space-y-3">
        <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-ink">Content</span>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-28 rounded-lg border border-black/20 px-3 py-2"
          />
        </label>
        <Input label="Branch Name" value={branchName} onChange={(e) => setBranchName(e.target.value)} required />
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-ink">Parent Idea</span>
          <select
            className="rounded-lg border border-black/20 px-3 py-2"
            value={parentIdeaId}
            onChange={(e) => setParentIdeaId(e.target.value)}
          >
            <option value="">None (root idea)</option>
            {options.map((option) => (
              <option key={option.id} value={option.id}>
                {option.title}
              </option>
            ))}
          </select>
        </label>
        <Input label="Tags (comma-separated)" value={tags} onChange={(e) => setTags(e.target.value)} />
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => void submit()}>Create</Button>
        </div>
      </div>
    </Modal>
  );
};
