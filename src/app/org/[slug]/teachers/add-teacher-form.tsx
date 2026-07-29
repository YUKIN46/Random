"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CredentialReveal from "@/components/credential-reveal";

export default function AddTeacherForm({ slug }: { slug: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", employeeCode: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<{ email: string; tempPassword: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/teachers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, slug }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Failed to add teacher.");
      return;
    }
    setCreated({ email: data.email, tempPassword: data.tempPassword });
    setForm({ name: "", email: "", employeeCode: "" });
    setOpen(false);
    router.refresh();
  }

  if (created) {
    return (
      <CredentialReveal
        email={created.email}
        password={created.tempPassword}
        onDismiss={() => setCreated(null)}
      />
    );
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="rounded-lg bg-ink text-paper px-4 py-2 text-sm font-medium">
        + Add teacher
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="bg-paper-raised border border-line rounded-xl p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
      <input required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-lg border border-line px-3 py-2 text-sm" />
      <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-lg border border-line px-3 py-2 text-sm" />
      <input placeholder="Employee code" value={form.employeeCode} onChange={(e) => setForm({ ...form, employeeCode: e.target.value })} className="rounded-lg border border-line px-3 py-2 text-sm" />
      {error && <p className="col-span-3 text-ledger-red text-sm">{error}</p>}
      <div className="col-span-3 flex gap-2">
        <button type="submit" disabled={loading} className="rounded-lg bg-ink text-paper px-4 py-2 text-sm font-medium disabled:opacity-50">
          {loading ? "Saving…" : "Save"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-line px-4 py-2 text-sm font-medium">
          Cancel
        </button>
      </div>
    </form>
  );
}
