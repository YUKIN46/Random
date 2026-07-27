export function SkeletonBar({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-line/60 ${className}`} />;
}

export function SkeletonPageHeader() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
      <SkeletonBar className="h-8 w-48" />
      <SkeletonBar className="h-9 w-40" />
    </div>
  );
}

export function SkeletonTable({ rows = 6, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-xl border border-line bg-paper-raised overflow-hidden">
      <div className="border-b border-line bg-paper px-4 py-3">
        <div className="flex gap-6">
          {Array.from({ length: cols }).map((_, i) => (
            <SkeletonBar key={i} className="h-3 w-20" />
          ))}
        </div>
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-6 border-t border-line px-4 py-4 first:border-t-0">
          {Array.from({ length: cols }).map((_, c) => (
            <SkeletonBar key={c} className="h-3.5 w-24" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonCardGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-line bg-paper-raised p-5">
          <SkeletonBar className="h-3 w-20 mb-3" />
          <SkeletonBar className="h-8 w-14" />
        </div>
      ))}
    </div>
  );
}
