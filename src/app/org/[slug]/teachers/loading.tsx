import { SkeletonPageHeader, SkeletonTable } from "@/components/skeleton";

export default function Loading() {
  return (
    <div>
      <SkeletonPageHeader />
      <SkeletonTable rows={6} cols={4} />
    </div>
  );
}
