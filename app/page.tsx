'use client';

import { useState, useEffect } from 'react';
import { useAppState } from '@/app/hooks/useAppState';
import { Modal } from '@/app/components/Modal';
import { useToast, ToastDisplay } from '@/app/components/Toast';
import { DEFAULT_APP_STATE } from '@/lib/appState';
import { QuickLog } from '@/app/components/QuickLog';
import { WeekScreen } from '@/app/week/WeekScreen';
import { GoalsScreen } from '@/app/goals/GoalsScreen';
import { HabitsScreen } from '@/app/habits/HabitsScreen';
import { ReflectionScreen } from '@/app/reflection/ReflectionScreen';

const ToggleSwitch = ({ on, onClick }: { on: boolean; onClick: () => void }) => (
  <div
    onClick={onClick}
    className={`relative h-6 w-10 shrink-0 rounded-full transition-colors cursor-pointer ${
      on ? 'bg-accent' : 'bg-border'
    }`}
  >
    <div
      className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-card shadow-sm transition-transform ${
        on ? 'translate-x-4' : 'translate-x-0'
      }`}
    />
  </div>
);

export default function Home() {
  const { state, setState, session, signIn, signUp, signOut, resetPassword } = useAppState();
  const [showSettings, setShowSettings] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const { show: showToast, toast, close } = useToast();
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [showInsights, setShowInsights] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', state?.settings.theme === 'dark');
    for (const t of ['theme-sage', 'theme-sky', 'theme-rose', 'theme-slate']) {
      root.classList.toggle(t, state?.settings.colorTheme === t.replace('theme-', ''));
    }
  }, [state?.settings.theme, state?.settings.colorTheme]);

  if (!state) return null;

  const { settings } = state;

  const toggle = (key: 'showAspirations' | 'showPractices' | 'showReflections' | 'theme' | 'colorTheme', value?: string) => {
    const newVal = key === 'theme' ? (settings.theme === 'light' ? 'dark' : 'light') : key === 'colorTheme' ? value : !(settings as Record<string, unknown>)[key];
    setState({ ...state, settings: { ...settings, [key]: newVal } });
  };

  const handleAuth = async () => {
    setAuthError('');
    setAuthLoading(true);
    const fn = authMode === 'signin' ? signIn : signUp;
    const error = await fn(authEmail, authPassword);
    setAuthLoading(false);
    if (error) {
      setAuthError(error);
    } else {
      setAuthEmail('');
      setAuthPassword('');
      setAuthError('');
      showToast(authMode === 'signin' ? 'Signed in' : 'Account created');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    showToast('Signed out');
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ritual-data.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data exported');
  };

  const handlePasswordReset = async () => {
    setAuthError('');
    const error = await resetPassword(authEmail);
    if (error) {
      setAuthError(error);
    } else {
      setResetSent(true);
      showToast('Reset link sent');
    }
  };

  const handleConfirmReset = () => {
    setState(structuredClone(DEFAULT_APP_STATE));
    setShowResetConfirm(false);
    setShowSettings(false);
    showToast('Data reset');
  };

  return (
    <div className="min-h-screen relative">
      {/* Settings Gear */}
      <button
        onClick={() => setShowSettings(true)}
        className="fixed top-4 right-4 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-card/60 backdrop-blur-sm text-tertiary hover:text-foreground hover:bg-card border border-border transition-all"
        title="Settings"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5">
          <circle cx="8" cy="8" r="2.5" />
          <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" />
        </svg>
      </button>

      <QuickLog />
      <WeekScreen />

      {settings.showAspirations && (
        <>
          <div className="mx-4 sm:mx-6 border-t border-border-dim" />
          <GoalsScreen />
        </>
      )}

      {settings.showPractices && (
        <>
          <div className="mx-4 sm:mx-6 border-t border-border-dim" />
          <HabitsScreen />
        </>
      )}

      {settings.showReflections && (
        <>
          <div className="mx-4 sm:mx-6 border-t border-border-dim" />
          <ReflectionScreen />
        </>
      )}

      {/* Settings Modal */}
      <Modal isOpen={showSettings} title="Settings" onClose={() => setShowSettings(false)}>
        <div className="space-y-4">
          <label className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 cursor-pointer hover:bg-muted transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-xl">{settings.theme === 'dark' ? '🌙' : '☀️'}</span>
              <div>
                <div className="text-sm font-medium text-foreground">Dark theme</div>
                <div className="text-xs text-secondary">Switch between light and dark</div>
              </div>
            </div>
            <ToggleSwitch on={settings.theme === 'dark'} onClick={() => toggle('theme')} />
          </label>

          <label className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <span className="text-xl">🎨</span>
              <div>
                <div className="text-sm font-medium text-foreground">Accent color</div>
                <div className="text-xs text-secondary">Pick a theme shade</div>
              </div>
            </div>
            <div className="flex gap-1.5">
              {(['warm', 'sage', 'sky', 'rose', 'slate'] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => toggle('colorTheme', c)}
                  className={`h-6 w-6 rounded-full transition-transform hover:scale-110 ${
                    settings.colorTheme === c ? 'ring-2 ring-foreground ring-offset-2 ring-offset-card' : ''
                  }`}
                  style={{
                    backgroundColor: c === 'warm' ? '#C4956A' : c === 'sage' ? '#7D9B76' : c === 'sky' ? '#6B9AC4' : c === 'rose' ? '#C46B8A' : '#8A8A9E',
                  }}
                  title={c.charAt(0).toUpperCase() + c.slice(1)}
                />
              ))}
            </div>
          </label>

          <div className="border-t border-border-dim pt-4">
            <div className="text-xs font-semibold tracking-widest text-secondary uppercase mb-4 px-1">
              Visible sections
            </div>
            <div className="space-y-3">
              {([
                { key: 'showAspirations' as const, label: 'Aspirations', icon: '🌟', desc: 'Long-term goals and milestones' },
                { key: 'showPractices' as const, label: 'Practices', icon: '🌿', desc: 'Daily habit tracking' },
                { key: 'showReflections' as const, label: 'Reflections', icon: '🪷', desc: 'Weekly reflection journal' },
              ]).map(({ key, label, icon, desc }) => (
                <label
                  key={key}
                  className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 cursor-pointer hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{icon}</span>
                    <div>
                      <div className="text-sm font-medium text-foreground">{label}</div>
                      <div className="text-xs text-secondary">{desc}</div>
                    </div>
                  </div>
                  <ToggleSwitch on={settings[key]} onClick={() => toggle(key)} />
                </label>
              ))}
            </div>
          </div>

          <div className="border-t border-border-dim pt-4 space-y-3">
            {session ? (
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="text-xs text-secondary mb-1">Signed in as</div>
                <div className="text-sm font-medium text-foreground mb-3 truncate">{session.user.email || session.user.id.slice(0, 8)}</div>
                <button
                  onClick={handleSignOut}
                  className="w-full rounded-xl border border-border bg-surface py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  Sign out
                </button>
              </div>
            ) : resetSent ? (
                <div className="rounded-2xl border border-border bg-card p-4 text-center">
                  <p className="text-sm text-secondary leading-relaxed">Check your email for the password reset link.</p>
                  <button
                    type="button"
                    onClick={() => setResetSent(false)}
                    className="mt-3 text-xs text-accent hover:text-accent-dark transition-colors"
                  >
                    Back to sign in
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => { e.preventDefault(); handleAuth(); }}
                  className="rounded-2xl border border-border bg-card p-4 space-y-3"
                >
                  <div className="text-xs font-semibold tracking-widest text-secondary uppercase">
                    {authMode === 'signin' ? 'Sign in to sync' : 'Create an account'}
                  </div>
                  <input
                    type="email"
                    placeholder="Email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    required
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-tertiary outline-none focus:border-accent"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    required
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-tertiary outline-none focus:border-accent"
                  />
                  {authError && <p className="text-xs text-danger">{authError}</p>}
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full rounded-xl bg-accent py-2.5 text-sm font-medium text-white hover:bg-accent-dark transition-colors disabled:opacity-50"
                  >
                    {authLoading ? '...' : authMode === 'signin' ? 'Sign in' : 'Create account'}
                  </button>
                  <div className="flex justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => { setAuthMode(authMode === 'signin' ? 'signup' : 'signin'); setAuthError(''); }}
                      className="text-secondary hover:text-foreground transition-colors"
                    >
                      {authMode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                    </button>
                    {authMode === 'signin' && (
                      <button
                        type="button"
                        onClick={handlePasswordReset}
                        className="text-accent hover:text-accent-dark transition-colors"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                </form>
              )}
          </div>

          <div className="border-t border-border-dim pt-4 space-y-3">
            <button
              onClick={() => { setShowSettings(false); setShowInsights(true); }}
              className="w-full rounded-2xl border border-border bg-card p-4 text-sm font-medium text-foreground hover:bg-muted transition-colors text-center"
            >
              Insights
            </button>
            <button
              onClick={handleExport}
              className="w-full rounded-2xl border border-border bg-card p-4 text-sm font-medium text-foreground hover:bg-muted transition-colors text-center"
            >
              Export data
            </button>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full rounded-2xl border border-border bg-card p-4 text-sm font-medium text-danger hover:bg-muted transition-colors text-center"
            >
              Reset all data
            </button>
          </div>
        </div>
      </Modal>

      {/* Insights Modal */}
      <Modal isOpen={showInsights} title="Insights" onClose={() => setShowInsights(false)}>
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="text-xs font-semibold tracking-widest text-secondary uppercase mb-3">Tasks this week</div>
            <div className="text-2xl font-bold text-foreground">
              {(() => {
                const allTasks = Object.values(state.tasks).flat();
                const total = allTasks.length;
                const done = allTasks.filter((t) => t.status === 'completed').length;
                return total > 0 ? `${Math.round((done / total) * 100)}%` : '—';
              })()}
            </div>
            <div className="text-xs text-secondary mt-1">
              {Object.values(state.tasks).flat().filter((t) => t.status === 'completed').length} of {Object.values(state.tasks).flat().length} intentions honored
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="text-xs font-semibold tracking-widest text-secondary uppercase mb-3">Goals</div>
            {state.goals.length > 0 ? (
              <>
                <div className="text-2xl font-bold text-foreground">
                  {Math.round(state.goals.reduce((s, g) => s + g.progress, 0) / state.goals.length)}%
                </div>
                <div className="text-xs text-secondary mt-1">
                  {state.goals.length} goals · {state.goals.reduce((s, g) => s + g.milestones.filter((m) => m.done).length, 0)} of {state.goals.reduce((s, g) => s + g.milestones.length, 0)} milestones complete
                </div>
              </>
            ) : (
              <div className="text-sm text-tertiary">No goals yet</div>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="text-xs font-semibold tracking-widest text-secondary uppercase mb-3">Habits</div>
            {state.habits.length > 0 ? (
              <>
                <div className="text-2xl font-bold text-foreground">
                  {Math.max(...state.habits.map((h) => h.streak), 0)} days
                </div>
                <div className="text-xs text-secondary mt-1">
                  Best streak across {state.habits.length} habits
                </div>
                <div className="mt-3 space-y-2">
                  {state.habits.slice(0, 5).map((h) => (
                    <div key={h.id} className="flex items-center justify-between text-sm">
                      <span className="text-foreground">{h.icon} {h.name}</span>
                      <span className="text-secondary">{h.streak} day streak</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-sm text-tertiary">No habits yet</div>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="text-xs font-semibold tracking-widest text-secondary uppercase mb-3">Reflections</div>
            <div className="text-2xl font-bold text-foreground">{state.reflections.length}</div>
            <div className="text-xs text-secondary mt-1">Total entries</div>
          </div>
        </div>
      </Modal>

      {/* Reset Confirmation */}
      <Modal isOpen={showResetConfirm} title="Reset all data?" onClose={() => setShowResetConfirm(false)}>
        <div className="space-y-4">
          <p className="text-sm text-secondary leading-relaxed">
            This will erase all your intentions, aspirations, practices, and reflections. This cannot be undone.
          </p>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowResetConfirm(false)}
              className="flex-1 rounded-xl border border-border bg-card py-3 font-medium text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmReset}
              className="flex-1 rounded-xl bg-danger py-3 font-medium text-white hover:bg-red-700 transition-colors"
            >
              Reset everything
            </button>
          </div>
        </div>
      </Modal>

      <ToastDisplay toast={toast} onClose={close} />
    </div>
  );
}
