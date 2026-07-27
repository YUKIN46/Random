import { SkeletonBar } from "@/components/skeleton";

export default function Loading() {
  return (
    <div>
      <SkeletonBar className="h-8 w-40 mb-6" />
      <SkeletonBar className="h-9 w-48 mb-6" />
      <div className="grid grid-cols-7 gap-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-line bg-paper-raised p-3">
            <SkeletonBar className="h-3 w-10 mb-3" />
            <SkeletonBar className="h-14 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
