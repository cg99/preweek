import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="mx-4 sm:mx-6 pt-6 sm:pt-8 pb-16">
      <Link href="/" className="inline-flex items-center gap-1 text-xs text-secondary hover:text-foreground transition-colors mb-6">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2">
          <path d="M10 2L4 8l6 6" />
        </svg>
        Back
      </Link>

      <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">Privacy Policy</h1>

      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-4 text-sm text-secondary leading-relaxed">
        <p>
          <strong className="text-foreground">Ritual</strong> respects your privacy. This policy explains what data we collect
          and how it is used.
        </p>

        <h2 className="text-foreground font-semibold pt-2">Data Storage</h2>
        <p>
          By default, all your data is stored locally in your browser using localStorage. No data is sent to any server
          unless you choose to sign in.
        </p>

        <h2 className="text-foreground font-semibold pt-2">Account & Sync</h2>
        <p>
          If you create an account via Supabase Auth, your email address and encrypted password are stored by Supabase.
          Your practice data (tasks, goals, habits, reflections) is stored in a Supabase database and associated with your
          account ID. This data is used solely to sync your experience across devices.
        </p>

        <h2 className="text-foreground font-semibold pt-2">Third Parties</h2>
        <p>
          We use Supabase for authentication and database services. Supabase operates under its own privacy and security
          policies. We do not share your data with any other third parties.
        </p>

        <h2 className="text-foreground font-semibold pt-2">Data Deletion</h2>
        <p>
          You can delete all locally stored data at any time via Settings → Reset all data. To delete your account and
          associated cloud data, contact us and we will process the request promptly.
        </p>

        <h2 className="text-foreground font-semibold pt-2">Contact</h2>
        <p>
          For privacy-related inquiries, open an issue on{' '}
          <a href="https://github.com/cg99/preweek/issues" target="_blank" rel="noopener noreferrer"
            className="text-accent hover:text-accent-dark transition-colors underline underline-offset-2">
            GitHub
          </a>.
        </p>

        <p className="text-tertiary text-xs pt-4">Last updated: July 2026</p>
      </div>
    </div>
  );
}
