import { InputHTMLAttributes, forwardRef, useId } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, hint, leftIcon, rightElement, id, className = '', ...props },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-semibold text-gray-700"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={[
              'w-full border rounded-xl bg-white text-gray-800 placeholder:text-gray-400 transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary',
              error
                ? 'border-red-400 focus:ring-red-200 focus:border-red-400'
                : 'border-gray-200 hover:border-gray-300',
              leftIcon ? 'pl-10' : 'pl-4',
              rightElement ? 'pr-12' : 'pr-4',
              'py-3 text-sm',
              className,
            ]
              .filter(Boolean)
              .join(' ')}
            {...props}
          />
          {rightElement && (
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
              {rightElement}
            </span>
          )}
        </div>
        {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
        {hint && !error && (
          <p className="text-gray-400 text-xs">{hint}</p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
export default Input;
