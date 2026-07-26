import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import SettingsForm from "./settings-form";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await requireRole(slug, ["ORG_ADMIN"]);
  const org = await prisma.organization.findUniqueOrThrow({ where: { slug } });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-6">School Settings</h1>
      <div className="max-w-lg">
        <SettingsForm
          slug={slug}
          initial={{
            name: org.name,
            logoUrl: org.logoUrl ?? "",
            address: org.address ?? "",
            phone: org.phone ?? "",
            timezone: org.timezone,
          }}
        />
      </div>
      <div className="max-w-lg mt-8 bg-paper border border-line rounded-xl p-5">
        <p className="text-sm text-slate">Subdomain</p>
        <p className="font-medium">
          {org.slug}.{process.env.NEXT_PUBLIC_APP_DOMAIN}
        </p>
        <p className="text-xs text-slate mt-1">
          Contact platform support to change your subdomain.
        </p>
      </div>
    </div>
  );
}
