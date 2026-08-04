import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";

const schema = z.object({
  slug: z.string(),
  sectionId: z.string(),
  subjectId: z.string(),
  teacherId: z.string(),
  day: z.enum(["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { slug, sectionId, subjectId, teacherId, day, startTime, endTime } = parsed.data;

  await requireRole(slug, ["ORG_ADMIN"]);
  const org = await prisma.organization.findUniqueOrThrow({ where: { slug } });

  const [section, subject, teacher] = await Promise.all([
    prisma.section.findUnique({ where: { id: sectionId } }),
    prisma.subject.findUnique({ where: { id: subjectId } }),
    prisma.teacher.findUnique({ where: { id: teacherId } }),
  ]);
  if (!section || section.organizationId !== org.id) {
    return NextResponse.json({ error: "Invalid section" }, { status: 400 });
  }
  if (!subject || subject.organizationId !== org.id) {
    return NextResponse.json({ error: "Invalid subject" }, { status: 400 });
  }
  if (!teacher || teacher.organizationId !== org.id) {
    return NextResponse.json({ error: "Invalid teacher" }, { status: 400 });
  }

  const slot = await prisma.timetableSlot.create({
    data: { organizationId: org.id, sectionId, subjectId, teacherId, day, startTime, endTime },
  });

  return NextResponse.json({ id: slot.id }, { status: 201 });
}
