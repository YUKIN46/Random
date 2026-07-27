import { SkeletonBar } from "@/components/skeleton";

export default function Loading() {
  return (
    <div>
      <SkeletonBar className="h-8 w-56 mb-6" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-line bg-paper-raised p-5">
            <SkeletonBar className="h-4 w-48 mb-2" />
            <SkeletonBar className="h-3 w-64 mb-4" />
            <SkeletonBar className="h-24 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
