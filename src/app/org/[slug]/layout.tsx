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
  if (!org || org.status !== "APPROVED") notFound();

  const user = await requireOrgMember(slug);

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <Sidebar orgName={org.name} slug={slug} role={user.role} />
      <div className="flex-1 bg-paper">
        <main className="p-5 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
