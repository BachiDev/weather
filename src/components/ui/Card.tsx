import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type CardProps = {
  children: ReactNode;
  className?: string;
};

/** Shared card — bachi.dev pattern: hairline border, faint fill, violet hover. */
export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition-all duration-300",
        "hover:border-brand-500/40 hover:shadow-[0_0_24px_-6px_var(--color-brand-500)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
