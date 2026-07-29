import Link from "next/link";
import { getPlatformSettings } from "@/lib/platform-settings";

// Content here is editable by the super admin at runtime (see
// /super-admin/site-content), so this must be rendered per-request rather
// than statically prerendered at build time — otherwise edits wouldn't
// show up until the next deploy, and the build would depend on the DB
// being reachable/migrated at build time.
export const dynamic = "force-dynamic";

export default async function Home() {
  const settings = await getPlatformSettings();

  return (
    <div className="flex-1">
      {/* ── Nav ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-line/70 bg-paper/90 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <span className="font-display text-lg font-semibold tracking-tight text-ink">
            {settings.siteName}
            <span className="text-brass">.</span>
          </span>
          <div className="flex items-center gap-3 sm:gap-5">
            <Link
              href="/login"
              className="font-mono text-xs uppercase tracking-wider text-slate hover:text-ink transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/apply"
              className="rounded-md bg-ink px-3.5 py-2 font-mono text-xs uppercase tracking-wider text-paper hover:bg-ink-soft transition-colors sm:px-4"
            >
              {settings.ctaLabel}
            </Link>
          </div>
        </nav>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden mx-auto max-w-6xl px-5 pt-14 pb-20 sm:px-8 sm:pt-20 sm:pb-28">
        {/* Floating ink-blot bubbles — decorative, behind content */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <span className="ink-bubble ink-bubble-1 bg-brass/25" />
          <span className="ink-bubble ink-bubble-2 bg-chalk/20" />
          <span className="ink-bubble ink-bubble-3 bg-ledger-red/20" />
          <span className="ink-bubble ink-bubble-4 bg-brass/20" />
          <span className="ink-bubble ink-bubble-5 bg-ink/10" />
        </div>

        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          {/* Copy */}
          <div className="hero-copy">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-brass">
              {settings.heroEyebrow}
            </p>
            <h1 className="mt-4 max-w-xl font-display text-[2.6rem] leading-[1.08] font-semibold tracking-tight text-ink sm:text-6xl">
              {settings.heroHeadline}
            </h1>
            <p className="mt-5 max-w-md text-[1.05rem] leading-relaxed text-slate">
              {settings.heroSubhead}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/apply"
                className="rounded-md bg-brass px-6 py-3.5 text-center font-mono text-sm uppercase tracking-wider text-paper transition-colors hover:bg-brass-dark"
              >
                {settings.ctaLabel}
              </Link>
              <Link
                href="/login"
                className="rounded-md border border-ink/20 px-6 py-3.5 text-center font-mono text-sm uppercase tracking-wider text-ink transition-colors hover:border-ink/40"
              >
                Log in to your school
              </Link>
            </div>
            <p className="mt-5 font-mono text-xs text-slate">
              Applications are reviewed before a school goes live.
            </p>
          </div>

          {/* Signature element — the ledger card */}
          <div className="ledger-wrap justify-self-center lg:justify-self-end">
            <div className="ledger-card relative w-full max-w-sm rounded-lg border border-line bg-paper-raised px-6 pt-6 pb-7 shadow-[0_24px_55px_-20px_rgba(27,42,74,0.4)]">
              <div className="absolute left-5 top-5 flex gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-paper ring-1 ring-line" />
                <span className="h-2.5 w-2.5 rounded-full bg-paper ring-1 ring-line" />
              </div>

              <div className="ml-10 mr-14 flex flex-col gap-0.5 border-b border-line pb-3 sm:mr-16">
                <span className="font-mono text-[0.7rem] uppercase tracking-wider text-slate">
                  Attendance Register
                </span>
                <span className="font-mono text-[0.65rem] text-slate/80">
                  Term II · Wk 6
                </span>
              </div>

              <ul className="ml-10 mt-1 divide-y divide-line">
                {[
                  { name: "R. Alcott", status: "Present", dot: "bg-chalk" },
                  { name: "M. Feld", status: "Present", dot: "bg-chalk" },
                  { name: "T. Osei", status: "Late", dot: "bg-brass" },
                  { name: "S. Bayo", status: "Present", dot: "bg-chalk" },
                ].map((row) => (
                  <li key={row.name} className="flex items-center justify-between py-2.5 text-sm">
                    <span className="text-ink">{row.name}</span>
                    <span className="flex items-center gap-1.5 font-mono text-xs text-slate">
                      <span className={`h-1.5 w-1.5 rounded-full ${row.dot}`} />
                      {row.status}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="ledger-seal absolute -right-6 -top-7 flex h-24 w-24 rotate-[-10deg] items-center justify-center rounded-full border-2 border-brass/70 bg-paper-raised text-brass shadow-sm sm:-right-8 sm:-top-8 sm:h-28 sm:w-28">
                <span className="font-mono text-[0.58rem] font-medium uppercase leading-tight tracking-wider text-center sm:text-[0.65rem]">
                  Verified
                  <br />
                  School
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────── */}
      <section className="border-y border-line bg-paper-raised/60">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <h2 className="max-w-md font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Everything the front office already tracks.
          </h2>
          <p className="mt-3 max-w-lg text-slate">
            Nothing here is invented for a demo — it&apos;s the same paperwork
            your school already keeps, just faster to fill in and easier to find.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: "Attendance", accent: "bg-chalk", copy: "Mark who's here, section by section, in seconds." },
              { label: "Grades & Exams", accent: "bg-brass", copy: "Record marks once; grades and averages work themselves out." },
              { label: "Timetable", accent: "bg-ink", copy: "Lay out the week for every class and every teacher." },
              { label: "Fees & Billing", accent: "bg-ledger-red", copy: "See what's owed, what's paid, and chase the rest." },
              { label: "Notes & Announcements", accent: "bg-slate", copy: "Post word to a section, a grade, or the whole school." },
              { label: "Approval-gated schools", accent: "bg-chalk", copy: "Every organization is reviewed before it goes live." },
            ].map((f) => (
              <div
                key={f.label}
                className="feature-card relative overflow-hidden rounded-lg border border-line bg-paper-raised p-5"
              >
                <span className={`absolute left-0 top-0 h-full w-1 ${f.accent}`} />
                <h3 className="font-display text-lg font-semibold text-ink">{f.label}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate">{f.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Approval flow (real sequence) ──────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          From application to launch.
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {[
            { step: "Register", copy: "Tell us about your school and set an admin login." },
            { step: "Reviewed", copy: "A platform admin checks the application." },
            { step: "Approved", copy: "Your school is stamped verified and switched on." },
            { step: "Live", copy: "yourschool.yourdomain.com — ready for staff and students." },
          ].map((s, i) => (
            <div key={s.step} className="flow-step">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brass/60 font-mono text-xs text-brass">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {i < 3 && <span className="hidden h-px flex-1 bg-line lg:block" />}
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold text-ink">{s.step}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate">{s.copy}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────────── */}
      <section className="bg-ink">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-5 py-16 sm:px-8 sm:py-20 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="max-w-md font-display text-3xl font-semibold tracking-tight text-paper sm:text-4xl">
              Ready to bring your school online?
            </h2>
            <p className="mt-3 max-w-md text-paper/70">
              Applications are usually reviewed within a couple of days.
            </p>
          </div>
          <Link
            href="/apply"
            className="shrink-0 rounded-md bg-brass px-7 py-3.5 font-mono text-sm uppercase tracking-wider text-paper transition-colors hover:bg-brass-dark"
          >
            {settings.ctaLabel}
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-8 text-sm text-slate sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span className="font-display text-ink">{settings.siteName}</span>
          <span className="font-mono text-xs">
            Already have a school here?{" "}
            <Link href="/login" className="text-ink underline underline-offset-2">
              Log in
            </Link>
            {settings.supportEmail && (
              <>
                {" · "}
                <a href={`mailto:${settings.supportEmail}`} className="text-ink underline underline-offset-2">
                  {settings.supportEmail}
                </a>
              </>
            )}
          </span>
        </div>
      </footer>
    </div>
  );
}
