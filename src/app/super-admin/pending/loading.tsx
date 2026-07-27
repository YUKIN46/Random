import { SkeletonBar } from "@/components/skeleton";

export default function Loading() {
  return (
    <main className="max-w-4xl mx-auto py-12 px-5 sm:px-8">
      <SkeletonBar className="h-4 w-32 mb-3" />
      <SkeletonBar className="h-8 w-72 mb-8" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-line bg-paper-raised p-5">
            <SkeletonBar className="h-4 w-40 mb-2" />
            <SkeletonBar className="h-3 w-56" />
          </div>
        ))}
      </div>
    </main>
  );
}
