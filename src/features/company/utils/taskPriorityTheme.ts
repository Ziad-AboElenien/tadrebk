export interface PriorityTheme {
  /** Solid banner color */
  banner: string;
  /** Light gradient card background (tailwind classes) */
  cardBg: string;
  /** Status/priority chip */
  chip: string;
}

const FALLBACK: PriorityTheme = {
  banner: '#64748b',
  cardBg: 'bg-white',
  chip: 'bg-slate-100 text-slate-500',
};

const THEMES: Record<string, PriorityTheme> = {
  high: {
    banner: '#f43f5e',
    cardBg: 'bg-gradient-to-b from-rose-50/90 to-white',
    chip: 'bg-rose-50 text-rose-500',
  },
  medium: {
    banner: '#f59e0b',
    cardBg: 'bg-gradient-to-b from-amber-50/90 to-white',
    chip: 'bg-amber-50 text-amber-600',
  },
  low: {
    banner: '#10b981',
    cardBg: 'bg-gradient-to-b from-emerald-50/90 to-white',
    chip: 'bg-emerald-50 text-emerald-600',
  },
};

export function priorityTheme(priority?: string | null): PriorityTheme {
  if (!priority) return FALLBACK;
  return THEMES[priority.toLowerCase()] ?? FALLBACK;
}
