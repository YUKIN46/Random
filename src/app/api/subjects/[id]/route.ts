import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";

const updateSchema = z.object({
  slug: z.string(),
  name: z.string().min(1),
  code: z.string().optional(),
});

async function assertOwnership(id: string, slug: string) {
  const org = await prisma.organization.findUniqueOrThrow({ where: { slug } });
  const subject = await prisma.subject.findUnique({ where: { id } });
  if (!subject || subject.organizationId !== org.id) return null;
  return subject;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const parsed = updateSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { slug, name, code } = parsed.data;

  await requireRole(slug, ["ORG_ADMIN"]);
  if (!(await assertOwnership(id, slug))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.subject.update({ where: { id }, data: { name, code: code || null } });
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

  await requireRole(slug, ["ORG_ADMIN"]);
  if (!(await assertOwnership(id, slug))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Cascades to exams (and their results), teacher assignments, and
  // timetable slots for this subject — the UI warns about this.
  await prisma.subject.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
