import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireOrgMember } from "@/lib/authz";
import AddStudentForm from "./add-student-form";
import BulkImportStudents from "./bulk-import-students";
import SearchBox from "@/components/search-box";
import Pagination from "@/components/pagination";

const PAGE_SIZE = 25;

export default async function StudentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { slug } = await params;
  const { q, page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  await requireOrgMember(slug);
  const org = await prisma.organization.findUniqueOrThrow({ where: { slug } });

  const where = {
    organizationId: org.id,
    ...(q
      ? {
          OR: [
            { user: { name: { contains: q, mode: "insensitive" as const } } },
            { user: { email: { contains: q, mode: "insensitive" as const } } },
            { admissionNo: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [students, totalCount, sections] = await Promise.all([
    prisma.student.findMany({
      where,
      include: { user: true, section: { include: { schoolClass: true } } },
      orderBy: { user: { name: "asc" } },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.student.count({ where }),
    prisma.section.findMany({
      where: { organizationId: org.id },
      include: { schoolClass: true },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="font-display text-2xl font-semibold">
          Students <span className="font-mono text-sm font-normal text-slate">({totalCount})</span>
        </h1>
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

      <Pagination
        basePath={`/org/${slug}/students`}
        currentPage={page}
        totalPages={totalPages}
        searchParams={{ q }}
      />
    </div>
  );
}
