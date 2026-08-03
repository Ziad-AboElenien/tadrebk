'use client';

import { useState, useRef, useEffect } from 'react';

interface Props {
  onEdit: () => void;
  onDelete?: () => void;
  loading?: boolean;
  inputId?: string;
}

export default function ImageMenu({ onEdit, onDelete, loading, inputId }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={loading}
        className="bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 w-9 h-9 rounded-full shadow-md border border-gray-200 flex items-center justify-center transition-all"
        title="Edit image"
      >
        {loading ? (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <i className="fas fa-pen text-xs" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 min-w-[160px] animate-scale-in">
          {inputId ? (
            <label
              htmlFor={inputId}
              onClick={() => setOpen(false)}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <i className="fas fa-pen-to-square text-emerald-500 text-xs w-4 text-center" />
              Change photo
            </label>
          ) : (
            <button
              onClick={() => { setOpen(false); onEdit(); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <i className="fas fa-pen-to-square text-emerald-500 text-xs w-4 text-center" />
              Change photo
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => { setOpen(false); onDelete(); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
            >
              <i className="fas fa-trash text-xs w-4 text-center" />
              Remove photo
            </button>
          )}
        </div>
      )}
    </div>
  );
}
