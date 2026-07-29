"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewInvoiceForm({
  slug,
  students,
}: {
  slug: string;
  students: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ studentId: "", amountDue: "", dueDate: "" });
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, slug }),
    });
    setLoading(false);
    setOpen(false);
    setForm({ studentId: "", amountDue: "", dueDate: "" });
    router.refresh();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="rounded-lg bg-ink text-paper px-4 py-2 text-sm font-medium">
        + New invoice
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="bg-paper-raised border border-line rounded-xl p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
      <select required value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} className="rounded-lg border border-line px-3 py-2 text-sm">
        <option value="">Select student</option>
        {students.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>
      <input required type="number" step="0.01" placeholder="Amount due" value={form.amountDue} onChange={(e) => setForm({ ...form, amountDue: e.target.value })} className="rounded-lg border border-line px-3 py-2 text-sm" />
      <input required type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="rounded-lg border border-line px-3 py-2 text-sm" />
      <div className="col-span-3 flex gap-2">
        <button type="submit" disabled={loading} className="rounded-lg bg-ink text-paper px-4 py-2 text-sm font-medium disabled:opacity-50">
          {loading ? "Saving…" : "Create"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-line px-4 py-2 text-sm font-medium">
          Cancel
        </button>
      </div>
    </form>
  );
}
