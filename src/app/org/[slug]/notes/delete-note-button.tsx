"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteNoteButton({ slug, noteId }: { slug: string; noteId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function del() {
    if (!confirm("Delete this note?")) return;
    setLoading(true);
    await fetch(`/api/notes/${noteId}?slug=${encodeURIComponent(slug)}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={del}
      disabled={loading}
      className="font-mono text-xs uppercase tracking-wider text-ledger-red disabled:opacity-50"
    >
      {loading ? "…" : "Delete"}
    </button>
  );
}
