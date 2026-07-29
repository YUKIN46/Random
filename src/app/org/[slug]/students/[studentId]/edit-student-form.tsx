"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Fields = {
  sectionId: string;
  admissionNo: string;
  dateOfBirth: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  address: string;
};

export default function EditStudentForm({
  slug,
  studentId,
  sections,
  initial,
}: {
  slug: string;
  studentId: string;
  sections: { id: string; label: string }[];
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
    const res = await fetch(`/api/students/${studentId}`, {
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
        <span className="font-mono text-xs uppercase tracking-wider text-slate">Section</span>
        <select
          value={form.sectionId}
          onChange={(e) => setForm({ ...form, sectionId: e.target.value })}
          className="mt-1.5 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm"
        >
          <option value="">No section</option>
          {sections.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="font-mono text-xs uppercase tracking-wider text-slate">Admission No.</span>
        <input
          value={form.admissionNo}
          onChange={(e) => setForm({ ...form, admissionNo: e.target.value })}
          className="mt-1.5 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm"
        />
      </label>
      <label className="block">
        <span className="font-mono text-xs uppercase tracking-wider text-slate">Date of birth</span>
        <input
          type="date"
          value={form.dateOfBirth}
          onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
          className="mt-1.5 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm"
        />
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="font-mono text-xs uppercase tracking-wider text-slate">Guardian name</span>
          <input
            value={form.guardianName}
            onChange={(e) => setForm({ ...form, guardianName: e.target.value })}
            className="mt-1.5 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="font-mono text-xs uppercase tracking-wider text-slate">Guardian phone</span>
          <input
            value={form.guardianPhone}
            onChange={(e) => setForm({ ...form, guardianPhone: e.target.value })}
            className="mt-1.5 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm"
          />
        </label>
      </div>
      <label className="block">
        <span className="font-mono text-xs uppercase tracking-wider text-slate">Guardian email</span>
        <input
          type="email"
          value={form.guardianEmail}
          onChange={(e) => setForm({ ...form, guardianEmail: e.target.value })}
          className="mt-1.5 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm"
        />
      </label>
      <label className="block">
        <span className="font-mono text-xs uppercase tracking-wider text-slate">Address</span>
        <input
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
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
