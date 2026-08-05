import Link from "next/link";

export default function Pagination({
  basePath,
  currentPage,
  totalPages,
  searchParams,
}: {
  basePath: string;
  currentPage: number;
  totalPages: number;
  /** Other query params to preserve across page links, e.g. { q: "smith" } */
  searchParams?: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  function hrefFor(page: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams ?? {})) {
      if (value) params.set(key, value);
    }
    params.set("page", String(page));
    return `${basePath}?${params.toString()}`;
  }

  // Show first, last, current, and one neighbor on each side; collapse the
  // rest into ellipses so this stays readable even with many pages.
  const pages = new Set<number>();
  pages.add(1);
  pages.add(totalPages);
  for (let p = currentPage - 1; p <= currentPage + 1; p++) {
    if (p >= 1 && p <= totalPages) pages.add(p);
  }
  const sorted = Array.from(pages).sort((a, b) => a - b);

  return (
    <nav className="mt-6 flex items-center justify-center gap-1 font-mono text-xs">
      <PageLink
        href={currentPage > 1 ? hrefFor(currentPage - 1) : undefined}
        label="Prev"
      />
      {sorted.map((p, i) => (
        <span key={p} className="flex items-center gap-1">
          {i > 0 && p - sorted[i - 1] > 1 && <span className="px-1 text-slate">…</span>}
          <PageLink href={hrefFor(p)} label={String(p)} active={p === currentPage} />
        </span>
      ))}
      <PageLink
        href={currentPage < totalPages ? hrefFor(currentPage + 1) : undefined}
        label="Next"
      />
    </nav>
  );
}

function PageLink({ href, label, active }: { href?: string; label: string; active?: boolean }) {
  if (!href) {
    return <span className="rounded-md px-2.5 py-1.5 text-slate/40">{label}</span>;
  }
  return (
    <Link
      href={href}
      className={
        active
          ? "rounded-md bg-ink px-2.5 py-1.5 text-paper"
          : "rounded-md px-2.5 py-1.5 text-ink hover:bg-paper"
      }
    >
      {label}
    </Link>
  );
}
