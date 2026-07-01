import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className="mx-4 sm:mx-6 pt-6 sm:pt-8 pb-16">
      <Link href="/" className="inline-flex items-center gap-1 text-xs text-secondary hover:text-foreground transition-colors mb-6">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2">
          <path d="M10 2L4 8l6 6" />
        </svg>
        Back
      </Link>

      <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">Contact</h1>

      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-4 text-sm text-secondary leading-relaxed">
        <p>
          Have feedback, a bug report, or a feature request? We&apos;d love to hear from you.
        </p>
        <p>
          Open an issue on{' '}
          <a href="https://github.com/cg99/preweek/issues" target="_blank" rel="noopener noreferrer"
            className="text-accent hover:text-accent-dark transition-colors underline underline-offset-2">
            GitHub
          </a>{' '}
          or reach out directly.
        </p>
      </div>
    </div>
  );
}
