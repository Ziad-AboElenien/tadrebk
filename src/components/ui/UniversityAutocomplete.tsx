'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// The list is fetched server-side by our /api/universities route (which proxies
// api.ror.org and caches the result), so the browser only talks to our origin.
const UNIVERSITIES_ENDPOINT = '/api/universities';

interface UniversityAutocompleteProps {
  label?: string;
  placeholder?: string;
  error?: string;
  hint?: string;
  id?: string;
  className?: string;
  disabled?: boolean;
  // single-select mode
  value?: string;
  onChange?: (value: string) => void;
  // multi-select mode
  multiple?: boolean;
  values?: string[];
  onMultiChange?: (values: string[]) => void;
}

// Fetch the full list once and reuse it across every instance, so the API is
// hit a single time instead of once per keystroke.
let cachedUniversities: string[] | null = null;
let cachedPromise: Promise<string[]> | null = null;

function getUniversities(): Promise<string[]> {
  if (cachedUniversities) return Promise.resolve(cachedUniversities);
  if (!cachedPromise) {
    cachedPromise = fetch(UNIVERSITIES_ENDPOINT)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load universities');
        return res.json() as Promise<string[]>;
      })
      .then((names) => {
        cachedUniversities = names;
        return names;
      })
      .catch((err) => {
        cachedPromise = null;
        throw err;
      });
  }
  return cachedPromise;
}

export default function UniversityAutocomplete({  label,
  placeholder = 'Type to search universities...',
  error,
  hint,
  id,
  className = '',
  disabled,
  value = '',
  onChange,
  multiple = false,
  values = [],
  onMultiChange,
}: UniversityAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [results, setResults] = useState<string[]>([]);
  const [customMode, setCustomMode] = useState(false);
  const [customName, setCustomName] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const selected = multiple ? values : value ? [value] : [];

  // Load the full ROR list once (cached at module level), then filter locally.
  const load = useCallback(() => {
    setLoading(true);
    setLoadError(null);
    getUniversities()
      .then((names) => setResults(names))
      .catch(() => setLoadError('Could not load universities. Check your connection and try again.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return results;
    return results.filter((name) => name.toLowerCase().includes(q));
  }, [query, results]);

  const exactMatch = query.trim()
    ? filtered.some(
        (name) => name.toLowerCase() === query.trim().toLowerCase(),
      )
    : true;

  function commit(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (multiple) {
      if (!values.includes(trimmed)) {
        onMultiChange?.([...values, trimmed]);
      }
    } else {
      onChange?.(trimmed);
      setOpen(false);
    }
    setQuery('');
  }

  function removeChip(chip: string) {
    onMultiChange?.(values.filter((v) => v !== chip));
  }

  function openCustom() {
    setOpen(false);
    setQuery('');
    setCustomMode(true);
    setCustomName('');
  }

  function commitCustom() {
    const name = customName.trim();
    if (!name) return;
    if (multiple) {
      if (!values.includes(name)) {
        onMultiChange?.([...values, name]);
      }
    } else {
      onChange?.(name);
    }
    setCustomName('');
    setCustomMode(false);
    setQuery('');
  }

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const showCustom = query.trim() && !exactMatch && !filtered.includes(query.trim());

  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-semibold text-gray-700">{label}</label>}
      <div ref={ref} className="relative">
        {multiple && selected.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-1.5">
            {selected.map((chip) => (
              <span
                key={chip}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1"
              >
                {chip}
                <button
                  type="button"
                  onClick={() => removeChip(chip)}
                  className="hover:text-emerald-900"
                  aria-label={`Remove ${chip}`}
                >
                  <i className="fas fa-xmark text-[10px]" />
                </button>
              </span>
            ))}
          </div>
        )}
        <input
          id={id}
          type="text"
          disabled={disabled}
          value={focused ? query : multiple ? '' : selected[0] || ''}
          placeholder={multiple && selected.length > 0 ? '' : placeholder}
          onFocus={() => {
            setFocused(true);
            setQuery('');
            setCustomMode(false);
            setOpen(true);
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && multiple && !query && selected.length > 0) {
              removeChip(selected[selected.length - 1]);
            }
            if (e.key === 'Enter') {
              e.preventDefault();
              if (filtered.length === 1) commit(filtered[0]);
              else if (showCustom) commit(query);
            }
          }}
          className={[
            'w-full border rounded-xl bg-white text-gray-800 placeholder:text-gray-400 transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary',
            error
              ? 'border-red-400 focus:ring-red-200 focus:border-red-400'
              : 'border-gray-200 hover:border-gray-300',
            'pl-4 pr-10 py-3 text-sm',
            multiple && selected.length > 0 ? '!pl-0 !px-3' : '',
            disabled ? 'opacity-60 cursor-not-allowed' : '',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
        />
        <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
          <i className={`fas fa-chevron-down text-xs transition-transform ${open ? 'rotate-180' : ''}`} />
        </span>

        {open && (
          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-100 rounded-xl shadow-xl shadow-gray-200/50 py-1 max-h-60 overflow-y-auto">
            {loading && filtered.length === 0 && (
              <div className="px-4 py-3 text-sm text-gray-400 flex items-center gap-2">
                <i className="fas fa-spinner fa-spin text-xs" /> Loading universities...
              </div>
            )}
            {!loading && loadError && filtered.length === 0 && (
              <div className="px-4 py-3 text-sm text-gray-500">
                <p>{loadError}</p>
                <button
                  type="button"
                  onClick={load}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  <i className="fas fa-rotate-right text-[10px]" /> Retry
                </button>
              </div>
            )}
            {filtered.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => commit(name)}
                className={[
                  'w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between',
                  selected.includes(name)
                    ? 'bg-emerald-50 text-emerald-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50',
                ].join(' ')}
              >
                {name}
                {selected.includes(name) && (
                  <i className="fas fa-check text-emerald-500 text-xs" />
                )}
              </button>
            ))}
            {showCustom && (
              <button
                type="button"
                onClick={() => commit(query)}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <i className="fas fa-plus text-xs text-gray-400" />
                Use &quot;{query.trim()}&quot;
              </button>
            )}
            {!loading && !loadError && filtered.length === 0 && !showCustom && (
              <div className="px-4 py-3 text-sm text-gray-400">No universities found</div>
            )}
            <div className="border-t border-gray-100">
              <button
                type="button"
                onClick={openCustom}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <i className="fas fa-plus text-xs text-gray-400" />
                Other
              </button>
            </div>
          </div>
        )}

        {customMode && !open && (
          <div className="mt-1.5 bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 mb-2">Other university</p>
            <input
              autoFocus
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  commitCustom();
                }
                if (e.key === 'Escape') setCustomMode(false);
              }}
              placeholder="Type the university name"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            />
            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={commitCustom}
                disabled={!customName.trim()}
                className="text-xs font-semibold bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setCustomMode(false)}
                className="text-xs font-semibold text-gray-500 hover:text-gray-700 px-2 py-1.5 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
      {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
      {hint && !error && <p className="text-gray-400 text-xs">{hint}</p>}
    </div>
  );
}
