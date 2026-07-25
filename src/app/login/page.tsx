"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Derive org slug from the current hostname (e.g. greenwood.schoolms.io)
    const host = window.location.hostname;
    const appDomain = (process.env.NEXT_PUBLIC_APP_DOMAIN || "localhost").split(":")[0];
    const orgSlug = host !== appDomain && host.endsWith(`.${appDomain}`)
      ? host.replace(`.${appDomain}`, "")
      : undefined;

    const res = await signIn("credentials", {
      email,
      password,
      orgSlug,
      redirect: false,
    });

    setLoading(false);
    if (res?.error) {
      setError("Invalid credentials, or your school isn't approved yet.");
      return;
    }
    router.push(orgSlug ? `/dashboard` : `/super-admin/pending`);
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-sm py-24 px-6">
      <h1 className="text-2xl font-semibold mb-6">Log in</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-neutral-700">Email</span>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-neutral-700">Password</span>
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
        </label>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-neutral-900 text-white py-2.5 font-medium disabled:opacity-50"
        >
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>
      <p className="text-sm text-neutral-500 mt-6">
        New school?{" "}
        <a href="/apply" className="underline">
          Apply here
        </a>
        .
      </p>
    </main>
  );
}
