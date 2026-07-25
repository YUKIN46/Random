import { DefaultSession } from "next-auth";
import type { Role } from "@prisma/client";

declare module "next-auth" {
  interface User {
    role: Role;
    organizationId: string | null;
    orgSlug: string | null;
  }

  interface Session {
    user: {
      id: string;
      role: Role;
      organizationId: string | null;
      orgSlug: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role;
    organizationId: string | null;
    orgSlug: string | null;
  }
}
