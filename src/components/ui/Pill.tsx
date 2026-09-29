import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type PillProps = {
  children: ReactNode;
  className?: string;
};

/** Mono tech pill — bachi.dev pattern. */
export function Pill({ children, className }: PillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-white/5 px-3 py-1 font-mono text-xs font-medium text-brand-300 ring-1 ring-white/10",
        className,
      )}
    >
      {children}
    </span>
  );
}
