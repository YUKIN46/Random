"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddSubjectForm({
  slug,
  teachers,
}: {
  slug: string;
  teachers: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/subjects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug,
        name,
        code: code || undefined,
        teacherIds: teacherId ? [teacherId] : undefined,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to add subject.");
      return;
    }
    setName("");
    setCode("");
    setTeacherId("");
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="rounded-lg bg-ink text-paper px-4 py-2 text-sm font-medium">
        + Add subject
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="bg-paper-raised border border-line rounded-xl p-5 grid grid-cols-3 gap-4">
      <input required placeholder="Subject name" value={name} onChange={(e) => setName(e.target.value)} className="rounded-lg border border-line px-3 py-2 text-sm" />
      <input placeholder="Code (optional)" value={code} onChange={(e) => setCode(e.target.value)} className="rounded-lg border border-line px-3 py-2 text-sm" />
      <select value={teacherId} onChange={(e) => setTeacherId(e.target.value)} className="rounded-lg border border-line px-3 py-2 text-sm">
        <option value="">No teacher assigned</option>
        {teachers.map((t) => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </select>
      {error && <p className="col-span-3 text-ledger-red text-sm">{error}</p>}
      <div className="col-span-3 flex gap-2">
        <button type="submit" disabled={loading} className="rounded-lg bg-ink text-paper px-4 py-2 text-sm font-medium disabled:opacity-50">
          {loading ? "Saving…" : "Save"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-line px-4 py-2 text-sm font-medium">
          Cancel
        </button>
      </div>
    </form>
  );
}
