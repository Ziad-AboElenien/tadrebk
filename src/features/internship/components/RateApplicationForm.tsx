'use client';

import { useState } from 'react';
import { Star, Loader2 } from 'lucide-react';

interface RateApplicationFormProps {
  heading: string;
  subheading?: string;
  initialScore?: number;
  submitting: boolean;
  serverError?: string;
  onSubmit: (score: number, comment?: string) => void;
  onCancel: () => void;
}

export default function RateApplicationForm({
  heading,
  subheading,
  initialScore = 5,
  submitting,
  serverError,
  onSubmit,
  onCancel,
}: RateApplicationFormProps) {
  const [score, setScore] = useState(initialScore);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (score < 1 || score > 5) {
      setError('Choose a rating between 1 and 5 stars.');
      return;
    }
    if (comment.length > 1000) {
      setError('Comment must be 1000 characters or fewer.');
      return;
    }
    setError('');
    onSubmit(score, comment.trim() || undefined);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="break-words text-xl font-bold text-slate-900 sm:text-2xl">{heading}</h2>
      {subheading && <p className="mt-1 text-sm text-slate-500">{subheading}</p>}

      <div className="mt-6">
        <p className="text-sm font-medium text-slate-700">
          Your rating <span className="text-rose-500">*</span>
        </p>
        <div className="mt-2 flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => {
                setScore(star);
                setError('');
              }}
              aria-label={`${star} star${star > 1 ? 's' : ''}`}
              className="rounded-lg p-1 transition-transform hover:scale-110"
            >
              <Star
                size={30}
                className={star <= score ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}
              />
            </button>
          ))}
          <span className="ml-2 text-sm font-semibold text-slate-600">{score}/5</span>
        </div>
        {error && <p className="mt-1 text-xs font-medium text-rose-500">{error}</p>}
      </div>

      <div className="mt-5">
        <label className="text-sm font-medium text-slate-700">
          Comment <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          maxLength={1000}
          placeholder="Share what went well or could improve..."
          className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
        />
        <p className="mt-1 text-right text-xs text-slate-400">{comment.length}/1000</p>
      </div>

      {serverError && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-600">{serverError}</p>
      )}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={onCancel}
          disabled={submitting}
          className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Submitting...
            </>
          ) : (
            'Submit Rating'
          )}
        </button>
      </div>
    </div>
  );
}
