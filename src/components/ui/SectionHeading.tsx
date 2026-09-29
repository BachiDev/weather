import { cn } from "@/lib/cn";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  level?: 2 | 3;
  className?: string;
};

/** Kicker (mono, violet) + heading — one pattern for all forecast sections. */
export function SectionHeading({
  eyebrow,
  title,
  level = 2,
  className,
}: SectionHeadingProps) {
  const Tag = level === 3 ? "h3" : "h2";
  return (
    <div className={cn("mb-6 space-y-2 text-center", className)}>
      <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-brand-400">
        {eyebrow}
      </p>
      <Tag className="text-2xl font-bold tracking-tight text-zinc-50 md:text-3xl">
        {title}
      </Tag>
    </div>
  );
}
