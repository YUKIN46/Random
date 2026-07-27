import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";

const updateSchema = z.object({
  slug: z.string(),
  sectionId: z.string().optional(),
  admissionNo: z.string().optional(),
  dateOfBirth: z.string().optional(),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
  guardianEmail: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const parsed = updateSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { slug, sectionId, admissionNo, dateOfBirth, guardianName, guardianPhone, guardianEmail, address } =
    parsed.data;

  await requireRole(slug, ["ORG_ADMIN", "TEACHER"]);
  const org = await prisma.organization.findUniqueOrThrow({ where: { slug } });

  const student = await prisma.student.findUnique({ where: { id } });
  if (!student || student.organizationId !== org.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.student.update({
    where: { id },
    data: {
      section: sectionId ? { connect: { id: sectionId } } : { disconnect: true },
      admissionNo: admissionNo || null,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      guardianName: guardianName || null,
      guardianPhone: guardianPhone || null,
      guardianEmail: guardianEmail || null,
      address: address || null,
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
  const org = await prisma.organization.findUniqueOrThrow({ where: { slug } });

  const student = await prisma.student.findUnique({ where: { id } });
  if (!student || student.organizationId !== org.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Deleting the User cascades to Student and all of its dependent
  // records (attendance, exam results, invoices) per the schema.
  await prisma.user.delete({ where: { id: student.userId } });

  return NextResponse.json({ ok: true });
}
