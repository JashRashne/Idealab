import { useEffect, useMemo, useState } from "react";

import { getSession, joinSession } from "../services/session.service";
import { useSessionStore } from "../store/sessionStore";
import type { Session } from "../types";

export const useSession = (sessionId: string, userId: string) => {
  const currentSession = useSessionStore((s) => s.currentSession);
  const setCurrentSession = useSessionStore((s) => s.setCurrentSession);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const session = await getSession(sessionId);
        let finalSession: Session = session;
        if (!session.participant_ids.includes(userId)) {
          finalSession = await joinSession(sessionId);
        }
        setCurrentSession(finalSession);
        setError(null);
      } catch {
        setError("Failed to load session");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [sessionId, userId, setCurrentSession]);

  const participants = useMemo(() => currentSession?.participant_ids ?? [], [currentSession]);
  return { session: currentSession, participants, loading, error };
};
