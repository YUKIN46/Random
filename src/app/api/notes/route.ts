import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireOrgMember } from "@/lib/authz";

const schema = z.object({
  slug: z.string(),
  title: z.string().min(1),
  content: z.string().min(1),
  visibility: z.enum(["SECTION", "CLASS", "ORG", "TEACHER_ONLY"]),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { slug, title, content, visibility } = parsed.data;

  const user = await requireOrgMember(slug);
  const org = await prisma.organization.findUniqueOrThrow({ where: { slug } });

  const note = await prisma.note.create({
    data: {
      organizationId: org.id,
      authorId: user.id,
      title,
      content,
      visibility,
    },
  });

  return NextResponse.json({ id: note.id }, { status: 201 });
}
