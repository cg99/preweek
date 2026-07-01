import Link from 'next/link';

export default function GuidePage() {
  return (
    <div className="mx-4 sm:mx-6 pt-6 sm:pt-8 pb-16">
      <Link href="/" className="inline-flex items-center gap-1 text-xs text-secondary hover:text-foreground transition-colors mb-6">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2">
          <path d="M10 2L4 8l6 6" />
        </svg>
        Back
      </Link>

      <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">Guide</h1>

      <div className="space-y-4">
        <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Weekly Intentions</h2>
          <p className="text-sm text-secondary leading-relaxed">
            Each day of the week, set an intention — a small commitment you want to honor. Check it off when done.
            Past days with unfinished intentions stay visible so you can still complete them.
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Aspirations</h2>
          <p className="text-sm text-secondary leading-relaxed">
            Long-term goals with milestones. Track your progress by breaking big aspirations into smaller,
            achievable steps. Enable in Settings.
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Practices</h2>
          <p className="text-sm text-secondary leading-relaxed">
            Daily habits you want to build. Log them each day and watch your streaks grow.
            Enable in Settings.
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Reflections</h2>
          <p className="text-sm text-secondary leading-relaxed">
            Once per week, reflect on what went well, what to improve, your biggest win, and your focus for the
            next cycle. Enable in Settings.
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Data & Sync</h2>
          <p className="text-sm text-secondary leading-relaxed">
            Everything is saved automatically in your browser. Sign in with an email and password to sync
            across devices via Supabase. You can export your data or reset it at any time in Settings.
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Tips</h2>
          <ul className="text-sm text-secondary space-y-2 list-disc list-inside">
            <li>Click the day number to set an intention for that day</li>
            <li>Click the checkbox to mark an intention as honored</li>
            <li>Use the ↻ button to move an intention to another day</li>
            <li>Toggle section visibility in Settings</li>
            <li>Sign in to sync data across devices</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
