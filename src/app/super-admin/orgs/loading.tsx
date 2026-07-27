import { SkeletonBar, SkeletonTable } from "@/components/skeleton";

export default function Loading() {
  return (
    <main className="max-w-5xl mx-auto py-12 px-5 sm:px-8">
      <SkeletonBar className="h-4 w-24 mb-3" />
      <SkeletonBar className="h-8 w-48 mb-8" />
      <SkeletonTable rows={6} cols={5} />
    </main>
  );
}
