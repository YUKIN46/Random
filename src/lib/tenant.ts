import { prisma } from "@/lib/prisma";

/**
 * The root domain the app is served from, e.g. "schoolms.io".
 * Every organization gets a subdomain of this: {slug}.schoolms.io
 * Set this in Vercel env vars once you've picked/attached your domain.
 */
export const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN || "localhost:3000";

/**
 * Given a request host header (e.g. "greenwood.schoolms.io" or
 * "greenwood.schoolms.io:3000" in dev), extract the organization slug.
 * Returns null for the root domain / www / app subdomain (marketing site,
 * super-admin panel, signup flow — no tenant context).
 */
export function getSlugFromHost(host: string | null): string | null {
  if (!host) return null;
  const hostname = host.split(":")[0];
  const rootHostname = APP_DOMAIN.split(":")[0];

  if (hostname === rootHostname || hostname === `www.${rootHostname}`) {
    return null;
  }

  if (!hostname.endsWith(`.${rootHostname}`) && hostname !== rootHostname) {
    // Custom/unknown domain (e.g. preview deployments) — treat as no tenant.
    // Vercel preview URLs like foo.vercel.app also fall here.
    if (hostname.endsWith(".vercel.app")) return null;
  }

  const subdomain = hostname.replace(`.${rootHostname}`, "");
  if (subdomain === hostname) return null; // didn't actually strip anything
  if (["app", "www", "admin"].includes(subdomain)) return null;

  return subdomain;
}

export async function getOrgBySlug(slug: string) {
  return prisma.organization.findUnique({ where: { slug } });
}
