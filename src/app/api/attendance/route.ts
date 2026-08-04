import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";

const schema = z.object({
  slug: z.string(),
  sectionId: z.string(),
  date: z.string(), // ISO date
  records: z.array(
    z.object({
      studentId: z.string(),
      status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"]),
    })
  ),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { slug, sectionId, date, records } = parsed.data;

  await requireRole(slug, ["ORG_ADMIN", "TEACHER"]);
  const org = await prisma.organization.findUniqueOrThrow({ where: { slug } });

  const section = await prisma.section.findUnique({ where: { id: sectionId } });
  if (!section || section.organizationId !== org.id) {
    return NextResponse.json({ error: "Invalid section" }, { status: 400 });
  }

  const studentIds = records.map((r) => r.studentId);
  const validStudents = await prisma.student.findMany({
    where: { id: { in: studentIds }, organizationId: org.id },
    select: { id: true },
  });
  const validIds = new Set(validStudents.map((s) => s.id));
  const safeRecords = records.filter((r) => validIds.has(r.studentId));

  const day = new Date(date);
  day.setHours(0, 0, 0, 0);

  await prisma.$transaction(
    safeRecords.map((r) =>
      prisma.attendanceRecord.upsert({
        where: { studentId_date: { studentId: r.studentId, date: day } },
        create: {
          organizationId: org.id,
          sectionId,
          studentId: r.studentId,
          date: day,
          status: r.status,
        },
        update: { status: r.status },
      })
    )
  );

  return NextResponse.json({ ok: true });
}
