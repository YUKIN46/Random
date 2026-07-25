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

  return (
    <aside className="w-60 shrink-0 border-r border-neutral-200 bg-white p-5 flex flex-col">
      <div className="mb-8">
        <p className="font-semibold leading-tight">{orgName}</p>
        <p className="text-xs text-neutral-400">{role.replace("_", " ")}</p>
      </div>
      <nav className="space-y-1 flex-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={`/org/${slug}/${item.href}`}
            className="block rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <form action="/api/auth/signout" method="post">
        <button className="text-sm text-neutral-500 hover:text-neutral-900">Sign out</button>
      </form>
    </aside>
  );
}
