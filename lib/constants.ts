// lib/constants.ts

export const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const DAYS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
export const MONTHS = [
  'JANUARY',
  'FEBRUARY',
  'MARCH',
  'APRIL',
  'MAY',
  'JUNE',
  'JULY',
  'AUGUST',
  'SEPTEMBER',
  'OCTOBER',
  'NOVEMBER',
  'DECEMBER',
];

export const QUOTES = [
  '"Begin each day with intention. Close it with gratitude."',
  '"Small daily rituals become the foundation of a meaningful life."',
  '"This week is not about doing more — it\'s about being present to what matters."',
  '"Your rituals shape your days. Your days shape your life."',
  '"Pause. Breathe. Choose what deserves your attention today."',
  '"The quality of your presence determines the quality of your life."',
  '"Let your intentions guide you, not your obligations."',
];

export const TAB_LABELS = ['Today', 'Aspirations', 'Practices', 'Reflect'] as const;
export type Tab = (typeof TAB_LABELS)[number];

// Color palette
export const COLORS = {
  bg: '#FAF8F5',
  card: '#FFFFFF',
  text: '#2C2A28',
  secondary: '#A09890',
  accent: '#C4956A',
  accentLight: '#F0EBE4',
  border: '#E8E3DE',
  success: '#8BA888',
  warning: '#C4A67A',
  danger: '#C4847A',
};
