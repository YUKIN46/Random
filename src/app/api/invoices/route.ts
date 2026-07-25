import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";

const schema = z.object({
  slug: z.string(),
  studentId: z.string(),
  amountDue: z.coerce.number().positive(),
  dueDate: z.string(),
  feeStructureId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { slug, studentId, amountDue, dueDate, feeStructureId } = parsed.data;

  await requireRole(slug, ["ORG_ADMIN", "ACCOUNTANT"]);
  const org = await prisma.organization.findUniqueOrThrow({ where: { slug } });

  const invoice = await prisma.invoice.create({
    data: {
      organizationId: org.id,
      studentId,
      amountDue,
      dueDate: new Date(dueDate),
      feeStructureId: feeStructureId || null,
      status: "UNPAID",
    },
  });

  return NextResponse.json({ id: invoice.id }, { status: 201 });
}
