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
  const exam = await prisma.exam.findUniqueOrThrow({ where: { id: examId } });

  await prisma.$transaction(
    results.map((r) => {
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

  return NextResponse.json({ ok: true });
}
