import React from 'react';

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const GlassInput: React.FC<GlassInputProps> = ({
  label,
  error,
  icon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-slate-300">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-3 text-slate-400 pointer-events-none flex items-center">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={`w-full rounded-xl bg-slate-900/70 border border-white/10 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 backdrop-blur-md transition-colors focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-50 ${
            icon ? 'pl-10' : ''
          } ${error ? 'border-rose-500/50 focus:ring-rose-500/20' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-rose-400">{error}</span>}
    </div>
  );
};
