import type { InputHTMLAttributes } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = ({ label, error, className = "", ...props }: Props) => {
  return (
    <label className="flex w-full flex-col gap-1 text-sm">
      <span className="font-medium text-ink">{label}</span>
      <input
        className={`rounded-lg border border-black/20 bg-white px-3 py-2 outline-none ring-coral/50 focus:ring ${className}`}
        {...props}
      />
      {error ? <span className="text-xs text-coral">{error}</span> : null}
    </label>
  );
};
