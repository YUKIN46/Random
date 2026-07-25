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
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);

  await prisma.$transaction(
    records.map((r) =>
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
