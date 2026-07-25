"use client";

import { useState } from "react";

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

  if (done) {
    return (
      <main className="mx-auto max-w-md py-24 px-6 text-center">
        <h1 className="text-2xl font-semibold mb-2">Application submitted</h1>
        <p className="text-neutral-600">
          Thanks! Your school&apos;s application is pending review. You&apos;ll get an
          email at <strong>{form.contactEmail}</strong> once it&apos;s approved and{" "}
          <strong>{form.slug}.{process.env.NEXT_PUBLIC_APP_DOMAIN}</strong> goes live.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md py-16 px-6">
      <h1 className="text-2xl font-semibold mb-1">Register your school</h1>
      <p className="text-neutral-600 mb-8">
        Submit your details below. A platform admin will review and approve your
        organization before you can log in.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
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
            <p className="text-xs text-neutral-500 mt-1">
              Your school will be reachable at{" "}
              <strong>
                {form.slug}.{process.env.NEXT_PUBLIC_APP_DOMAIN || "yourapp.com"}
              </strong>
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
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-neutral-900 text-white py-2.5 font-medium disabled:opacity-50"
        >
          {submitting ? "Submitting…" : "Submit application"}
        </button>
      </form>
    </main>
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
      <span className="text-sm font-medium text-neutral-700">{label}</span>
      <input
        required
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
      />
    </label>
  );
}
