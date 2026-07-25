import { prisma } from "@/lib/prisma";
import { requireOrgMember } from "@/lib/authz";

export default async function ExamsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await requireOrgMember(slug);
  const org = await prisma.organization.findUniqueOrThrow({ where: { slug } });

  const exams = await prisma.exam.findMany({
    where: { organizationId: org.id },
    include: {
      subject: true,
      results: {
        include: { student: { include: { user: true } } },
        ...(user.role === "STUDENT" ? {} : {}),
      },
    },
    orderBy: { examDate: "desc" },
    take: 20,
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Exams & Grades</h1>
      <div className="space-y-4">
        {exams.map((exam) => (
          <div key={exam.id} className="bg-white border border-neutral-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-medium">{exam.name}</p>
                <p className="text-sm text-neutral-500">
                  {exam.subject.name} · {exam.examDate.toLocaleDateString()} · Max {exam.maxMarks}
                </p>
              </div>
            </div>
            <table className="w-full text-sm">
              <thead className="text-left text-neutral-400">
                <tr>
                  <th className="py-1 font-medium">Student</th>
                  <th className="py-1 font-medium">Marks</th>
                  <th className="py-1 font-medium">Grade</th>
                </tr>
              </thead>
              <tbody>
                {exam.results
                  .filter((r) => user.role !== "STUDENT" || r.student.userId === user.id)
                  .map((r) => (
                    <tr key={r.id} className="border-t border-neutral-100">
                      <td className="py-1.5">{r.student.user.name}</td>
                      <td className="py-1.5">{r.marksObtained} / {exam.maxMarks}</td>
                      <td className="py-1.5">{r.grade ?? "—"}</td>
                    </tr>
                  ))}
                {exam.results.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-3 text-center text-neutral-400">No results entered yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ))}
        {exams.length === 0 && <p className="text-neutral-400">No exams scheduled yet.</p>}
      </div>
    </div>
  );
}
