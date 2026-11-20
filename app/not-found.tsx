import Link from "next/link"

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-start justify-center gap-4 px-6 py-24">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">// OPENBOX DOCS</p>
      <h1 className="text-3xl font-bold tracking-tight">Page not found</h1>
      <p className="text-muted-foreground">
        The requested OpenBoxGL documentation page does not exist. Use the links below to continue.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link className="rounded-lg border border-border px-4 py-2 text-sm hover:border-primary/40" href="/">
          Home
        </Link>
        <Link className="rounded-lg border border-border px-4 py-2 text-sm hover:border-primary/40" href="/install/">
          Installation
        </Link>
        <Link className="rounded-lg border border-border px-4 py-2 text-sm hover:border-primary/40" href="/getting-started/">
          Getting started
        </Link>
      </div>
    </main>
  )
}
