import { SkeletonBar } from "@/components/skeleton";

export default function Loading() {
  return (
    <div>
      <SkeletonBar className="h-8 w-64 mb-6" />
      <SkeletonBar className="h-9 w-32 mb-6" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-line bg-paper-raised p-5">
            <SkeletonBar className="h-4 w-40 mb-2" />
            <SkeletonBar className="h-3 w-full mb-1.5" />
            <SkeletonBar className="h-3 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
