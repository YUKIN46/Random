"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ResultsEntry({
  slug,
  examId,
  maxMarks,
  students,
}: {
  slug: string;
  examId: string;
  maxMarks: number;
  students: { id: string; name: string; marksObtained: number | "" }[];
}) {
  const router = useRouter();
  const [local, setLocal] = useState(students);
  const [saving, setSaving] = useState(false);

  function setMarks(studentId: string, value: string) {
    const num = value === "" ? "" : Number(value);
    setLocal((prev) => prev.map((s) => (s.id === studentId ? { ...s, marksObtained: num } : s)));
  }

  async function save() {
    setSaving(true);
    const results = local
      .filter((s) => s.marksObtained !== "")
      .map((s) => ({ studentId: s.id, marksObtained: s.marksObtained as number }));

    await fetch(`/api/exams/${examId}/results`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, results }),
    });
    setSaving(false);
    router.push(`/org/${slug}/exams`);
    router.refresh();
  }

  return (
    <div>
      <div className="bg-paper-raised border border-line rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-paper text-left text-slate">
            <tr>
              <th className="px-4 py-3 font-medium">Student</th>
              <th className="px-4 py-3 font-medium">Marks (out of {maxMarks})</th>
            </tr>
          </thead>
          <tbody>
            {local.map((s) => (
              <tr key={s.id} className="border-t border-line">
                <td className="px-4 py-3">{s.name}</td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    min={0}
                    max={maxMarks}
                    value={s.marksObtained}
                    onChange={(e) => setMarks(s.id, e.target.value)}
                    className="w-24 rounded-lg border border-line px-2 py-1 text-sm"
                  />
                </td>
              </tr>
            ))}
            {local.length === 0 && (
              <tr>
                <td colSpan={2} className="px-4 py-6 text-center text-slate">
                  No students found.
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
          className="mt-4 rounded-lg bg-ink text-paper px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save results"}
        </button>
      )}
    </div>
  );
}
