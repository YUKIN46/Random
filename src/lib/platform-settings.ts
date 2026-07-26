import { prisma } from "@/lib/prisma";

export const PLATFORM_SETTINGS_ID = "singleton";

export const DEFAULT_PLATFORM_SETTINGS = {
  siteName: "Ledger",
  heroEyebrow: "Form 24-B · School Registration",
  heroHeadline: "One ledger for the whole school.",
  heroSubhead:
    "Attendance, grades, timetables, fees, and notices — kept the way a front office actually keeps them, organized by school. Every organization gets its own address and its own private records.",
  ctaLabel: "Register your school",
  supportEmail: null as string | null,
};

export async function getPlatformSettings() {
  const row = await prisma.platformSettings.findUnique({
    where: { id: PLATFORM_SETTINGS_ID },
  });
  return row ?? { id: PLATFORM_SETTINGS_ID, ...DEFAULT_PLATFORM_SETTINGS, updatedAt: null, updatedById: null };
}
