import { SkeletonBar, SkeletonCardGrid } from "@/components/skeleton";

export default function Loading() {
  return (
    <div>
      <SkeletonBar className="h-8 w-40 mb-6" />
      <SkeletonCardGrid count={4} />
    </div>
  );
}
