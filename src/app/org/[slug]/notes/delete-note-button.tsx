"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteNoteButton({ slug, noteId }: { slug: string; noteId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function del() {
    setLoading(true);
    await fetch(`/api/notes/${noteId}?slug=${encodeURIComponent(slug)}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  if (confirming) {
    return (
      <span className="flex items-center gap-2">
        <button
          onClick={del}
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
      Delete
    </button>
  );
}
