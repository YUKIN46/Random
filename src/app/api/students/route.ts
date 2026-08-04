import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
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

  if (sectionId) {
    const section = await prisma.section.findUnique({ where: { id: sectionId } });
    if (!section || section.organizationId !== org.id) {
      return NextResponse.json({ error: "Invalid section" }, { status: 400 });
    }
  }

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
      organization: { connect: { id: org.id } },
      section: sectionId ? { connect: { id: sectionId } } : undefined,
      admissionNo: admissionNo || null,
      user: {
        create: {
          name,
          email,
          role: Role.STUDENT,
          organizationId: org.id,
          passwordHash,
        },
      },
    },
  });

  // TODO: email the temp password / invite link to the student's guardian
  // once an email provider is wired up. Until then, return it once here so
  // the admin can share it manually — it is never stored or shown again.

  return NextResponse.json({ id: student.id, email, tempPassword }, { status: 201 });
}
