import Link from "next/link";
import { requireSuperAdmin } from "@/lib/authz";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSuperAdmin();

  return (
    <div className="flex-1 flex flex-col">
      <header className="border-b border-line bg-paper-raised">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-8">
          <Link href="/" className="font-display text-lg font-semibold text-ink">
            Ledger<span className="text-brass">.</span>{" "}
            <span className="font-mono text-xs font-normal uppercase tracking-wider text-slate">
              Platform Admin
            </span>
          </Link>
          <nav className="flex flex-wrap items-center gap-4 font-mono text-xs uppercase tracking-wider">
            <Link href="/super-admin/pending" className="text-slate hover:text-ink">
              Pending
            </Link>
            <Link href="/super-admin/orgs" className="text-slate hover:text-ink">
              All Schools
            </Link>
            <Link href="/super-admin/site-content" className="text-slate hover:text-ink">
              Homepage Content
            </Link>
            <form action="/api/auth/signout" method="post">
              <button className="text-slate hover:text-ink">Sign out</button>
            </form>
          </nav>
        </div>
      </header>
      <div className="flex-1 bg-paper">{children}</div>
    </div>
  );
}
