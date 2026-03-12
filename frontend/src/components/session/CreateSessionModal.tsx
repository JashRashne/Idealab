import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { createSession } from "../../services/session.service";
import type { Session } from "../../types";
import { Input } from "../shared/Input";
import { Modal } from "../shared/Modal";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (session: Session) => void;
}

export const CreateSessionModal = ({ open, onClose, onCreated }: Props) => {
  const [title,       setTitle]       = useState("");
  const [description, setDescription] = useState("");
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const navigate = useNavigate();

  const submit = async () => {
    if (!title.trim()) { setError("Session title is required."); return; }
    setLoading(true);
    setError("");
    try {
      const session = await createSession(title.trim(), description.trim());
      onCreated(session);
      onClose();
      setTitle("");
      setDescription("");
      navigate(`/sessions/${session.id}`);
    } catch {
      setError("Failed to create session. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="">
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .modal-field input:focus,
        .modal-field textarea:focus {
          outline: none;
          border-color: #3a5bff !important;
          box-shadow: 0 0 0 3px rgba(58,91,255,0.12);
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div className="flex items-center" style={{ gap: 8, marginBottom: 10 }}>
          <span style={{ width: 20, height: 1.5, background: "#3a5bff", display: "block" }} />
          <p className="font-body text-[#3a5bff] uppercase" style={{ fontSize: 10, letterSpacing: "0.2em" }}>
            New session
          </p>
        </div>
        <h2 className="font-display font-extrabold" style={{ fontSize: 26, letterSpacing: "-0.03em", lineHeight: 1 }}>
          Start a brainstorm.
        </h2>
        <p className="font-body text-[#888]" style={{ fontSize: 12, marginTop: 8, lineHeight: 1.6 }}>
          Give your session a name and optional description, then invite your team.
        </p>
      </div>

      {/* Fields */}
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>

        {/* Title field */}
        <div
          className="modal-field"
          style={{ border: "1.5px solid #13131A", borderRadius: "4px 4px 0 0", borderBottom: "none", padding: "12px 16px" }}
        >
          <label className="font-body text-[#888] uppercase block" style={{ fontSize: 10, letterSpacing: "0.15em", marginBottom: 6 }}>
            Session title <span style={{ color: "#3a5bff" }}>*</span>
          </label>
          <Input
            value={title}
            label=""
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Q3 Product Strategy"
            onKeyDown={(e) => e.key === "Enter" && void submit()}
            style={{
              border: "none", outline: "none", background: "transparent",
              fontFamily: "inherit", fontSize: 15, width: "100%", padding: 0, color: "#13131A",
            }}
          />
        </div>

        {/* Description field */}
        <div
          className="modal-field"
          style={{ border: "1.5px solid #13131A", borderRadius: "0 0 4px 4px", padding: "12px 16px" }}
        >
          <label className="font-body text-[#888] uppercase block" style={{ fontSize: 10, letterSpacing: "0.15em", marginBottom: 6 }}>
            Description <span style={{ color: "#888", fontWeight: 400 }}>(optional)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's this session about?"
            rows={3}
            style={{
              border: "none", outline: "none", background: "transparent",
              fontFamily: "inherit", fontSize: 14, width: "100%", padding: 0,
              color: "#13131A", resize: "none", lineHeight: 1.6,
            }}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center font-body text-[#e53e3e]" style={{ marginTop: 10, fontSize: 12, gap: 6 }}>
            <span style={{
              width: 16, height: 16, borderRadius: "50%", background: "rgba(229,62,62,0.1)",
              border: "1px solid rgba(229,62,62,0.3)", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 9, flexShrink: 0,
            }}>!</span>
            {error}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between" style={{ marginTop: 24, gap: 12 }}>
        <button
          onClick={onClose}
          className="font-display font-bold uppercase text-[#888] hover:text-ink transition-colors duration-150"
          style={{ fontSize: 12, letterSpacing: "0.08em", background: "none", border: "none", cursor: "pointer", padding: "8px 0" }}
        >
          Cancel
        </button>

        <button
          onClick={() => void submit()}
          disabled={loading}
          className="font-display font-bold uppercase text-white hover:bg-[#0a0a0a] hover:border-[#0a0a0a] transition-all duration-[180ms] flex items-center disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            fontSize: 13, letterSpacing: "0.08em", padding: "12px 28px",
            background: loading ? "#555" : "#3a5bff",
            border: `1.5px solid ${loading ? "#555" : "#3a5bff"}`,
            borderRadius: 4, cursor: loading ? "not-allowed" : "pointer", gap: 10,
          }}
        >
          {loading ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                style={{ animation: "spin 0.8s linear infinite" }}>
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              Creating…
            </>
          ) : (
            <>Create Session →</>
          )}
        </button>
      </div>

      {/* Footer hint */}
      <p className="font-body text-[#aaa] text-center" style={{ fontSize: 11, marginTop: 20, lineHeight: 1.6 }}>
        You'll be taken to the workspace immediately after creation.
      </p>
    </Modal>
  );
};