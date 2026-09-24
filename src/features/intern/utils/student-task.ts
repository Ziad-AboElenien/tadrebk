import type { Task } from '@/features/company/types/management';

export interface InternNote {
  date?: string;
  text: string;
}

export interface FeedbackThread {
  internNotes: InternNote[];
  /** Everything the reviewer/admin wrote (thread with intern blocks removed). */
  adminNotes: string;
}

const INTERN_BLOCK_RE = /\[intern note ([^\]]*)\]\s*([\s\S]*?)(?=\[intern note |$)/g;

/**
 * The backend stores the submit thread inside `reviewerFeedback`:
 *   [intern note 2026-09-15T10:23:00.000Z]
 *   <student text>
 * Admin feedback is plain text around those blocks.
 */
export function parseFeedbackThread(reviewerFeedback?: string | null): FeedbackThread {
  if (!reviewerFeedback) return { internNotes: [], adminNotes: '' };
  const internNotes: InternNote[] = [];
  let m: RegExpExecArray | null;
  INTERN_BLOCK_RE.lastIndex = 0;
  while ((m = INTERN_BLOCK_RE.exec(reviewerFeedback)) !== null) {
    const text = (m[2] || '').trim();
    if (text) internNotes.push({ date: (m[1] || '').trim() || undefined, text });
  }
  const adminNotes = reviewerFeedback.replace(/\[intern note [^\]]*\]\s*[\s\S]*?(?=\[intern note |$)/g, '').trim();
  return { internNotes, adminNotes };
}

export type StudentTaskBucket = 'todo' | 'submitted' | 'reviewed';

/** Student-facing bucket: outstanding work, awaiting review, or reviewed. */
export function studentBucket(task: Task): StudentTaskBucket | null {
  switch (task.status) {
    case 'todo':
    case 'in_progress':
      return 'todo';
    case 'in_review':
      return 'submitted';
    case 'complete':
      return 'reviewed';
    default:
      return null; // archived and anything else stays hidden from the student
  }
}

export const STUDENT_BUCKET_META: Record<StudentTaskBucket, { label: string; chip: string; dot: string }> = {
  todo: { label: 'To Do', chip: 'bg-blue-50 text-blue-600', dot: 'bg-blue-500' },
  submitted: { label: 'Submitted', chip: 'bg-purple-50 text-purple-600', dot: 'bg-purple-500' },
  reviewed: { label: 'Reviewed', chip: 'bg-emerald-50 text-emerald-600', dot: 'bg-emerald-500' },
};
