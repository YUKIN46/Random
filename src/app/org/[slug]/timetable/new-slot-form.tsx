"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;

export default function NewSlotForm({
  slug,
  sectionId,
  subjects,
  teachers,
}: {
  slug: string;
  sectionId: string;
  subjects: { id: string; name: string }[];
  teachers: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ subjectId: "", teacherId: "", day: "MON", startTime: "09:00", endTime: "09:45" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/timetable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, slug, sectionId }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to add slot.");
      return;
    }
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="rounded-lg bg-ink text-paper px-4 py-2 text-sm font-medium">
        + Add timetable slot
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="bg-paper-raised border border-line rounded-xl p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
      <select required value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })} className="rounded-lg border border-line px-3 py-2 text-sm">
        <option value="">Subject</option>
        {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>
      <select required value={form.teacherId} onChange={(e) => setForm({ ...form, teacherId: e.target.value })} className="rounded-lg border border-line px-3 py-2 text-sm">
        <option value="">Teacher</option>
        {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select>
      <select value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })} className="rounded-lg border border-line px-3 py-2 text-sm">
        {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
      </select>
      <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="rounded-lg border border-line px-3 py-2 text-sm" />
      <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className="rounded-lg border border-line px-3 py-2 text-sm" />
      {error && <p className="col-span-2 md:col-span-5 text-ledger-red text-sm">{error}</p>}
      <div className="col-span-2 md:col-span-5 flex gap-2">
        <button type="submit" disabled={loading} className="rounded-lg bg-ink text-paper px-4 py-2 text-sm font-medium disabled:opacity-50">
          {loading ? "Saving…" : "Add"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-line px-4 py-2 text-sm font-medium">
          Cancel
        </button>
      </div>
    </form>
  );
}
