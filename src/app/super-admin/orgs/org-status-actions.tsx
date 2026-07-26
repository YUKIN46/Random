"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function OrgStatusActions({
  orgId,
  status,
}: {
  orgId: string;
  status: "APPROVED" | "SUSPENDED";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function act() {
    setLoading(true);
    const action = status === "APPROVED" ? "suspend" : "reactivate";
    await fetch(`/api/super-admin/orgs/${orgId}/${action}`, { method: "POST" });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={act}
      disabled={loading}
      className="font-mono text-xs uppercase tracking-wider text-ink underline underline-offset-2 disabled:opacity-50"
    >
      {loading ? "…" : status === "APPROVED" ? "Suspend" : "Reactivate"}
    </button>
  );
}
