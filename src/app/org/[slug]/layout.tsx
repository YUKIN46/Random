import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireOrgMember } from "@/lib/authz";
import Sidebar from "@/components/layout/sidebar";

export default async function OrgLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const org = await prisma.organization.findUnique({ where: { slug } });
  if (!org) notFound();

  const user = await requireOrgMember(slug);
  if (org.status !== "APPROVED" && user.role !== "SUPER_ADMIN") notFound();

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {org.status !== "APPROVED" && (
        <div className="w-full bg-ledger-red/10 px-4 py-2 text-center font-mono text-xs uppercase tracking-wider text-ledger-red lg:hidden">
          This school is {org.status.toLowerCase()} — viewing as platform admin
        </div>
      )}
      <Sidebar orgName={org.name} slug={slug} role={user.role} />
      <div className="flex-1 bg-paper">
        {org.status !== "APPROVED" && (
          <div className="hidden bg-ledger-red/10 px-8 py-2 font-mono text-xs uppercase tracking-wider text-ledger-red lg:block">
            This school is {org.status.toLowerCase()} — viewing as platform admin
          </div>
        )}
        <main className="p-5 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
