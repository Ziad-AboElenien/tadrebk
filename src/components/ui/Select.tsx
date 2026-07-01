'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  error?: string;
  hint?: string;
  options?: SelectOption[];
  placeholder?: string;
  children?: React.ReactNode;
  value?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange?: (e: any) => void;
  className?: string;
  id?: string;
  name?: string;
  disabled?: boolean;
}

export default function Select({
  label,
  error,
  hint,
  options,
  placeholder,
  children,
  value = '',
  onChange,
  className = '',
  id,
  name,
  disabled,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Parse children <option>s to build item list
  const items = useCallback(() => {
    if (options) return options;
    if (!children) return [];
    const opts: SelectOption[] = [];
    const childArr = Array.isArray(children) ? children : [children];
    childArr.forEach((child: any) => {
      if (child?.type === 'option') {
        opts.push({ value: child.props.value ?? '', label: child.props.children });
      }
    });
    return opts;
  }, [options, children])();

  const selected = items.find((o) => o.value === value);

  function handleSelect(item: SelectOption) {
    if (onChange) onChange({ target: { value: item.value } });
    setOpen(false);
  }

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handle(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [open]);

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-semibold text-gray-700">{label}</label>
      )}
      <div ref={ref} className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
          className={[
            'w-full border rounded-xl bg-white transition-all duration-200 cursor-pointer text-left',
            'focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary',
            error
              ? 'border-red-400 focus:ring-red-200 focus:border-red-400'
              : 'border-gray-200 hover:border-gray-300',
            'pl-4 pr-10 py-3 text-sm',
            disabled ? 'opacity-60 cursor-not-allowed' : '',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          id={id}
          name={name}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className={selected ? 'text-gray-800' : 'text-gray-400'}>
            {selected ? selected.label : placeholder || 'Select...'}
          </span>
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            <i className={`fas fa-chevron-down text-xs transition-transform ${open ? 'rotate-180' : ''}`} />
          </span>
        </button>

        {open && (
          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-100 rounded-xl shadow-xl shadow-gray-200/50 py-1 max-h-60 overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-400">No options</div>
            ) : (
              items.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className={[
                    'w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between',
                    item.value === value
                      ? 'bg-emerald-50 text-emerald-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-50',
                  ].join(' ')}
                >
                  {item.label}
                  {item.value === value && (
                    <i className="fas fa-check text-emerald-500 text-xs" />
                  )}
                </button>
              ))
            )}
          </div>
        )}
      </div>
      {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
      {hint && !error && <p className="text-gray-400 text-xs">{hint}</p>}
    </div>
  );
}
