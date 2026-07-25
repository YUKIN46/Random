"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddTeacherForm({ slug }: { slug: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", employeeCode: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/teachers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, slug }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to add teacher.");
      return;
    }
    setForm({ name: "", email: "", employeeCode: "" });
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="rounded-lg bg-neutral-900 text-white px-4 py-2 text-sm font-medium">
        + Add teacher
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="bg-white border border-neutral-200 rounded-xl p-5 grid grid-cols-3 gap-4">
      <input required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
      <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
      <input placeholder="Employee code" value={form.employeeCode} onChange={(e) => setForm({ ...form, employeeCode: e.target.value })} className="rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
      {error && <p className="col-span-3 text-red-600 text-sm">{error}</p>}
      <div className="col-span-3 flex gap-2">
        <button type="submit" disabled={loading} className="rounded-lg bg-neutral-900 text-white px-4 py-2 text-sm font-medium disabled:opacity-50">
          {loading ? "Saving…" : "Save"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium">
          Cancel
        </button>
      </div>
    </form>
  );
}
