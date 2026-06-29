'use client';

import { useState } from 'react';
import { Tab } from '@/lib/constants';
import { WeekScreen } from '@/app/features/week/WeekScreen';
import { GoalsScreen } from '@/app/features/goals/GoalsScreen';
import { HabitsScreen } from '@/app/features/habits/HabitsScreen';
import { ReflectionScreen } from '@/app/features/reflection/ReflectionScreen';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('Today');
  const [showMenu, setShowMenu] = useState(false);

  const renderScreen = () => {
    switch (activeTab) {
      case 'Today':
        return <WeekScreen />;
      case 'Aspirations':
        return <GoalsScreen />;
      case 'Practices':
        return <HabitsScreen />;
      case 'Reflect':
        return <ReflectionScreen />;
    }
  };

  const allItems: { tab: Tab; icon: string }[] = [
    { tab: 'Today', icon: '☀️' },
    { tab: 'Aspirations', icon: '🌟' },
    { tab: 'Practices', icon: '🌿' },
    { tab: 'Reflect', icon: '🪷' },
  ];
  const menuItems = allItems.filter((item) => item.tab !== activeTab);

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <main className="flex-1">
        <div className="animate-fade-in" key={activeTab}>
          {renderScreen()}
        </div>
      </main>

      {/* FAB */}
      <div className="fixed bottom-6 right-6 z-50">
        {showMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
            <div className="absolute bottom-16 right-0 z-50 flex flex-col gap-2">
              {menuItems.map((item, i) => (
                <button
                  key={item.tab}
                  onClick={() => { setActiveTab(item.tab); setShowMenu(false); }}
                  className="animate-scale-in flex items-center gap-3 rounded-2xl border border-border bg-white px-5 py-3 shadow-lg hover:bg-accent-light transition-colors whitespace-nowrap"
                  style={{ animationDelay: `${i * 40}ms`, animationFillMode: 'both' }}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm font-medium text-foreground">{item.tab}</span>
                </button>
              ))}
            </div>
          </>
        )}
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm text-secondary shadow-md border border-border hover:bg-accent hover:text-white hover:border-accent active:scale-95 transition-all duration-200"
        >
          {showMenu ? '✕' : '☀️'}
        </button>
      </div>
    </div>
  );
}
