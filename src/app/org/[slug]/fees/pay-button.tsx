"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PayButton({
  slug,
  invoiceId,
  remaining,
}: {
  slug: string;
  invoiceId: string;
  remaining: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function recordPayment() {
    const amountStr = window.prompt(`Amount received (remaining: $${remaining.toFixed(2)})`, remaining.toFixed(2));
    if (!amountStr) return;
    const amount = Number(amountStr);
    if (!amount || amount <= 0) return;

    setLoading(true);
    await fetch(`/api/invoices/${invoiceId}/pay`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, amount, method: "CASH" }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={recordPayment}
      disabled={loading}
      className="text-xs font-medium text-ink underline disabled:opacity-50"
    >
      {loading ? "Saving…" : "Record payment"}
    </button>
  );
}
