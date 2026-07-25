"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Row = { name: string; email: string; sectionName?: string; admissionNo?: string };

// Minimal CSV parser: handles quoted fields with embedded commas, not
// multi-line quoted fields. Expected header: name,email,section,admissionNo
function parseCsv(text: string): Row[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const header = splitCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
  const nameIdx = header.indexOf("name");
  const emailIdx = header.indexOf("email");
  const sectionIdx = header.indexOf("section");
  const admissionIdx = header.indexOf("admissionno");

  return lines.slice(1).filter(Boolean).map((line) => {
    const cols = splitCsvLine(line);
    return {
      name: cols[nameIdx]?.trim() ?? "",
      email: cols[emailIdx]?.trim() ?? "",
      sectionName: sectionIdx >= 0 ? cols[sectionIdx]?.trim() : undefined,
      admissionNo: admissionIdx >= 0 ? cols[admissionIdx]?.trim() : undefined,
    };
  });
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

export default function BulkImportStudents({ slug }: { slug: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<{ created: number; skipped: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const text = await file.text();
    const parsedRows = parseCsv(text).filter((r) => r.name && r.email);
    setRows(parsedRows);
    setSummary(null);
    setError(null);
  }

  async function submit() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/students/bulk-import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, rows }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Import failed.");
      return;
    }
    setSummary({ created: data.created, skipped: data.skipped });
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium"
      >
        Bulk import (CSV)
      </button>
    );
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5">
      <p className="text-sm text-neutral-600 mb-3">
        CSV with headers <code>name,email,section,admissionNo</code> — <code>section</code>{" "}
        should match an existing section like <code>Grade 8 - A</code> and{" "}
        <code>admissionNo</code> is optional.
      </p>
      <input type="file" accept=".csv" onChange={handleFile} className="text-sm mb-3" />
      {fileName && (
        <p className="text-sm text-neutral-500 mb-3">
          {rows.length} valid row(s) parsed from <strong>{fileName}</strong>.
        </p>
      )}
      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
      {summary && (
        <p className="text-emerald-700 text-sm mb-3">
          Imported {summary.created} student(s); skipped {summary.skipped} (duplicate emails).
        </p>
      )}
      <div className="flex gap-2">
        <button
          onClick={submit}
          disabled={loading || rows.length === 0}
          className="rounded-lg bg-neutral-900 text-white px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {loading ? "Importing…" : `Import ${rows.length || ""} students`}
        </button>
        <button
          onClick={() => {
            setOpen(false);
            setRows([]);
            setFileName("");
            setSummary(null);
          }}
          className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium"
        >
          Close
        </button>
      </div>
    </div>
  );
}
