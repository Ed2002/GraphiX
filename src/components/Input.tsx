import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-medium text-text-secondary"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`
          w-full px-3 py-2 text-sm
          bg-bg-elevated border border-border-default
          rounded-md text-text-primary
          placeholder:text-text-muted
          focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30
          transition-all duration-150
          ${error ? 'border-danger focus:border-danger focus:ring-danger/30' : ''}
          ${className}
        `.trim()}
        {...props}
      />
      {error && (
        <span className="text-xs text-danger">{error}</span>
      )}
    </div>
  );
}
