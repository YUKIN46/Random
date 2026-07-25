import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";

const rowSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  sectionName: z.string().optional(), // e.g. "Grade 8 - A" (matched loosely)
  admissionNo: z.string().optional(),
});

const schema = z.object({
  slug: z.string(),
  rows: z.array(rowSchema).min(1).max(1000),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { slug, rows } = parsed.data;

  await requireRole(slug, ["ORG_ADMIN"]);
  const org = await prisma.organization.findUniqueOrThrow({ where: { slug } });

  const sections = await prisma.section.findMany({
    where: { organizationId: org.id },
    include: { schoolClass: true },
  });

  const results: { email: string; status: "created" | "skipped"; reason?: string }[] = [];

  for (const row of rows) {
    const existing = await prisma.user.findUnique({ where: { email: row.email } });
    if (existing) {
      results.push({ email: row.email, status: "skipped", reason: "Email already exists" });
      continue;
    }

    const matchedSection = row.sectionName
      ? sections.find(
          (s) =>
            `${s.schoolClass.name} - ${s.name}`.toLowerCase() === row.sectionName!.toLowerCase()
        )
      : undefined;

    const tempPassword = crypto.randomBytes(6).toString("base64url");
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    await prisma.student.create({
      data: {
        organizationId: org.id,
        sectionId: matchedSection?.id ?? null,
        admissionNo: row.admissionNo || null,
        user: {
          create: {
            name: row.name,
            email: row.email,
            role: Role.STUDENT,
            organizationId: org.id,
            passwordHash,
          },
        },
      },
    });

    results.push({ email: row.email, status: "created" });
  }

  return NextResponse.json({
    created: results.filter((r) => r.status === "created").length,
    skipped: results.filter((r) => r.status === "skipped").length,
    results,
  });
}
