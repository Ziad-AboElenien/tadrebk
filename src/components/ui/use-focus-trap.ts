'use client';

import { useEffect, useRef } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Traps keyboard focus inside a modal while `active`, focuses the first
 * focusable element on open, and restores focus to the previously focused
 * element on close. Attach the returned ref to the dialog container.
 */
export function useFocusTrap<T extends HTMLElement>(active: boolean) {
  const ref = useRef<T | null>(null);
  const restoreRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!active) return;
    restoreRef.current = document.activeElement;
    const node = ref.current;
    // Focus first focusable (or the container itself as a fallback).
    const first = node?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? node)?.focus?.();

    function handleKey(e: KeyboardEvent) {
      if (e.key !== 'Tab' || !ref.current) return;
      const items = Array.from(ref.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const firstItem = items[0];
      const lastItem = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstItem) {
        e.preventDefault();
        lastItem.focus();
      } else if (!e.shiftKey && document.activeElement === lastItem) {
        e.preventDefault();
        firstItem.focus();
      }
    }

    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
      (restoreRef.current as HTMLElement | null)?.focus?.();
    };
  }, [active]);

  return ref;
}
