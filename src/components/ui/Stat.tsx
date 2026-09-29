import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type StatProps = {
  value: string;
  label: string;
  className?: string;
  /** Optional leading icon (e.g. Leaf for AQI) + value tint (e.g. AQI band). */
  icon?: ReactNode;
  valueClassName?: string;
};

/**
 * Small value + mono label tile. Fixed height + nowrap everywhere so tiles in
 * a grid always render uniform — no wrapping, no ragged rows.
 */
export function Stat({
  value,
  label,
  className,
  icon,
  valueClassName,
}: StatProps) {
  return (
    <div
      className={cn(
        "flex min-h-[78px] flex-col justify-center rounded-xl bg-white/[0.03] px-2 py-3 text-center ring-1 ring-white/5",
        className,
      )}
    >
      <p
        className={cn(
          "flex items-center justify-center gap-1.5 whitespace-nowrap text-base font-semibold text-zinc-100",
          valueClassName,
        )}
      >
        {icon}
        {value}
      </p>
      <p className="mt-0.5 whitespace-nowrap font-mono text-[11px] uppercase tracking-wider text-zinc-400">
        {label}
      </p>
    </div>
  );
}
