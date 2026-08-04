import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";

const schema = z.object({
  slug: z.string(),
  subjectId: z.string(),
  name: z.string().min(1),
  examDate: z.string(),
  maxMarks: z.coerce.number().positive().default(100),
  passMarks: z.coerce.number().nonnegative().default(35),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { slug, subjectId, name, examDate, maxMarks, passMarks } = parsed.data;

  await requireRole(slug, ["ORG_ADMIN", "TEACHER"]);
  const org = await prisma.organization.findUniqueOrThrow({ where: { slug } });

  const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
  if (!subject || subject.organizationId !== org.id) {
    return NextResponse.json({ error: "Invalid subject" }, { status: 400 });
  }

  const exam = await prisma.exam.create({
    data: {
      organizationId: org.id,
      subjectId,
      name,
      examDate: new Date(examDate),
      maxMarks,
      passMarks,
    },
  });

  return NextResponse.json({ id: exam.id }, { status: 201 });
}
