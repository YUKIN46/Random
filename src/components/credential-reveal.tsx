"use client";

import { useState } from "react";

export default function CredentialReveal({
  email,
  password,
  onDismiss,
}: {
  email: string;
  password: string;
  onDismiss: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(`Email: ${email}\nTemporary password: ${password}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (e.g. non-HTTPS) — the values are still
      // shown on screen for manual copy.
    }
  }

  return (
    <div className="rounded-lg border border-brass/40 bg-brass/5 p-4">
      <p className="font-mono text-xs uppercase tracking-wider text-brass-dark">
        Account created — share these credentials
      </p>
      <p className="mt-2 text-sm text-ink">
        <span className="text-slate">Email:</span> {email}
      </p>
      <p className="mt-0.5 font-mono text-sm text-ink">
        <span className="font-sans text-slate">Password:</span> {password}
      </p>
      <p className="mt-2 text-xs text-slate">
        This password is only shown once — email sending isn&apos;t set up yet,
        so share it with them directly. They can change it after logging in.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={copy}
          className="rounded-md border border-brass/50 px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-brass-dark"
        >
          {copied ? "Copied" : "Copy"}
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-md px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-slate"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
