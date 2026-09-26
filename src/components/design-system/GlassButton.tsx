import React from 'react';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  className?: string;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs rounded-xl gap-1.5',
    md: 'px-4 py-2 text-sm rounded-xl gap-2',
    lg: 'px-5 py-2.5 text-base rounded-2xl gap-2.5',
    icon: 'p-2 rounded-xl text-sm justify-center items-center',
  };

  const variantStyles = {
    primary:
      'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold shadow-[0_0_20px_rgba(6,182,212,0.35)] active:scale-[0.98]',
    secondary:
      'bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-slate-100 backdrop-blur-md shadow-sm active:scale-[0.98]',
    accent:
      'bg-indigo-600/80 hover:bg-indigo-500/90 border border-indigo-400/30 text-white shadow-[0_0_20px_rgba(99,102,241,0.25)] active:scale-[0.98]',
    ghost:
      'bg-transparent hover:bg-white/10 text-slate-300 hover:text-white active:scale-[0.98]',
    danger:
      'bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 active:scale-[0.98]',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-medium transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : null}
      {children}
    </button>
  );
};
