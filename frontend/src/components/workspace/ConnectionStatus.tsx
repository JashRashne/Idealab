interface Props {
  status: "connecting" | "connected" | "disconnected";
}

export const ConnectionStatus = ({ status }: Props) => {
  const map = {
    connected:    { label: "Live",            dot: "#27c93f", bg: "rgba(39,201,63,0.08)",   border: "rgba(39,201,63,0.35)",   pulse: true  },
    connecting:   { label: "Reconnecting…",   dot: "#f59e0b", bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.35)",  pulse: false },
    disconnected: { label: "Disconnected",    dot: "#e53e3e", bg: "rgba(229,62,62,0.08)",   border: "rgba(229,62,62,0.35)",   pulse: false },
  } as const;

  const s = map[status];

  return (
    <>
      {s.pulse && (
        <style>{`
          @keyframes livePulse { 0%,100%{opacity:1} 50%{opacity:0.25} }
          .ws-live-dot { animation: livePulse 1.4s infinite; }
        `}</style>
      )}
      <div
        className="flex items-center"
        style={{
          gap: 7,
          padding: "5px 14px",
          borderRadius: 999,
          background: s.bg,
          border: `1.5px solid ${s.border}`,
        }}
      >
        <span
          className={s.pulse ? "ws-live-dot" : ""}
          style={{ width: 7, height: 7, borderRadius: "50%", background: s.dot, flexShrink: 0 }}
        />
        <span
          className="font-body font-semibold"
          style={{ fontSize: 11, color: s.dot, letterSpacing: "0.05em" }}
        >
          {s.label}
        </span>
      </div>
    </>
  );
};