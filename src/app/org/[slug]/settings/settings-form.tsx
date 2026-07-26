"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Initial = {
  name: string;
  logoUrl: string;
  address: string;
  phone: string;
  timezone: string;
};

const TIMEZONES: string[] =
  typeof Intl !== "undefined" && "supportedValuesOf" in Intl
    ? Intl.supportedValuesOf("timeZone")
    : ["UTC"];

export default function SettingsForm({ slug, initial }: { slug: string; initial: Initial }) {
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
    const res = await fetch("/api/org-settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, slug }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to save settings.");
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium text-neutral-700">School name</span>
        <input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-neutral-700">Logo URL</span>
        <input
          type="url"
          placeholder="https://…"
          value={form.logoUrl}
          onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-neutral-700">Address</span>
        <input
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-neutral-700">Phone</span>
        <input
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-neutral-700">Timezone</span>
        <select
          value={form.timezone}
          onChange={(e) => setForm({ ...form, timezone: e.target.value })}
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        >
          {TIMEZONES.map((tz) => (
            <option key={tz} value={tz}>{tz}</option>
          ))}
        </select>
      </label>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {saved && <p className="text-emerald-700 text-sm">Saved.</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-neutral-900 text-white px-4 py-2 text-sm font-medium disabled:opacity-50"
      >
        {loading ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
