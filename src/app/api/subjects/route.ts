import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";

const schema = z.object({
  slug: z.string(),
  name: z.string().min(1),
  code: z.string().optional(),
  teacherIds: z.array(z.string()).optional(),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { slug, name, code, teacherIds } = parsed.data;

  await requireRole(slug, ["ORG_ADMIN"]);
  const org = await prisma.organization.findUniqueOrThrow({ where: { slug } });

  const existing = await prisma.subject.findUnique({
    where: { organizationId_name: { organizationId: org.id, name } },
  });
  if (existing) return NextResponse.json({ error: "That subject already exists" }, { status: 409 });

  const subject = await prisma.subject.create({
    data: {
      organizationId: org.id,
      name,
      code: code || null,
      teacherLinks: teacherIds?.length
        ? { create: teacherIds.map((teacherId) => ({ teacherId })) }
        : undefined,
    },
  });

  return NextResponse.json({ id: subject.id }, { status: 201 });
}
