import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Session } from "next-auth";

export type SessionUser = Session["user"];

export async function requireUser(): Promise<SessionUser> {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session.user;
}

export async function requireOrgMember(slug: string): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role === "SUPER_ADMIN") return user;
  if (user.orgSlug !== slug) redirect("/login");
  return user;
}

export async function requireRole(
  slug: string,
  allowed: SessionUser["role"][]
): Promise<SessionUser> {
  const user = await requireOrgMember(slug);
  if (!allowed.includes(user.role)) redirect(`/org/${slug}/dashboard`);
  return user;
}

export async function requireSuperAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "SUPER_ADMIN") redirect("/login");
  return user;
}
