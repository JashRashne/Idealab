import { useMemo } from "react";
import { Navigate, useParams } from "react-router-dom";

import { WorkspaceLayout } from "../components/workspace/WorkspaceLayout";
import { useIdeas } from "../hooks/useIdeas";
import { useSession } from "../hooks/useSession";
import { useWebSocket } from "../hooks/useWebSocket";
import { useAuthStore } from "../store/authStore";
import { useSessionStore } from "../store/sessionStore";

export const WorkspacePage = () => {
  const params = useParams<{ id: string }>();
  const sessionId = params.id;
  const user = useAuthStore((s) => s.user);
  const onlineParticipantIds = useSessionStore((s) => s.onlineParticipantIds);

  const safeSessionId = sessionId ?? "";
  const safeUserId = user?.id ?? "";

  const { sendMessage, connectionStatus } = useWebSocket(safeSessionId, safeUserId);
  const { session, participants, loading, error } = useSession(safeSessionId, safeUserId);
  useIdeas(safeSessionId);

  const title = useMemo(() => session?.title ?? "Workspace", [session]);

  if (!sessionId || !user) {
    return <Navigate to="/sessions" replace />;
  }

  if (loading) {
    return <div className="p-6">Loading workspace...</div>;
  }

  if (error || !session) {
    return <div className="p-6 text-coral">Unable to load this session.</div>;
  }

  return (
    <WorkspaceLayout
      sessionId={sessionId}
      sessionTitle={title}
      participants={participants}
      onlineParticipantIds={onlineParticipantIds}
      connectionStatus={connectionStatus}
      sendMessage={sendMessage}
    />
  );
};
