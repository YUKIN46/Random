"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ApproveRejectButtons({ orgId }: { orgId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  async function act(action: "approve" | "reject") {
    setLoading(action);
    await fetch(`/api/super-admin/orgs/${orgId}/${action}`, { method: "POST" });
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => act("approve")}
        disabled={loading !== null}
        className="rounded-md bg-chalk px-4 py-2 font-mono text-xs uppercase tracking-wider text-paper disabled:opacity-50"
      >
        {loading === "approve" ? "Approving…" : "Approve"}
      </button>
      <button
        onClick={() => act("reject")}
        disabled={loading !== null}
        className="rounded-md border border-ledger-red/30 bg-ledger-red/5 px-4 py-2 font-mono text-xs uppercase tracking-wider text-ledger-red disabled:opacity-50"
      >
        {loading === "reject" ? "Rejecting…" : "Reject"}
      </button>
    </div>
  );
}
