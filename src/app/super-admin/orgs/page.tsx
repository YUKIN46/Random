import Link from "next/link";
import { requireSuperAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import OrgStatusActions from "./org-status-actions";

const STATUS_COLORS: Record<string, string> = {
  APPROVED: "bg-chalk/10 text-chalk",
  PENDING: "bg-brass/10 text-brass-dark",
  REJECTED: "bg-line/60 text-slate",
  SUSPENDED: "bg-ledger-red/10 text-ledger-red",
};

export default async function AllOrgsPage() {
  await requireSuperAdmin();

  const orgs = await prisma.organization.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { users: true, students: true } } },
  });

  return (
    <main className="max-w-5xl mx-auto py-12 px-5 sm:px-8">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-brass">Directory</p>
      <h1 className="mt-2 font-display text-2xl font-semibold text-ink">All schools</h1>
      <div className="mt-8 overflow-x-auto rounded-lg border border-line bg-paper-raised">
        <table className="w-full text-sm">
          <thead className="bg-paper text-left text-slate">
            <tr>
              <th className="px-4 py-3 font-mono text-xs uppercase tracking-wider font-medium">School</th>
              <th className="px-4 py-3 font-mono text-xs uppercase tracking-wider font-medium">Subdomain</th>
              <th className="px-4 py-3 font-mono text-xs uppercase tracking-wider font-medium">Students</th>
              <th className="px-4 py-3 font-mono text-xs uppercase tracking-wider font-medium">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {orgs.map((org) => (
              <tr key={org.id} className="border-t border-line">
                <td className="px-4 py-3 text-ink">{org.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate">
                  {org.slug}.{process.env.NEXT_PUBLIC_APP_DOMAIN}
                </td>
                <td className="px-4 py-3 text-ink">{org._count.students}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-md px-2 py-1 font-mono text-xs font-medium ${STATUS_COLORS[org.status]}`}>
                    {org.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/org/${org.slug}/dashboard`}
                      className="font-mono text-xs uppercase tracking-wider text-ink underline underline-offset-2"
                    >
                      View
                    </Link>
                    {(org.status === "APPROVED" || org.status === "SUSPENDED") && (
                      <OrgStatusActions orgId={org.id} status={org.status} />
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {orgs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate">
                  No schools yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
