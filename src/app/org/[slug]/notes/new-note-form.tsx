"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewNoteForm({ slug }: { slug: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", visibility: "ORG" });
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, slug }),
    });
    setLoading(false);
    setOpen(false);
    setForm({ title: "", content: "", visibility: "ORG" });
    router.refresh();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="rounded-lg bg-ink text-paper px-4 py-2 text-sm font-medium">
        + New note
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="bg-paper-raised border border-line rounded-xl p-5 space-y-3">
      <input required placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg border border-line px-3 py-2 text-sm" />
      <textarea required placeholder="Content" rows={4} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="w-full rounded-lg border border-line px-3 py-2 text-sm" />
      <select value={form.visibility} onChange={(e) => setForm({ ...form, visibility: e.target.value })} className="rounded-lg border border-line px-3 py-2 text-sm">
        <option value="ORG">Whole school</option>
        <option value="CLASS">Class</option>
        <option value="SECTION">Section</option>
        <option value="TEACHER_ONLY">Teachers only</option>
      </select>
      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="rounded-lg bg-ink text-paper px-4 py-2 text-sm font-medium disabled:opacity-50">
          {loading ? "Posting…" : "Post"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-line px-4 py-2 text-sm font-medium">
          Cancel
        </button>
      </div>
    </form>
  );
}
