import { SkeletonBar } from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="space-y-10">
      <SkeletonBar className="h-8 w-56" />
      <div>
        <SkeletonBar className="h-5 w-40 mb-3" />
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-line bg-paper-raised p-5">
              <SkeletonBar className="h-4 w-32 mb-3" />
              <SkeletonBar className="h-3 w-full mb-1.5" />
              <SkeletonBar className="h-3 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
