import { cn } from "@/lib/cn";

type StatProps = {
  value: string;
  label: string;
  className?: string;
};

/** Small value + mono label tile for the meta grid. */
export function Stat({ value, label, className }: StatProps) {
  return (
    <div
      className={cn(
        "rounded-xl bg-white/[0.03] px-4 py-3 text-center ring-1 ring-white/5",
        className,
      )}
    >
      <p className="text-lg font-semibold text-zinc-100">{value}</p>
      <p className="mt-0.5 font-mono text-[11px] uppercase tracking-wider text-zinc-400">
        {label}
      </p>
    </div>
  );
}
