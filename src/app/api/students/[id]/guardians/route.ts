import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";

const schema = z.object({
  slug: z.string(),
  name: z.string().min(2).optional(), // required only when creating a new parent
  email: z.string().email(),
  relationship: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: studentId } = await params;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { slug, name, email, relationship } = parsed.data;

  await requireRole(slug, ["ORG_ADMIN"]);
  const org = await prisma.organization.findUniqueOrThrow({ where: { slug } });

  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student || student.organizationId !== org.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let parentUser = await prisma.user.findUnique({ where: { email } });
  let tempPassword: string | null = null;

  if (parentUser) {
    // Linking an existing account — it must be a parent in this same org
    // (or have no org yet, e.g. brand new). Don't let this silently
    // re-purpose a teacher/admin/student account from this or another org.
    if (parentUser.organizationId && parentUser.organizationId !== org.id) {
      return NextResponse.json({ error: "That email belongs to a different school" }, { status: 409 });
    }
    if (parentUser.organizationId && parentUser.role !== Role.PARENT) {
      return NextResponse.json({ error: "That email belongs to a non-parent account" }, { status: 409 });
    }
    if (!parentUser.organizationId) {
      parentUser = await prisma.user.update({
        where: { id: parentUser.id },
        data: { role: Role.PARENT, organizationId: org.id },
      });
    }
  } else {
    if (!name) {
      return NextResponse.json({ error: "Name is required for a new guardian account" }, { status: 400 });
    }
    tempPassword = crypto.randomBytes(6).toString("base64url");
    const passwordHash = await bcrypt.hash(tempPassword, 10);
    parentUser = await prisma.user.create({
      data: { name, email, role: Role.PARENT, organizationId: org.id, passwordHash },
    });
  }

  const existingLink = await prisma.guardian.findUnique({
    where: { studentId_parentUserId: { studentId, parentUserId: parentUser.id } },
  });
  if (existingLink) {
    return NextResponse.json({ error: "Already linked to this student" }, { status: 409 });
  }

  await prisma.guardian.create({
    data: { studentId, parentUserId: parentUser.id, relationship: relationship || null },
  });

  return NextResponse.json(
    { id: parentUser.id, email: parentUser.email, tempPassword },
    { status: 201 }
  );
}
