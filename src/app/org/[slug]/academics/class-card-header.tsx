"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ClassCardHeader({
  slug,
  classId,
  name,
  sectionCount,
}: {
  slug: string;
  classId: string;
  name: string;
  sectionCount: number;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [value, setValue] = useState(name);
  const [loading, setLoading] = useState(false);

  async function rename() {
    setLoading(true);
    await fetch(`/api/classes/${classId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, name: value }),
    });
    setLoading(false);
    setEditing(false);
    router.refresh();
  }

  async function del() {
    setLoading(true);
    await fetch(`/api/classes/${classId}?slug=${encodeURIComponent(slug)}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="mb-3 rounded-md border border-ledger-red/30 bg-ledger-red/5 p-2">
        <p className="text-xs text-ledger-red">
          Delete class and its {sectionCount} section(s)? This also removes their attendance
          and timetable records.
        </p>
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
      <div className="mb-3 flex gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="flex-1 rounded-md border border-line px-2 py-1 text-sm"
        />
        <button onClick={rename} disabled={loading} className="font-mono text-xs uppercase tracking-wider text-ink underline">
          Save
        </button>
        <button onClick={() => { setEditing(false); setValue(name); }} className="font-mono text-xs uppercase tracking-wider text-slate">
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between mb-3">
      <p className="font-medium text-ink">{name}</p>
      <div className="flex gap-3">
        <button onClick={() => setEditing(true)} className="font-mono text-xs uppercase tracking-wider text-slate hover:text-ink">
          Rename
        </button>
        <button onClick={() => setConfirming(true)} className="font-mono text-xs uppercase tracking-wider text-ledger-red">
          Delete
        </button>
      </div>
    </div>
  );
}
