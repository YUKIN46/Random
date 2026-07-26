"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
    <div className="flex-1 flex flex-col">
      <header className="border-b border-line px-5 py-4 sm:px-8">
        <Link href="/" className="font-display text-lg font-semibold text-ink">
          Ledger<span className="text-brass">.</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-5 py-14 sm:px-8">
        <div className="w-full max-w-sm">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-brass">Sign in</p>
          <h1 className="mt-3 font-display text-3xl font-semibold text-ink">Log in</h1>
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <label className="block">
              <span className="font-mono text-xs uppercase tracking-wider text-slate">Email</span>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-line bg-paper-raised px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brass/50"
              />
            </label>
            <label className="block">
              <span className="font-mono text-xs uppercase tracking-wider text-slate">Password</span>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-line bg-paper-raised px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brass/50"
              />
            </label>
            {error && <p className="text-ledger-red text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-ink py-3 font-mono text-sm uppercase tracking-wider text-paper transition-colors hover:bg-ink-soft disabled:opacity-50"
            >
              {loading ? "Logging in…" : "Log in"}
            </button>
          </form>
          <p className="mt-6 text-sm text-slate">
            New school?{" "}
            <Link href="/apply" className="text-ink underline underline-offset-2">
              Register here
            </Link>
            .
          </p>
        </div>
      </main>
    </div>
  );
}
