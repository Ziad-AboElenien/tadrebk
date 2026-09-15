'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Check } from 'lucide-react';

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

function collectOptions(node: React.ReactNode): SelectOption[] {
  const opts: SelectOption[] = [];
  const walk = (n: React.ReactNode) => {
    if (n == null || typeof n === 'boolean') return;
    if (Array.isArray(n)) {
      n.forEach(walk);
      return;
    }
    if (typeof n === 'object') {
      const el = n as { type?: React.ElementType; props?: { value?: string; children?: React.ReactNode } };
      if (el.type === 'option') {
        opts.push({ value: el.props?.value ?? '', label: (el.props?.children as string) ?? '' });
        return;
      }
      if (el.props?.children != null) walk(el.props.children);
    }
  };
  walk(node);
  return opts;
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

  const items = useCallback(() => {
    if (options) return options;
    if (!children) return [];
    return collectOptions(children);
  }, [options, children])();

  const selected = items.find((o) => o.value === value);

  function handleSelect(item: SelectOption) {
    if (onChange) onChange({ target: { value: item.value } });
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

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
        <label className="text-sm font-medium text-slate-700">{label}</label>
      )}
      <div ref={ref} className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
          className={[
            'w-full rounded-lg border bg-slate-50 transition-all duration-200 cursor-pointer text-left',
            'focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500',
            error
              ? 'border-rose-400 focus:ring-rose-200 focus:border-rose-400'
              : 'border-slate-200 hover:border-slate-300',
            'pl-3 pr-10 py-2.5 text-sm',
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
          <span className={selected ? 'text-slate-700' : 'text-slate-400'}>
            {selected ? selected.label : placeholder || 'Select...'}
          </span>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            <ChevronDown size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
          </span>
        </button>

        {open && (
          <div className="absolute z-50 mt-1 w-full rounded-lg border border-slate-200 bg-white py-1 shadow-xl shadow-slate-200/50 max-h-60 overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-3 py-2.5 text-sm text-slate-400">No options</div>
            ) : (
              items.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className={[
                    'w-full text-left px-3 py-2.5 text-sm transition-colors flex items-center justify-between',
                    item.value === value
                      ? 'bg-emerald-50 text-emerald-700 font-medium'
                      : 'text-slate-600 hover:bg-slate-50',
                  ].join(' ')}
                >
                  {item.label}
                  {item.value === value && (
                    <Check size={14} className="text-emerald-500" />
                  )}
                </button>
              ))
            )}
          </div>
        )}
      </div>
      {error && <p className="flex items-center gap-1.5 text-rose-500 text-xs font-medium"><span className="text-[10px] shrink-0">&#9679;</span>{error}</p>}
      {hint && !error && <p className="text-slate-400 text-xs">{hint}</p>}
    </div>
  );
}
