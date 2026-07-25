import Link from "next/link";
import { requireSuperAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import OrgStatusActions from "./org-status-actions";

const STATUS_COLORS: Record<string, string> = {
  APPROVED: "bg-emerald-50 text-emerald-700",
  PENDING: "bg-amber-50 text-amber-700",
  REJECTED: "bg-neutral-100 text-neutral-500",
  SUSPENDED: "bg-red-50 text-red-700",
};

export default async function AllOrgsPage() {
  await requireSuperAdmin();

  const orgs = await prisma.organization.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { users: true, students: true } } },
  });

  return (
    <main className="max-w-5xl mx-auto py-12 px-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">All schools</h1>
        <Link href="/super-admin/pending" className="text-sm underline text-neutral-600">
          View pending applications
        </Link>
      </div>
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">School</th>
              <th className="px-4 py-3 font-medium">Subdomain</th>
              <th className="px-4 py-3 font-medium">Students</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {orgs.map((org) => (
              <tr key={org.id} className="border-t border-neutral-100">
                <td className="px-4 py-3">{org.name}</td>
                <td className="px-4 py-3 text-neutral-500">
                  {org.slug}.{process.env.NEXT_PUBLIC_APP_DOMAIN}
                </td>
                <td className="px-4 py-3">{org._count.students}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${STATUS_COLORS[org.status]}`}>
                    {org.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {(org.status === "APPROVED" || org.status === "SUSPENDED") && (
                    <OrgStatusActions orgId={org.id} status={org.status} />
                  )}
                </td>
              </tr>
            ))}
            {orgs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-neutral-400">
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
