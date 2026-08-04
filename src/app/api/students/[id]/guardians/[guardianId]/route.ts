import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; guardianId: string }> }
) {
  const { id: studentId, guardianId } = await params;
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "Missing org context" }, { status: 400 });

  await requireRole(slug, ["ORG_ADMIN"]);
  const org = await prisma.organization.findUniqueOrThrow({ where: { slug } });

  const guardian = await prisma.guardian.findUnique({
    where: { id: guardianId },
    include: { student: true },
  });
  if (!guardian || guardian.studentId !== studentId || guardian.student.organizationId !== org.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Only unlinks the relationship — does not delete the parent's account,
  // since they may be linked to other children too.
  await prisma.guardian.delete({ where: { id: guardianId } });

  return NextResponse.json({ ok: true });
}
