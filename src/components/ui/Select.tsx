import { SelectHTMLAttributes, forwardRef, useId } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options?: SelectOption[];
  placeholder?: string;
  children?: React.ReactNode;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, placeholder, id, className = '', children, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id || generatedId;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-sm font-semibold text-gray-700">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={[
              'w-full border rounded-xl bg-white text-gray-800 transition-all duration-200 appearance-none cursor-pointer',
              'focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary',
              error
                ? 'border-red-400 focus:ring-red-200 focus:border-red-400'
                : 'border-gray-200 hover:border-gray-300',
              'pl-4 pr-10 py-3 text-sm',
              className,
            ]
              .filter(Boolean)
              .join(' ')}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {children ? (
              children
            ) : (
              options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            )}
          </select>
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            <i className="fas fa-chevron-down text-xs" />
          </span>
        </div>
        {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
        {hint && !error && <p className="text-gray-400 text-xs">{hint}</p>}
      </div>
    );
  },
);

Select.displayName = 'Select';
export default Select;
