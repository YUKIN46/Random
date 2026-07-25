import { prisma } from "@/lib/prisma";
import { requireOrgMember } from "@/lib/authz";

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
  await requireOrgMember(slug);
  const org = await prisma.organization.findUniqueOrThrow({ where: { slug } });

  const sections = await prisma.section.findMany({
    where: { organizationId: org.id },
    include: { schoolClass: true },
  });
  const sectionId = sp.sectionId || sections[0]?.id;

  const slots = sectionId
    ? await prisma.timetableSlot.findMany({
        where: { sectionId },
        include: { subject: true, teacher: { include: { user: true } } },
        orderBy: { startTime: "asc" },
      })
    : [];

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Timetable</h1>
      <div className="grid grid-cols-7 gap-3">
        {DAYS.map((day) => (
          <div key={day} className="bg-white border border-neutral-200 rounded-xl p-3">
            <p className="text-xs font-semibold text-neutral-500 mb-2">{day}</p>
            <div className="space-y-2">
              {slots.filter((s) => s.day === day).map((s) => (
                <div key={s.id} className="text-xs bg-neutral-50 rounded-md p-2">
                  <p className="font-medium">{s.subject.name}</p>
                  <p className="text-neutral-500">{s.startTime}–{s.endTime}</p>
                  <p className="text-neutral-400">{s.teacher.user.name}</p>
                </div>
              ))}
              {slots.filter((s) => s.day === day).length === 0 && (
                <p className="text-xs text-neutral-300">—</p>
              )}
            </div>
          </div>
        ))}
      </div>
      <p className="text-sm text-neutral-400 mt-6">
        Timetable slots are managed by school admins. Slot creation UI coming in the next iteration —
        rows can be added directly via the <code>TimetableSlot</code> model in the meantime.
      </p>
    </div>
  );
}
