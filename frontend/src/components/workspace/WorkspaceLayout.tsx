import { IdeaBranchGraph } from "../ideas/IdeaBranchGraph";
import { IdeaDetailPanel } from "../ideas/IdeaDetailPanel";
import { ConnectionStatus } from "./ConnectionStatus";
import { ParticipantList } from "./ParticipantList";
import type { WSMessage } from "../../types";

interface Props {
  sessionTitle: string;
  participants: string[];
  onlineParticipantIds: string[];
  connectionStatus: "connecting" | "connected" | "disconnected";
  sessionId: string;
  sendMessage: (message: WSMessage) => void;
}

export const WorkspaceLayout = ({
  sessionTitle,
  participants,
  onlineParticipantIds,
  connectionStatus,
  sessionId,
  sendMessage
}: Props) => {
  return (
    <div className="flex h-[calc(100vh-64px)] flex-col">
      <div className="flex items-center justify-between border-b border-black/10 bg-sand px-4 py-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink">{sessionTitle}</h2>
          <ParticipantList participants={participants} onlineParticipantIds={onlineParticipantIds} />
        </div>
        <ConnectionStatus status={connectionStatus} />
      </div>
      <div className="grid flex-1 grid-cols-12 overflow-hidden">
        <div className="col-span-7 border-r border-black/10 bg-sky/40">
          <IdeaBranchGraph sessionId={sessionId} sendMessage={sendMessage} />
        </div>
        <div className="col-span-5 bg-white">
          <IdeaDetailPanel sessionId={sessionId} sendMessage={sendMessage} />
        </div>
      </div>
    </div>
  );
};
