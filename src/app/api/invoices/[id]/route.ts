import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";

const updateSchema = z.object({
  slug: z.string(),
  amountDue: z.coerce.number().positive().optional(),
  dueDate: z.string().optional(),
  action: z.enum(["cancel", "reopen"]).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const parsed = updateSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { slug, amountDue, dueDate, action } = parsed.data;

  await requireRole(slug, ["ORG_ADMIN", "ACCOUNTANT"]);
  const org = await prisma.organization.findUniqueOrThrow({ where: { slug } });

  const invoice = await prisma.invoice.findUnique({ where: { id } });
  if (!invoice || invoice.organizationId !== org.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (action === "cancel") {
    await prisma.invoice.update({ where: { id }, data: { status: "CANCELLED" } });
    return NextResponse.json({ ok: true });
  }
  if (action === "reopen") {
    const status = invoice.amountPaid >= invoice.amountDue ? "PAID" : invoice.amountPaid > 0 ? "PARTIAL" : "UNPAID";
    await prisma.invoice.update({ where: { id }, data: { status } });
    return NextResponse.json({ ok: true });
  }

  await prisma.invoice.update({
    where: { id },
    data: {
      ...(amountDue !== undefined ? { amountDue } : {}),
      ...(dueDate ? { dueDate: new Date(dueDate) } : {}),
    },
  });

  return NextResponse.json({ ok: true });
}
