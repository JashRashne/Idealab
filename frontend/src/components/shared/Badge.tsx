import type { PropsWithChildren } from "react";

interface Props extends PropsWithChildren {
  tone?: "default" | "success" | "warning" | "danger";
}

const tones = {
  default: "bg-ink/10 text-ink",
  success: "bg-moss/15 text-moss",
  warning: "bg-yellow-100 text-yellow-700",
  danger: "bg-coral/15 text-coral"
};

export const Badge = ({ tone = "default", children }: Props) => {
  return <span className={`rounded-full px-2 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
};
