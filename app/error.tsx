'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-6">
      <div className="text-6xl mb-4">🫠</div>
      <h1 className="text-xl font-bold text-foreground mb-2">Something went wrong</h1>
      <p className="text-sm text-secondary text-center mb-6 max-w-sm">
        {error.message || 'An unexpected error occurred.'}
      </p>
      <button
        onClick={reset}
        className="rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white hover:bg-accent-dark transition"
      >
        Try again
      </button>
    </div>
  );
}
