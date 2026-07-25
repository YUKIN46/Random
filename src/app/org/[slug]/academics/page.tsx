import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import AddClassForm from "./add-class-form";
import AddSectionForm from "./add-section-form";
import AddSubjectForm from "./add-subject-form";

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

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-semibold">Academic Structure</h1>

      {/* Classes & Sections */}
      <section>
        <h2 className="text-lg font-medium mb-3">Classes & Sections</h2>
        <AddClassForm slug={slug} />
        <div className="grid gap-4 mt-4 md:grid-cols-2">
          {classes.map((c) => (
            <div key={c.id} className="bg-white border border-neutral-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="font-medium">{c.name}</p>
              </div>
              <ul className="space-y-1 mb-3">
                {c.sections.map((s) => (
                  <li key={s.id} className="text-sm text-neutral-600 flex justify-between">
                    <span>Section {s.name}</span>
                    <span className="text-neutral-400">
                      {s.classTeacher ? s.classTeacher.user.name : "No class teacher"}
                    </span>
                  </li>
                ))}
                {c.sections.length === 0 && (
                  <li className="text-sm text-neutral-400">No sections yet.</li>
                )}
              </ul>
              <AddSectionForm
                slug={slug}
                classId={c.id}
                teachers={teachers.map((t) => ({ id: t.id, name: t.user.name }))}
              />
            </div>
          ))}
          {classes.length === 0 && (
            <p className="text-neutral-400 text-sm">No classes yet — add one above.</p>
          )}
        </div>
      </section>

      {/* Subjects */}
      <section>
        <h2 className="text-lg font-medium mb-3">Subjects</h2>
        <AddSubjectForm
          slug={slug}
          teachers={teachers.map((t) => ({ id: t.id, name: t.user.name }))}
        />
        <div className="bg-white border border-neutral-200 rounded-xl mt-4 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-medium">Subject</th>
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Teachers</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((s) => (
                <tr key={s.id} className="border-t border-neutral-100">
                  <td className="px-4 py-3">{s.name}</td>
                  <td className="px-4 py-3 text-neutral-500">{s.code ?? "—"}</td>
                  <td className="px-4 py-3">
                    {s.teacherLinks.map((tl) => tl.teacher.user.name).join(", ") || "—"}
                  </td>
                </tr>
              ))}
              {subjects.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-neutral-400">
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
