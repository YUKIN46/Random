import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireOrgMember } from "@/lib/authz";
import AddStudentForm from "./add-student-form";
import BulkImportStudents from "./bulk-import-students";
import SearchBox from "@/components/search-box";

export default async function StudentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { slug } = await params;
  const { q } = await searchParams;
  await requireOrgMember(slug);
  const org = await prisma.organization.findUniqueOrThrow({ where: { slug } });

  const [students, sections] = await Promise.all([
    prisma.student.findMany({
      where: {
        organizationId: org.id,
        ...(q
          ? {
              OR: [
                { user: { name: { contains: q, mode: "insensitive" } } },
                { user: { email: { contains: q, mode: "insensitive" } } },
                { admissionNo: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: { user: true, section: { include: { schoolClass: true } } },
      orderBy: { user: { name: "asc" } },
    }),
    prisma.section.findMany({
      where: { organizationId: org.id },
      include: { schoolClass: true },
    }),
  ]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="font-display text-2xl font-semibold">Students</h1>
        <SearchBox placeholder="Search students…" />
      </div>

      <div className="flex flex-wrap gap-2">
        <AddStudentForm slug={slug} sections={sections.map((s) => ({
          id: s.id,
          label: `${s.schoolClass.name} - ${s.name}`,
        }))} />
        <BulkImportStudents slug={slug} />
      </div>

      <div className="bg-paper-raised border border-line rounded-xl mt-6 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-paper text-left text-slate">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Section</th>
              <th className="px-4 py-3 font-medium">Admission No.</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-t border-line hover:bg-paper">
                <td className="px-4 py-3">
                  <Link href={`/org/${slug}/students/${s.id}`} className="text-ink underline-offset-2 hover:underline">
                    {s.user.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate">{s.user.email}</td>
                <td className="px-4 py-3">
                  {s.section ? `${s.section.schoolClass.name} - ${s.section.name}` : "—"}
                </td>
                <td className="px-4 py-3">{s.admissionNo ?? "—"}</td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate">
                  {q ? "No students match your search." : "No students yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
