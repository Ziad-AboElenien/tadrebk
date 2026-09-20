'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';

interface ExpandableSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
}

/**
 * Table search: a closed full-width bar on mobile that expands into a real
 * input when tapped; always expanded on sm+ screens.
 */
export default function ExpandableSearch({ value, onChange, placeholder = 'Search...', id }: ExpandableSearchProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full">
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open search"
          className="flex w-full items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-400 transition-colors hover:border-slate-300 sm:hidden"
        >
          <Search size={15} />
          <span className="truncate">{placeholder}</span>
        </button>
      )}
      <div className={`${open ? 'block' : 'hidden'} sm:block`}>
        <div className="relative">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            autoFocus={open}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 sm:pr-3"
          />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 sm:hidden"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
