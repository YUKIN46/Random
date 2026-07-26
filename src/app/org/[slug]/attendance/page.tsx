import { prisma } from "@/lib/prisma";
import { requireOrgMember } from "@/lib/authz";
import AttendanceMarker from "./attendance-marker";

export default async function AttendancePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sectionId?: string; date?: string }>;
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
  const date = sp.date || new Date().toISOString().slice(0, 10);

  const students = sectionId
    ? await prisma.student.findMany({
        where: { sectionId },
        include: {
          user: true,
          attendance: { where: { date: new Date(date) } },
        },
        orderBy: { user: { name: "asc" } },
      })
    : [];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-6">Attendance</h1>
      <AttendanceMarker
        slug={slug}
        sections={sections.map((s) => ({ id: s.id, label: `${s.schoolClass.name} - ${s.name}` }))}
        selectedSectionId={sectionId ?? ""}
        date={date}
        students={students.map((s) => ({
          id: s.id,
          name: s.user.name,
          status: s.attendance[0]?.status ?? "PRESENT",
        }))}
      />
    </div>
  );
}
