"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfileForm({ initialName }: { initialName: string }) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to save.");
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="flex items-end gap-2">
      <label className="block flex-1">
        <span className="font-mono text-xs uppercase tracking-wider text-slate">Full name</span>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1.5 w-full rounded-md border border-line bg-paper-raised px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brass/50"
        />
      </label>
      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-ink px-4 py-2.5 font-mono text-xs uppercase tracking-wider text-paper disabled:opacity-50"
      >
        {loading ? "Saving…" : "Save"}
      </button>
      {error && <p className="text-ledger-red text-sm">{error}</p>}
      {saved && <p className="text-chalk text-sm">Saved.</p>}
    </form>
  );
}
