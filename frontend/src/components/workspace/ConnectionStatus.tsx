interface Props {
  status: "connecting" | "connected" | "disconnected";
}

export const ConnectionStatus = ({ status }: Props) => {
  const map = {
    connected: { label: "Live", color: "bg-moss" },
    connecting: { label: "Reconnecting...", color: "bg-yellow-500" },
    disconnected: { label: "Disconnected", color: "bg-coral" }
  } as const;
  const state = map[status];

  return (
    <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-ink">
      <span className={`h-2.5 w-2.5 rounded-full ${state.color}`} />
      {state.label}
    </div>
  );
};
