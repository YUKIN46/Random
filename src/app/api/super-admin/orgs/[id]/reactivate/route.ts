import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/authz";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireSuperAdmin();
  const { id } = await params;
  const org = await prisma.organization.update({ where: { id }, data: { status: "APPROVED" } });
  return NextResponse.json({ id: org.id, status: org.status });
}
