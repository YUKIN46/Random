import { requireSuperAdmin } from "@/lib/authz";
import { getPlatformSettings } from "@/lib/platform-settings";
import SiteContentForm from "./site-content-form";

export default async function SiteContentPage() {
  await requireSuperAdmin();
  const settings = await getPlatformSettings();

  return (
    <main className="mx-auto max-w-xl py-12 px-6">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-brass">
        Platform settings
      </p>
      <h1 className="mt-2 font-display text-2xl font-semibold text-ink">
        Homepage content
      </h1>
      <p className="mt-2 text-slate">
        Changes here update the public landing page immediately.
      </p>
      <div className="mt-8">
        <SiteContentForm
          initial={{
            siteName: settings.siteName,
            heroEyebrow: settings.heroEyebrow,
            heroHeadline: settings.heroHeadline,
            heroSubhead: settings.heroSubhead,
            ctaLabel: settings.ctaLabel,
            supportEmail: settings.supportEmail ?? "",
          }}
        />
      </div>
    </main>
  );
}
