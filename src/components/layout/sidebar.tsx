import Link from "next/link";
import type { SessionUser } from "@/lib/authz";

const NAV: { href: string; label: string; roles: SessionUser["role"][] }[] = [
  { href: "dashboard", label: "Dashboard", roles: ["ORG_ADMIN", "TEACHER", "STUDENT", "PARENT", "ACCOUNTANT"] },
  { href: "academics", label: "Academic Structure", roles: ["ORG_ADMIN"] },
  { href: "students", label: "Students", roles: ["ORG_ADMIN", "TEACHER"] },
  { href: "teachers", label: "Teachers", roles: ["ORG_ADMIN"] },
  { href: "attendance", label: "Attendance", roles: ["ORG_ADMIN", "TEACHER"] },
  { href: "timetable", label: "Timetable", roles: ["ORG_ADMIN", "TEACHER", "STUDENT"] },
  { href: "exams", label: "Exams & Grades", roles: ["ORG_ADMIN", "TEACHER", "STUDENT"] },
  { href: "fees", label: "Fees & Billing", roles: ["ORG_ADMIN", "ACCOUNTANT", "STUDENT", "PARENT"] },
  { href: "notes", label: "Notes & Announcements", roles: ["ORG_ADMIN", "TEACHER", "STUDENT", "PARENT"] },
  { href: "settings", label: "School Settings", roles: ["ORG_ADMIN"] },
];

export default function Sidebar({
  orgName,
  slug,
  role,
}: {
  orgName: string;
  slug: string;
  role: SessionUser["role"];
}) {
  const items = NAV.filter((item) => item.roles.includes(role));
  const navId = "org-nav-toggle";

  return (
    <>
      {/* CSS-only mobile drawer toggle — no client JS needed */}
      <input type="checkbox" id={navId} className="peer hidden" />

      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-paper-raised px-4 py-3 lg:hidden">
        <div>
          <p className="font-display font-semibold leading-tight text-ink">{orgName}</p>
          <p className="font-mono text-[0.65rem] uppercase tracking-wider text-slate">
            {role.replace("_", " ")}
          </p>
        </div>
        <label
          htmlFor={navId}
          aria-label="Open menu"
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-line"
        >
          <span className="sr-only">Menu</span>
          <div className="space-y-1">
            <span className="block h-0.5 w-5 bg-ink" />
            <span className="block h-0.5 w-5 bg-ink" />
            <span className="block h-0.5 w-5 bg-ink" />
          </div>
        </label>
      </div>

      {/* Backdrop (mobile only, shown when drawer open) */}
      <label
        htmlFor={navId}
        aria-hidden="true"
        className="fixed inset-0 z-30 hidden bg-ink/30 peer-checked:block lg:hidden"
      />

      {/* Sidebar / drawer */}
      <aside
        className="fixed inset-y-0 left-0 z-40 flex w-64 -translate-x-full flex-col border-r border-line bg-paper-raised p-5 transition-transform duration-200 ease-out peer-checked:translate-x-0 lg:static lg:z-auto lg:w-60 lg:shrink-0 lg:translate-x-0"
      >
        <div className="mb-8 hidden lg:block">
          <p className="font-display font-semibold leading-tight text-ink">{orgName}</p>
          <p className="font-mono text-[0.65rem] uppercase tracking-wider text-slate">
            {role.replace("_", " ")}
          </p>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto">
          {items.map((item) => (
            <Link
              key={item.href}
              href={`/org/${slug}/${item.href}`}
              className="block rounded-md px-3 py-2 text-sm text-ink hover:bg-paper"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <form action="/api/auth/signout" method="post">
          <button className="font-mono text-xs uppercase tracking-wider text-slate hover:text-ink">
            Sign out
          </button>
        </form>
      </aside>
    </>
  );
}
