import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireOrgMember } from "@/lib/authz";
import NewSlotForm from "./new-slot-form";
import SectionSelect from "./section-select";

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;
const DAY_LABELS: Record<(typeof DAYS)[number], string> = {
  MON: "Monday", TUE: "Tuesday", WED: "Wednesday", THU: "Thursday",
  FRI: "Friday", SAT: "Saturday", SUN: "Sunday",
};

export default async function TimetablePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sectionId?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const user = await requireOrgMember(slug);
  const org = await prisma.organization.findUniqueOrThrow({ where: { slug } });
  const isAdmin = user.role === "ORG_ADMIN" || user.role === "SUPER_ADMIN";

  const sections = await prisma.section.findMany({
    where: { organizationId: org.id },
    include: { schoolClass: true },
  });
  const sectionId = sp.sectionId || sections[0]?.id;

  const [slots, subjects, teachers] = await Promise.all([
    sectionId
      ? prisma.timetableSlot.findMany({
          where: { sectionId },
          include: { subject: true, teacher: { include: { user: true } } },
          orderBy: { startTime: "asc" },
        })
      : Promise.resolve([]),
    isAdmin ? prisma.subject.findMany({ where: { organizationId: org.id }, orderBy: { name: "asc" } }) : Promise.resolve([]),
    isAdmin ? prisma.teacher.findMany({ where: { organizationId: org.id }, include: { user: true }, orderBy: { user: { name: "asc" } } }) : Promise.resolve([]),
  ]);

  // ── Empty states: guide admins through the actual setup order ──
  if (sections.length === 0) {
    return (
      <div>
        <h1 className="font-display text-2xl font-semibold mb-6">Timetable</h1>
        <div className="rounded-xl border border-line bg-paper-raised p-8 text-center">
          <p className="font-mono text-xs uppercase tracking-wider text-brass mb-2">
            Nothing to schedule yet
          </p>
          <p className="text-ink font-medium mb-1">You need at least one class and section first.</p>
          <p className="text-sm text-slate max-w-sm mx-auto mb-5">
            A timetable slot belongs to a section — create a class (e.g. &quot;Grade 8&quot;)
            and a section under it (e.g. &quot;A&quot;) before scheduling classes.
          </p>
          {isAdmin ? (
            <Link
              href={`/org/${slug}/academics`}
              className="inline-block rounded-md bg-ink px-5 py-2.5 font-mono text-xs uppercase tracking-wider text-paper"
            >
              Set up Academic Structure
            </Link>
          ) : (
            <p className="text-xs text-slate">Ask your school admin to set this up.</p>
          )}
        </div>
      </div>
    );
  }

  if (isAdmin && (subjects.length === 0 || teachers.length === 0)) {
    return (
      <div>
        <h1 className="font-display text-2xl font-semibold mb-6">Timetable</h1>
        <div className="rounded-xl border border-line bg-paper-raised p-8 text-center">
          <p className="font-mono text-xs uppercase tracking-wider text-brass mb-2">
            Almost there
          </p>
          <p className="text-ink font-medium mb-1">
            {subjects.length === 0 && teachers.length === 0
              ? "You need subjects and teachers before scheduling classes."
              : subjects.length === 0
              ? "You need at least one subject before scheduling classes."
              : "You need at least one teacher before scheduling classes."}
          </p>
          <div className="mt-5 flex justify-center gap-3">
            {subjects.length === 0 && (
              <Link href={`/org/${slug}/academics`} className="inline-block rounded-md bg-ink px-5 py-2.5 font-mono text-xs uppercase tracking-wider text-paper">
                Add subjects
              </Link>
            )}
            {teachers.length === 0 && (
              <Link href={`/org/${slug}/teachers`} className="inline-block rounded-md border border-line px-5 py-2.5 font-mono text-xs uppercase tracking-wider text-ink">
                Add teachers
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-6">Timetable</h1>

      <div className="mb-6">
        <SectionSelect
          sections={sections.map((s) => ({ id: s.id, label: `${s.schoolClass.name} - ${s.name}` }))}
          selectedSectionId={sectionId ?? ""}
        />
      </div>

      {isAdmin && sectionId && (
        <NewSlotForm
          slug={slug}
          sectionId={sectionId}
          subjects={subjects.map((s) => ({ id: s.id, name: s.name }))}
          teachers={teachers.map((t) => ({ id: t.id, name: t.user.name }))}
        />
      )}

      {slots.length === 0 ? (
        <div className="mt-6 rounded-xl border border-line bg-paper-raised p-8 text-center">
          <p className="text-sm text-slate">
            No slots scheduled for this section yet
            {isAdmin ? " — add one above." : "."}
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto -mx-1 px-1 pb-2">
          <div className="grid grid-cols-7 gap-3 min-w-[760px]">
            {DAYS.map((day) => (
              <div key={day} className="bg-paper-raised border border-line rounded-xl p-3">
                <p className="text-xs font-semibold text-slate mb-2" title={DAY_LABELS[day]}>{day}</p>
                <div className="space-y-2">
                  {slots.filter((s) => s.day === day).map((s) => (
                    <div key={s.id} className="text-xs bg-paper rounded-md p-2">
                      <p className="font-medium text-ink">{s.subject.name}</p>
                      <p className="text-slate">{s.startTime}–{s.endTime}</p>
                      <p className="text-slate">{s.teacher.user.name}</p>
                    </div>
                  ))}
                  {slots.filter((s) => s.day === day).length === 0 && (
                    <p className="text-xs text-slate">—</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
