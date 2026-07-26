import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireOrgMember } from "@/lib/authz";
import AddTeacherForm from "./add-teacher-form";
import SearchBox from "@/components/search-box";

export default async function TeachersPage({
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

  const teachers = await prisma.teacher.findMany({
    where: {
      organizationId: org.id,
      ...(q
        ? {
            OR: [
              { user: { name: { contains: q, mode: "insensitive" } } },
              { user: { email: { contains: q, mode: "insensitive" } } },
              { employeeCode: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: { user: true, subjects: { include: { subject: true } } },
    orderBy: { user: { name: "asc" } },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="font-display text-2xl font-semibold">Teachers</h1>
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
    </div>
  );
}
