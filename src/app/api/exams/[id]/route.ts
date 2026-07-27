import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";

const updateSchema = z.object({
  slug: z.string(),
  name: z.string().min(1),
  examDate: z.string(),
  maxMarks: z.coerce.number().positive(),
  passMarks: z.coerce.number().nonnegative(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const parsed = updateSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { slug, name, examDate, maxMarks, passMarks } = parsed.data;

  await requireRole(slug, ["ORG_ADMIN", "TEACHER"]);
  const org = await prisma.organization.findUniqueOrThrow({ where: { slug } });

  const exam = await prisma.exam.findUnique({ where: { id } });
  if (!exam || exam.organizationId !== org.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.exam.update({
    where: { id },
    data: { name, examDate: new Date(examDate), maxMarks, passMarks },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "Missing org context" }, { status: 400 });

  await requireRole(slug, ["ORG_ADMIN", "TEACHER"]);
  const org = await prisma.organization.findUniqueOrThrow({ where: { slug } });

  const exam = await prisma.exam.findUnique({ where: { id } });
  if (!exam || exam.organizationId !== org.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Cascades to its exam results.
  await prisma.exam.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
