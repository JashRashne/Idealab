import { WorkspaceLayout } from "../components/workspace/WorkspaceLayout";
import { mockSession } from "../mocks/mockSession";
import { mockIdeaTree } from "../mocks/mockIdeas";

// MOCK UI ONLY: Use mock data for UI development
export const WorkspacePage = () => {
  const session              = mockSession;
  const ideaTree             = mockIdeaTree;
  const participants         = session.participant_ids;
  const onlineParticipantIds = session.participant_ids;
  const connectionStatus     = "connected";
  const sendMessage          = () => {};

  return (
    <WorkspaceLayout
      sessionId={session.id}
      sessionTitle={session.title}
      participants={participants}
      onlineParticipantIds={onlineParticipantIds}
      connectionStatus={connectionStatus}
      sendMessage={sendMessage}
      ideaTree={ideaTree}
    />
  );
};