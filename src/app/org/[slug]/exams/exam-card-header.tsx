"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ExamCardHeader({
  slug,
  examId,
  name,
  subjectName,
  examDate,
  maxMarks,
  passMarks,
}: {
  slug: string;
  examId: string;
  name: string;
  subjectName: string;
  examDate: string;
  maxMarks: number;
  passMarks: number;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [form, setForm] = useState({ name, examDate, maxMarks: String(maxMarks), passMarks: String(passMarks) });
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    await fetch(`/api/exams/${examId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, slug }),
    });
    setLoading(false);
    setEditing(false);
    router.refresh();
  }

  async function del() {
    setLoading(true);
    await fetch(`/api/exams/${examId}?slug=${encodeURIComponent(slug)}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="mb-3 rounded-md border border-ledger-red/30 bg-ledger-red/5 p-3">
        <p className="text-xs text-ledger-red">Delete &quot;{name}&quot; and all its results?</p>
        <div className="mt-1.5 flex gap-3">
          <button onClick={del} disabled={loading} className="font-mono text-xs uppercase tracking-wider text-ledger-red underline">
            {loading ? "Deleting…" : "Confirm"}
          </button>
          <button onClick={() => setConfirming(false)} className="font-mono text-xs uppercase tracking-wider text-slate">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (editing) {
    return (
      <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="col-span-2 rounded-md border border-line px-2 py-1 text-sm sm:col-span-1" />
        <input type="date" value={form.examDate} onChange={(e) => setForm({ ...form, examDate: e.target.value })} className="rounded-md border border-line px-2 py-1 text-sm" />
        <input type="number" value={form.maxMarks} onChange={(e) => setForm({ ...form, maxMarks: e.target.value })} className="rounded-md border border-line px-2 py-1 text-sm" />
        <input type="number" value={form.passMarks} onChange={(e) => setForm({ ...form, passMarks: e.target.value })} className="rounded-md border border-line px-2 py-1 text-sm" />
        <div className="col-span-2 flex gap-3 sm:col-span-4">
          <button onClick={save} disabled={loading} className="font-mono text-xs uppercase tracking-wider text-ink underline">Save</button>
          <button onClick={() => setEditing(false)} className="font-mono text-xs uppercase tracking-wider text-slate">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between mb-3">
      <div>
        <p className="font-medium text-ink">{name}</p>
        <p className="text-sm text-slate">
          {subjectName} · {new Date(examDate).toLocaleDateString()} · Max {maxMarks}
        </p>
      </div>
      <div className="flex gap-3">
        <button onClick={() => setEditing(true)} className="font-mono text-xs uppercase tracking-wider text-slate hover:text-ink">
          Edit
        </button>
        <button onClick={() => setConfirming(true)} className="font-mono text-xs uppercase tracking-wider text-ledger-red">
          Delete
        </button>
      </div>
    </div>
  );
}
