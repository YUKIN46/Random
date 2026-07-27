"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function InvoiceCancelButton({
  slug,
  invoiceId,
  cancelled,
}: {
  slug: string;
  invoiceId: string;
  cancelled: boolean;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function act() {
    setLoading(true);
    await fetch(`/api/invoices/${invoiceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, action: cancelled ? "reopen" : "cancel" }),
    });
    setLoading(false);
    setConfirming(false);
    router.refresh();
  }

  if (cancelled) {
    return (
      <button
        onClick={act}
        disabled={loading}
        className="font-mono text-xs uppercase tracking-wider text-ink underline disabled:opacity-50"
      >
        {loading ? "…" : "Reopen"}
      </button>
    );
  }

  if (confirming) {
    return (
      <span className="flex items-center gap-2">
        <button
          onClick={act}
          disabled={loading}
          className="font-mono text-xs uppercase tracking-wider text-ledger-red underline disabled:opacity-50"
        >
          {loading ? "…" : "Confirm"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="font-mono text-xs uppercase tracking-wider text-slate"
        >
          Cancel
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="font-mono text-xs uppercase tracking-wider text-ledger-red"
    >
      Cancel
    </button>
  );
}
