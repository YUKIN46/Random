import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireOrgMember } from "@/lib/authz";
import AddTeacherForm from "./add-teacher-form";
import SearchBox from "@/components/search-box";
import Pagination from "@/components/pagination";

const PAGE_SIZE = 25;

export default async function TeachersPage({
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
            { employeeCode: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [teachers, totalCount] = await Promise.all([
    prisma.teacher.findMany({
      where,
      include: { user: true, subjects: { include: { subject: true } } },
      orderBy: { user: { name: "asc" } },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.teacher.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="font-display text-2xl font-semibold">
          Teachers <span className="font-mono text-sm font-normal text-slate">({totalCount})</span>
        </h1>
        <SearchBox placeholder="Search teachers…" />
      </div>
      <AddTeacherForm slug={slug} />
      <div className="bg-paper-raised border border-line rounded-xl mt-6 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-paper text-left text-slate">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Employee code</th>
              <th className="px-4 py-3 font-medium">Subjects</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((t) => (
              <tr key={t.id} className="border-t border-line hover:bg-paper">
                <td className="px-4 py-3">
                  <Link href={`/org/${slug}/teachers/${t.id}`} className="text-ink underline-offset-2 hover:underline">
                    {t.user.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate">{t.user.email}</td>
                <td className="px-4 py-3">{t.employeeCode ?? "—"}</td>
                <td className="px-4 py-3">
                  {t.subjects.map((s) => s.subject.name).join(", ") || "—"}
                </td>
              </tr>
            ))}
            {teachers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate">
                  {q ? "No teachers match your search." : "No teachers yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        basePath={`/org/${slug}/teachers`}
        currentPage={page}
        totalPages={totalPages}
        searchParams={{ q }}
      />
    </div>
  );
}
