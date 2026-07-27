import { SkeletonBar, SkeletonTable } from "@/components/skeleton";

export default function Loading() {
  return (
    <div>
      <SkeletonBar className="h-8 w-40 mb-6" />
      <div className="flex gap-4 mb-6">
        <SkeletonBar className="h-9 w-40" />
        <SkeletonBar className="h-9 w-36" />
      </div>
      <SkeletonTable rows={6} cols={2} />
    </div>
  );
}
