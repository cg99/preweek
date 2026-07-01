import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="mx-4 sm:mx-6 pt-6 sm:pt-8 pb-16">
      <Link href="/" className="inline-flex items-center gap-1 text-xs text-secondary hover:text-foreground transition-colors mb-6">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2">
          <path d="M10 2L4 8l6 6" />
        </svg>
        Back
      </Link>

      <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">About</h1>

      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-4 text-sm text-secondary leading-relaxed">
        <p>
          <strong className="text-foreground">Ritual</strong> is a weekly practice tool designed to help you set intentions,
          nurture long-term aspirations, build daily habits, and reflect on what matters.
        </p>
        <p>
          Everything lives in your browser by default — no account needed. You can optionally sign in
          with Supabase to sync across devices.
        </p>
        <p>
          Inspired by the idea that small, consistent actions compound into meaningful change over time.
          Ritual gives you a quiet space to check in with yourself each week.
        </p>
      </div>
    </div>
  );
}
