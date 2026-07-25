import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";

const schema = z.object({
  slug: z.string(),
  name: z.string().min(2),
  email: z.string().email(),
  sectionId: z.string().optional(),
  admissionNo: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { slug, name, email, sectionId, admissionNo } = parsed.data;

  await requireRole(slug, ["ORG_ADMIN", "TEACHER"]);
  const org = await prisma.organization.findUniqueOrThrow({ where: { slug } });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already in use" }, { status: 409 });
  }

  // Temporary password — in production, send an invite link instead and let
  // the student set their own password on first login.
  const tempPassword = crypto.randomBytes(6).toString("base64url");
  const passwordHash = await bcrypt.hash(tempPassword, 10);

  const student = await prisma.student.create({
    data: {
      organizationId: org.id,
      sectionId: sectionId || null,
      admissionNo: admissionNo || null,
      user: {
        create: {
          name,
          email,
          role: "STUDENT",
          organizationId: org.id,
          passwordHash,
        },
      },
    },
  });

  // TODO: email the temp password / invite link to the student's guardian.

  return NextResponse.json({ id: student.id }, { status: 201 });
}
