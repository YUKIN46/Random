import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";

const schema = z.object({
  slug: z.string(),
  results: z.array(
    z.object({
      studentId: z.string(),
      marksObtained: z.coerce.number().nonnegative(),
    })
  ),
});

function computeGrade(pct: number): string {
  if (pct >= 90) return "A+";
  if (pct >= 80) return "A";
  if (pct >= 70) return "B";
  if (pct >= 60) return "C";
  if (pct >= 50) return "D";
  return "F";
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: examId } = await params;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { slug, results } = parsed.data;

  await requireRole(slug, ["ORG_ADMIN", "TEACHER"]);
  const org = await prisma.organization.findUniqueOrThrow({ where: { slug } });

  const exam = await prisma.exam.findUnique({ where: { id: examId } });
  if (!exam || exam.organizationId !== org.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const studentIds = results.map((r) => r.studentId);
  const validStudents = await prisma.student.findMany({
    where: { id: { in: studentIds }, organizationId: org.id },
    select: { id: true },
  });
  const validIds = new Set(validStudents.map((s) => s.id));
  const safeResults = results.filter((r) => validIds.has(r.studentId));

  await prisma.$transaction(
    safeResults.map((r) => {
      const pct = (r.marksObtained / exam.maxMarks) * 100;
      return prisma.examResult.upsert({
        where: { examId_studentId: { examId, studentId: r.studentId } },
        create: {
          examId,
          studentId: r.studentId,
          marksObtained: r.marksObtained,
          grade: computeGrade(pct),
        },
        update: { marksObtained: r.marksObtained, grade: computeGrade(pct) },
      });
    })
  );

  return NextResponse.json({ ok: true, saved: safeResults.length, skipped: results.length - safeResults.length });
}
