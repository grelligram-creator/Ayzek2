import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'subtle' | 'elevated' | 'accent' | 'highlight';
  interactive?: boolean;
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = 'default',
  interactive = false,
  className = '',
  ...props
}) => {
  // iOS 27 Liquid Glass styling variants
  const variantStyles = {
    default:
      'liquid-glass-card bg-slate-900/65 backdrop-blur-2xl border border-white/10 shadow-[0_12px_36px_0_rgba(0,0,0,0.45)] text-slate-100',
    subtle:
      'liquid-glass-card bg-slate-900/40 backdrop-blur-xl border border-white/5 shadow-sm text-slate-200',
    elevated:
      'liquid-glass-card bg-gradient-to-b from-slate-800/85 to-slate-900/90 backdrop-blur-2xl border border-white/15 shadow-[0_18px_45px_0_rgba(0,0,0,0.55)] text-slate-50',
    accent:
      'liquid-glass-card bg-gradient-to-br from-cyan-950/40 via-slate-900/70 to-indigo-950/40 backdrop-blur-2xl border border-cyan-500/25 shadow-[0_12px_36px_0_rgba(6,182,212,0.18)] text-slate-100',
    highlight:
      'liquid-glass-card bg-gradient-to-br from-amber-950/30 via-slate-900/70 to-slate-900/80 backdrop-blur-2xl border border-amber-500/25 shadow-[0_12px_36px_0_rgba(245,158,11,0.15)] text-slate-100',
  };

  const interactiveStyles = interactive
    ? 'cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:border-white/25 active:scale-[0.99] active:translate-y-0'
    : '';

  return (
    <div
      className={`relative overflow-hidden rounded-3xl ${variantStyles[variant]} ${interactiveStyles} ${className}`}
      {...props}
    >
      {/* iOS 27 Liquid Glass specular highlight refraction on top border */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      {/* Subtle bottom light reflection */}
      <div className="pointer-events-none absolute inset-x-4 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-400/15 to-transparent" />
      {children}
    </div>
  );
};
