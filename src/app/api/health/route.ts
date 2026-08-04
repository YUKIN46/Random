import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public, unauthenticated on purpose — this is for uptime monitors, load
// balancers, and Docker's HEALTHCHECK, which don't have credentials.
// It intentionally reveals nothing beyond "database reachable: yes/no".
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok", database: "connected" });
  } catch {
    return NextResponse.json({ status: "error", database: "unreachable" }, { status: 503 });
  }
}
