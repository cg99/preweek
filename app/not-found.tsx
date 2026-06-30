import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-6">
      <div className="text-6xl mb-4">🔭</div>
      <h1 className="text-xl font-bold text-foreground mb-2">Not found</h1>
      <p className="text-sm text-secondary text-center mb-6 max-w-sm">
        This page is beyond your orbit.
      </p>
      <Link
        href="/"
        className="rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white hover:bg-accent-dark transition"
      >
        Return home
      </Link>
    </div>
  );
}
