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

type ImportResult = { email: string; status: "created" | "skipped"; reason?: string; tempPassword?: string };

export default function BulkImportStudents({ slug }: { slug: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ImportResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const text = await file.text();
    const parsedRows = parseCsv(text).filter((r) => r.name && r.email);
    setRows(parsedRows);
    setResults(null);
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
    setResults(data.results);
    router.refresh();
  }

  function downloadCredentials() {
    const created = (results ?? []).filter((r) => r.status === "created");
    const csv = ["email,temporary_password", ...created.map((r) => `${r.email},${r.tempPassword}`)].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "student-credentials.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg border border-line px-4 py-2 text-sm font-medium"
      >
        Bulk import (CSV)
      </button>
    );
  }

  const created = results?.filter((r) => r.status === "created") ?? [];
  const skipped = results?.filter((r) => r.status === "skipped") ?? [];

  return (
    <div className="bg-paper-raised border border-line rounded-xl p-5">
      {!results && (
        <>
          <p className="text-sm text-slate mb-3">
            CSV with headers <code>name,email,section,admissionNo</code> — <code>section</code>{" "}
            should match an existing section like <code>Grade 8 - A</code> and{" "}
            <code>admissionNo</code> is optional.
          </p>
          <input type="file" accept=".csv" onChange={handleFile} className="text-sm mb-3" />
          {fileName && (
            <p className="text-sm text-slate mb-3">
              {rows.length} valid row(s) parsed from <strong>{fileName}</strong>.
            </p>
          )}
          {error && <p className="text-ledger-red text-sm mb-3">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={submit}
              disabled={loading || rows.length === 0}
              className="rounded-lg bg-ink text-paper px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              {loading ? "Importing…" : `Import ${rows.length || ""} students`}
            </button>
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg border border-line px-4 py-2 text-sm font-medium"
            >
              Close
            </button>
          </div>
        </>
      )}

      {results && (
        <>
          <p className="font-mono text-xs uppercase tracking-wider text-brass-dark">
            Import complete — save these credentials now
          </p>
          <p className="mt-1 text-sm text-slate">
            {created.length} created, {skipped.length} skipped (duplicate emails). Passwords are
            only shown here once — download the CSV to keep them, or copy them individually below.
          </p>
          {created.length > 0 && (
            <div className="mt-3 max-h-64 overflow-y-auto rounded-md border border-line">
              <table className="w-full text-sm">
                <thead className="bg-paper text-left text-slate sticky top-0">
                  <tr>
                    <th className="px-3 py-2 font-mono text-xs uppercase tracking-wider font-medium">Email</th>
                    <th className="px-3 py-2 font-mono text-xs uppercase tracking-wider font-medium">Temp password</th>
                  </tr>
                </thead>
                <tbody>
                  {created.map((r) => (
                    <tr key={r.email} className="border-t border-line">
                      <td className="px-3 py-2 text-ink">{r.email}</td>
                      <td className="px-3 py-2 font-mono text-ink">{r.tempPassword}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="mt-4 flex gap-2">
            {created.length > 0 && (
              <button
                onClick={downloadCredentials}
                className="rounded-md border border-brass/50 px-4 py-2 font-mono text-xs uppercase tracking-wider text-brass-dark"
              >
                Download CSV
              </button>
            )}
            <button
              onClick={() => {
                setOpen(false);
                setRows([]);
                setFileName("");
                setResults(null);
              }}
              className="rounded-md px-4 py-2 font-mono text-xs uppercase tracking-wider text-slate"
            >
              Done
            </button>
          </div>
        </>
      )}
    </div>
  );
}
