import { Link } from "react-router-dom";

import type { Session } from "../../types";
import { Badge } from "../shared/Badge";

interface Props {
  session: Session;
  isParticipant: boolean;
  onJoin: (id: string) => Promise<void>;
}

export const SessionCard = ({ session, isParticipant, onJoin }: Props) => {
  const participantCount = (session.participant_ids ?? []).length;

  return (
    <article className="h-full flex flex-col" style={{ padding: 28 }}>
      {/* Header row */}
      <div className="flex items-start justify-between" style={{ gap: 12, marginBottom: 12 }}>
        <h3
          className="font-display font-extrabold leading-tight"
          style={{ fontSize: 17, letterSpacing: "-0.01em", flex: 1 }}
        >
          {session.title}
        </h3>
        <span
          className="font-body uppercase flex-shrink-0"
          style={{
            fontSize: 10,
            letterSpacing: "0.12em",
            padding: "3px 10px",
            borderRadius: 999,
            border: `1.5px solid ${session.status === "active" ? "#27c93f" : "#f59e0b"}`,
            color: session.status === "active" ? "#27c93f" : "#f59e0b",
            background: session.status === "active" ? "rgba(39,201,63,0.08)" : "rgba(245,158,11,0.08)",
          }}
        >
          {session.status}
        </span>
      </div>

      {/* Description */}
      <p
        className="font-body text-[#888] flex-1"
        style={{ fontSize: 13, lineHeight: 1.7, marginBottom: 20 }}
      >
        {session.description || "No description provided."}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between" style={{ gap: 12, marginTop: "auto" }}>
        {/* Participants */}
        <div className="flex items-center" style={{ gap: 6 }}>
          <div
            className="flex items-center justify-center"
            style={{
              width: 20, height: 20,
              borderRadius: "50%",
              background: "#3a5bff",
              fontSize: 8,
              color: "white",
              fontFamily: "inherit",
              fontWeight: 700,
            }}
          >
            {participantCount}
          </div>
          <span className="font-body text-[#888]" style={{ fontSize: 11 }}>
            {participantCount === 1 ? "participant" : "participants"}
          </span>
        </div>

        {/* Action button */}
        {isParticipant ? (
          <Link
            to={`/sessions/${session.id}`}
            className="font-display font-bold uppercase text-white hover:bg-[#0a0a0a] hover:border-[#0a0a0a] transition-all duration-[180ms]"
            style={{
              fontSize: 12,
              letterSpacing: "0.08em",
              padding: "8px 18px",
              background: "#3a5bff",
              border: "1.5px solid #3a5bff",
              borderRadius: 4,
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Open →
          </Link>
        ) : (
          <button
            onClick={() => void onJoin(session.id)}
            className="font-display font-bold uppercase text-ink hover:bg-ink hover:text-[#f5f5f0] transition-all duration-[180ms]"
            style={{
              fontSize: 12,
              letterSpacing: "0.08em",
              padding: "8px 18px",
              background: "transparent",
              border: "1.5px solid #13131A",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Join
          </button>
        )}
      </div>
    </article>
  );
};