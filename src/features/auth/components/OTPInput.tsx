'use client';

import { useRef, KeyboardEvent, ClipboardEvent } from 'react';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export default function OTPInput({
  length = 6,
  value,
  onChange,
  error,
  disabled = false,
}: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const digits = value.split('').concat(Array(length).fill('')).slice(0, length);

  function handleChange(index: number, char: string) {
    const newDigits = [...digits];
    newDigits[index] = char.slice(-1); // only last char
    const newValue = newDigits.join('');
    onChange(newValue);
    // Auto-advance focus
    if (char && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      const newDigits = [...digits];
      if (!newDigits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        newDigits[index - 1] = '';
      } else {
        newDigits[index] = '';
      }
      onChange(newDigits.join(''));
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    onChange(pasted.padEnd(length, '').slice(0, length));
    // Focus last filled or last slot
    const focusIdx = Math.min(pasted.length, length - 1);
    inputRefs.current[focusIdx]?.focus();
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex gap-3">
        {Array.from({ length }).map((_, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            id={`otp-${i}`}
            type="text"
            inputMode="numeric"
            pattern="\d*"
            maxLength={1}
            value={digits[i] || ''}
            disabled={disabled}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            className={[
              'w-12 h-14 text-center text-xl font-bold border-2 rounded-xl transition-all duration-200',
              'focus:outline-none focus:ring-0',
              digits[i]
                ? 'border-primary bg-primary/5 text-dark'
                : 'border-gray-200 bg-white text-dark',
              error ? 'border-red-400 bg-red-50' : '',
              'disabled:opacity-50 disabled:cursor-not-allowed',
            ]
              .filter(Boolean)
              .join(' ')}
          />
        ))}
      </div>
      {error && (
        <p className="text-red-500 text-sm font-medium text-center">{error}</p>
      )}
    </div>
  );
}
