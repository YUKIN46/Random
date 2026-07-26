import { prisma } from "@/lib/prisma";
import { requireOrgMember } from "@/lib/authz";
import NewSlotForm from "./new-slot-form";

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;

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
  const isAdmin = user.role === "ORG_ADMIN";

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

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-6">Timetable</h1>

      <form className="mb-6">
        <select
          name="sectionId"
          defaultValue={sectionId ?? ""}
          className="rounded-lg border border-line px-3 py-2 text-sm"
          onChange={(e) => e.currentTarget.form?.submit()}
        >
          {sections.map((s) => (
            <option key={s.id} value={s.id}>{s.schoolClass.name} - {s.name}</option>
          ))}
        </select>
      </form>

      {isAdmin && sectionId && (
        <NewSlotForm
          slug={slug}
          sectionId={sectionId}
          subjects={subjects.map((s) => ({ id: s.id, name: s.name }))}
          teachers={teachers.map((t) => ({ id: t.id, name: t.user.name }))}
        />
      )}

      <div className="grid grid-cols-7 gap-3 mt-6">
        {DAYS.map((day) => (
          <div key={day} className="bg-paper-raised border border-line rounded-xl p-3">
            <p className="text-xs font-semibold text-slate mb-2">{day}</p>
            <div className="space-y-2">
              {slots.filter((s) => s.day === day).map((s) => (
                <div key={s.id} className="text-xs bg-paper rounded-md p-2">
                  <p className="font-medium">{s.subject.name}</p>
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
  );
}
