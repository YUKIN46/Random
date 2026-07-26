import { requireOrgMember } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import ProfileForm from "./profile-form";
import ChangePasswordForm from "./change-password-form";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await requireOrgMember(slug);
  const dbUser = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });

  return (
    <div className="max-w-lg">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-brass">Account</p>
      <h1 className="mt-2 font-display text-2xl font-semibold text-ink">My Profile</h1>

      <div className="mt-8 rounded-lg border border-line bg-paper-raised p-5">
        <p className="font-mono text-xs uppercase tracking-wider text-slate">Signed in as</p>
        <p className="mt-1 text-ink">{dbUser.email}</p>
        <p className="font-mono text-xs text-slate">{user.role.replace("_", " ")}</p>
      </div>

      <div className="mt-8">
        <h2 className="font-display text-lg font-semibold text-ink">Name</h2>
        <div className="mt-3">
          <ProfileForm initialName={dbUser.name} />
        </div>
      </div>

      <div className="mt-8">
        <h2 className="font-display text-lg font-semibold text-ink">Change password</h2>
        <div className="mt-3">
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
