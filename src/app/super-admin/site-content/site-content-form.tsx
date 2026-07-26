"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Fields = {
  siteName: string;
  heroEyebrow: string;
  heroHeadline: string;
  heroSubhead: string;
  ctaLabel: string;
  supportEmail: string;
};

export default function SiteContentForm({ initial }: { initial: Fields }) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);
    const res = await fetch("/api/platform-settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to save.");
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Site name" value={form.siteName} onChange={(v) => setForm({ ...form, siteName: v })} />
      <Field label="Hero eyebrow" value={form.heroEyebrow} onChange={(v) => setForm({ ...form, heroEyebrow: v })} />
      <Field label="Hero headline" value={form.heroHeadline} onChange={(v) => setForm({ ...form, heroHeadline: v })} />
      <label className="block">
        <span className="font-mono text-xs uppercase tracking-wider text-slate">Hero subhead</span>
        <textarea
          required
          rows={3}
          value={form.heroSubhead}
          onChange={(e) => setForm({ ...form, heroSubhead: e.target.value })}
          className="mt-1.5 w-full rounded-md border border-line bg-paper-raised px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brass/50"
        />
      </label>
      <Field label="Primary button label" value={form.ctaLabel} onChange={(v) => setForm({ ...form, ctaLabel: v })} />
      <Field label="Support email (optional)" type="email" value={form.supportEmail} onChange={(v) => setForm({ ...form, supportEmail: v })} required={false} />
      {error && <p className="text-ledger-red text-sm">{error}</p>}
      {saved && <p className="text-chalk text-sm">Saved — the homepage is updated.</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-ink px-5 py-2.5 font-mono text-xs uppercase tracking-wider text-paper transition-colors hover:bg-ink-soft disabled:opacity-50"
      >
        {loading ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = true,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="font-mono text-xs uppercase tracking-wider text-slate">{label}</span>
      <input
        required={required}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-md border border-line bg-paper-raised px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brass/50"
      />
    </label>
  );
}
