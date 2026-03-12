import { useMemo, useState, useEffect } from "react";

import type { Idea, IdeaCreate, IdeaNode } from "../../types";
import { useIdeaStore } from "../../store/ideaStore";
import { Modal } from "../shared/Modal";

interface Props {
  open: boolean;
  onClose: () => void;
  sessionId: string;
  ideaTree: IdeaNode[];
  onSubmit: (payload: IdeaCreate) => Promise<Idea>;
}

const flattenIdeas = (nodes: IdeaNode[]): { id: string; title: string }[] => {
  const result: { id: string; title: string }[] = [];
  const stack = [...nodes];
  while (stack.length > 0) {
    const node = stack.pop();
    if (!node) continue;
    result.push({ id: node.idea.id, title: node.idea.title });
    stack.push(...node.children);
  }
  return result;
};

const BRANCH_SUGGESTIONS = ["main", "feature", "experiment", "alternative", "refined", "wild-card"];

export const CreateIdeaModal = ({ open, onClose, sessionId, ideaTree, onSubmit }: Props) => {
  // ── Pre-fill parent from currently selected idea in the graph ──
  const selectedIdea = useIdeaStore((s) => s.selectedIdea);

  const [title,        setTitle]        = useState("");
  const [content,      setContent]      = useState("");
  const [branchName,   setBranchName]   = useState("main");
  const [parentIdeaId, setParentIdeaId] = useState("");
  const [tagInput,     setTagInput]     = useState("");
  const [tagList,      setTagList]      = useState<string[]>([]);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");

  // When the modal opens, pre-fill parent from selectedIdea and inherit its branch
  useEffect(() => {
    if (open && selectedIdea) {
      setParentIdeaId(selectedIdea.id);
      setBranchName(selectedIdea.branch_name);
    }
  }, [open, selectedIdea]);

  const options = useMemo(() => flattenIdeas(ideaTree), [ideaTree]);

  const addTag = (val: string) => {
    const clean = val.trim().replace(/,/g, "");
    if (clean && !tagList.includes(clean)) setTagList((p) => [...p, clean]);
    setTagInput("");
  };

  const removeTag = (tag: string) => setTagList((p) => p.filter((t) => t !== tag));

  const reset = () => {
    setTitle(""); setContent(""); setBranchName("main");
    setParentIdeaId(""); setTagList([]); setTagInput(""); setError("");
  };

  const submit = async () => {
    if (!title.trim())      { setError("Title is required."); return; }
    if (!branchName.trim()) { setError("Branch name is required."); return; }
    setError(""); setLoading(true);

    try {
      const payload: IdeaCreate = {
        session_id:     sessionId,
        title:          title.trim(),
        content:        content.trim(),
        branch_name:    branchName.trim(),
        parent_idea_id: parentIdeaId || null,
        tags:           tagList,
      };

      await onSubmit(payload);
      reset();
      onClose();
    } catch {
      setError("Failed to create idea. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={() => { reset(); onClose(); }} title="">
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .ci-field:focus-within { border-color: #3a5bff !important; box-shadow: 0 0 0 3px rgba(58,91,255,0.1); }
        .ci-input { border: none; outline: none; background: transparent; font-family: inherit; width: 100%; }
        .ci-input::placeholder { color: #bbb; }
        .ci-select {
          appearance: none; -webkit-appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23888' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 12px center; padding-right: 32px !important;
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div className="flex items-center" style={{ gap: 8, marginBottom: 10 }}>
          <span style={{ width: 20, height: 1.5, background: "#3a5bff", display: "block" }} />
          <p className="font-body text-[#3a5bff] uppercase" style={{ fontSize: 10, letterSpacing: "0.2em" }}>New idea</p>
        </div>
        <h2 className="font-display font-extrabold" style={{ fontSize: 24, letterSpacing: "-0.03em", lineHeight: 1 }}>
          Branch a new idea.
        </h2>
        {selectedIdea && (
          <div className="flex items-center" style={{ gap: 6, marginTop: 10, padding: "6px 10px", background: "rgba(58,91,255,0.06)", border: "1px solid rgba(58,91,255,0.2)", borderRadius: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3a5bff", flexShrink: 0 }} />
            <p className="font-body text-[#3a5bff]" style={{ fontSize: 11 }}>
              Branching off: <strong>{selectedIdea.title}</strong>
            </p>
          </div>
        )}
        {!selectedIdea && (
          <p className="font-body text-[#888]" style={{ fontSize: 12, marginTop: 8, lineHeight: 1.6 }}>
            No idea selected — this will be added as a root idea.
          </p>
        )}
      </div>

      {/* Fields */}
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>

        {/* Title */}
        <div className="ci-field" style={{ border: "1.5px solid #13131A", borderRadius: "4px 4px 0 0", borderBottom: "none", padding: "10px 14px", transition: "border-color 0.15s, box-shadow 0.15s" }}>
          <label className="font-body text-[#888] uppercase block" style={{ fontSize: 9, letterSpacing: "0.15em", marginBottom: 5 }}>
            Title <span style={{ color: "#3a5bff" }}>*</span>
          </label>
          <input className="ci-input font-body" style={{ fontSize: 14, color: "#13131A" }}
            value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Dark mode with auto-switch" />
        </div>

        {/* Content */}
        <div className="ci-field" style={{ border: "1.5px solid #13131A", borderBottom: "none", padding: "10px 14px", transition: "border-color 0.15s, box-shadow 0.15s" }}>
          <label className="font-body text-[#888] uppercase block" style={{ fontSize: 9, letterSpacing: "0.15em", marginBottom: 5 }}>
            Description <span style={{ color: "#888", fontWeight: 400 }}>(optional)</span>
          </label>
          <textarea className="ci-input font-body" style={{ fontSize: 14, color: "#13131A", resize: "none", lineHeight: 1.6 }}
            rows={3} value={content} onChange={(e) => setContent(e.target.value)} placeholder="What's the idea about?" />
        </div>

        {/* Branch + Parent */}
        <div className="flex">
          <div className="ci-field flex-1" style={{ border: "1.5px solid #13131A", borderRight: "none", padding: "10px 14px", transition: "border-color 0.15s, box-shadow 0.15s" }}>
            <label className="font-body text-[#888] uppercase block" style={{ fontSize: 9, letterSpacing: "0.15em", marginBottom: 5 }}>
              Branch <span style={{ color: "#3a5bff" }}>*</span>
            </label>
            <input className="ci-input font-body" style={{ fontSize: 13, color: "#13131A" }}
              list="branch-suggestions" value={branchName} onChange={(e) => setBranchName(e.target.value)} placeholder="main" />
            <datalist id="branch-suggestions">
              {BRANCH_SUGGESTIONS.map((b) => <option key={b} value={b} />)}
            </datalist>
          </div>
          <div className="ci-field flex-1" style={{ border: "1.5px solid #13131A", padding: "10px 14px", transition: "border-color 0.15s, box-shadow 0.15s" }}>
            <label className="font-body text-[#888] uppercase block" style={{ fontSize: 9, letterSpacing: "0.15em", marginBottom: 5 }}>
              Parent idea
            </label>
            <select className="ci-input ci-select font-body" style={{ fontSize: 12, color: parentIdeaId ? "#13131A" : "#bbb" }}
              value={parentIdeaId} onChange={(e) => setParentIdeaId(e.target.value)}>
              <option value="">None (root)</option>
              {options.map((o) => (
                <option key={o.id} value={o.id}>{o.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tags */}
        <div className="ci-field" style={{ border: "1.5px solid #13131A", borderRadius: "0 0 4px 4px", padding: "10px 14px", transition: "border-color 0.15s, box-shadow 0.15s" }}>
          <label className="font-body text-[#888] uppercase block" style={{ fontSize: 9, letterSpacing: "0.15em", marginBottom: 5 }}>
            Tags <span style={{ color: "#888", fontWeight: 400 }}>(Enter or comma to add)</span>
          </label>
          <div className="flex flex-wrap" style={{ gap: 5, marginBottom: tagList.length ? 8 : 0 }}>
            {tagList.map((tag) => (
              <span key={tag} className="flex items-center font-body"
                style={{ gap: 4, fontSize: 11, padding: "2px 8px", borderRadius: 3, background: "rgba(58,91,255,0.1)", color: "#3a5bff", border: "1px solid rgba(58,91,255,0.25)" }}>
                {tag}
                <button onClick={() => removeTag(tag)} style={{ background: "none", border: "none", cursor: "pointer", color: "#3a5bff", fontSize: 13, lineHeight: 1, padding: 0 }}>×</button>
              </span>
            ))}
          </div>
          <input className="ci-input font-body" style={{ fontSize: 13, color: "#13131A" }}
            value={tagInput} onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(tagInput); } }}
            placeholder="e.g. ux, mobile, ai" />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center font-body text-[#e53e3e]" style={{ marginTop: 10, fontSize: 12, gap: 6 }}>
          <span style={{ width: 16, height: 16, borderRadius: "50%", background: "rgba(229,62,62,0.1)", border: "1px solid rgba(229,62,62,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, flexShrink: 0 }}>!</span>
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between" style={{ marginTop: 24, gap: 12 }}>
        <button onClick={() => { reset(); onClose(); }}
          className="font-display font-bold uppercase text-[#888] hover:text-ink transition-colors"
          style={{ fontSize: 11, letterSpacing: "0.08em", background: "none", border: "none", cursor: "pointer", padding: "8px 0" }}>
          Cancel
        </button>
        <button onClick={() => void submit()} disabled={loading}
          className="font-display font-bold uppercase text-white hover:bg-[#0a0a0a] hover:border-[#0a0a0a] transition-all duration-150 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ fontSize: 12, letterSpacing: "0.08em", padding: "11px 28px", background: "#3a5bff", border: "1.5px solid #3a5bff", borderRadius: 4, gap: 9 }}>
          {loading ? (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 0.8s linear infinite" }}>
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              Creating…
            </>
          ) : (
            <>
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="6" y1="1" x2="6" y2="11" /><line x1="1" y1="6" x2="11" y2="6" />
              </svg>
              Create Idea →
            </>
          )}
        </button>
      </div>
    </Modal>
  );
};