"use client";

import { useState } from "react";
import Link from "next/link";

export default function ApplyPage() {
  const [form, setForm] = useState({
    schoolName: "",
    slug: "",
    contactEmail: "",
    adminName: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/orgs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Something went wrong.");
        return;
      }
      setDone(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      <header className="border-b border-line px-5 py-4 sm:px-8">
        <Link href="/" className="font-display text-lg font-semibold text-ink">
          Ledger<span className="text-brass">.</span>
        </Link>
      </header>

      {done ? (
        <main className="flex-1 flex items-center justify-center px-5 py-16 sm:px-8">
          <div className="max-w-md text-center">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-brass">
              Application received
            </p>
            <h1 className="mt-3 font-display text-3xl font-semibold text-ink">
              Sent for review.
            </h1>
            <p className="mt-4 text-slate leading-relaxed">
              You&apos;ll hear back at <strong className="text-ink">{form.contactEmail}</strong> once
              it&apos;s approved, and{" "}
              <strong className="text-ink">
                {form.slug}.{process.env.NEXT_PUBLIC_APP_DOMAIN}
              </strong>{" "}
              goes live.
            </p>
            <Link
              href="/"
              className="mt-8 inline-block rounded-md border border-ink/20 px-5 py-2.5 font-mono text-xs uppercase tracking-wider text-ink hover:border-ink/40"
            >
              Back home
            </Link>
          </div>
        </main>
      ) : (
        <main className="flex-1 mx-auto w-full max-w-md px-5 py-14 sm:px-8 sm:py-20">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-brass">
            Form 24-B · School Registration
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold text-ink">
            Register your school
          </h1>
          <p className="mt-3 text-slate leading-relaxed">
            A platform admin reviews every application before a school goes live.
          </p>
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <Field
              label="School name"
              value={form.schoolName}
              onChange={(v) => setForm({ ...form, schoolName: v })}
            />
            <div>
              <Field
                label="Subdomain"
                value={form.slug}
                onChange={(v) => setForm({ ...form, slug: v.toLowerCase() })}
                placeholder="greenwood"
              />
              {form.slug && (
                <p className="mt-1.5 font-mono text-xs text-slate">
                  {form.slug}.{process.env.NEXT_PUBLIC_APP_DOMAIN || "yourapp.com"}
                </p>
              )}
            </div>
            <Field
              label="Admin full name"
              value={form.adminName}
              onChange={(v) => setForm({ ...form, adminName: v })}
            />
            <Field
              label="Admin email"
              type="email"
              value={form.contactEmail}
              onChange={(v) => setForm({ ...form, contactEmail: v })}
            />
            <Field
              label="Password"
              type="password"
              value={form.password}
              onChange={(v) => setForm({ ...form, password: v })}
            />
            {error && <p className="text-ledger-red text-sm">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-md bg-brass py-3 font-mono text-sm uppercase tracking-wider text-paper transition-colors hover:bg-brass-dark disabled:opacity-50"
            >
              {submitting ? "Submitting…" : "Submit application"}
            </button>
          </form>
        </main>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="font-mono text-xs uppercase tracking-wider text-slate">{label}</span>
      <input
        required
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-md border border-line bg-paper-raised px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brass/50"
      />
    </label>
  );
}
