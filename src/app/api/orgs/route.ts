import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const applySchema = z.object({
  schoolName: z.string().min(2),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only"),
  contactEmail: z.string().email(),
  adminName: z.string().min(2),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = applySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { schoolName, slug, contactEmail, adminName, password } = parsed.data;

  const existingSlug = await prisma.organization.findUnique({ where: { slug } });
  if (existingSlug) {
    return NextResponse.json({ error: "That subdomain is already taken." }, { status: 409 });
  }
  const existingUser = await prisma.user.findUnique({ where: { email: contactEmail } });
  if (existingUser) {
    return NextResponse.json({ error: "That email is already registered." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const org = await prisma.organization.create({
    data: {
      name: schoolName,
      slug,
      contactEmail,
      status: "PENDING",
      users: {
        create: {
          name: adminName,
          email: contactEmail,
          passwordHash,
          role: "ORG_ADMIN",
        },
      },
    },
  });

  // TODO: send a "your application is under review" email to contactEmail,
  // and a notification to the super-admin. Wire up Resend/SendGrid here.

  return NextResponse.json({ id: org.id, slug: org.slug, status: org.status });
}
