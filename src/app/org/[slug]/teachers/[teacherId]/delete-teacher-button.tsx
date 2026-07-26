"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteTeacherButton({ slug, teacherId }: { slug: string; teacherId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function del() {
    setLoading(true);
    await fetch(`/api/teachers/${teacherId}?slug=${encodeURIComponent(slug)}`, { method: "DELETE" });
    router.push(`/org/${slug}/teachers`);
    router.refresh();
  }

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="font-mono text-xs uppercase tracking-wider text-ledger-red underline underline-offset-2"
      >
        Remove teacher
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-md border border-ledger-red/30 bg-ledger-red/5 px-3 py-2">
      <p className="text-xs text-ledger-red">Permanently delete this teacher?</p>
      <button
        onClick={del}
        disabled={loading}
        className="font-mono text-xs uppercase tracking-wider text-ledger-red underline disabled:opacity-50"
      >
        {loading ? "Removing…" : "Confirm"}
      </button>
      <button
        onClick={() => setConfirming(false)}
        className="font-mono text-xs uppercase tracking-wider text-slate"
      >
        Cancel
      </button>
    </div>
  );
}
