import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import AddClassForm from "./add-class-form";
import AddSectionForm from "./add-section-form";
import AddSubjectForm from "./add-subject-form";
import ClassCardHeader from "./class-card-header";
import SectionRow from "./section-row";
import SubjectRow from "./subject-row";

export default async function AcademicsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await requireRole(slug, ["ORG_ADMIN"]);
  const org = await prisma.organization.findUniqueOrThrow({ where: { slug } });

  const [classes, subjects, teachers] = await Promise.all([
    prisma.schoolClass.findMany({
      where: { organizationId: org.id },
      include: { sections: { include: { classTeacher: { include: { user: true } } } } },
      orderBy: { order: "asc" },
    }),
    prisma.subject.findMany({
      where: { organizationId: org.id },
      include: { teacherLinks: { include: { teacher: { include: { user: true } } } } },
      orderBy: { name: "asc" },
    }),
    prisma.teacher.findMany({
      where: { organizationId: org.id },
      include: { user: true },
      orderBy: { user: { name: "asc" } },
    }),
  ]);

  const teacherOptions = teachers.map((t) => ({ id: t.id, name: t.user.name }));

  return (
    <div className="space-y-10">
      <h1 className="font-display text-2xl font-semibold">Academic Structure</h1>

      {/* Classes & Sections */}
      <section>
        <h2 className="font-display text-lg font-medium mb-3">Classes & Sections</h2>
        <AddClassForm slug={slug} />
        <div className="grid gap-4 mt-4 md:grid-cols-2">
          {classes.map((c) => (
            <div key={c.id} className="bg-paper-raised border border-line rounded-xl p-5">
              <ClassCardHeader slug={slug} classId={c.id} name={c.name} sectionCount={c.sections.length} />
              <ul className="space-y-1 mb-3">
                {c.sections.map((s) => (
                  <SectionRow
                    key={s.id}
                    slug={slug}
                    sectionId={s.id}
                    name={s.name}
                    classTeacherId={s.classTeacherId ?? ""}
                    classTeacherName={s.classTeacher?.user.name ?? ""}
                    teachers={teacherOptions}
                  />
                ))}
                {c.sections.length === 0 && (
                  <li className="text-sm text-slate">No sections yet.</li>
                )}
              </ul>
              <AddSectionForm slug={slug} classId={c.id} teachers={teacherOptions} />
            </div>
          ))}
          {classes.length === 0 && (
            <p className="text-slate text-sm">No classes yet — add one above.</p>
          )}
        </div>
      </section>

      {/* Subjects */}
      <section>
        <h2 className="font-display text-lg font-medium mb-3">Subjects</h2>
        <AddSubjectForm slug={slug} teachers={teacherOptions} />
        <div className="bg-paper-raised border border-line rounded-xl mt-4 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-paper text-left text-slate">
              <tr>
                <th className="px-4 py-3 font-medium">Subject</th>
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Teachers</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {subjects.map((s) => (
                <SubjectRow
                  key={s.id}
                  slug={slug}
                  subjectId={s.id}
                  name={s.name}
                  code={s.code ?? ""}
                  teacherNames={s.teacherLinks.map((tl) => tl.teacher.user.name).join(", ")}
                />
              ))}
              {subjects.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate">
                    No subjects yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
