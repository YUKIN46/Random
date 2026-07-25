"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewExamForm({
  slug,
  subjects,
}: {
  slug: string;
  subjects: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ subjectId: "", name: "", examDate: "", maxMarks: "100", passMarks: "35" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/exams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, slug }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to create exam.");
      return;
    }
    setForm({ subjectId: "", name: "", examDate: "", maxMarks: "100", passMarks: "35" });
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="rounded-lg bg-neutral-900 text-white px-4 py-2 text-sm font-medium">
        + New exam
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="bg-white border border-neutral-200 rounded-xl p-5 grid grid-cols-2 md:grid-cols-5 gap-3">
      <select required value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })} className="rounded-lg border border-neutral-300 px-3 py-2 text-sm">
        <option value="">Subject</option>
        {subjects.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>
      <input required placeholder="Exam name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
      <input required type="date" value={form.examDate} onChange={(e) => setForm({ ...form, examDate: e.target.value })} className="rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
      <input type="number" placeholder="Max marks" value={form.maxMarks} onChange={(e) => setForm({ ...form, maxMarks: e.target.value })} className="rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
      <input type="number" placeholder="Pass marks" value={form.passMarks} onChange={(e) => setForm({ ...form, passMarks: e.target.value })} className="rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
      {error && <p className="col-span-2 md:col-span-5 text-red-600 text-sm">{error}</p>}
      <div className="col-span-2 md:col-span-5 flex gap-2">
        <button type="submit" disabled={loading} className="rounded-lg bg-neutral-900 text-white px-4 py-2 text-sm font-medium disabled:opacity-50">
          {loading ? "Saving…" : "Create"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium">
          Cancel
        </button>
      </div>
    </form>
  );
}
