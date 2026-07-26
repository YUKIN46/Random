import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center px-5 py-20 sm:px-8">
      <div className="max-w-sm text-center">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-brass">
          Record not found
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-ink">
          Page 404
        </h1>
        <p className="mt-3 text-slate leading-relaxed">
          There&apos;s no entry for this page in the ledger — it may have
          moved, or the link might be off.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-md bg-ink px-5 py-2.5 font-mono text-xs uppercase tracking-wider text-paper hover:bg-ink-soft"
        >
          Back home
        </Link>
      </div>
    </div>
  );
}
