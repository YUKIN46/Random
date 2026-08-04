"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CredentialReveal from "@/components/credential-reveal";

type Guardian = { id: string; name: string; email: string; relationship: string };

export default function GuardiansSection({
  slug,
  studentId,
  guardians,
}: {
  slug: string;
  studentId: string;
  guardians: Guardian[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", relationship: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<{ email: string; tempPassword: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/students/${studentId}/guardians`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, slug }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Failed to add guardian.");
      return;
    }
    if (data.tempPassword) {
      setCreated({ email: data.email, tempPassword: data.tempPassword });
    }
    setForm({ name: "", email: "", relationship: "" });
    setOpen(false);
    router.refresh();
  }

  async function unlink(guardianId: string) {
    if (!confirm("Remove this guardian from the student's record?")) return;
    await fetch(`/api/students/${studentId}/guardians/${guardianId}?slug=${encodeURIComponent(slug)}`, {
      method: "DELETE",
    });
    router.refresh();
  }

  return (
    <div>
      {created && (
        <div className="mb-3">
          <CredentialReveal
            email={created.email}
            password={created.tempPassword}
            onDismiss={() => setCreated(null)}
          />
        </div>
      )}

      <div className="rounded-lg border border-line bg-paper-raised overflow-hidden">
        <table className="w-full text-sm">
          <tbody>
            {guardians.map((g) => (
              <tr key={g.id} className="border-t border-line first:border-t-0">
                <td className="px-4 py-2 text-ink">{g.name}</td>
                <td className="px-4 py-2 text-slate">{g.relationship || "—"}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => unlink(g.id)}
                    className="font-mono text-xs uppercase tracking-wider text-ledger-red"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {guardians.length === 0 && (
              <tr><td colSpan={3} className="px-4 py-4 text-center text-slate">No guardians linked yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {open ? (
        <form onSubmit={submit} className="mt-3 space-y-2 rounded-lg border border-line bg-paper-raised p-4">
          <input
            required
            placeholder="Guardian full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-md border border-line px-3 py-2 text-sm"
          />
          <input
            required
            type="email"
            placeholder="Email (their login)"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-md border border-line px-3 py-2 text-sm"
          />
          <input
            placeholder="Relationship (e.g. Mother)"
            value={form.relationship}
            onChange={(e) => setForm({ ...form, relationship: e.target.value })}
            className="w-full rounded-md border border-line px-3 py-2 text-sm"
          />
          {error && <p className="text-ledger-red text-sm">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={loading} className="rounded-md bg-ink px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-paper disabled:opacity-50">
              {loading ? "Saving…" : "Add guardian"}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="rounded-md border border-line px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-ink">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="mt-3 font-mono text-xs uppercase tracking-wider text-ink underline underline-offset-2"
        >
          + Add guardian
        </button>
      )}
    </div>
  );
}
