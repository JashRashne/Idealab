import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { expandIdea, mergeIdeas, summarizeSession } from "../../services/ai.service";
import { useIdeaStore } from "../../store/ideaStore";

interface Props {
  sessionId: string;
}

type AIAction = "expand" | "summarize" | "merge";

function SparkleIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M7 1v2M7 11v2M1 7h2M11 7h2M3.05 3.05l1.41 1.41M9.54 9.54l1.41 1.41M3.05 10.95l1.41-1.41M9.54 4.46l1.41-1.41" />
      <circle cx="7" cy="7" r="2" />
    </svg>
  );
}

function ExpandIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <polyline points="8 1 13 1 13 6" />
      <polyline points="6 13 1 13 1 8" />
      <line x1="13" y1="1" x2="7" y2="7" />
      <line x1="1" y1="13" x2="7" y2="7" />
    </svg>
  );
}

function SummarizeIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <line x1="2" y1="4" x2="12" y2="4" />
      <line x1="2" y1="7" x2="9" y2="7" />
      <line x1="2" y1="10" x2="7" y2="10" />
    </svg>
  );
}

function MergeIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="3" cy="3" r="1.5" />
      <circle cx="3" cy="11" r="1.5" />
      <circle cx="11" cy="7" r="1.5" />
      <path d="M4.5 3.5 Q7 3.5 9.5 7" />
      <path d="M4.5 10.5 Q7 10.5 9.5 7" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="5" y="5" width="8" height="8" rx="1" />
      <path d="M3 9H2a1 1 0 01-1-1V2a1 1 0 011-1h6a1 1 0 011 1v1" />
    </svg>
  );
}

const ACTIONS: { id: AIAction; label: string; icon: JSX.Element; description: string; needsIdea: boolean }[] = [
  {
    id: "expand", label: "Expand", icon: <ExpandIcon />,
    description: "AI elaborates the selected idea with more detail and sub-points.",
    needsIdea: true,
  },
  {
    id: "summarize", label: "Summarize Session", icon: <SummarizeIcon />,
    description: "Get a high-level summary of all ideas in this session.",
    needsIdea: false,
  },
  {
    id: "merge", label: "Merge Ideas", icon: <MergeIcon />,
    description: "Merge the selected idea with another to create a combined idea.",
    needsIdea: true,
  },
];

const flattenIds = (nodes: { idea: { id: string; title: string }; children: unknown[] }[]) => {
  const result: { id: string; title: string }[] = [];
  const stack = [...nodes] as Array<{ idea: { id: string; title: string }; children: unknown[] }>;
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;
    result.push({ id: current.idea.id, title: current.idea.title });
    stack.push(...(current.children as typeof stack));
  }
  return result;
};

