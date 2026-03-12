interface Props {
  participants: string[];
  onlineParticipantIds: string[];
}

export const ParticipantList = ({ participants, onlineParticipantIds }: Props) => {
  return (
    <div className="flex flex-wrap gap-2">
      {participants.map((participant) => {
        const online = onlineParticipantIds.includes(participant);
        return (
          <span key={participant} className="flex items-center gap-1 rounded-full bg-white px-2 py-1 text-xs">
            <span className={`h-2 w-2 rounded-full ${online ? "bg-moss" : "bg-gray-400"}`} />
            {participant.slice(0, 8)}
          </span>
        );
      })}
    </div>
  );
};
