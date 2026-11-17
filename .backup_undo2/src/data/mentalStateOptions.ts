import { MentalStateKey } from '../types';

export interface MentalStateDefinition {
  key: MentalStateKey;
  emoji: string;
  label: string;
  category: 'optimal' | 'stable' | 'vulnerable' | 'critical';
  description: string;
  defaultRating: number;
  bgLight: string;
  bgDark: string;
  borderLight: string;
  borderDark: string;
  textColorLight: string;
  textColorDark: string;
  accentColor: string;
}

export const MENTAL_STATE_DEFINITIONS: MentalStateDefinition[] = [
  {
    key: 'flow',
    emoji: '🎯',
    label: 'In The Flow / Zone',
    category: 'optimal',
    description: 'Hyper-focused, effortless discipline, razor-sharp execution without hesitation.',
    defaultRating: 5,
    bgLight: 'bg-emerald-50',
    bgDark: 'dark:bg-emerald-950/40',
    borderLight: 'border-emerald-300',
    borderDark: 'dark:border-emerald-700/60',
    textColorLight: 'text-emerald-800',
    textColorDark: 'dark:text-emerald-300',
    accentColor: '#10b981'
  },
  {
    key: 'calm',
    emoji: '🧘',
    label: 'Calm & Grounded',
    category: 'optimal',
    description: 'Serene emotional state, zero anxiety, patient waiting for planned confluence.',
    defaultRating: 5,
    bgLight: 'bg-teal-50',
    bgDark: 'dark:bg-teal-950/40',
    borderLight: 'border-teal-300',
    borderDark: 'dark:border-teal-700/60',
    textColorLight: 'text-teal-800',
    textColorDark: 'dark:text-teal-300',
    accentColor: '#14b8a6'
  },
  {
    key: 'confident',
    emoji: '⚡',
    label: 'Decisive & Confident',
    category: 'stable',
    description: 'Clear bias, trusted analysis, accepted risk willingly without fear.',
    defaultRating: 4,
    bgLight: 'bg-sky-50',
    bgDark: 'dark:bg-sky-950/40',
    borderLight: 'border-sky-300',
    borderDark: 'dark:border-sky-700/60',
    textColorLight: 'text-sky-800',
    textColorDark: 'dark:text-sky-300',
    accentColor: '#0ea5e9'
  },
  {
    key: 'guarded',
    emoji: '🛡️',
    label: 'Guarded & Cautious',
    category: 'stable',
    description: 'Defensive mindset, strictly protecting capital, sizing defensively.',
    defaultRating: 3,
    bgLight: 'bg-amber-50',
    bgDark: 'dark:bg-amber-950/40',
    borderLight: 'border-amber-300',
    borderDark: 'dark:border-amber-700/60',
    textColorLight: 'text-amber-800',
    textColorDark: 'dark:text-amber-300',
    accentColor: '#f59e0b'
  },
  {
    key: 'hesitant',
    emoji: '⚠️',
    label: 'Anxious & Hesitant',
    category: 'vulnerable',
    description: 'Second-guessing signals, fear of red, tempted to close prematurely.',
    defaultRating: 2,
    bgLight: 'bg-orange-50',
    bgDark: 'dark:bg-orange-950/40',
    borderLight: 'border-orange-300',
    borderDark: 'dark:border-orange-700/60',
    textColorLight: 'text-orange-800',
    textColorDark: 'dark:text-orange-300',
    accentColor: '#f97316'
  },
  {
    key: 'fomo',
    emoji: '🔥',
    label: 'FOMO & Impatient',
    category: 'vulnerable',
    description: 'Chasing fast candles, urged to jump in before confirmation, fear of missing.',
    defaultRating: 1,
    bgLight: 'bg-rose-50',
    bgDark: 'dark:bg-rose-950/40',
    borderLight: 'border-rose-300',
    borderDark: 'dark:border-rose-700/60',
    textColorLight: 'text-rose-800',
    textColorDark: 'dark:text-rose-300',
    accentColor: '#f43f5e'
  },
  {
    key: 'tilted',
    emoji: '😤',
    label: 'Tilted / Revenge Urge',
    category: 'critical',
    description: 'Frustrated by scratch or stop loss, urge to re-enter immediately to recover.',
    defaultRating: 1,
    bgLight: 'bg-red-50',
    bgDark: 'dark:bg-red-950/40',
    borderLight: 'border-red-300',
    borderDark: 'dark:border-red-700/60',
    textColorLight: 'text-red-800',
    textColorDark: 'dark:text-red-300',
    accentColor: '#ef4444'
  },
  {
    key: 'fatigued',
    emoji: '🥱',
    label: 'Fatigued & Distracted',
    category: 'vulnerable',
    description: 'Low physical energy, split attention, sluggish reaction or mental fog.',
    defaultRating: 2,
    bgLight: 'bg-purple-50',
    bgDark: 'dark:bg-purple-950/40',
    borderLight: 'border-purple-300',
    borderDark: 'dark:border-purple-700/60',
    textColorLight: 'text-purple-800',
    textColorDark: 'dark:text-purple-300',
    accentColor: '#a855f7'
  }
];

export const PSYCHOLOGICAL_BEHAVIORAL_TAGS = [
  'Waited for 15M confirmation',
  'Honored 20-pip stop loss',
  'Zero revenge trading',
  'No FOMO chasing',
  'Devotion gate cleared',
  'Walked away after session harvest',
  'Accepted breakeven scratch calmly',
  'Slept 7+ hours / well-rested',
  'Avoided high-impact news gamble',
  'Trailed stops according to protocol'
];

export const RATING_DESCRIPTIONS: Record<number, { label: string; tag: string; color: string }> = {
  1: { label: 'Severe Tilt / Highly Impulsive', tag: 'High Risk', color: 'text-rose-500' },
  2: { label: 'Struggling / Hesitant or Distracted', tag: 'Vulnerable', color: 'text-orange-500' },
  3: { label: 'Guarded / Neutral Equanimity', tag: 'Neutral', color: 'text-amber-500' },
  4: { label: 'Disciplined / Composed Execution', tag: 'Composed', color: 'text-emerald-500' },
  5: { label: 'Peak Equanimity / In The Flow', tag: 'Elite Mindset', color: 'text-teal-400' }
};
