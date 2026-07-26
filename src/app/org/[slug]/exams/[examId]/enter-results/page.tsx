import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import ResultsEntry from "./results-entry";

export default async function EnterResultsPage({
  params,
}: {
  params: Promise<{ slug: string; examId: string }>;
}) {
  const { slug, examId } = await params;
  await requireRole(slug, ["ORG_ADMIN", "TEACHER"]);
  const org = await prisma.organization.findUniqueOrThrow({ where: { slug } });

  const exam = await prisma.exam.findUniqueOrThrow({
    where: { id: examId },
    include: { subject: true },
  });

  const students = await prisma.student.findMany({
    where: { organizationId: org.id },
    include: {
      user: true,
      examResults: { where: { examId } },
    },
    orderBy: { user: { name: "asc" } },
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-1">Enter results — {exam.name}</h1>
      <p className="text-slate mb-6">{exam.subject.name} · Max marks {exam.maxMarks}</p>
      <ResultsEntry
        slug={slug}
        examId={examId}
        maxMarks={exam.maxMarks}
        students={students.map((s) => ({
          id: s.id,
          name: s.user.name,
          marksObtained: s.examResults[0]?.marksObtained ?? "",
        }))}
      />
    </div>
  );
}
