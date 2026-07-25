/**
 * Bootstraps the platform super-admin account.
 * Run with: npm run seed
 * Reads SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASSWORD from env (see .env.example).
 */
import { config } from "dotenv";
import path from "path";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { prisma } from "../src/lib/prisma";

// Plain tsx scripts (unlike Next.js itself) don't auto-load .env files, so
// load them explicitly. .env.local takes precedence, matching Next.js
// conventions (e.g. after `vercel env pull .env.local`).
config({ path: path.resolve(__dirname, "../.env.local") });
config({ path: path.resolve(__dirname, "../.env") });

async function main() {
  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;
  const name = process.env.SUPER_ADMIN_NAME || "Platform Admin";

  if (!email || !password) {
    throw new Error(
      "Set SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD in your environment before seeding."
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Super admin ${email} already exists.`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { name, email, passwordHash, role: Role.SUPER_ADMIN },
  });

  console.log(`Super admin created: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
