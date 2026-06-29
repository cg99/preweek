'use client';

import { useAppState } from '@/app/hooks/useAppState';
import { useWeekDates } from '@/app/hooks/useWeekDates';
import { useToast } from '@/app/components/shared/Toast';
import { useState, useEffect } from 'react';

export function ReflectionScreen() {
  const { state, setState } = useAppState();
  const { weekDates } = useWeekDates();
  const { show: showToast, ToastComponent } = useToast();

  const [well, setWell] = useState('');
  const [improve, setImprove] = useState('');
  const [win, setWin] = useState('');
  const [focus, setFocus] = useState('');

  if (!state) {
    return <div className="px-6 py-6">Loading...</div>;
  }

  const handleSave = () => {
    if (!well && !improve && !win && !focus) {
      showToast('Write something first');
      return;
    }

    const start = weekDates[0];
    const end = weekDates[6];
    const weekLabel =
      start.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) +
      '–' +
      end.toLocaleDateString('en-US', { day: 'numeric', year: 'numeric' });

    const newState = JSON.parse(JSON.stringify(state));
    newState.reflections.unshift({ week: weekLabel, well, improve, win, focus });
    setState(newState);

    setWell('');
    setImprove('');
    setWin('');
    setFocus('');
    showToast('Reflection saved');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="px-6 pt-8 pb-4">
        <div className="text-xs font-semibold tracking-widest text-secondary uppercase mb-2">
          Weekly reflection
        </div>
        <div className="text-3xl font-bold text-foreground">
          Look back, look ahead
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-white p-5">
            <div className="text-xs font-semibold tracking-widest text-secondary uppercase mb-3">
              ✦ What went well?
            </div>
            <textarea
              value={well}
              onChange={(e) => setWell(e.target.value)}
              placeholder="Celebrate your wins..."
              className="w-full min-h-[80px] resize-none rounded-xl bg-muted p-3 text-sm text-foreground outline-none focus:bg-accent-light leading-relaxed"
            />
          </div>

          <div className="rounded-2xl border border-border bg-white p-5">
            <div className="text-xs font-semibold tracking-widest text-secondary uppercase mb-3">
              ✦ What could improve?
            </div>
            <textarea
              value={improve}
              onChange={(e) => setImprove(e.target.value)}
              placeholder="Be honest, be kind to yourself..."
              className="w-full min-h-[80px] resize-none rounded-xl bg-muted p-3 text-sm text-foreground outline-none focus:bg-accent-light leading-relaxed"
            />
          </div>

          <div className="rounded-2xl border border-border bg-white p-5">
            <div className="text-xs font-semibold tracking-widest text-secondary uppercase mb-3">
              ★ Biggest win this week?
            </div>
            <textarea
              value={win}
              onChange={(e) => setWin(e.target.value)}
              placeholder="Your proudest moment..."
              className="w-full min-h-[80px] resize-none rounded-xl bg-muted p-3 text-sm text-foreground outline-none focus:bg-accent-light leading-relaxed"
            />
          </div>

          <div className="rounded-2xl border border-border bg-white p-5">
            <div className="text-xs font-semibold tracking-widest text-secondary uppercase mb-3">
              → Focus for next week?
            </div>
            <textarea
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              placeholder="One thing to commit to..."
              className="w-full min-h-[80px] resize-none rounded-xl bg-muted p-3 text-sm text-foreground outline-none focus:bg-accent-light leading-relaxed"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          className="mt-4 w-full rounded-xl bg-accent py-4 text-sm font-semibold text-white hover:bg-accent-dark transition"
        >
          Save this week's reflection
        </button>

        {state.reflections.length > 0 && (
          <div className="mt-8">
            <div className="text-xs font-semibold tracking-widest text-secondary uppercase mb-3">
              Previous weeks
            </div>
            <div className="space-y-3">
              {state.reflections.map((r, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-border bg-white p-5"
                >
                  <div className="text-xs font-semibold tracking-widest text-secondary uppercase mb-3">
                    {r.week}
                  </div>
                  <div className="space-y-3 text-sm text-foreground">
                    <div>
                      <span className="text-xs font-semibold tracking-widest text-secondary uppercase block mb-1">
                        What went well
                      </span>
                      {r.well}
                    </div>
                    <div>
                      <span className="text-xs font-semibold tracking-widest text-secondary uppercase block mb-1">
                        Could improve
                      </span>
                      {r.improve}
                    </div>
                    <div>
                      <span className="text-xs font-semibold tracking-widest text-secondary uppercase block mb-1">
                        Biggest win
                      </span>
                      {r.win}
                    </div>
                    <div>
                      <span className="text-xs font-semibold tracking-widest text-secondary uppercase block mb-1">
                        Next focus
                      </span>
                      {r.focus}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <ToastComponent />
    </div>
  );
}
