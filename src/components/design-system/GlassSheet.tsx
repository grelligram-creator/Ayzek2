import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { GlassButton } from './GlassButton';

interface GlassSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export const GlassSheet: React.FC<GlassSheetProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Dimmed backdrop with intense blur */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal / Sheet Container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`relative z-10 w-full ${maxWidthStyles[maxWidth]} rounded-3xl bg-slate-900/90 border border-white/15 p-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] backdrop-blur-2xl transition-all my-auto max-h-[90vh] flex flex-col`}
      >
        {/* Top bar */}
        <div className="flex items-start justify-between pb-4 border-b border-white/10">
          <div>
            <h2 id="modal-title" className="text-lg font-semibold text-slate-100">{title}</h2>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          <GlassButton
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Kapat"
            className="text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </GlassButton>
        </div>

        {/* Content body */}
        <div className="pt-4 overflow-y-auto flex-1 pr-1 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};
