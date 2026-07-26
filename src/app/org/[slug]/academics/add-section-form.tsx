"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddSectionForm({
  slug,
  classId,
  teachers,
}: {
  slug: string;
  classId: string;
  teachers: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [classTeacherId, setClassTeacherId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/sections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, classId, name, classTeacherId: classTeacherId || undefined }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to add section.");
      return;
    }
    setName("");
    setClassTeacherId("");
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-xs font-medium text-ink underline">
        + Add section
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <input
        required
        placeholder="e.g. A"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-lg border border-line px-3 py-1.5 text-sm"
      />
      <select
        value={classTeacherId}
        onChange={(e) => setClassTeacherId(e.target.value)}
        className="w-full rounded-lg border border-line px-3 py-1.5 text-sm"
      >
        <option value="">No class teacher</option>
        {teachers.map((t) => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </select>
      {error && <p className="text-ledger-red text-xs">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="rounded-lg bg-ink text-paper px-3 py-1.5 text-xs font-medium disabled:opacity-50">
          {loading ? "Saving…" : "Save"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium">
          Cancel
        </button>
      </div>
    </form>
  );
}
