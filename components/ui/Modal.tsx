'use client';

import { useEffect, useId, useRef } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  danger?: boolean;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}

/**
 * Modal dialog aksesibel sesuai DSG §11.14 & antislop-human (focus trap + Escape + restore focus).
 */
export default function Modal({
  open,
  onClose,
  title,
  description,
  size = 'sm',
  danger = false,
  children,
  footer,
}: ModalProps) {
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const panel = panelRef.current;
    const focusableSelector =
      'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

    const focusFirst = () => {
      if (!panel) return;
      const items = panel.querySelectorAll<HTMLElement>(focusableSelector);
      if (items.length > 0) {
        items[0].focus();
      } else {
        panel.focus();
      }
    };

    const rafId = requestAnimationFrame(focusFirst);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key !== 'Tab' || !panel) return;
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(focusableSelector));
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelAnimationFrame(rafId);
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      previousFocusRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  const maxWidthClass =
    size === 'lg' ? 'max-w-[720px]' : size === 'md' ? 'max-w-[560px]' : 'max-w-[480px]';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
    >
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 z-40 bg-backdrop transition-opacity"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={`relative z-50 max-h-[90vh] w-full ${maxWidthClass} overflow-y-auto rounded-2xl border border-border-default bg-surface-raised p-6 shadow-[var(--shadow-lg-val)] focus-visible:outline-none`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id={titleId}
              className={`font-display text-xl font-bold tracking-[-0.02em] ${
                danger ? 'text-danger' : 'text-primary'
              }`}
            >
              {title}
            </h2>
            {description && (
              <p id={descId} className="mt-2 text-sm leading-relaxed text-secondary">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup dialog"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-secondary transition-colors hover:bg-surface-overlay hover:text-primary lg:h-9 lg:w-9"
          >
            <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {children && <div className="mt-5">{children}</div>}

        {footer && (
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
