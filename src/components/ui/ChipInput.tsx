'use client';

import { useState, KeyboardEvent } from 'react';

interface ChipInputProps {
  label?: string;
  error?: string;
  hint?: string;
  placeholder?: string;
  value: string[];
  onChange: (items: string[]) => void;
  maxItems?: number;
}

export default function ChipInput({ label, error, hint, placeholder = 'Type and press Add...', value, onChange, maxItems }: ChipInputProps) {
  const [input, setInput] = useState('');

  function addItem() {
    const item = input.trim();
    if (!item) return;
    if (value.includes(item)) return;
    if (maxItems && value.length >= maxItems) return;
    onChange([...value, item]);
    setInput('');
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem();
    }
  }

  function removeItem(item: string) {
    onChange(value.filter((v) => v !== item));
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-semibold text-gray-700">{label}</label>}

      {/* Chips */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((item) => (
            <span key={item} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
              {item}
              <button type="button" onClick={() => removeItem(item)} className="w-4 h-4 rounded-full bg-emerald-200/50 hover:bg-emerald-300/50 flex items-center justify-center transition-colors cursor-pointer">
                <i className="fas fa-xmark text-[10px] text-emerald-600" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input + Add button */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={maxItems ? value.length >= maxItems : false}
          className={`flex-1 border rounded-xl bg-white text-gray-800 placeholder:text-gray-400 px-4 py-3 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary ${
            error ? 'border-red-400 focus:ring-red-200 focus:border-red-400' : 'border-gray-200 hover:border-gray-300'
          }`}
        />
        <button
          type="button"
          onClick={addItem}
          disabled={!input.trim() || (maxItems ? value.length >= maxItems : false)}
          className="px-4 py-3 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
        >
          Add
        </button>
      </div>

      {error && <p className="flex items-center gap-1.5 text-red-500 text-xs font-medium"><i className="fas fa-circle-exclamation text-[10px] shrink-0" />{error}</p>}
      {hint && !error && <p className="text-gray-400 text-xs">{hint}</p>}
    </div>
  );
}
