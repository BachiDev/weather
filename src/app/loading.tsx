import { ResultsSkeleton } from "@/components/states";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 md:px-6">
      <ResultsSkeleton />
    </div>
  );
}
