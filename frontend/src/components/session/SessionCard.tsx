import { Link } from "react-router-dom";

import type { Session } from "../../types";
import { Badge } from "../shared/Badge";
import { Button } from "../shared/Button";

interface Props {
  session: Session;
  isParticipant: boolean;
  onJoin: (id: string) => Promise<void>;
}

export const SessionCard = ({ session, isParticipant, onJoin }: Props) => {
  return (
    <article className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-2">
        <h3 className="font-display text-lg font-bold text-ink">{session.title}</h3>
        <Badge tone={session.status === "active" ? "success" : "warning"}>{session.status}</Badge>
      </div>
      <p className="mb-3 text-sm text-ink/70">{session.description || "No description provided."}</p>
      <p className="mb-4 text-xs text-ink/60">Participants: {session.participant_ids.length}</p>
      {isParticipant ? (
        <Link to={`/sessions/${session.id}`}>
          <Button variant="primary">Open</Button>
        </Link>
      ) : (
        <Button variant="secondary" onClick={() => void onJoin(session.id)}>
          Join
        </Button>
      )}
    </article>
  );
};
