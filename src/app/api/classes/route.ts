import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";

const schema = z.object({
  slug: z.string(),
  name: z.string().min(1),
  order: z.coerce.number().optional(),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { slug, name, order } = parsed.data;

  await requireRole(slug, ["ORG_ADMIN"]);
  const org = await prisma.organization.findUniqueOrThrow({ where: { slug } });

  const existing = await prisma.schoolClass.findUnique({
    where: { organizationId_name: { organizationId: org.id, name } },
  });
  if (existing) return NextResponse.json({ error: "That class already exists" }, { status: 409 });

  const schoolClass = await prisma.schoolClass.create({
    data: { organizationId: org.id, name, order: order ?? 0 },
  });

  return NextResponse.json({ id: schoolClass.id }, { status: 201 });
}
