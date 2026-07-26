import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";

const schema = z.object({
  slug: z.string(),
  name: z.string().min(2),
  logoUrl: z.string().url().optional().or(z.literal("")),
  address: z.string().optional(),
  phone: z.string().optional(),
  timezone: z.string().min(1),
});

export async function PATCH(req: NextRequest) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { slug, name, logoUrl, address, phone, timezone } = parsed.data;

  await requireRole(slug, ["ORG_ADMIN"]);

  const org = await prisma.organization.update({
    where: { slug },
    data: {
      name,
      logoUrl: logoUrl || null,
      address: address || null,
      phone: phone || null,
      timezone,
    },
  });

  return NextResponse.json({ id: org.id });
}
