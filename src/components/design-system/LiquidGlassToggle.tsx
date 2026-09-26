import React from 'react';

interface LiquidGlassToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

/**
 * Liquid Glass Aesthetic Toggle Switch
 * Features frosted & glossy materials, soft ambient lighting,
 * monochromatic depth, and smooth specular highlights.
 */
export const LiquidGlassToggle: React.FC<LiquidGlassToggleProps> = ({
  checked,
  onChange,
  label,
  description,
  size = 'md',
  disabled = false,
  className = '',
}) => {
  const sizeConfig = {
    sm: {
      track: 'w-9 h-5',
      thumb: 'w-3.5 h-3.5',
      translate: 'translate-x-4',
      untranslated: 'translate-x-0.5',
    },
    md: {
      track: 'w-11 h-6',
      thumb: 'w-5 h-5',
      translate: 'translate-x-5',
      untranslated: 'translate-x-0.5',
    },
    lg: {
      track: 'w-14 h-7.5',
      thumb: 'w-6.5 h-6.5',
      translate: 'translate-x-6.5',
      untranslated: 'translate-x-0.5',
    },
  }[size];

  return (
    <div
      className={`flex items-center justify-between gap-3 ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}
    >
      {(label || description) && (
        <div className="flex flex-col cursor-pointer select-none" onClick={() => !disabled && onChange(!checked)}>
          {label && <span className="text-xs font-semibold text-slate-100 tracking-tight">{label}</span>}
          {description && <span className="text-[11px] text-slate-400 leading-snug">{description}</span>}
        </div>
      )}

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex items-center shrink-0 rounded-full transition-all duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 p-0.5 ${
          sizeConfig.track
        } ${
          checked
            ? 'bg-gradient-to-r from-cyan-500/80 via-sky-400/75 to-indigo-500/80 shadow-[0_0_16px_rgba(6,182,212,0.45),inset_0_1px_1px_rgba(255,255,255,0.4)] border border-cyan-300/40'
            : 'bg-slate-900/90 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] border border-white/10 backdrop-blur-xl'
        }`}
      >
        {/* Specular glass highlight reflection on track */}
        <span className="pointer-events-none absolute inset-x-1.5 top-0.5 h-0.5 rounded-full bg-gradient-to-r from-transparent via-white/40 to-transparent" />

        {/* Liquid Glass Thumb */}
        <span
          className={`pointer-events-none inline-block transform rounded-full transition-transform duration-300 ease-spring ${
            sizeConfig.thumb
          } ${checked ? sizeConfig.translate : sizeConfig.untranslated} ${
            checked
              ? 'bg-gradient-to-b from-white via-slate-100 to-slate-200 shadow-[0_4px_10px_rgba(0,0,0,0.35),0_0_8px_rgba(255,255,255,0.8),inset_0_1px_1px_#ffffff]'
              : 'bg-gradient-to-b from-slate-200 via-slate-300 to-slate-400 shadow-[0_2px_6px_rgba(0,0,0,0.4),inset_0_1px_1px_#ffffff]'
          }`}
        >
          {/* Subtle glossy dot in center */}
          <span className="absolute inset-0 m-auto w-1.5 h-1.5 rounded-full bg-white/70 filter blur-[0.2px]" />
        </span>
      </button>
    </div>
  );
};
