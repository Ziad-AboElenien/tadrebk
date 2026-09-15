import type { Internship } from '@/features/internship/types';

const LS_KEY = 'tadrebk:closedInternshipIds';

function readClosedIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((x): x is string => typeof x === 'string'));
  } catch {
    return new Set();
  }
}

function persist(ids: Set<string>): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify([...ids]));
  } catch {
    // ignore quota / privacy errors
  }
}

export function markInternshipClosed(internId: string): void {
  const ids = readClosedIds();
  ids.add(internId);
  persist(ids);
}

export function markInternshipOpen(internId: string): void {
  const ids = readClosedIds();
  ids.delete(internId);
  persist(ids);
}

export function syncInternshipsClosedState(internships: Internship[]): Internship[] {
  const closedIds = readClosedIds();
  if (closedIds.size === 0) return internships;
  return internships.map((i) =>
    closedIds.has(i._id) ? { ...i, closed: true } : i
  );
}