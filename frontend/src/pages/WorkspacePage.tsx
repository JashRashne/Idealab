import { Navigate, useParams } from "react-router-dom";

import { WorkspaceLayout } from "../components/workspace/WorkspaceLayout";
import { useIdeas } from "../hooks/useIdeas";
import { useSession } from "../hooks/useSession";
import { useWebSocket } from "../hooks/useWebSocket";
import { useAuthStore } from "../store/authStore";
import { useSessionStore } from "../store/sessionStore";

export const WorkspacePage = () => {
  const { id: sessionId = "" } = useParams<{ id: string }>();

  const user = useAuthStore((s) => s.user);
  const onlineParticipantIds = useSessionStore((s) => s.onlineParticipantIds);

  const { session, participants } = useSession(sessionId, user?.id ?? "");
  useIdeas(sessionId);
  const { connectionStatus, sendMessage } = useWebSocket(sessionId, user?.id ?? "");

  if (!sessionId || !user || !session) return null;

  return (
    <WorkspaceLayout
      sessionId={sessionId}
      sessionTitle={session.title}
      participants={participants}
      onlineParticipantIds={onlineParticipantIds}
      connectionStatus={connectionStatus}
      sendMessage={sendMessage}
      isOwner={session.owner_id === user.id}
      currentUserId={user.id}
      currentUsername={user.username}
    />
  );
};