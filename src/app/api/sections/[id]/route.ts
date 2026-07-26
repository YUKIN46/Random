import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";

const updateSchema = z.object({
  slug: z.string(),
  name: z.string().min(1),
  classTeacherId: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const parsed = updateSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { slug, name, classTeacherId } = parsed.data;

  await requireRole(slug, ["ORG_ADMIN"]);
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
  // Students in this section have their sectionId set to null (not
  // deleted). Attendance records and timetable slots for this section
  // are cascaded away — the UI warns about this before confirming.
  await prisma.section.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
