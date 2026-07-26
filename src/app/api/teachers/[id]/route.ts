import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";

const updateSchema = z.object({
  slug: z.string(),
  name: z.string().min(2),
  employeeCode: z.string().optional(),
  phone: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const parsed = updateSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { slug, name, employeeCode, phone } = parsed.data;

  await requireRole(slug, ["ORG_ADMIN"]);

  const teacher = await prisma.teacher.findUniqueOrThrow({ where: { id } });

  await prisma.$transaction([
    prisma.user.update({ where: { id: teacher.userId }, data: { name } }),
    prisma.teacher.update({
      where: { id },
      data: { employeeCode: employeeCode || null, phone: phone || null },
    }),
  ]);

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

  const teacher = await prisma.teacher.findUniqueOrThrow({ where: { id } });
  await prisma.user.delete({ where: { id: teacher.userId } });

  return NextResponse.json({ ok: true });
}
