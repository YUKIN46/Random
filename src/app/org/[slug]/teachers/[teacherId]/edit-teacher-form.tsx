"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Fields = { name: string; employeeCode: string; phone: string };

export default function EditTeacherForm({
  slug,
  teacherId,
  initial,
}: {
  slug: string;
  teacherId: string;
  initial: Fields;
}) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);
    const res = await fetch(`/api/teachers/${teacherId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, slug }),
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
    <form onSubmit={submit} className="space-y-3 rounded-lg border border-line bg-paper-raised p-5">
      <label className="block">
        <span className="font-mono text-xs uppercase tracking-wider text-slate">Full name</span>
        <input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="mt-1.5 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm"
        />
      </label>
      <label className="block">
        <span className="font-mono text-xs uppercase tracking-wider text-slate">Employee code</span>
        <input
          value={form.employeeCode}
          onChange={(e) => setForm({ ...form, employeeCode: e.target.value })}
          className="mt-1.5 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm"
        />
      </label>
      <label className="block">
        <span className="font-mono text-xs uppercase tracking-wider text-slate">Phone</span>
        <input
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="mt-1.5 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm"
        />
      </label>
      {error && <p className="text-ledger-red text-sm">{error}</p>}
      {saved && <p className="text-chalk text-sm">Saved.</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-ink px-4 py-2 font-mono text-xs uppercase tracking-wider text-paper disabled:opacity-50"
      >
        {loading ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
