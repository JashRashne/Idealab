import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement>, PropsWithChildren {
  variant?: Variant;
}

const styles: Record<Variant, string> = {
  primary: "bg-ink text-sand hover:bg-black",
  secondary: "bg-sky text-ink hover:bg-cyan-100",
  danger: "bg-coral text-white hover:opacity-90",
  ghost: "bg-transparent text-ink hover:bg-black/5"
};

export const Button = ({ variant = "primary", children, className = "", ...props }: Props) => {
  return (
    <button
      className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
