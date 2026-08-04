import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";

const updateSchema = z.object({
  slug: z.string(),
  name: z.string().min(1),
  classTeacherId: z.string().optional(),
});

async function assertOwnership(id: string, slug: string) {
  const org = await prisma.organization.findUniqueOrThrow({ where: { slug } });
  const section = await prisma.section.findUnique({ where: { id } });
  if (!section || section.organizationId !== org.id) return null;
  return section;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const parsed = updateSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { slug, name, classTeacherId } = parsed.data;

  await requireRole(slug, ["ORG_ADMIN"]);
  const org = await prisma.organization.findUniqueOrThrow({ where: { slug } });
  if (!(await assertOwnership(id, slug))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (classTeacherId) {
    const teacher = await prisma.teacher.findUnique({ where: { id: classTeacherId } });
    if (!teacher || teacher.organizationId !== org.id) {
      return NextResponse.json({ error: "Invalid class teacher" }, { status: 400 });
    }
  }

  await prisma.section.update({
    where: { id },
    data: {
      name,
      classTeacher: classTeacherId ? { connect: { id: classTeacherId } } : { disconnect: true },
    },
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

  await requireRole(slug, ["ORG_ADMIN"]);
  if (!(await assertOwnership(id, slug))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Students in this section have their sectionId set to null (not
  // deleted). Attendance records and timetable slots for this section
  // are cascaded away — the UI warns about this before confirming.
  await prisma.section.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
