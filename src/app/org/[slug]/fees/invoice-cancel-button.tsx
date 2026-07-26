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
  const [loading, setLoading] = useState(false);

  async function act() {
    if (!cancelled && !confirm("Cancel this invoice?")) return;
    setLoading(true);
    await fetch(`/api/invoices/${invoiceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, action: cancelled ? "reopen" : "cancel" }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={act}
      disabled={loading}
      className={`font-mono text-xs uppercase tracking-wider underline disabled:opacity-50 ${cancelled ? "text-ink" : "text-ledger-red"}`}
    >
      {loading ? "…" : cancelled ? "Reopen" : "Cancel"}
    </button>
  );
}
