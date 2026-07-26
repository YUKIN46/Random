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
    <main className="max-w-4xl mx-auto py-12 px-5 sm:px-8">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-brass">Review queue</p>
      <h1 className="mt-2 font-display text-2xl font-semibold text-ink">
        Pending school applications
      </h1>
      {pending.length === 0 ? (
        <p className="mt-8 text-slate">No applications waiting on review.</p>
      ) : (
        <ul className="mt-8 space-y-4">
          {pending.map((org) => (
            <li
              key={org.id}
              className="flex flex-col gap-4 rounded-lg border border-line bg-paper-raised p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-ink">{org.name}</p>
                <p className="mt-0.5 font-mono text-xs text-slate">
                  {org.slug}.{process.env.NEXT_PUBLIC_APP_DOMAIN} · {org.contactEmail}
                </p>
                <p className="mt-1 text-xs text-slate">
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
