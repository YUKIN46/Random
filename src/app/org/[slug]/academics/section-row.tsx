"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SectionRow({
  slug,
  sectionId,
  name,
  classTeacherId,
  classTeacherName,
  teachers,
}: {
  slug: string;
  sectionId: string;
  name: string;
  classTeacherId: string;
  classTeacherName: string;
  teachers: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [nameValue, setNameValue] = useState(name);
  const [teacherValue, setTeacherValue] = useState(classTeacherId);
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    await fetch(`/api/sections/${sectionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, name: nameValue, classTeacherId: teacherValue || undefined }),
    });
    setLoading(false);
    setEditing(false);
    router.refresh();
  }

  async function del() {
    setLoading(true);
    await fetch(`/api/sections/${sectionId}?slug=${encodeURIComponent(slug)}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  if (confirming) {
    return (
      <li className="rounded-md border border-ledger-red/30 bg-ledger-red/5 p-2">
        <p className="text-xs text-ledger-red">
          Delete section {name}? Students keep their record but lose this section assignment.
        </p>
        <div className="mt-1.5 flex gap-3">
          <button onClick={del} disabled={loading} className="font-mono text-xs uppercase tracking-wider text-ledger-red underline">
            {loading ? "Deleting…" : "Confirm"}
          </button>
          <button onClick={() => setConfirming(false)} className="font-mono text-xs uppercase tracking-wider text-slate">
            Cancel
          </button>
        </div>
      </li>
    );
  }

  if (editing) {
    return (
      <li className="space-y-1.5 rounded-md border border-line p-2">
        <input
          value={nameValue}
          onChange={(e) => setNameValue(e.target.value)}
          className="w-full rounded-md border border-line px-2 py-1 text-sm"
        />
        <select
          value={teacherValue}
          onChange={(e) => setTeacherValue(e.target.value)}
          className="w-full rounded-md border border-line px-2 py-1 text-sm"
        >
          <option value="">No class teacher</option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <div className="flex gap-3">
          <button onClick={save} disabled={loading} className="font-mono text-xs uppercase tracking-wider text-ink underline">
            Save
          </button>
          <button onClick={() => setEditing(false)} className="font-mono text-xs uppercase tracking-wider text-slate">
            Cancel
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="text-sm text-slate flex items-center justify-between gap-2">
      <span className="text-ink">Section {name}</span>
      <span className="flex items-center gap-2 shrink-0">
        <span className="text-xs">{classTeacherName || "No class teacher"}</span>
        <button onClick={() => setEditing(true)} className="font-mono text-[0.65rem] uppercase tracking-wider text-slate hover:text-ink">
          Edit
        </button>
        <button onClick={() => setConfirming(true)} className="font-mono text-[0.65rem] uppercase tracking-wider text-ledger-red">
          Delete
        </button>
      </span>
    </li>
  );
}
