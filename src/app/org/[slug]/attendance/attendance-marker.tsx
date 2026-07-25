"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUSES = ["PRESENT", "ABSENT", "LATE", "EXCUSED"] as const;
type Status = (typeof STATUSES)[number];

export default function AttendanceMarker({
  slug,
  sections,
  selectedSectionId,
  date,
  students,
}: {
  slug: string;
  sections: { id: string; label: string }[];
  selectedSectionId: string;
  date: string;
  students: { id: string; name: string; status: Status }[];
}) {
  const router = useRouter();
  const [local, setLocal] = useState(students);
  const [saving, setSaving] = useState(false);

  function updateFilters(sectionId: string, newDate: string) {
    const url = new URL(window.location.href);
    url.searchParams.set("sectionId", sectionId);
    url.searchParams.set("date", newDate);
    router.push(url.pathname + url.search);
  }

  function setStatus(studentId: string, status: Status) {
    setLocal((prev) => prev.map((s) => (s.id === studentId ? { ...s, status } : s)));
  }

  async function save() {
    setSaving(true);
    await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug,
        sectionId: selectedSectionId,
        date,
        records: local.map((s) => ({ studentId: s.id, status: s.status })),
      }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <div>
      <div className="flex gap-4 mb-6">
        <select
          value={selectedSectionId}
          onChange={(e) => updateFilters(e.target.value, date)}
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        >
          {sections.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={date}
          onChange={(e) => updateFilters(selectedSectionId, e.target.value)}
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">Student</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {local.map((s) => (
              <tr key={s.id} className="border-t border-neutral-100">
                <td className="px-4 py-3">{s.name}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {STATUSES.map((st) => (
                      <button
                        key={st}
                        onClick={() => setStatus(s.id, st)}
                        className={`px-3 py-1 rounded-md text-xs font-medium border ${
                          s.status === st
                            ? "bg-neutral-900 text-white border-neutral-900"
                            : "border-neutral-300 text-neutral-600"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
            {local.length === 0 && (
              <tr>
                <td colSpan={2} className="px-4 py-6 text-center text-neutral-400">
                  No students in this section.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {local.length > 0 && (
        <button
          onClick={save}
          disabled={saving}
          className="mt-4 rounded-lg bg-neutral-900 text-white px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save attendance"}
        </button>
      )}
    </div>
  );
}
