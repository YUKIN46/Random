"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SubjectRow({
  slug,
  subjectId,
  name,
  code,
  teacherNames,
}: {
  slug: string;
  subjectId: string;
  name: string;
  code: string;
  teacherNames: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [nameValue, setNameValue] = useState(name);
  const [codeValue, setCodeValue] = useState(code);
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    await fetch(`/api/subjects/${subjectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, name: nameValue, code: codeValue || undefined }),
    });
    setLoading(false);
    setEditing(false);
    router.refresh();
  }

  async function del() {
    setLoading(true);
    await fetch(`/api/subjects/${subjectId}?slug=${encodeURIComponent(slug)}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  if (confirming) {
    return (
      <tr className="border-t border-line">
        <td colSpan={4} className="px-4 py-3 bg-ledger-red/5">
          <p className="text-xs text-ledger-red">
            Delete {name}? This also removes its exams, results, and timetable slots.
          </p>
          <div className="mt-1.5 flex gap-3">
            <button onClick={del} disabled={loading} className="font-mono text-xs uppercase tracking-wider text-ledger-red underline">
              {loading ? "Deleting…" : "Confirm"}
            </button>
            <button onClick={() => setConfirming(false)} className="font-mono text-xs uppercase tracking-wider text-slate">
              Cancel
            </button>
          </div>
        </td>
      </tr>
    );
  }

  if (editing) {
    return (
      <tr className="border-t border-line">
        <td className="px-4 py-2">
          <input value={nameValue} onChange={(e) => setNameValue(e.target.value)} className="w-full rounded-md border border-line px-2 py-1 text-sm" />
        </td>
        <td className="px-4 py-2">
          <input value={codeValue} onChange={(e) => setCodeValue(e.target.value)} className="w-full rounded-md border border-line px-2 py-1 text-sm" />
        </td>
        <td className="px-4 py-2 text-slate">{teacherNames || "—"}</td>
        <td className="px-4 py-2">
          <div className="flex gap-3">
            <button onClick={save} disabled={loading} className="font-mono text-xs uppercase tracking-wider text-ink underline">Save</button>
            <button onClick={() => setEditing(false)} className="font-mono text-xs uppercase tracking-wider text-slate">Cancel</button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-t border-line">
      <td className="px-4 py-3 text-ink">{name}</td>
      <td className="px-4 py-3 text-slate">{code || "—"}</td>
      <td className="px-4 py-3 text-slate">{teacherNames || "—"}</td>
      <td className="px-4 py-3">
        <div className="flex gap-3">
          <button onClick={() => setEditing(true)} className="font-mono text-xs uppercase tracking-wider text-slate hover:text-ink">Edit</button>
          <button onClick={() => setConfirming(true)} className="font-mono text-xs uppercase tracking-wider text-ledger-red">Delete</button>
        </div>
      </td>
    </tr>
  );
}
