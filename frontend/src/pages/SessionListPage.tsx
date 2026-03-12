import { useEffect, useState } from "react";

import { CreateSessionModal } from "../components/session/CreateSessionModal";
import { SessionCard } from "../components/session/SessionCard";
import { Button } from "../components/shared/Button";
import { getSessions, joinSession } from "../services/session.service";
import { useAuthStore } from "../store/authStore";
import { useSessionStore } from "../store/sessionStore";
import type { Session } from "../types";

export const SessionListPage = () => {
  const [modalOpen, setModalOpen] = useState(false);

  const user = useAuthStore((s) => s.user);
  const sessions = useSessionStore((s) => s.sessions);
  const setSessions = useSessionStore((s) => s.setSessions);
  const addSession = useSessionStore((s) => s.addSession);

  useEffect(() => {
    const load = async () => {
      const data = await getSessions();
      setSessions(data);
    };
    void load();
  }, [setSessions]);

  const onJoin = async (id: string) => {
    const joined = await joinSession(id);
    const updated = sessions.map((session) => (session.id === joined.id ? joined : session));
    setSessions(updated);
  };

  const onCreated = (session: Session) => {
    addSession(session);
  };

  return (
    <main className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-3xl font-bold">Sessions</h2>
        <Button onClick={() => setModalOpen(true)}>+ New Session</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sessions.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            isParticipant={Boolean(user && session.participant_ids.includes(user.id))}
            onJoin={onJoin}
          />
        ))}
      </div>

      <CreateSessionModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={onCreated} />
    </main>
  );
};
