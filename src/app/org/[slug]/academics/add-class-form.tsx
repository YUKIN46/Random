"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddClassForm({ slug }: { slug: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, name }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to add class.");
      return;
    }
    setName("");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        required
        placeholder="e.g. Grade 8"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-neutral-900 text-white px-4 py-2 text-sm font-medium disabled:opacity-50"
      >
        {loading ? "Adding…" : "+ Add class"}
      </button>
      {error && <p className="text-red-600 text-sm self-center">{error}</p>}
    </form>
  );
}
