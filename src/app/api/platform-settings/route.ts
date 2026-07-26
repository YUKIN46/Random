import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/authz";
import { PLATFORM_SETTINGS_ID } from "@/lib/platform-settings";

const schema = z.object({
  siteName: z.string().min(1),
  heroEyebrow: z.string().min(1),
  heroHeadline: z.string().min(1),
  heroSubhead: z.string().min(1),
  ctaLabel: z.string().min(1),
  supportEmail: z.string().email().optional().or(z.literal("")),
});

export async function PATCH(req: NextRequest) {
  const admin = await requireSuperAdmin();
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { siteName, heroEyebrow, heroHeadline, heroSubhead, ctaLabel, supportEmail } = parsed.data;

  await prisma.platformSettings.upsert({
    where: { id: PLATFORM_SETTINGS_ID },
    create: {
      id: PLATFORM_SETTINGS_ID,
      siteName,
      heroEyebrow,
      heroHeadline,
      heroSubhead,
      ctaLabel,
      supportEmail: supportEmail || null,
      updatedById: admin.id,
    },
    update: {
      siteName,
      heroEyebrow,
      heroHeadline,
      heroSubhead,
      ctaLabel,
      supportEmail: supportEmail || null,
      updatedById: admin.id,
    },
  });

  return NextResponse.json({ ok: true });
}
