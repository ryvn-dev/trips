import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold tracking-tight">404</h1>
      <p className="mt-3 text-lg text-ink-light">
        This trip doesn&apos;t exist yet.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-vermillion hover:underline"
      >
        Back to all trips
      </Link>
    </main>
  );
}
