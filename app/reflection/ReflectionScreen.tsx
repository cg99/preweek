'use client';

import { useAppState } from '@/app/hooks/useAppState';
import { useWeekDates } from '@/app/hooks/useWeekDates';
import { useToast, ToastDisplay } from '@/app/components/Toast';
import { Modal } from '@/app/components/Modal';
import { useState } from 'react';

export function ReflectionScreen() {
  const { state, setState } = useAppState();
  const { weekDates } = useWeekDates();
  const { show: showToast, toast, close } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [well, setWell] = useState('');
  const [improve, setImprove] = useState('');
  const [win, setWin] = useState('');
  const [focus, setFocus] = useState('');

  if (!state) {
    return <div className="px-6 py-6">Loading...</div>;
  }

  const start = weekDates[0];
  const end = weekDates[6];
  const currentWeekLabel =
    start.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) +
    '–' +
    end.toLocaleDateString('en-US', { day: 'numeric', year: 'numeric' });

  const hasSubmitted = state.reflections.some((r) => r.week === currentWeekLabel);

  const handleOpen = () => {
    setWell('');
    setImprove('');
    setWin('');
    setFocus('');
    setShowModal(true);
  };

  const handleSave = () => {
    if (!well && !improve && !win && !focus) {
      showToast('Write something first');
      return;
    }

    const newState = structuredClone(state);
    newState.reflections.unshift({ week: currentWeekLabel, well, improve, win, focus });
    setState(newState);

    setWell('');
    setImprove('');
    setWin('');
    setFocus('');
    setShowModal(false);
    showToast('Reflection saved');
  };

  return (
    <section>
      <div className="px-4 sm:px-6 pt-6 sm:pt-8 pb-4">
        <div className="text-xs font-semibold tracking-widest text-secondary uppercase mb-2">
          Weekly reflection
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-foreground">
          Look back, look ahead
        </div>
      </div>

      <div className="px-4 sm:px-6 pb-6 space-y-4">
        {/* Current week status */}
        {hasSubmitted ? (
          <div className="rounded-2xl border border-success bg-success-light p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-success text-white text-sm font-bold">✓</span>
              <div>
                <div className="text-sm font-semibold text-foreground">Reflection recorded</div>
                <div className="text-xs text-secondary mt-0.5">{currentWeekLabel}</div>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={handleOpen}
            className="w-full rounded-2xl border-2 border-dashed border-border bg-card p-5 text-left hover:border-accent transition-colors group"
          >
            <div className="text-xs font-semibold tracking-widest text-secondary uppercase mb-1">
              {currentWeekLabel}
            </div>
            <div className="flex items-center gap-2 text-sm text-secondary group-hover:text-accent transition-colors">
              <span className="text-lg font-light">+</span> Reflect on this week
            </div>
          </button>
        )}

        {/* Previous reflections */}
        {state.reflections.length > 0 && (
          <div>
            <div className="text-xs font-semibold tracking-widest text-secondary uppercase mb-3">
              Past entries
            </div>
            <div className="space-y-3">
              {state.reflections.map((r, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-border bg-card p-5"
                >
                  <div className="text-xs font-semibold tracking-widest text-secondary uppercase mb-3">
                    {r.week}
                  </div>
                  <div className="space-y-3 text-sm text-foreground">
                    {r.well && (
                      <div>
                        <span className="text-xs font-semibold tracking-widest text-secondary uppercase block mb-1">What went well</span>
                        {r.well}
                      </div>
                    )}
                    {r.improve && (
                      <div>
                        <span className="text-xs font-semibold tracking-widest text-secondary uppercase block mb-1">Could improve</span>
                        {r.improve}
                      </div>
                    )}
                    {r.win && (
                      <div>
                        <span className="text-xs font-semibold tracking-widest text-secondary uppercase block mb-1">Biggest win</span>
                        {r.win}
                      </div>
                    )}
                    {r.focus && (
                      <div>
                        <span className="text-xs font-semibold tracking-widest text-secondary uppercase block mb-1">Next focus</span>
                        {r.focus}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reflection Modal */}
      <Modal isOpen={showModal} title={currentWeekLabel} onClose={() => setShowModal(false)}>
        <div className="space-y-4">
          <div>
            <div className="text-xs font-semibold tracking-widest text-secondary uppercase mb-2">✦ What went well?</div>
            <textarea
              value={well}
              onChange={(e) => setWell(e.target.value)}
              placeholder="Celebrate your wins..."
              autoFocus
              className="w-full min-h-[100px] resize-none rounded-xl bg-muted p-3 text-sm text-foreground outline-none focus:bg-accent-light leading-relaxed"
            />
          </div>
          <div>
            <div className="text-xs font-semibold tracking-widest text-secondary uppercase mb-2">✦ What could improve?</div>
            <textarea
              value={improve}
              onChange={(e) => setImprove(e.target.value)}
              placeholder="Be honest, be kind to yourself..."
              className="w-full min-h-[100px] resize-none rounded-xl bg-muted p-3 text-sm text-foreground outline-none focus:bg-accent-light leading-relaxed"
            />
          </div>
          <div>
            <div className="text-xs font-semibold tracking-widest text-secondary uppercase mb-2">★ Biggest win?</div>
            <textarea
              value={win}
              onChange={(e) => setWin(e.target.value)}
              placeholder="Your proudest moment..."
              className="w-full min-h-[100px] resize-none rounded-xl bg-muted p-3 text-sm text-foreground outline-none focus:bg-accent-light leading-relaxed"
            />
          </div>
          <div>
            <div className="text-xs font-semibold tracking-widest text-secondary uppercase mb-2">→ Focus for next week?</div>
            <textarea
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              placeholder="One thing to commit to..."
              className="w-full min-h-[100px] resize-none rounded-xl bg-muted p-3 text-sm text-foreground outline-none focus:bg-accent-light leading-relaxed"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowModal(false)}
              className="flex-1 rounded-xl border border-border bg-card py-3 font-medium text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 rounded-xl bg-accent py-3 font-medium text-white hover:bg-accent-dark transition-colors"
            >
              Save reflection
            </button>
          </div>
        </div>
      </Modal>

      <ToastDisplay toast={toast} onClose={close} />
    </section>
  );
}
