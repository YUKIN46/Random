import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";

const schema = z.object({
  slug: z.string(),
  classId: z.string(),
  name: z.string().min(1),
  classTeacherId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { slug, classId, name, classTeacherId } = parsed.data;

  await requireRole(slug, ["ORG_ADMIN"]);
  const org = await prisma.organization.findUniqueOrThrow({ where: { slug } });

  const existing = await prisma.section.findUnique({
    where: { classId_name: { classId, name } },
  });
  if (existing) return NextResponse.json({ error: "That section already exists" }, { status: 409 });

  const section = await prisma.section.create({
    data: {
      organizationId: org.id,
      classId,
      name,
      classTeacherId: classTeacherId || null,
    },
  });

  return NextResponse.json({ id: section.id }, { status: 201 });
}
