import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/authz";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireSuperAdmin();
  const { id } = await params;

  const org = await prisma.organization.update({
    where: { id },
    data: {
      status: "APPROVED",
      approvedAt: new Date(),
      approvedById: admin.id,
    },
  });

  // TODO: send "your school is live" email to org.contactEmail with the
  // login URL: https://{org.slug}.{APP_DOMAIN}/login

  return NextResponse.json({ id: org.id, status: org.status });
}
