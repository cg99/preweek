export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface">
      <div className="text-center">
        <div className="text-4xl mb-4 animate-pulse">⟳</div>
        <p className="text-sm text-secondary">Preparing your practice…</p>
      </div>
    </div>
  );
}
