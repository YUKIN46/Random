"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddStudentForm({
  slug,
  sections,
}: {
  slug: string;
  sections: { id: string; label: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", sectionId: "", admissionNo: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, slug }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to add student.");
      return;
    }
    setForm({ name: "", email: "", sectionId: "", admissionNo: "" });
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-ink text-paper px-4 py-2 text-sm font-medium"
      >
        + Add student
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="bg-paper-raised border border-line rounded-xl p-5 grid grid-cols-2 gap-4">
      <input
        required
        placeholder="Full name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="rounded-lg border border-line px-3 py-2 text-sm"
      />
      <input
        required
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        className="rounded-lg border border-line px-3 py-2 text-sm"
      />
      <select
        value={form.sectionId}
        onChange={(e) => setForm({ ...form, sectionId: e.target.value })}
        className="rounded-lg border border-line px-3 py-2 text-sm"
      >
        <option value="">No section</option>
        {sections.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
      </select>
      <input
        placeholder="Admission No."
        value={form.admissionNo}
        onChange={(e) => setForm({ ...form, admissionNo: e.target.value })}
        className="rounded-lg border border-line px-3 py-2 text-sm"
      />
      {error && <p className="col-span-2 text-ledger-red text-sm">{error}</p>}
      <div className="col-span-2 flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-ink text-paper px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {loading ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg border border-line px-4 py-2 text-sm font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
