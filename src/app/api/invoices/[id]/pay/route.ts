import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";

const schema = z.object({
  slug: z.string(),
  amount: z.coerce.number().positive(),
  method: z.enum(["CASH", "CARD", "BANK_TRANSFER", "ONLINE"]),
  reference: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { slug, amount, method, reference } = parsed.data;

  await requireRole(slug, ["ORG_ADMIN", "ACCOUNTANT"]);
  const org = await prisma.organization.findUniqueOrThrow({ where: { slug } });

  const invoice = await prisma.invoice.findUnique({ where: { id } });
  if (!invoice || invoice.organizationId !== org.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const newPaid = invoice.amountPaid + amount;
  const status = newPaid >= invoice.amountDue ? "PAID" : "PARTIAL";

  await prisma.$transaction([
    prisma.payment.create({
      data: { invoiceId: id, amount, method, reference: reference || null },
    }),
    prisma.invoice.update({
      where: { id },
      data: { amountPaid: newPaid, status },
    }),
  ]);

  return NextResponse.json({ ok: true, status });
}
