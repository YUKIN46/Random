import { SkeletonBar, SkeletonTable } from "@/components/skeleton";

export default function Loading() {
  return (
    <div>
      <SkeletonBar className="h-8 w-56 mb-6" />
      <SkeletonBar className="h-9 w-32 mb-6" />
      <SkeletonTable rows={6} cols={5} />
    </div>
  );
}
