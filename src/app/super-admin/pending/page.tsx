import { requireSuperAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import ApproveRejectButtons from "./approve-reject-buttons";

export default async function PendingOrgsPage() {
  await requireSuperAdmin();

  const pending = await prisma.organization.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: { users: { where: { role: "ORG_ADMIN" }, take: 1 } },
  });

  return (
    <main className="max-w-4xl mx-auto py-12 px-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Pending school applications</h1>
        <a href="/super-admin/orgs" className="text-sm underline text-neutral-600">
          View all schools
        </a>
      </div>
      {pending.length === 0 ? (
        <p className="text-neutral-500">No applications waiting on review.</p>
      ) : (
        <ul className="space-y-4">
          {pending.map((org) => (
            <li
              key={org.id}
              className="border border-neutral-200 rounded-xl p-5 flex items-center justify-between"
            >
              <div>
                <p className="font-medium">{org.name}</p>
                <p className="text-sm text-neutral-500">
                  {org.slug}.{process.env.NEXT_PUBLIC_APP_DOMAIN} · {org.contactEmail}
                </p>
                <p className="text-xs text-neutral-400 mt-1">
                  Applied {org.createdAt.toLocaleDateString()}
                </p>
              </div>
              <ApproveRejectButtons orgId={org.id} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
