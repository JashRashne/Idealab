interface Props {
  participants: string[];
  onlineParticipantIds: string[];
}

const AVATAR_COLORS = ["#3a5bff","#27c93f","#e53e3e","#d69e2e","#805ad5","#0891b2","#db2777"];

export const ParticipantList = ({ participants, onlineParticipantIds }: Props) => {
  const MAX_SHOW = 5;
  const visible  = participants.slice(0, MAX_SHOW);
  const overflow = participants.length - MAX_SHOW;

  return (
    <div className="flex items-center" style={{ gap: 6 }}>
      {/* Stacked avatars */}
      <div className="flex">
        {visible.map((p, i) => {
          const online = onlineParticipantIds.includes(p);
          const color  = AVATAR_COLORS[i % AVATAR_COLORS.length];
          return (
            <div
              key={p}
              title={p}
              style={{
                position: "relative",
                width: 26, height: 26,
                marginLeft: i === 0 ? 0 : -7,
                zIndex: visible.length - i,
              }}
            >
              {/* Avatar circle */}
              <div
                className="flex items-center justify-center font-body font-bold text-white rounded-full"
                style={{
                  width: "100%", height: "100%",
                  background: color,
                  border: "2px solid #f5f5f0",
                  fontSize: 9,
                  opacity: online ? 1 : 0.45,
                }}
              >
                {p.slice(0, 2).toUpperCase()}
              </div>
              {/* Online dot */}
              {online && (
                <span
                  style={{
                    position: "absolute", bottom: 0, right: 0,
                    width: 7, height: 7, borderRadius: "50%",
                    background: "#27c93f",
                    border: "1.5px solid #f5f5f0",
                  }}
                />
              )}
            </div>
          );
        })}

        {/* Overflow badge */}
        {overflow > 0 && (
          <div
            className="flex items-center justify-center font-body font-bold text-[#888] rounded-full"
            style={{
              width: 26, height: 26,
              marginLeft: -7,
              background: "#e8e5dc",
              border: "2px solid #f5f5f0",
              fontSize: 9,
              zIndex: 0,
            }}
          >
            +{overflow}
          </div>
        )}
      </div>

      {/* Count label */}
      <span className="font-body text-[#888]" style={{ fontSize: 11 }}>
        {onlineParticipantIds.length} online
      </span>
    </div>
  );
};