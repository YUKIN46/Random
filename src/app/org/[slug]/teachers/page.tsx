import { prisma } from "@/lib/prisma";
import { requireOrgMember } from "@/lib/authz";
import AddTeacherForm from "./add-teacher-form";

export default async function TeachersPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await requireOrgMember(slug);
  const org = await prisma.organization.findUniqueOrThrow({ where: { slug } });

  const teachers = await prisma.teacher.findMany({
    where: { organizationId: org.id },
    include: { user: true, subjects: { include: { subject: true } } },
    orderBy: { user: { name: "asc" } },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Teachers</h1>
      <AddTeacherForm slug={slug} />
      <div className="bg-white border border-neutral-200 rounded-xl mt-6 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Employee code</th>
              <th className="px-4 py-3 font-medium">Subjects</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((t) => (
              <tr key={t.id} className="border-t border-neutral-100">
                <td className="px-4 py-3">{t.user.name}</td>
                <td className="px-4 py-3 text-neutral-500">{t.user.email}</td>
                <td className="px-4 py-3">{t.employeeCode ?? "—"}</td>
                <td className="px-4 py-3">
                  {t.subjects.map((s) => s.subject.name).join(", ") || "—"}
                </td>
              </tr>
            ))}
            {teachers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-neutral-400">
                  No teachers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