export const AIPanel = ({ sessionId }: Props) => {
  const selectedIdea = useIdeaStore((s) => s.selectedIdea);
  const ideaTree     = useIdeaStore((s) => s.ideaTree);
  const addIdea      = useIdeaStore((s) => s.addIdea);

  const [output,      setOutput]      = useState("");
  const [loading,     setLoading]     = useState(false);
  const [activeAction, setActiveAction] = useState<AIAction | null>(null);
  const [mergeTarget, setMergeTarget] = useState("");
  const [copied,      setCopied]      = useState(false);

  const allIdeas = flattenIds(ideaTree);

  const run = async (action: AIAction) => {
    if (action !== "summarize" && !selectedIdea) return;
    if (action === "merge" && !mergeTarget) return;

    setLoading(true);
    setActiveAction(action);
    setOutput("");

    try {
      if (action === "expand") {
        const res = await expandIdea(selectedIdea!.id);
        setOutput(res.output);
      } else if (action === "summarize") {
        const res = await summarizeSession(sessionId);
        setOutput(res.output);
      } else if (action === "merge") {
        const merged = await mergeIdeas(selectedIdea!.id, mergeTarget);
        addIdea(merged);
        setOutput("✓ Merged idea created and added to the graph.");
      }
    } finally {
      setLoading(false);
    }
  };

  const copyOutput = () => {
    if (!output) return;
    void navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes outputIn { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
        .ai-output-in { animation: outputIn 0.3s ease forwards; }
        .ai-action-btn:hover { background: #f0f0eb !important; }
        .ai-action-btn.active { background: rgba(58,91,255,0.06) !important; border-color: #3a5bff !important; }
        .ci-select-ai {
          appearance: none; -webkit-appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23888' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 10px center;
        }
        .ai-markdown h1, .ai-markdown h2, .ai-markdown h3 { margin: 8px 0 6px; font-weight: 800; color: #13131A; }
        .ai-markdown p { margin: 6px 0; }
        .ai-markdown ul, .ai-markdown ol { margin: 6px 0; padding-left: 20px; }
        .ai-markdown li { margin: 3px 0; }
        .ai-markdown code { background: #f5f5f0; border: 1px solid #e5e5e0; border-radius: 3px; padding: 1px 4px; font-family: 'IBM Plex Mono', monospace; font-size: 12px; }
        .ai-markdown pre { background: #f5f5f0; border: 1px solid #e5e5e0; border-radius: 4px; padding: 10px; overflow-x: auto; }
        .ai-markdown pre code { border: none; background: transparent; padding: 0; }
        .ai-markdown blockquote { margin: 8px 0; padding: 6px 10px; border-left: 3px solid #a855f7; color: #555; background: rgba(168,85,247,0.04); }
      `}</style>

      <div style={{ marginTop: 24, borderTop: "1.5px solid #e5e5e0", paddingTop: 20 }}>

        {/* AI header */}
        <div className="flex items-center" style={{ gap: 8, marginBottom: 14 }}>
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{ width: 24, height: 24, background: "linear-gradient(135deg, #3a5bff, #a855f7)", borderRadius: 4 }}
          >
            <SparkleIcon />
          </div>
          <div>
            <p className="font-display font-bold" style={{ fontSize: 13, lineHeight: 1 }}>AI Assistant</p>
            <p className="font-body text-[#aaa]" style={{ fontSize: 10, marginTop: 1 }}>Llama 3 · Groq</p>
          </div>
          {!selectedIdea && (
            <span
              className="font-body text-[#aaa] ml-auto"
              style={{ fontSize: 10, padding: "2px 8px", border: "1px solid #e5e5e0", borderRadius: 999 }}
            >
              Select an idea first
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0, border: "1.5px solid #13131A", borderRadius: 4, overflow: "hidden" }}>
          {ACTIONS.map((action, i) => {
            const disabled = action.needsIdea && !selectedIdea;
            const isActive = activeAction === action.id && (loading || output);

            return (
              <div key={action.id} style={{ borderBottom: i < ACTIONS.length - 1 ? "1px solid #e5e5e0" : "none" }}>
                <button
                  onClick={() => !disabled && void run(action.id)}
                  disabled={disabled}
                  className={`ai-action-btn w-full flex items-center text-left transition-all duration-150${isActive ? " active" : ""}`}
                  style={{
                    padding: "10px 14px", background: "transparent",
                    border: "none", cursor: disabled ? "not-allowed" : "pointer",
                    gap: 10, opacity: disabled ? 0.4 : 1,
                  }}
                >
                  <div
                    className="flex items-center justify-center flex-shrink-0"
                    style={{
                      width: 26, height: 26, borderRadius: 4,
                      background: isActive ? "rgba(58,91,255,0.12)" : "#f0f0eb",
                      color: isActive ? "#3a5bff" : "#555",
                    }}
                  >
                    {loading && activeAction === action.id
                      ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 0.8s linear infinite" }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" /></svg>
                      : action.icon
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold" style={{ fontSize: 12, color: "#13131A" }}>{action.label}</p>
                    <p className="font-body text-[#aaa] truncate" style={{ fontSize: 10 }}>{action.description}</p>
                  </div>
                  {!loading && (
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round">
                      <polyline points="4 2 9 6 4 10" />
                    </svg>
                  )}
                </button>

                {/* Merge target selector */}
                {action.id === "merge" && selectedIdea && (
                  <div style={{ padding: "0 14px 10px", borderTop: "1px solid #f0f0eb" }}>
                    <select
                      className="ci-select-ai font-body w-full"
                      style={{
                        fontSize: 12, padding: "7px 32px 7px 10px",
                        border: "1.5px solid #e5e5e0", borderRadius: 4,
                        background: "#fff", color: mergeTarget ? "#13131A" : "#aaa",
                        outline: "none",
                      }}
                      value={mergeTarget}
                      onChange={(e) => setMergeTarget(e.target.value)}
                    >
                      <option value="">Select idea to merge with…</option>
                      {allIdeas
                        .filter((idea) => idea.id !== selectedIdea?.id)
                        .map((idea) => (
                          <option key={idea.id} value={idea.id}>{idea.title}</option>
                        ))}
                    </select>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Output area */}
        {(output || (loading && !output)) && (
          <div
            className="ai-output-in"
            style={{ marginTop: 12, border: "1.5px solid #13131A", borderRadius: 4, overflow: "hidden" }}
          >
            <div
              className="flex items-center justify-between"
              style={{ padding: "7px 12px", borderBottom: "1px solid #e5e5e0", background: "#f5f5f0" }}
            >
              <div className="flex items-center" style={{ gap: 6 }}>
                <span style={{ width: 12, height: 1.5, background: "#a855f7", display: "block" }} />
                <span className="font-body text-[#a855f7] uppercase" style={{ fontSize: 9, letterSpacing: "0.15em" }}>AI Output</span>
              </div>
              {output && (
                <button
                  onClick={copyOutput}
                  className="flex items-center font-body text-[#888] hover:text-ink transition-colors"
                  style={{ gap: 4, fontSize: 10, background: "none", border: "none", cursor: "pointer", padding: 0 }}
                >
                  <CopyIcon />
                  {copied ? "Copied!" : "Copy"}
                </button>
              )}
            </div>
            <div style={{ padding: "12px 14px", background: "#fff", minHeight: 60 }}>
              {loading && !output ? (
                <div className="flex items-center" style={{ gap: 8 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" style={{ animation: "spin 0.8s linear infinite", flexShrink: 0 }}>
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  <span className="font-body text-[#aaa]" style={{ fontSize: 12 }}>Thinking…</span>
                </div>
              ) : (
                <div className="font-body ai-markdown" style={{ fontSize: 13, lineHeight: 1.75, color: "#333" }}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{output}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};