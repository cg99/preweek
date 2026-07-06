'use client';

import Link from 'next/link';
import { useAppState } from '@/app/hooks/useAppState';
import { DAYS, parseDateKey } from '@/lib/constants';

export default function ArchivePage() {
  const { state } = useAppState();

  if (!state) return null;

  const allTasks = Object.entries(state.tasks).flatMap(([dateKey, tasks]) =>
    tasks.map((t) => ({ ...t, day: DAYS[parseDateKey(dateKey).getDay()] })),
  );
  const pending = allTasks.filter((t) => t.status === 'pending');
  const completed = allTasks.filter((t) => t.status === 'completed');

  return (
    <div className="mx-4 sm:mx-6 pt-6 sm:pt-8 pb-16">
      <Link href="/" className="inline-flex items-center gap-1 text-xs text-secondary hover:text-foreground transition-colors mb-6">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2">
          <path d="M10 2L4 8l6 6" />
        </svg>
        Back
      </Link>

      <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">Archive</h1>

      {allTasks.length === 0 && state.overdue.length === 0 && (
        <div className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-tertiary">
          No tasks yet
        </div>
      )}

      {pending.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-semibold tracking-widest text-secondary uppercase mb-3 px-1">
            Pending · {pending.length}
          </h2>
          <div className="space-y-2">
            {pending.map((t) => (
              <div key={t.id} className="rounded-2xl border border-border bg-card p-3 flex items-center gap-3">
                <div className="h-5 w-5 flex-shrink-0 rounded-md border-2 border-border" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-foreground truncate">{t.text}</div>
                  <div className="text-xs text-tertiary">{t.day}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {state.overdue.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-semibold tracking-widest text-secondary uppercase mb-3 px-1">
            Overdue · {state.overdue.length}
          </h2>
          <div className="space-y-2">
            {state.overdue.map((o) => (
              <div key={o.id} className="rounded-2xl border border-border bg-card p-3 flex items-center gap-3 opacity-70">
                <div className="h-5 w-5 flex-shrink-0 rounded-md border-2 border-border" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-foreground truncate">{o.text}</div>
                  <div className="text-xs text-tertiary">From {o.from}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {completed.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold tracking-widest text-secondary uppercase mb-3 px-1">
            Honored · {completed.length}
          </h2>
          <div className="space-y-2">
            {completed.map((t) => (
              <div key={t.id} className="rounded-2xl border border-border-dim bg-card/50 p-3 flex items-center gap-3 opacity-60">
                <div className="h-5 w-5 flex-shrink-0 rounded-md border-2 border-success bg-success flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="2.5">
                    <path d="M2 6l3 3 5-5" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-tertiary line-through truncate">{t.text}</div>
                  <div className="text-xs text-tertiary">{t.day}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
